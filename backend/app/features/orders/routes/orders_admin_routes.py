from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.core.role_auth import require_admin
from app.core.pagination import PaginationParams, PaginatedResponse
from app.core.base import SuccessResponse
from app.core.exceptions import ValidationException, NotFoundException
from app.core.logging import get_logger
from app.database.session import get_async_session
from app.features.orders.cruds import OrderCRUD, PaymentCrud, ShipmentCrud, ReturnCrud, RefundCrud, CartCrud
from app.features.orders.requests import (
    OrderUpdateStatusRequest, OrderSearchRequest, OrderAnalyticsRequest,
    BulkOrderUpdateRequest, PaymentAnalyticsRequest, ProcessPaymentRequest,
    InitiateRefundRequest, ShipmentAnalyticsRequest, BulkShipmentUpdateRequest,
    ReturnAnalyticsRequest, RefundAnalyticsRequest, BulkReturnUpdateRequest,
    ProcessRefundRequest, CancelRefundRequest
)
from app.features.orders.responses import (
    OrderResponse, OrderWithItemsResponse, OrderAnalyticsResponse, BulkOrderUpdateResponse,
    PaymentResponse, PaymentAnalyticsResponse, FailedPaymentResponse,
    ShipmentResponse, ShipmentAnalyticsResponse, BulkShipmentUpdateResponse,
    ReturnResponse, RefundResponse, ReturnAnalyticsResponse, RefundAnalyticsResponse,
    BulkReturnUpdateResponse
)
from app.features.orders.models.order import OrderStatusEnum
from app.features.orders.models.payment import PaymentMethodStatusEnum
from app.features.orders.models.shipment import ShipmentStatusEnum
from app.features.orders.models.return_refund import ReturnStatusEnum, RefundStatusEnum

orders_admin_router = APIRouter(prefix="/orders/admin", tags=["Admin Orders"])
logger = get_logger("routes.admin_orders")


