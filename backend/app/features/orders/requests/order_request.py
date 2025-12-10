from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
import uuid
from app.features.orders.models.order import OrderStatusEnum, OrderItemFulfillmentStatusEnum
from app.core.exceptions import ValidationException


class OrderCreateRequest(BaseModel):
    billing_address_id: str = Field(..., description="Billing address ID")
    shipping_address_id: Optional[str] = Field(None, description="Shipping address ID")
    use_different_shipping: bool = Field(False, description="Use different shipping address")
    payment_method: str = Field(..., description="Payment method")
    customer_notes: Optional[str] = Field(None, max_length=1000, description="Customer notes")

    @field_validator("billing_address_id")
    def validate_billing_address_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Billing address ID is required")
        v = v.strip()
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValidationException("Billing address ID must be a valid UUID")
        return v

    @field_validator("shipping_address_id")
    def validate_shipping_address_id(cls, v):
        if v and v.strip():
            v = v.strip()
            try:
                uuid.UUID(v)
            except ValueError:
                raise ValidationException("Shipping address ID must be a valid UUID")
            return v
        return v

    @field_validator("payment_method")
    def validate_payment_method(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment method is required")
        return v.strip()


class OrderUpdateStatusRequest(BaseModel):
    status: OrderStatusEnum = Field(..., description="New order status")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")


class OrderCancelRequest(BaseModel):
    cancel_reason: str = Field(..., min_length=1, max_length=500, description="Reason for cancellation")

    @field_validator("cancel_reason")
    def validate_cancel_reason(cls, v):
        if not v or not v.strip():
            raise ValidationException("Cancel reason is required")
        return v.strip()


class UpdateOrderItemFulfillmentRequest(BaseModel):
    fulfillment_status: OrderItemFulfillmentStatusEnum = Field(..., description="New fulfillment status")
    tracking_number: Optional[str] = Field(None, max_length=100, description="Tracking number if shipped")

    @field_validator("tracking_number")
    def validate_tracking_number(cls, v):
        if v and not v.strip():
            raise ValidationException("Tracking number cannot be empty if provided")
        return v.strip() if v else None


class OrderSearchRequest(BaseModel):
    search_term: str = Field(..., min_length=1, max_length=100, description="Search term")

    @field_validator("search_term")
    def validate_search_term(cls, v):
        if not v or not v.strip():
            raise ValidationException("Search term is required")
        return v.strip()


class OrderAnalyticsRequest(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date in ISO format")
    end_date: Optional[str] = Field(None, description="End date in ISO format")


class BulkOrderUpdateRequest(BaseModel):
    order_ids: List[str] = Field(..., min_items=1, description="List of order IDs to update")
    status: OrderStatusEnum = Field(..., description="New status for all orders")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("order_ids")
    def validate_order_ids(cls, v):
        if not v:
            raise ValidationException("At least one order ID is required")
        
        clean_ids = []
        for order_id in v:
            if not order_id or not order_id.strip():
                raise ValidationException("Order ID cannot be empty")
            clean_ids.append(order_id.strip())
        
        if len(clean_ids) > 50:
            raise ValidationException("Cannot update more than 50 orders at once")
        
        return clean_ids
