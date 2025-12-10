from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.core.role_auth import require_supplier
from app.core.pagination import PaginationParams, PaginatedResponse
from app.core.base import SuccessResponse
from app.core.exceptions import ValidationException, NotFoundException
from app.core.logging import get_logger
from app.database.session import get_async_session
from app.features.orders.cruds import OrderCRUD, ShipmentCrud, ReturnCrud, RefundCrud
from app.features.orders.requests import (
    UpdateOrderItemFulfillmentRequest, CreateShipmentRequest, UpdateShipmentStatusRequest,
    AddTrackingEventRequest, UpdateEstimatedDeliveryRequest, ApproveReturnRequest,
    RejectReturnRequest, UpdateReturnShippingRequest, MarkReturnReceivedRequest,
    CompleteReturnRequest, CreateRefundRequest
)
from app.features.orders.responses import (
    SupplierOrderItemResponse, ShipmentResponse, ShipmentWithItemsResponse,
    ReturnResponse, RefundResponse, ShipmentAnalyticsResponse
)
from app.features.orders.models.order import OrderItemFulfillmentStatusEnum
from app.features.orders.models.shipment import ShipmentStatusEnum
from app.features.orders.models.return_refund import ReturnStatusEnum

orders_supplier_router = APIRouter(prefix="/supplier/orders", tags=["Supplier Orders"])

logger = get_logger("routes.supplier_orders")

