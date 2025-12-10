from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.features.orders.models.order import OrderStatusEnum, PaymentStatusEnum, FulfillmentStatusEnum, OrderItemFulfillmentStatusEnum


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    variant_id: Optional[str] = None
    supplier_id: str
    product_name: str
    variant_title: Optional[str] = None
    sku: str
    quantity: int
    unit_price: float
    total_price: float
    fulfillment_status: OrderItemFulfillmentStatusEnum
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_number: str
    status: OrderStatusEnum
    payment_status: PaymentStatusEnum
    fulfillment_status: FulfillmentStatusEnum
    currency: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    billing_address: Dict[str, Any]
    shipping_address: Dict[str, Any]
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    processed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    items_count: int
    created_at: datetime
    updated_at: datetime


class OrderWithItemsResponse(BaseModel):
    id: str
    user_id: str
    order_number: str
    status: OrderStatusEnum
    payment_status: PaymentStatusEnum
    fulfillment_status: FulfillmentStatusEnum
    currency: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    billing_address: Dict[str, Any]
    shipping_address: Dict[str, Any]
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    processed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    items_count: int
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime


class OrderSummaryResponse(BaseModel):
    id: str
    order_number: str
    status: OrderStatusEnum
    payment_status: PaymentStatusEnum
    total_amount: float
    items_count: int
    created_at: datetime


class OrderAnalyticsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    average_order_value: float
    status_breakdown: Dict[str, int]
    period: Dict[str, Optional[str]]


class SupplierOrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    variant_id: Optional[str] = None
    product_name: str
    variant_title: Optional[str] = None
    sku: str
    quantity: int
    unit_price: float
    total_price: float
    fulfillment_status: OrderItemFulfillmentStatusEnum
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    order: Optional[OrderResponse] = None
    created_at: datetime
    updated_at: datetime


class BulkOrderUpdateResponse(BaseModel):
    message: str
    updated_count: int
    failed_count: int
    failed_orders: List[Dict[str, str]] = []
