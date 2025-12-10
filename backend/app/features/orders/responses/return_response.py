from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.features.orders.models.return_refund import ReturnReasonEnum, ReturnStatusEnum, RefundStatusEnum


class ReturnResponse(BaseModel):
    id: str
    order_id: str
    order_item_id: str
    user_id: str
    supplier_id: str
    return_number: str
    reason: ReturnReasonEnum
    description: str
    quantity: int
    status: ReturnStatusEnum
    return_tracking_number: Optional[str] = None
    images: List[str] = []
    requested_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    item_shipped_at: Optional[datetime] = None
    item_received_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ReturnWithOrderItemResponse(BaseModel):
    id: str
    order_id: str
    order_item_id: str
    user_id: str
    supplier_id: str
    return_number: str
    reason: ReturnReasonEnum
    description: str
    quantity: int
    status: ReturnStatusEnum
    return_tracking_number: Optional[str] = None
    images: List[str] = []
    requested_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    item_shipped_at: Optional[datetime] = None
    item_received_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    order_item: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class ReturnSummaryResponse(BaseModel):
    id: str
    return_number: str
    reason: ReturnReasonEnum
    quantity: int
    status: ReturnStatusEnum
    requested_at: datetime
    created_at: datetime


class RefundResponse(BaseModel):
    id: str
    return_id: str
    order_id: str
    payment_id: str
    refund_number: str
    amount: float
    currency: str
    status: RefundStatusEnum
    gateway_refund_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class RefundSummaryResponse(BaseModel):
    id: str
    refund_number: str
    amount: float
    status: RefundStatusEnum
    processed_at: Optional[datetime] = None
    created_at: datetime


class ReturnAnalyticsResponse(BaseModel):
    total_returns: int
    total_quantity: int
    reason_breakdown: Dict[str, int]
    status_breakdown: Dict[str, int]
    average_processing_time_hours: Optional[float] = None
    approval_rate: float
    period: Dict[str, Optional[str]]


class RefundAnalyticsResponse(BaseModel):
    total_refunds: int
    total_amount: float
    success_rate: float
    status_breakdown: Dict[str, int]
    period: Dict[str, Optional[str]]


class BulkReturnUpdateResponse(BaseModel):
    message: str
    updated_count: int
    failed_count: int
    failed_returns: List[Dict[str, str]] = []
