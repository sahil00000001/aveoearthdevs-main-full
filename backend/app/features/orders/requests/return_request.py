from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from app.features.orders.models.return_refund import ReturnReasonEnum, ReturnStatusEnum, RefundStatusEnum
from app.core.exceptions import ValidationException


class CreateReturnRequest(BaseModel):
    order_item_id: str = Field(..., description="Order item ID to return")
    reason: ReturnReasonEnum = Field(..., description="Reason for return")
    description: str = Field(..., min_length=10, max_length=1000, description="Detailed description")
    quantity: int = Field(..., ge=1, description="Quantity to return")
    images: Optional[List[str]] = Field(None, description="List of image URLs")

    @field_validator("order_item_id")
    def validate_order_item_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Order item ID is required")
        return v.strip()

    @field_validator("description")
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValidationException("Description is required")
        if len(v.strip()) < 10:
            raise ValidationException("Description must be at least 10 characters long")
        return v.strip()

    @field_validator("quantity")
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValidationException("Quantity must be greater than 0")
        if v > 100:
            raise ValidationException("Cannot return more than 100 items at once")
        return v

    @field_validator("images")
    def validate_images(cls, v):
        if v:
            if len(v) > 10:
                raise ValidationException("Cannot upload more than 10 images")
            
            valid_images = []
            for img_url in v:
                if img_url and img_url.strip():
                    valid_images.append(img_url.strip())
            
            return valid_images if valid_images else None
        return v


class ApproveReturnRequest(BaseModel):
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("admin_notes")
    def validate_admin_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Admin notes cannot be empty if provided")
        return v.strip() if v else None


class RejectReturnRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=1, max_length=500, description="Reason for rejection")

    @field_validator("rejection_reason")
    def validate_rejection_reason(cls, v):
        if not v or not v.strip():
            raise ValidationException("Rejection reason is required")
        return v.strip()


class UpdateReturnShippingRequest(BaseModel):
    tracking_number: str = Field(..., description="Return tracking number")

    @field_validator("tracking_number")
    def validate_tracking_number(cls, v):
        if not v or not v.strip():
            raise ValidationException("Tracking number is required")
        return v.strip()


class MarkReturnReceivedRequest(BaseModel):
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("admin_notes")
    def validate_admin_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Admin notes cannot be empty if provided")
        return v.strip() if v else None


class CompleteReturnRequest(BaseModel):
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("admin_notes")
    def validate_admin_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Admin notes cannot be empty if provided")
        return v.strip() if v else None


class CreateRefundRequest(BaseModel):
    return_id: str = Field(..., description="Return ID to create refund for")
    payment_id: str = Field(..., description="Payment ID to refund")
    amount: float = Field(..., gt=0, description="Refund amount")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("return_id")
    def validate_return_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Return ID is required")
        return v.strip()

    @field_validator("payment_id")
    def validate_payment_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Payment ID is required")
        return v.strip()

    @field_validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValidationException("Refund amount must be greater than 0")
        if v > 999999:
            raise ValidationException("Refund amount is too large")
        return round(v, 2)

    @field_validator("admin_notes")
    def validate_admin_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Admin notes cannot be empty if provided")
        return v.strip() if v else None


class ProcessRefundRequest(BaseModel):
    refund_id: str = Field(..., description="Refund ID to process")
    success: bool = Field(..., description="Whether refund was successful")
    gateway_refund_id: str = Field(..., description="Gateway refund ID")
    gateway_response: Dict[str, Any] = Field(..., description="Gateway response data")

    @field_validator("refund_id")
    def validate_refund_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Refund ID is required")
        return v.strip()

    @field_validator("gateway_refund_id")
    def validate_gateway_refund_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Gateway refund ID is required")
        return v.strip()

    @field_validator("gateway_response")
    def validate_gateway_response(cls, v):
        if not isinstance(v, dict):
            raise ValidationException("Gateway response must be a dictionary")
        return v


class CancelRefundRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for cancellation")

    @field_validator("reason")
    def validate_reason(cls, v):
        if not v or not v.strip():
            raise ValidationException("Cancellation reason is required")
        return v.strip()


class ReturnAnalyticsRequest(BaseModel):
    supplier_id: Optional[str] = Field(None, description="Filter by supplier ID")
    start_date: Optional[str] = Field(None, description="Start date in ISO format")
    end_date: Optional[str] = Field(None, description="End date in ISO format")
    reason: Optional[ReturnReasonEnum] = Field(None, description="Filter by return reason")
    status: Optional[ReturnStatusEnum] = Field(None, description="Filter by return status")

    @field_validator("supplier_id")
    def validate_supplier_id(cls, v):
        if v and not v.strip():
            raise ValidationException("Supplier ID cannot be empty if provided")
        return v.strip() if v else None


class RefundAnalyticsRequest(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date in ISO format")
    end_date: Optional[str] = Field(None, description="End date in ISO format")
    status: Optional[RefundStatusEnum] = Field(None, description="Filter by refund status")


class BulkReturnUpdateRequest(BaseModel):
    return_ids: List[str] = Field(..., min_items=1, description="List of return IDs to update")
    status: ReturnStatusEnum = Field(..., description="New status for all returns")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")

    @field_validator("return_ids")
    def validate_return_ids(cls, v):
        if not v:
            raise ValidationException("At least one return ID is required")
        
        clean_ids = []
        for return_id in v:
            if not return_id or not return_id.strip():
                raise ValidationException("Return ID cannot be empty")
            clean_ids.append(return_id.strip())
        
        if len(clean_ids) > 50:
            raise ValidationException("Cannot update more than 50 returns at once")
        
        return clean_ids

    @field_validator("admin_notes")
    def validate_admin_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Admin notes cannot be empty if provided")
        return v.strip() if v else None
