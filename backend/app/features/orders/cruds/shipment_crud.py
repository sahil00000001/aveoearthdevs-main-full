from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, func
from app.core.base import BaseCrud
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.orders.models.shipment import Shipment, ShipmentItem, ShipmentStatusEnum
from app.features.orders.models.order import Order, OrderItem, OrderItemFulfillmentStatusEnum
from app.features.orders.responses.shipment_response import ShipmentResponse, ShipmentWithItemsResponse, ShipmentAnalyticsResponse
from app.database.base import get_supabase_client

logger = get_logger("crud.shipment")


class ShipmentCrud(BaseCrud[Shipment]):
    def __init__(self):
        super().__init__(get_supabase_client(), Shipment)

    async def create_shipment(self, db: AsyncSession, order_id: str, supplier_id: str, tracking_number: str, carrier: str, shipping_cost: float, order_item_ids: List[str], shipping_address: Dict[str, Any], carrier_service: Optional[str] = None, estimated_delivery_date: Optional[datetime] = None) -> ShipmentResponse:
        try:
            order_query = select(Order).where(Order.id == order_id)
            order_result = await db.execute(order_query)
            order = order_result.scalar_one_or_none()
            
            if not order:
                raise NotFoundException("Order not found")

            for order_item_id in order_item_ids:
                order_item_query = select(OrderItem).where(and_(OrderItem.id == order_item_id, OrderItem.supplier_id == supplier_id))
                order_item_result = await db.execute(order_item_query)
                order_item = order_item_result.scalar_one_or_none()
                
                if not order_item:
                    raise NotFoundException(f"Order item {order_item_id} not found or doesn't belong to supplier")

            shipment_data = {
                "order_id": order_id,
                "supplier_id": supplier_id,
                "tracking_number": tracking_number,
                "carrier": carrier,
                "carrier_service": carrier_service,
                "shipping_cost": shipping_cost,
                "estimated_delivery_date": estimated_delivery_date,
                "shipping_address": shipping_address,
                "status": ShipmentStatusEnum.PENDING
            }

            shipment = await self.create(db, shipment_data, commit=False)

            for order_item_id in order_item_ids:
                order_item_query = select(OrderItem).where(OrderItem.id == order_item_id)
                order_item_result = await db.execute(order_item_query)
                order_item = order_item_result.scalar_one_or_none()

                shipment_item_data = {
                    "shipment_id": shipment.id,
                    "order_item_id": order_item_id,
                    "product_id": order_item.product_id,
                    "variant_id": order_item.variant_id,
                    "quantity": order_item.quantity
                }

                shipment_item = ShipmentItem(**shipment_item_data)
                db.add(shipment_item)

            await db.commit()
            await db.refresh(shipment)
            
            logger.info(f"Created shipment {shipment.tracking_number} for order {order.order_number}")
            return ShipmentResponse(**shipment.to_dict())
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating shipment: {str(e)}")
            raise

    async def update_shipment_status(self, db: AsyncSession, shipment_id: str, status: ShipmentStatusEnum, delivery_notes: Optional[str] = None, tracking_events: Optional[List[Dict[str, Any]]] = None) -> ShipmentResponse:
        try:
            shipment = await self.get_by_id(db, shipment_id)
            if not shipment:
                raise NotFoundException("Shipment not found")

            update_data = {"status": status}
            
            if status == ShipmentStatusEnum.SHIPPED:
                update_data["shipped_at"] = datetime.utcnow()
                await self._update_order_items_status(db, shipment_id, OrderItemFulfillmentStatusEnum.SHIPPED)
            elif status == ShipmentStatusEnum.DELIVERED:
                update_data["delivered_at"] = datetime.utcnow()
                await self._update_order_items_status(db, shipment_id, OrderItemFulfillmentStatusEnum.DELIVERED)
            elif status == ShipmentStatusEnum.CANCELLED:
                await self._update_order_items_status(db, shipment_id, OrderItemFulfillmentStatusEnum.CANCELLED)
            
            if delivery_notes:
                update_data["delivery_notes"] = delivery_notes
            
            if tracking_events:
                existing_events = shipment.tracking_events or []
                update_data["tracking_events"] = existing_events + tracking_events

            updated_shipment = await self.update(db, shipment_id, update_data)
            
            logger.info(f"Updated shipment {shipment.tracking_number} status to {status}")
            return ShipmentResponse(**updated_shipment.to_dict())
        except Exception as e:
            logger.error(f"Error updating shipment status: {str(e)}")
            raise

    async def add_tracking_event(self, db: AsyncSession, shipment_id: str, event: Dict[str, Any]) -> ShipmentResponse:
        try:
            shipment = await self.get_by_id(db, shipment_id)
            if not shipment:
                raise NotFoundException("Shipment not found")

            event["timestamp"] = datetime.utcnow().isoformat()
            
            existing_events = shipment.tracking_events or []
            new_events = existing_events + [event]

            updated_shipment = await self.update(db, shipment_id, {"tracking_events": new_events})
            
            logger.info(f"Added tracking event to shipment {shipment.tracking_number}")
            return ShipmentResponse(**updated_shipment.to_dict())
        except Exception as e:
            logger.error(f"Error adding tracking event: {str(e)}")
            raise

    async def get_shipment_by_tracking(self, db: AsyncSession, tracking_number: str) -> ShipmentWithItemsResponse:
        try:
            shipment_query = select(Shipment).where(Shipment.tracking_number == tracking_number)
            shipment_result = await db.execute(shipment_query)
            shipment = shipment_result.scalar_one_or_none()
            
            if not shipment:
                raise NotFoundException("Shipment not found")

            shipment_dict = shipment.to_dict()
            
            items_query = select(ShipmentItem).where(ShipmentItem.shipment_id == shipment.id)
            items_result = await db.execute(items_query)
            shipment_items = items_result.scalars().all()
            shipment_dict["items"] = [item.to_dict() for item in shipment_items]
            
            return ShipmentWithItemsResponse(**shipment_dict)
        except Exception as e:
            logger.error(f"Error getting shipment by tracking: {str(e)}")
            raise

    async def get_order_shipments(self, db: AsyncSession, order_id: str) -> List[ShipmentWithItemsResponse]:
        try:
            shipments_query = select(Shipment).where(Shipment.order_id == order_id)
            shipments_result = await db.execute(shipments_query)
            shipments = shipments_result.scalars().all()
            
            shipments_data = []
            for shipment in shipments:
                shipment_dict = shipment.to_dict()
                
                items_query = select(ShipmentItem).where(ShipmentItem.shipment_id == shipment.id)
                items_result = await db.execute(items_query)
                shipment_items = items_result.scalars().all()
                shipment_dict["items"] = [item.to_dict() for item in shipment_items]
                
                shipments_data.append(ShipmentWithItemsResponse(**shipment_dict))
            
            return shipments_data
        except Exception as e:
            logger.error(f"Error getting order shipments: {str(e)}")
            raise

    async def get_supplier_shipments(self, db: AsyncSession, supplier_id: str, pagination: PaginationParams, status: Optional[ShipmentStatusEnum] = None) -> PaginatedResponse[ShipmentWithItemsResponse]:
        try:
            query = select(Shipment).where(Shipment.supplier_id == supplier_id)
            
            if status:
                query = query.where(Shipment.status == status)
            
            query = query.order_by(Shipment.created_at.desc())
            
            count_query = select(func.count()).select_from(Shipment).where(Shipment.supplier_id == supplier_id)
            if status:
                count_query = count_query.where(Shipment.status == status)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            query = query.offset(pagination.offset).limit(pagination.limit)
            shipments_result = await db.execute(query)
            shipments = shipments_result.scalars().all()

            shipments_data = []
            for shipment in shipments:
                shipment_dict = shipment.to_dict()
                
                items_query = select(ShipmentItem).where(ShipmentItem.shipment_id == shipment.id)
                items_result = await db.execute(items_query)
                shipment_items = items_result.scalars().all()
                shipment_dict["items"] = [item.to_dict() for item in shipment_items]
                
                shipments_data.append(ShipmentWithItemsResponse(**shipment_dict))

            return PaginatedResponse.create(
                items=shipments_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting supplier shipments: {str(e)}")
            raise

    async def get_shipment_analytics(self, db: AsyncSession, supplier_id: Optional[str] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> ShipmentAnalyticsResponse:
        try:
            query = select(Shipment)
            
            if supplier_id:
                query = query.where(Shipment.supplier_id == supplier_id)
            if start_date:
                query = query.where(Shipment.created_at >= start_date)
            if end_date:
                query = query.where(Shipment.created_at <= end_date)

            shipments_result = await db.execute(query)
            shipments = shipments_result.scalars().all()

            total_shipments = len(shipments)
            total_shipping_cost = sum(float(shipment.shipping_cost) for shipment in shipments)
            
            status_counts = {}
            for status in ShipmentStatusEnum:
                status_counts[status.value] = sum(1 for shipment in shipments if shipment.status == status)

            carrier_counts = {}
            for shipment in shipments:
                carrier = shipment.carrier
                carrier_counts[carrier] = carrier_counts.get(carrier, 0) + 1

            delivered_shipments = [s for s in shipments if s.status == ShipmentStatusEnum.DELIVERED and s.shipped_at and s.delivered_at]
            avg_delivery_time = None
            if delivered_shipments:
                total_delivery_time = sum((s.delivered_at - s.shipped_at).total_seconds() / 3600 for s in delivered_shipments)
                avg_delivery_time = total_delivery_time / len(delivered_shipments)

            analytics_data = {
                "total_shipments": total_shipments,
                "total_shipping_cost": total_shipping_cost,
                "average_delivery_time_hours": avg_delivery_time,
                "status_breakdown": status_counts,
                "carrier_breakdown": carrier_counts,
                "period": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            }
            return ShipmentAnalyticsResponse(**analytics_data)
        except Exception as e:
            logger.error(f"Error getting shipment analytics: {str(e)}")
            raise

    async def update_estimated_delivery(self, db: AsyncSession, shipment_id: str, estimated_delivery_date: datetime) -> ShipmentResponse:
        try:
            updated_shipment = await self.update(db, shipment_id, {"estimated_delivery_date": estimated_delivery_date})
            
            logger.info(f"Updated estimated delivery for shipment {shipment_id}")
            return ShipmentResponse(**updated_shipment.to_dict())
        except Exception as e:
            logger.error(f"Error updating estimated delivery: {str(e)}")
            raise

    async def _update_order_items_status(self, db: AsyncSession, shipment_id: str, status: OrderItemFulfillmentStatusEnum):
        try:
            shipment_items_query = select(ShipmentItem).where(ShipmentItem.shipment_id == shipment_id)
            shipment_items_result = await db.execute(shipment_items_query)
            shipment_items = shipment_items_result.scalars().all()

            for item in shipment_items:
                update_data = {"fulfillment_status": status}
                
                if status == OrderItemFulfillmentStatusEnum.SHIPPED:
                    update_data["shipped_at"] = datetime.utcnow()
                elif status == OrderItemFulfillmentStatusEnum.DELIVERED:
                    update_data["delivered_at"] = datetime.utcnow()

                await db.execute(
                    update(OrderItem)
                    .where(OrderItem.id == item.order_item_id)
                    .values(**update_data)
                )

            await db.commit()
        except Exception as e:
            logger.error(f"Error updating order items status: {str(e)}")
            raise