@orders_supplier_router.get("/orders", response_model=PaginatedResponse[SupplierOrderItemResponse])
async def get_supplier_orders(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[OrderItemFulfillmentStatusEnum] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    orders = await order_crud.get_supplier_orders(db, current_user["id"], pagination, status_filter)
    return orders


@orders_supplier_router.get("/orders/{order_item_id}", response_model=SupplierOrderItemResponse)
async def get_order_item_details(
    order_item_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.order import OrderItem, Order
    from sqlalchemy import select
    
    order_item_query = select(OrderItem).where(OrderItem.id == order_item_id)
    order_item_result = await db.execute(order_item_query)
    order_item = order_item_result.scalar_one_or_none()
    
    if not order_item:
        raise NotFoundException("Order item not found")
    
    if str(order_item.supplier_id) != current_user["id"]:
        raise ValidationException("You can only view your own order items")
    
    order_query = select(Order).where(Order.id == order_item.order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    
    item_dict = order_item.to_dict()
    if order:
        item_dict["order"] = order.to_dict()
    
    return SupplierOrderItemResponse(**item_dict)


@orders_supplier_router.put("/orders/{order_item_id}/fulfillment", response_model=SupplierOrderItemResponse)
async def update_order_item_fulfillment(
    order_item_id: str,
    request: UpdateOrderItemFulfillmentRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.order import OrderItem
    from sqlalchemy import select
    
    order_item_query = select(OrderItem).where(OrderItem.id == order_item_id)
    order_item_result = await db.execute(order_item_query)
    order_item = order_item_result.scalar_one_or_none()
    
    if not order_item:
        raise NotFoundException("Order item not found")
    
    if str(order_item.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update your own order items")
    
    order_crud = OrderCRUD()
    updated_item = await order_crud.update_order_item_fulfillment(
        db, order_item_id, request.fulfillment_status, request.tracking_number
    )
    return SupplierOrderItemResponse(**updated_item)


@orders_supplier_router.post("/shipments", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    request: CreateShipmentRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.order import Order
    from sqlalchemy import select
    
    order_query = select(Order).where(Order.id == request.order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    estimated_delivery = None
    if request.estimated_delivery_date:
        estimated_delivery = datetime.fromisoformat(request.estimated_delivery_date.replace('Z', '+00:00'))
    
    shipment_crud = ShipmentCrud()
    shipment = await shipment_crud.create_shipment(
        db, request.order_id, current_user["id"], request.tracking_number,
        request.carrier, request.shipping_cost, request.order_item_ids,
        order.shipping_address, request.carrier_service, estimated_delivery
    )
    return ShipmentResponse(**shipment)


@orders_supplier_router.get("/shipments", response_model=PaginatedResponse[ShipmentWithItemsResponse])
async def get_supplier_shipments(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[ShipmentStatusEnum] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    shipments = await shipment_crud.get_supplier_shipments(db, current_user["id"], pagination, status_filter)
    return shipments


@orders_supplier_router.get("/shipments/{shipment_id}", response_model=ShipmentWithItemsResponse)
async def get_shipment_details(
    shipment_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    shipment = await shipment_crud.get_by_id(db, shipment_id)
    
    if not shipment:
        raise NotFoundException("Shipment not found")
    
    if str(shipment.supplier_id) != current_user["id"]:
        raise ValidationException("You can only view your own shipments")
    
    from app.features.orders.models.shipment import ShipmentItem
    from sqlalchemy import select
    
    items_query = select(ShipmentItem).where(ShipmentItem.shipment_id == shipment_id)
    items_result = await db.execute(items_query)
    shipment_items = items_result.scalars().all()
    
    shipment_dict = shipment.to_dict()
    shipment_dict["items"] = [item.to_dict() for item in shipment_items]
    
    return ShipmentWithItemsResponse(**shipment_dict)


@orders_supplier_router.put("/shipments/{shipment_id}/status", response_model=ShipmentResponse)
async def update_shipment_status(
    shipment_id: str,
    request: UpdateShipmentStatusRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    shipment = await shipment_crud.get_by_id(db, shipment_id)
    
    if not shipment:
        raise NotFoundException("Shipment not found")
    
    if str(shipment.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update your own shipments")
    
    updated_shipment = await shipment_crud.update_shipment_status(
        db, shipment_id, request.status, request.delivery_notes
    )
    return ShipmentResponse(**updated_shipment)


@orders_supplier_router.post("/shipments/{shipment_id}/tracking", response_model=ShipmentResponse)
async def add_tracking_event(
    shipment_id: str,
    request: AddTrackingEventRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    shipment = await shipment_crud.get_by_id(db, shipment_id)
    
    if not shipment:
        raise NotFoundException("Shipment not found")
    
    if str(shipment.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update your own shipments")
    
    event = {
        "event_type": request.event_type,
        "description": request.description,
        "location": request.location,
        "event_time": request.event_time or datetime.utcnow().isoformat()
    }
    
    updated_shipment = await shipment_crud.add_tracking_event(db, shipment_id, event)
    return ShipmentResponse(**updated_shipment)


@orders_supplier_router.put("/shipments/{shipment_id}/delivery-date", response_model=ShipmentResponse)
async def update_estimated_delivery(
    shipment_id: str,
    request: UpdateEstimatedDeliveryRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    shipment = await shipment_crud.get_by_id(db, shipment_id)
    
    if not shipment:
        raise NotFoundException("Shipment not found")
    
    if str(shipment.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update your own shipments")
    
    estimated_date = datetime.fromisoformat(request.estimated_delivery_date.replace('Z', '+00:00'))
    updated_shipment = await shipment_crud.update_estimated_delivery(db, shipment_id, estimated_date)
    return ShipmentResponse(**updated_shipment)


@orders_supplier_router.get("/returns", response_model=PaginatedResponse[ReturnResponse])
async def get_supplier_returns(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[ReturnStatusEnum] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    returns = await return_crud.get_supplier_returns(db, current_user["id"], pagination, status_filter)
    return returns


@orders_supplier_router.get("/returns/{return_id}", response_model=ReturnResponse)
async def get_return_details(
    return_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only view returns for your own products")
    
    return ReturnResponse(**return_request.to_dict())


@orders_supplier_router.put("/returns/{return_id}/approve", response_model=ReturnResponse)
async def approve_return(
    return_id: str,
    request: ApproveReturnRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only approve returns for your own products")
    
    updated_return = await return_crud.approve_return(db, return_id, request.admin_notes)
    return ReturnResponse(**updated_return)


@orders_supplier_router.put("/returns/{return_id}/reject", response_model=ReturnResponse)
async def reject_return(
    return_id: str,
    request: RejectReturnRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only reject returns for your own products")
    
    updated_return = await return_crud.reject_return(db, return_id, request.rejection_reason)
    return ReturnResponse(**updated_return)


@orders_supplier_router.put("/returns/{return_id}/shipping", response_model=ReturnResponse)
async def update_return_shipping(
    return_id: str,
    request: UpdateReturnShippingRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update returns for your own products")
    
    updated_return = await return_crud.update_return_shipping(db, return_id, request.tracking_number)
    return ReturnResponse(**updated_return)


@orders_supplier_router.put("/returns/{return_id}/received", response_model=ReturnResponse)
async def mark_return_received(
    return_id: str,
    request: MarkReturnReceivedRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only update returns for your own products")
    
    updated_return = await return_crud.mark_return_received(db, return_id, request.admin_notes)
    return ReturnResponse(**updated_return)


@orders_supplier_router.put("/returns/{return_id}/complete", response_model=ReturnResponse)
async def complete_return(
    return_id: str,
    request: CompleteReturnRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only complete returns for your own products")
    
    updated_return = await return_crud.complete_return(db, return_id, request.admin_notes)
    return ReturnResponse(**updated_return)


@orders_supplier_router.post("/refunds", response_model=RefundResponse, status_code=status.HTTP_201_CREATED)
async def create_refund(
    request: CreateRefundRequest,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, request.return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.supplier_id) != current_user["id"]:
        raise ValidationException("You can only create refunds for your own returns")
    
    refund_crud = RefundCrud()
    refund = await refund_crud.create_refund(
        db, request.return_id, request.payment_id, request.amount, request.admin_notes
    )
    return RefundResponse(**refund)


@orders_supplier_router.get("/analytics/shipments", response_model=ShipmentAnalyticsResponse)
async def get_shipment_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    
    start_dt = None
    end_dt = None
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    analytics = await shipment_crud.get_shipment_analytics(db, current_user["id"], start_dt, end_dt)
    return ShipmentAnalyticsResponse(**analytics)


@orders_supplier_router.get("/analytics/orders")
async def get_supplier_order_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, Any]:
    from app.features.orders.models.order import OrderItem
    from sqlalchemy import select, func
    
    query = select(OrderItem).where(OrderItem.supplier_id == current_user["id"])
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.where(OrderItem.created_at >= start_dt)
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.where(OrderItem.created_at <= end_dt)
    
    order_items_result = await db.execute(query)
    order_items = order_items_result.scalars().all()
    
    total_orders = len(order_items)
    total_revenue = sum(float(item.total_price) for item in order_items)
    
    status_counts = {}
    for item in order_items:
        status = item.fulfillment_status
        status_counts[status.value] = status_counts.get(status.value, 0) + 1
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0,
        "status_breakdown": status_counts,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }
