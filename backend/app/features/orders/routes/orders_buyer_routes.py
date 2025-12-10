from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from app.core.role_auth import require_buyer
from app.core.pagination import PaginationParams, PaginatedResponse
from app.core.base import SuccessResponse
from app.core.exceptions import ValidationException, NotFoundException
from app.core.logging import get_logger
from app.database.session import get_async_session
from app.features.orders.cruds import CartCrud, OrderCRUD, PaymentCrud, ReturnCrud
from app.features.orders.requests import (
    AddToCartRequest, UpdateCartItemRequest, TransferCartRequest,
    OrderCreateRequest, OrderCancelRequest, CreateReturnRequest
)
from app.features.orders.responses import (
    CartResponse, CartWithItemsResponse, OrderResponse, OrderWithItemsResponse,
    PaymentResponse, ReturnResponse
)
from app.features.orders.models.order import OrderStatusEnum
from app.core.role_auth import get_all_users

orders_buyer_router = APIRouter(prefix="/buyer/orders", tags=["Buyer Orders"])

logger = get_logger("routes.buyer_orders")

@orders_buyer_router.get("/cart", response_model=CartWithItemsResponse)
async def get_cart(
    session_id: Optional[str] = Query(None),
    current_user: Optional[Dict[str, Any]] = Depends(get_all_users),
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    try:
        # Ensure user exists in database if authenticated
        if current_user and current_user.get("id"):
            from app.core.user_helper import ensure_user_exists_in_db
            from app.features.auth.cruds.auth_crud import AuthCrud
            auth_crud = AuthCrud()
            user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
            
            if not user_exists:
                # Retry once with delay
                import asyncio
                await asyncio.sleep(0.5)
                user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
                if not user_exists:
                    logger.error(f"Failed to create user {current_user['id']} in public.users table")
                    from app.core.exceptions import ValidationException
                    raise ValidationException(f"User account not properly set up. Please try logging out and back in.")
        
        cart_crud = CartCrud()
        
        if current_user and current_user.get("id"):
            cart = await cart_crud.get_or_create_cart(db, user_id=current_user["id"])
        else:
            if not session_id:
                raise ValidationException("Session ID is required for guest users")
            cart = await cart_crud.get_or_create_cart(db, session_id=session_id)
        
        cart_with_items = await cart_crud.get_cart_with_items(db, str(cart.id))
        return cart_with_items
    except Exception as e:
        logger.error(f"Error in get_cart: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise

@orders_buyer_router.post("/cart/items", response_model=SuccessResponse)
async def add_to_cart(
    request: AddToCartRequest,
    session_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        cart_crud = CartCrud()
        
        # CRITICAL: Ensure user exists before attempting cart operations
        # This prevents ForeignKeyViolationError when creating cart
        if current_user:
            user_id = current_user["id"]
            logger.info(f"Ensuring user {user_id} exists before cart operations")
            
            # Ensure user exists in database
            from app.core.user_helper import ensure_user_exists_in_db
            from app.features.auth.cruds.auth_crud import AuthCrud
            auth_crud = AuthCrud()
            user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
            
            if not user_exists:
                # Retry once with delay
                import asyncio
                await asyncio.sleep(0.5)
                user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
                if not user_exists:
                    logger.error(f"Failed to create user {user_id} in public.users table")
                    from app.core.exceptions import ValidationException
                    raise ValidationException(f"User account not properly set up. Please try logging out and back in.")
            
            logger.info(f"🔍 Getting or creating cart for user_id: {user_id}")
            cart = await cart_crud.get_or_create_cart(db, user_id=user_id)
            logger.info(f"✅ Cart retrieved/created: {cart.id}")
        else:
            if not session_id:
                raise ValidationException("Session ID is required for guest users")
            cart = await cart_crud.get_or_create_cart(db, session_id=session_id)
        
        logger.info(f"🛒 Adding item to cart: Cart={cart.id}, Product={request.product_id}, Qty={request.quantity}, Variant={request.variant_id}")
        cart_item = await cart_crud.add_item_to_cart(
            db, str(cart.id), request.product_id, request.quantity, request.variant_id
        )
        logger.info(f"✅✅ Route: Item successfully added, CartItem ID: {cart_item.id}")
        
        return SuccessResponse(message="Item added to cart successfully")
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error adding item to cart: {str(e)}\n{error_details}", exc_info=True)
        # Convert to HTTPException with detailed error message for debugging
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add item to cart: {str(e)}"
        )


@orders_buyer_router.put("/cart/items/{cart_item_id}", response_model=SuccessResponse)
async def update_cart_item(
    cart_item_id: str,
    request: UpdateCartItemRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    cart_crud = CartCrud()
    
    if request.quantity == 0:
        await cart_crud.remove_cart_item(db, cart_item_id)
        return SuccessResponse(message="Item removed from cart")
    else:
        await cart_crud.update_cart_item_quantity(db, cart_item_id, request.quantity)
        return SuccessResponse(message="Cart item updated successfully")


@orders_buyer_router.delete("/cart/items/{cart_item_id}", response_model=SuccessResponse)
async def remove_cart_item(
    cart_item_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    cart_crud = CartCrud()
    await cart_crud.remove_cart_item(db, cart_item_id)
    return SuccessResponse(message="Item removed from cart")


@orders_buyer_router.delete("/cart/clear", response_model=SuccessResponse)
async def clear_cart(
    session_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    cart_crud = CartCrud()
    
    if current_user:
        cart = await cart_crud.get_or_create_cart(db, user_id=current_user["id"])
    else:
        if not session_id:
            raise ValidationException("Session ID is required for guest users")
        cart = await cart_crud.get_or_create_cart(db, session_id=session_id)
    
    await cart_crud.clear_cart(db, cart.id)
    return SuccessResponse(message="Cart cleared successfully")


@orders_buyer_router.post("/cart/transfer", response_model=CartResponse)
async def transfer_cart(
    request: TransferCartRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    cart_crud = CartCrud()
    cart = await cart_crud.transfer_cart_to_user(db, request.session_id, current_user["id"])
    return cart


@orders_buyer_router.get("/cart/count")
async def get_cart_count(
    session_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, int]:
    cart_crud = CartCrud()
    
    if current_user:
        count = await cart_crud.get_cart_count(db, user_id=current_user["id"])
    else:
        count = await cart_crud.get_cart_count(db, session_id=session_id) if session_id else 0
    
    return {"count": count}


@orders_buyer_router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    request: OrderCreateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.create_order_from_cart(
        db, current_user["id"], request
    )
    return order


@orders_buyer_router.get("/", response_model=PaginatedResponse[OrderResponse])
async def get_user_orders(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[OrderStatusEnum] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    orders = await order_crud.get_user_orders(db, current_user["id"], pagination, status_filter)
    return orders


@orders_buyer_router.get("/{order_id}", response_model=OrderWithItemsResponse)
async def get_order_details(
    order_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.get_by_id(db, order_id)
    
    if not order:
        raise NotFoundException("Order not found")
    
    if str(order.user_id) != current_user["id"]:
        raise ValidationException("You can only view your own orders")
    
    order_dict = order.to_dict()
    
    from app.features.orders.models.order import OrderItem
    from sqlalchemy import select
    items_query = select(OrderItem).where(OrderItem.order_id == order_id)
    items_result = await db.execute(items_query)
    order_items = items_result.scalars().all()
    order_dict["items"] = [item.to_dict() for item in order_items]
    
    return OrderWithItemsResponse(**order_dict)


@orders_buyer_router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    request: OrderCancelRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.cancel_order(db, order_id, current_user["id"], request)
    return order


@orders_buyer_router.get("/{order_id}/payments", response_model=list[PaymentResponse])
async def get_order_payments(
    order_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.get_by_id(db, order_id)
    
    if not order:
        raise NotFoundException("Order not found")
    
    if str(order.user_id) != current_user["id"]:
        raise ValidationException("You can only view payments for your own orders")
    
    payment_crud = PaymentCrud()
    payments = await payment_crud.get_order_payments(db, order_id)
    return payments


@orders_buyer_router.get("/payments/", response_model=PaginatedResponse[PaymentResponse])
async def get_user_payments(
    pagination: PaginationParams = Depends(),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    payment_crud = PaymentCrud()
    payments = await payment_crud.get_user_payments(db, current_user["id"], pagination)
    return payments


@orders_buyer_router.post("/returns", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED)
async def create_return_request(
    request: CreateReturnRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.create_return_request(
        db, current_user["id"], request.order_item_id, request.reason,
        request.description, request.quantity, request.images
    )
    return return_request


@orders_buyer_router.get("/returns/", response_model=PaginatedResponse[ReturnResponse])
async def get_user_returns(
    pagination: PaginationParams = Depends(),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    returns = await return_crud.get_user_returns(db, current_user["id"], pagination)
    return returns


@orders_buyer_router.get("/returns/{return_id}", response_model=ReturnResponse)
async def get_return_details(
    return_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    return_request = await return_crud.get_by_id(db, return_id)
    
    if not return_request:
        raise NotFoundException("Return request not found")
    
    if str(return_request.user_id) != current_user["id"]:
        raise ValidationException("You can only view your own return requests")
    
    return ReturnResponse(**return_request.to_dict())


@orders_buyer_router.get("/{order_id}/track")
async def track_order(
    order_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, Any]:
    order_crud = OrderCRUD()
    order = await order_crud.get_by_id(db, order_id)
    
    if not order:
        raise NotFoundException("Order not found")
    
    if str(order.user_id) != current_user["id"]:
        raise ValidationException("You can only track your own orders")
    
    from app.features.orders.cruds import ShipmentCrud
    shipment_crud = ShipmentCrud()
    shipments = await shipment_crud.get_order_shipments(db, order_id)
    
    return {
        "order_id": order_id,
        "order_number": order.order_number,
        "status": order.status,
        "shipments": shipments
    }