@orders_admin_router.get("/orders", response_model=PaginatedResponse[OrderWithItemsResponse])
async def get_all_orders(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[OrderStatusEnum] = Query(None, alias="status"),
    user_id: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.order import Order, OrderItem
    from sqlalchemy import select, and_
    
    from sqlalchemy import func
    
    query = select(Order)
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    if user_id:
        query = query.where(Order.user_id == user_id)
    if supplier_id:
        items_query = select(OrderItem.order_id).where(OrderItem.supplier_id == supplier_id)
        items_result = await db.execute(items_query)
        order_ids = [str(row[0]) for row in items_result.fetchall()]
        if order_ids:
            query = query.where(Order.id.in_(order_ids))
        else:
            return PaginatedResponse.create(items=[], total=0, page=pagination.page, limit=pagination.limit)
    
    query = query.order_by(Order.created_at.desc())
    
    count_query = select(func.count()).select_from(Order)
    if status_filter:
        count_query = count_query.where(Order.status == status_filter)
    if user_id:
        count_query = count_query.where(Order.user_id == user_id)
    if supplier_id and order_ids:
        count_query = count_query.where(Order.id.in_(order_ids))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    orders_result = await db.execute(query)
    orders = orders_result.scalars().all()
    
    orders_data = []
    for order in orders:
        order_dict = order.to_dict()
        
        items_query = select(OrderItem).where(OrderItem.order_id == order.id)
        items_result = await db.execute(items_query)
        order_items = items_result.scalars().all()
        order_dict["items"] = [item.to_dict() for item in order_items]
        
        orders_data.append(order_dict)
    
    return PaginatedResponse.create(
        items=[OrderWithItemsResponse(**order) for order in orders_data],
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )


@orders_admin_router.get("/orders/{order_id}", response_model=OrderWithItemsResponse)
async def get_order_details(
    order_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.get_by_id(db, order_id)
    
    if not order:
        raise NotFoundException("Order not found")
    
    from app.features.orders.models.order import OrderItem
    from sqlalchemy import select
    
    order_dict = order.to_dict()
    items_query = select(OrderItem).where(OrderItem.order_id == order_id)
    items_result = await db.execute(items_query)
    order_items = items_result.scalars().all()
    order_dict["items"] = [item.to_dict() for item in order_items]
    
    return OrderWithItemsResponse(**order_dict)


@orders_admin_router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    request: OrderUpdateStatusRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    order = await order_crud.update_order_status(db, order_id, request)
    return order


@orders_admin_router.post("/orders/search", response_model=PaginatedResponse[OrderWithItemsResponse])
async def search_orders(
    request: OrderSearchRequest,
    pagination: PaginationParams = Depends(),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    orders = await order_crud.search_orders(db, request.search_term, pagination)
    return orders


@orders_admin_router.post("/orders/bulk-update", response_model=BulkOrderUpdateResponse)
async def bulk_update_orders(
    request: BulkOrderUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    updated_count = 0
    failed_count = 0
    failed_orders = []
    
    for order_id in request.order_ids:
        try:
            await order_crud.update_order_status(db, order_id, request.status, request.admin_notes)
            updated_count += 1
        except Exception as e:
            failed_count += 1
            failed_orders.append({"order_id": order_id, "error": str(e)})
    
    return BulkOrderUpdateResponse(
        message=f"Updated {updated_count} orders, {failed_count} failed",
        updated_count=updated_count,
        failed_count=failed_count,
        failed_orders=failed_orders
    )


@orders_admin_router.get("/analytics/orders", response_model=OrderAnalyticsResponse)
async def get_order_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    order_crud = OrderCRUD()
    
    start_dt = None
    end_dt = None
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    analytics = await order_crud.get_order_analytics(db, start_dt, end_dt)
    return OrderAnalyticsResponse(**analytics)


@orders_admin_router.get("/payments", response_model=PaginatedResponse[PaymentResponse])
async def get_all_payments(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[PaymentMethodStatusEnum] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    payment_gateway: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.payment import Payment
    from sqlalchemy import select, func
    
    query = select(Payment)
    
    if status_filter:
        query = query.where(Payment.status == status_filter)
    if payment_method:
        query = query.where(Payment.payment_method == payment_method)
    if payment_gateway:
        query = query.where(Payment.payment_gateway == payment_gateway)
    
    query = query.order_by(Payment.created_at.desc())
    
    count_query = select(func.count()).select_from(Payment)
    if status_filter:
        count_query = count_query.where(Payment.status == status_filter)
    if payment_method:
        count_query = count_query.where(Payment.payment_method == payment_method)
    if payment_gateway:
        count_query = count_query.where(Payment.payment_gateway == payment_gateway)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    payments_result = await db.execute(query)
    payments = payments_result.scalars().all()
    
    return PaginatedResponse.create(
        items=[PaymentResponse(**payment.to_dict()) for payment in payments],
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )


@orders_admin_router.put("/payments/{payment_id}/process", response_model=PaymentResponse)
async def process_payment(
    payment_id: str,
    request: ProcessPaymentRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    payment_crud = PaymentCrud()
    payment = await payment_crud.process_payment(db, payment_id, request.gateway_response, request.success)
    return PaymentResponse(**payment)


@orders_admin_router.post("/payments/{payment_id}/refund", response_model=PaymentResponse)
async def initiate_payment_refund(
    payment_id: str,
    request: InitiateRefundRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    payment_crud = PaymentCrud()
    payment = await payment_crud.initiate_refund(db, payment_id, request.refund_amount, request.reason)
    return PaymentResponse(**payment)


@orders_admin_router.get("/payments/failed", response_model=PaginatedResponse[FailedPaymentResponse])
async def get_failed_payments(
    pagination: PaginationParams = Depends(),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    payment_crud = PaymentCrud()
    payments = await payment_crud.get_failed_payments(db, pagination)
    return payments


@orders_admin_router.get("/analytics/payments", response_model=PaymentAnalyticsResponse)
async def get_payment_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    payment_crud = PaymentCrud()
    
    start_dt = None
    end_dt = None
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    analytics = await payment_crud.get_payment_analytics(db, start_dt, end_dt)
    return PaymentAnalyticsResponse(**analytics)


@orders_admin_router.get("/shipments", response_model=PaginatedResponse[ShipmentResponse])
async def get_all_shipments(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[ShipmentStatusEnum] = Query(None, alias="status"),
    carrier: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.shipment import Shipment
    from sqlalchemy import select, func
    
    query = select(Shipment)
    
    if status_filter:
        query = query.where(Shipment.status == status_filter)
    if carrier:
        query = query.where(Shipment.carrier == carrier)
    if supplier_id:
        query = query.where(Shipment.supplier_id == supplier_id)
    
    query = query.order_by(Shipment.created_at.desc())
    
    count_query = select(func.count()).select_from(Shipment)
    if status_filter:
        count_query = count_query.where(Shipment.status == status_filter)
    if carrier:
        count_query = count_query.where(Shipment.carrier == carrier)
    if supplier_id:
        count_query = count_query.where(Shipment.supplier_id == supplier_id)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    shipments_result = await db.execute(query)
    shipments = shipments_result.scalars().all()
    
    return PaginatedResponse.create(
        items=[ShipmentResponse(**shipment.to_dict()) for shipment in shipments],
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )


@orders_admin_router.post("/shipments/bulk-update", response_model=BulkShipmentUpdateResponse)
async def bulk_update_shipments(
    request: BulkShipmentUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    updated_count = 0
    failed_count = 0
    failed_shipments = []
    
    for shipment_id in request.shipment_ids:
        try:
            await shipment_crud.update_shipment_status(db, shipment_id, request.status, request.delivery_notes)
            updated_count += 1
        except Exception as e:
            failed_count += 1
            failed_shipments.append({"shipment_id": shipment_id, "error": str(e)})
    
    return BulkShipmentUpdateResponse(
        message=f"Updated {updated_count} shipments, {failed_count} failed",
        updated_count=updated_count,
        failed_count=failed_count,
        failed_shipments=failed_shipments
    )


@orders_admin_router.get("/analytics/shipments", response_model=ShipmentAnalyticsResponse)
async def get_shipment_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    shipment_crud = ShipmentCrud()
    
    start_dt = None
    end_dt = None
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    analytics = await shipment_crud.get_shipment_analytics(db, supplier_id, start_dt, end_dt)
    return ShipmentAnalyticsResponse(**analytics)


@orders_admin_router.get("/returns", response_model=PaginatedResponse[ReturnResponse])
async def get_all_returns(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[ReturnStatusEnum] = Query(None, alias="status"),
    supplier_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.return_refund import Return
    from sqlalchemy import select, func
    
    query = select(Return)
    
    if status_filter:
        query = query.where(Return.status == status_filter)
    if supplier_id:
        query = query.where(Return.supplier_id == supplier_id)
    if user_id:
        query = query.where(Return.user_id == user_id)
    
    query = query.order_by(Return.created_at.desc())
    
    count_query = select(func.count()).select_from(Return)
    if status_filter:
        count_query = count_query.where(Return.status == status_filter)
    if supplier_id:
        count_query = count_query.where(Return.supplier_id == supplier_id)
    if user_id:
        count_query = count_query.where(Return.user_id == user_id)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    returns_result = await db.execute(query)
    returns = returns_result.scalars().all()
    
    return PaginatedResponse.create(
        items=[ReturnResponse(**return_req.to_dict()) for return_req in returns],
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )


@orders_admin_router.post("/returns/bulk-update", response_model=BulkReturnUpdateResponse)
async def bulk_update_returns(
    request: BulkReturnUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    return_crud = ReturnCrud()
    updated_count = 0
    failed_count = 0
    failed_returns = []
    
    for return_id in request.return_ids:
        try:
            if request.status == ReturnStatusEnum.APPROVED:
                await return_crud.approve_return(db, return_id, request.admin_notes)
            elif request.status == ReturnStatusEnum.REJECTED:
                await return_crud.reject_return(db, return_id, request.admin_notes or "Bulk rejection")
            elif request.status == ReturnStatusEnum.COMPLETED:
                await return_crud.complete_return(db, return_id, request.admin_notes)
            updated_count += 1
        except Exception as e:
            failed_count += 1
            failed_returns.append({"return_id": return_id, "error": str(e)})
    
    return BulkReturnUpdateResponse(
        message=f"Updated {updated_count} returns, {failed_count} failed",
        updated_count=updated_count,
        failed_count=failed_count,
        failed_returns=failed_returns
    )


@orders_admin_router.get("/refunds", response_model=PaginatedResponse[RefundResponse])
async def get_all_refunds(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[RefundStatusEnum] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.return_refund import Refund
    from sqlalchemy import select, func
    
    query = select(Refund)
    
    if status_filter:
        query = query.where(Refund.status == status_filter)
    
    query = query.order_by(Refund.created_at.desc())
    
    count_query = select(func.count()).select_from(Refund)
    if status_filter:
        count_query = count_query.where(Refund.status == status_filter)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    refunds_result = await db.execute(query)
    refunds = refunds_result.scalars().all()
    
    return PaginatedResponse.create(
        items=[RefundResponse(**refund.to_dict()) for refund in refunds],
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )


@orders_admin_router.put("/refunds/{refund_id}/process", response_model=RefundResponse)
async def process_refund(
    refund_id: str,
    request: ProcessRefundRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    refund_crud = RefundCrud()
    refund = await refund_crud.process_refund(
        db, refund_id, request.gateway_refund_id, request.gateway_response, request.success
    )
    return RefundResponse(**refund)


@orders_admin_router.put("/refunds/{refund_id}/cancel", response_model=RefundResponse)
async def cancel_refund(
    refund_id: str,
    request: CancelRefundRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    refund_crud = RefundCrud()
    refund = await refund_crud.cancel_refund(db, refund_id, request.reason)
    return RefundResponse(**refund)


@orders_admin_router.get("/analytics/returns", response_model=ReturnAnalyticsResponse)
async def get_return_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.orders.models.return_refund import Return
    from sqlalchemy import select
    
    query = select(Return)
    
    if supplier_id:
        query = query.where(Return.supplier_id == supplier_id)
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.where(Return.created_at >= start_dt)
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.where(Return.created_at <= end_dt)
    
    returns_result = await db.execute(query)
    returns = returns_result.scalars().all()
    
    total_returns = len(returns)
    total_quantity = sum(return_req.quantity for return_req in returns)
    
    reason_breakdown = {}
    status_breakdown = {}
    
    for return_req in returns:
        reason = return_req.reason.value
        status = return_req.status.value
        reason_breakdown[reason] = reason_breakdown.get(reason, 0) + 1
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
    
    approved_returns = [r for r in returns if r.status == ReturnStatusEnum.APPROVED]
    approval_rate = (len(approved_returns) / total_returns * 100) if total_returns > 0 else 0
    
    return ReturnAnalyticsResponse(
        total_returns=total_returns,
        total_quantity=total_quantity,
        reason_breakdown=reason_breakdown,
        status_breakdown=status_breakdown,
        average_processing_time_hours=None,
        approval_rate=approval_rate,
        period={
            "start_date": start_date,
            "end_date": end_date
        }
    )


@orders_admin_router.get("/analytics/refunds", response_model=RefundAnalyticsResponse)
async def get_refund_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    refund_crud = RefundCrud()
    
    start_dt = None
    end_dt = None
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    analytics = await refund_crud.get_refund_analytics(db, start_dt, end_dt)
    return RefundAnalyticsResponse(**analytics)


@orders_admin_router.get("/dashboard")
async def get_admin_dashboard(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, Any]:
    from app.features.orders.models.order import Order
    from app.features.orders.models.payment import Payment
    from app.features.orders.models.shipment import Shipment
    from app.features.orders.models.return_refund import Return
    from sqlalchemy import select, func
    
    orders_count = await db.execute(select(func.count()).select_from(Order))
    payments_count = await db.execute(select(func.count()).select_from(Payment))
    shipments_count = await db.execute(select(func.count()).select_from(Shipment))
    returns_count = await db.execute(select(func.count()).select_from(Return))
    
    pending_orders = await db.execute(select(func.count()).select_from(Order).where(Order.status == OrderStatusEnum.PENDING))
    failed_payments = await db.execute(select(func.count()).select_from(Payment).where(Payment.status == PaymentMethodStatusEnum.FAILED))
    
    total_revenue = await db.execute(select(func.sum(Order.total_amount)).select_from(Order).where(Order.status.in_([OrderStatusEnum.CONFIRMED, OrderStatusEnum.DELIVERED])))
    
    return {
        "total_orders": orders_count.scalar(),
        "total_payments": payments_count.scalar(),
        "total_shipments": shipments_count.scalar(),
        "total_returns": returns_count.scalar(),
        "pending_orders": pending_orders.scalar(),
        "failed_payments": failed_payments.scalar(),
        "total_revenue": float(total_revenue.scalar() or 0),
        "timestamp": datetime.utcnow().isoformat()
    }


@orders_admin_router.post("/maintenance/cleanup-expired-carts", response_model=SuccessResponse)
async def cleanup_expired_carts(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    cart_crud = CartCrud()
    cleaned_count = await cart_crud.cleanup_expired_carts(db)
    return SuccessResponse(message=f"Cleaned up {cleaned_count} expired carts")
