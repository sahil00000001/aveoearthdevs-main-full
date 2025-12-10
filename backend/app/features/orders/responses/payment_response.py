from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.features.orders.models.payment import PaymentMethodStatusEnum


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    payment_method: str
    payment_gateway: str
    gateway_transaction_id: Optional[str] = None
    amount: float
    currency: str
    status: PaymentMethodStatusEnum
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None
    refund_amount: float
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PaymentWithOrderResponse(BaseModel):
    id: str
    order_id: str
    payment_method: str
    payment_gateway: str
    gateway_transaction_id: Optional[str] = None
    amount: float
    currency: str
    status: PaymentMethodStatusEnum
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None
    refund_amount: float
    processed_at: Optional[datetime] = None
    order: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class PaymentSummaryResponse(BaseModel):
    id: str
    order_id: str
    payment_method: str
    amount: float
    status: PaymentMethodStatusEnum
    processed_at: Optional[datetime] = None
    created_at: datetime


class PaymentAnalyticsResponse(BaseModel):
    total_payments: int
    total_amount: float
    total_refunded: float
    net_amount: float
    success_rate: float
    status_breakdown: Dict[str, int]
    payment_method_breakdown: Dict[str, int]
    gateway_breakdown: Dict[str, int]
    period: Dict[str, Optional[str]]


class FailedPaymentResponse(BaseModel):
    id: str
    order_id: str
    payment_method: str
    payment_gateway: str
    amount: float
    failure_reason: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    order: Optional[Dict[str, str]] = None
    created_at: datetime


class PaymentWebhookResponse(BaseModel):
    message: str
    payment_id: str
    status: str
    processed: bool
