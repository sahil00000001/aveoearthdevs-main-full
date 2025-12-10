from pydantic import BaseModel, Field, field_validator
from typing import Optional
from app.core.exceptions import ValidationException


class AddToCartRequest(BaseModel):
    product_id: str = Field(..., description="Product ID to add to cart")
    quantity: int = Field(..., ge=1, le=100, description="Quantity to add")
    variant_id: Optional[str] = Field(None, description="Product variant ID if applicable")

    @field_validator("product_id")
    def validate_product_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Product ID is required")
        return v.strip()

    @field_validator("variant_id")
    def validate_variant_id(cls, v):
        if v and not v.strip():
            raise ValidationException("Variant ID cannot be empty if provided")
        return v.strip() if v else None


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=0, le=100, description="New quantity (0 to remove item)")

    @field_validator("quantity")
    def validate_quantity(cls, v):
        if v < 0:
            raise ValidationException("Quantity cannot be negative")
        return v


class TransferCartRequest(BaseModel):
    session_id: str = Field(..., description="Session ID of the cart to transfer")

    @field_validator("session_id")
    def validate_session_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Session ID is required")
        return v.strip()

