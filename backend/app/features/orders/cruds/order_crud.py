from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, desc, func
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import secrets
import string

from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.exceptions import NotFoundException, ValidationException, ConflictException, BadRequestException
from app.core.logging import get_logger
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.orders.models.order import Order, OrderItem, OrderStatusEnum, PaymentStatusEnum
from app.features.orders.models.cart import Cart, CartItem
from app.features.orders.models.payment import Payment
from app.features.auth.models.address import Address
from app.features.orders.requests.order_request import OrderCreateRequest, OrderUpdateStatusRequest, OrderCancelRequest
from app.features.orders.responses.order_response import OrderResponse, OrderWithItemsResponse, OrderSummaryResponse

logger = get_logger("crud.orders")

class OrderCRUD(BaseCrud[Order]):
    def __init__(self):
        super().__init__(get_supabase_client(), Order)
    
    def generate_order_number(self) -> str:
        timestamp = datetime.now().strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.digits) for _ in range(6))
        return f"ORD-{timestamp}-{random_part}"
    
    async def create_order_from_cart(self, db: AsyncSession, user_id: UUID, request: OrderCreateRequest) -> OrderResponse:
        try:
            cart_query = select(Cart).where(Cart.user_id == user_id).options(
                selectinload(Cart.items).selectinload(CartItem.product),
                selectinload(Cart.items).selectinload(CartItem.variant)
            )
            cart_result = await db.execute(cart_query)
            cart = cart_result.scalar_one_or_none()
            
            if not cart or not cart.items:
                raise ValidationException("Cart is empty")
            
            billing_address_query = select(Address).where(
                and_(Address.id == request.billing_address_id, Address.user_id == user_id)
            )
            billing_result = await db.execute(billing_address_query)
            billing_address = billing_result.scalar_one_or_none()
            
            if not billing_address:
                raise NotFoundException("Billing address not found")
            
            shipping_address_id = request.shipping_address_id if request.use_different_shipping else request.billing_address_id
            shipping_address_query = select(Address).where(
                and_(Address.id == shipping_address_id, Address.user_id == user_id)
            )
            shipping_result = await db.execute(shipping_address_query)
            shipping_address = shipping_result.scalar_one_or_none()
            
            if not shipping_address:
                raise NotFoundException("Shipping address not found")
            
            # Use raw SQL INSERT with proper enum casting to avoid type mismatch
            from sqlalchemy import text
            import json
            order_number = self.generate_order_number()
            billing_addr_json = json.dumps(self.address_to_dict(billing_address))
            shipping_addr_json = json.dumps(self.address_to_dict(shipping_address))
            
            # Columns are now VARCHAR, so we can use SQLAlchemy ORM directly
            order = Order(
                user_id=user_id,
                order_number=order_number,
                status='pending',
                payment_status='pending',
                fulfillment_status='unfulfilled',
                currency=cart.currency,
                subtotal=cart.subtotal,
                tax_amount=cart.tax_amount,
                shipping_amount=cart.shipping_amount,
                discount_amount=cart.discount_amount,
                total_amount=cart.total_amount,
                billing_address=self.address_to_dict(billing_address),
                shipping_address=self.address_to_dict(shipping_address),
                customer_notes=request.customer_notes
            )
            
            db.add(order)
            await db.flush()  # Get the ID without committing
            
            for cart_item in cart.items:
                product = cart_item.product
                variant = cart_item.variant
                
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=cart_item.product_id,
                    variant_id=cart_item.variant_id,
                    supplier_id=product.supplier_id,
                    product_name=product.name,
                    variant_title=variant.title if variant else None,
                    sku=variant.sku if variant else product.sku,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.unit_price,
                    total_price=cart_item.total_price,
                    fulfillment_status='unfulfilled'  # String value for String column
                )
                db.add(order_item)
            
            payment = Payment(
                order_id=order.id,
                payment_method=request.payment_method,
                payment_gateway="razorpay",
                amount=order.total_amount,
                currency=order.currency
            )
            db.add(payment)
            
            await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
            cart.subtotal = 0
            cart.total_amount = 0
            
            await db.commit()
            await db.refresh(order)
            logger.info(f"Order created: {order.id} for user {user_id}")
            return OrderResponse(**order.to_dict())
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise
    
    def address_to_dict(self, address: Address) -> Dict[str, Any]:
        return {
            "first_name": address.first_name,
            "last_name": address.last_name,
            "company": address.company,
            "address_line_1": address.address_line_1,
            "address_line_2": address.address_line_2,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country,
            "phone": address.phone
        }
    
    async def get_user_orders(self, db: AsyncSession, user_id: UUID, pagination: PaginationParams, status_filter: Optional[OrderStatusEnum] = None) -> PaginatedResponse[OrderResponse]:
        try:
            query = select(Order).where(Order.user_id == user_id).options(
                selectinload(Order.items),
                selectinload(Order.payments)
            ).order_by(desc(Order.created_at))
            
            if status_filter:
                query = query.where(Order.status == status_filter)
            
            count_query = select(func.count(Order.id)).where(Order.user_id == user_id)
            if status_filter:
                count_query = count_query.where(Order.status == status_filter)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            offset = pagination.offset
            query = query.offset(offset).limit(pagination.limit)
            
            result = await db.execute(query)
            orders = result.scalars().all()
            
            orders_data = [OrderResponse(**order.to_dict()) for order in orders]
            
            return PaginatedResponse.create(
                items=orders_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting user orders: {str(e)}")
            raise
    
    async def get_order_by_id(self, db: AsyncSession, order_id: UUID, user_id: Optional[UUID] = None) -> Optional[OrderWithItemsResponse]:
        query = select(Order).where(Order.id == order_id).options(
            selectinload(Order.items),
            selectinload(Order.payments),
            selectinload(Order.shipments)
        )
        
        if user_id:
            query = query.where(Order.user_id == user_id)
        
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if order:
            return OrderWithItemsResponse(**order.to_dict())
        return None
    
    async def get_order_by_number(self, db: AsyncSession, order_number: str, user_id: Optional[UUID] = None) -> Optional[OrderWithItemsResponse]:
        query = select(Order).where(Order.order_number == order_number).options(
            selectinload(Order.items),
            selectinload(Order.payments)
        )
        
        if user_id:
            query = query.where(Order.user_id == user_id)
        
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if order:
            return OrderWithItemsResponse(**order.to_dict())
        return None
    
    async def update_order_status(self, db: AsyncSession, order_id: UUID, request: OrderUpdateStatusRequest) -> Optional[OrderResponse]:
        order = await self.get_by_id(db, str(order_id))
        if not order:
            return None
        
        update_data = {"status": request.status}
        
        if request.status == OrderStatusEnum.PROCESSING:
            update_data["processed_at"] = datetime.utcnow()
        elif request.status == OrderStatusEnum.SHIPPED:
            update_data["shipped_at"] = datetime.utcnow()
        elif request.status == OrderStatusEnum.DELIVERED:
            update_data["delivered_at"] = datetime.utcnow()
        elif request.status == OrderStatusEnum.CANCELLED:
            update_data["cancelled_at"] = datetime.utcnow()
        
        if request.admin_notes:
            update_data["admin_notes"] = request.admin_notes
        
        updated_order = await self.update(db, str(order_id), update_data)
        return OrderResponse(**updated_order.to_dict())
    
    async def cancel_order(self, db: AsyncSession, order_id: UUID, user_id: UUID, request: OrderCancelRequest) -> OrderResponse:
        order = await self.get_by_id(db, str(order_id))
        if not order:
            raise NotFoundException("Order not found")
            
        if order.user_id != user_id:
            raise ValidationException("You can only cancel your own orders")
        
        if order.status not in [OrderStatusEnum.PENDING, OrderStatusEnum.CONFIRMED]:
            raise ValidationException("Order cannot be cancelled")
        
        update_data = {
            "status": OrderStatusEnum.CANCELLED,
            "cancelled_at": datetime.utcnow(),
            "cancel_reason": request.cancel_reason
        }
        
        updated_order = await self.update(db, str(order_id), update_data)
        return OrderResponse(**updated_order.to_dict())
    
    async def get_supplier_orders(self, db: AsyncSession, supplier_id: UUID, pagination: PaginationParams) -> PaginatedResponse[OrderResponse]:
        try:
            query = select(Order).join(OrderItem).where(OrderItem.supplier_id == supplier_id).options(
                selectinload(Order.items),
                selectinload(Order.payments)
            ).order_by(desc(Order.created_at)).distinct()
            
            count_query = select(func.count(Order.id.distinct())).join(OrderItem).where(OrderItem.supplier_id == supplier_id)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            offset = pagination.offset
            query = query.offset(offset).limit(pagination.limit)
            
            result = await db.execute(query)
            orders = result.scalars().all()
            
            orders_data = [OrderResponse(**order.to_dict()) for order in orders]
            
            return PaginatedResponse.create(
                items=orders_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting supplier orders: {str(e)}")
            raise
