from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from app.features.orders.models.payment import PaymentMethodStatusEnum
from app.core.exceptions import ValidationException


class CreatePaymentRequest(BaseModel):
    order_id: str = Field(..., description="Order ID to create payment for")
    payment_method: str = Field(..., description="Payment method (card, upi, wallet, etc.)")
    payment_gateway: str = Field(..., description="Payment gateway (razorpay, stripe, etc.)")
    gateway_transaction_id: Optional[str] = Field(None, description="Gateway transaction ID")

    @field_validator("order_id")
    def validate_order_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Order ID is required")
        return v.strip()

    @field_validator("payment_method")
    def validate_payment_method(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment method is required")
        allowed_methods = ["card", "upi", "wallet", "netbanking", "cod", "emi"]
        if v.lower() not in allowed_methods:
            raise ValidationException(f"Payment method must be one of: {', '.join(allowed_methods)}")
        return v.lower()

    @field_validator("payment_gateway")
    def validate_payment_gateway(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment gateway is required")
        allowed_gateways = ["razorpay", "stripe", "payu", "cashfree", "phonepe", "googlepay"]
        if v.lower() not in allowed_gateways:
            raise ValidationException(f"Payment gateway must be one of: {', '.join(allowed_gateways)}")
        return v.lower()

    @field_validator("gateway_transaction_id")
    def validate_gateway_transaction_id(cls, v):
        if v and not v.strip():
            raise ValidationException("Gateway transaction ID cannot be empty if provided")
        return v.strip() if v else None


class ProcessPaymentRequest(BaseModel):
    payment_id: str = Field(..., description="Payment ID to process")
    success: bool = Field(..., description="Whether payment was successful")
    gateway_response: Dict[str, Any] = Field(..., description="Gateway response data")

    @field_validator("payment_id")
    def validate_payment_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment ID is required")
        return v.strip()

    @field_validator("gateway_response")
    def validate_gateway_response(cls, v):
        if not isinstance(v, dict):
            raise ValidationException("Gateway response must be a dictionary")
        return v


class CancelPaymentRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for cancellation")

    @field_validator("reason")
    def validate_reason(cls, v):
        if not v or not v.strip():
            raise ValidationException("Cancellation reason is required")
        return v.strip()


class InitiateRefundRequest(BaseModel):
    refund_amount: float = Field(..., gt=0, description="Amount to refund")
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for refund")

    @field_validator("refund_amount")
    def validate_refund_amount(cls, v):
        if v <= 0:
            raise ValidationException("Refund amount must be greater than 0")
        if v > 999999:
            raise ValidationException("Refund amount is too large")
        return round(v, 2)

    @field_validator("reason")
    def validate_reason(cls, v):
        if not v or not v.strip():
            raise ValidationException("Refund reason is required")
        return v.strip()


class RetryPaymentRequest(BaseModel):
    new_gateway_transaction_id: Optional[str] = Field(None, description="New gateway transaction ID")

    @field_validator("new_gateway_transaction_id")
    def validate_new_gateway_transaction_id(cls, v):
        if v and not v.strip():
            raise ValidationException("Gateway transaction ID cannot be empty if provided")
        return v.strip() if v else None


class PaymentAnalyticsRequest(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date in ISO format")
    end_date: Optional[str] = Field(None, description="End date in ISO format")
    payment_method: Optional[str] = Field(None, description="Filter by payment method")
    payment_gateway: Optional[str] = Field(None, description="Filter by payment gateway")
    status: Optional[PaymentMethodStatusEnum] = Field(None, description="Filter by payment status")

    @field_validator("payment_method")
    def validate_payment_method(cls, v):
        if v and not v.strip():
            raise ValidationException("Payment method cannot be empty if provided")
        return v.strip().lower() if v else None

    @field_validator("payment_gateway")
    def validate_payment_gateway(cls, v):
        if v and not v.strip():
            raise ValidationException("Payment gateway cannot be empty if provided")
        return v.strip().lower() if v else None


class WebhookPaymentRequest(BaseModel):
    event_type: str = Field(..., description="Webhook event type")
    payment_id: str = Field(..., description="Payment ID")
    gateway_data: Dict[str, Any] = Field(..., description="Gateway webhook data")
    signature: Optional[str] = Field(None, description="Webhook signature for verification")

    @field_validator("event_type")
    def validate_event_type(cls, v):
        if not v or not v.strip():
            raise ValidationException("Event type is required")
        allowed_events = ["payment.captured", "payment.failed", "refund.created", "refund.processed"]
        if v not in allowed_events:
            raise ValidationException(f"Event type must be one of: {', '.join(allowed_events)}")
        return v

    @field_validator("payment_id")
    def validate_payment_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment ID is required")
        return v.strip()

    @field_validator("gateway_data")
    def validate_gateway_data(cls, v):
        if not isinstance(v, dict):
            raise ValidationException("Gateway data must be a dictionary")
        return v
