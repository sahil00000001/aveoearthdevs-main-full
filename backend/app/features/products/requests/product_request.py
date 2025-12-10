from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from decimal import Decimal
import re
from app.core.exceptions import ValidationException

class ProductCreateRequest(BaseModel):
    category_id: str = Field(..., min_length=1)
    brand_id: Optional[str] = None
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=500)
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    cost_per_item: Optional[Decimal] = Field(None, gt=0)
    track_quantity: bool = Field(default=True)
    continue_selling: bool = Field(default=False)
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    materials: Optional[List[str]] = Field(default_factory=list)
    care_instructions: Optional[str] = None
    origin_country: Optional[str] = None
    manufacturing_details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    tags: Optional[List[str]] = Field(default_factory=list)
    seo_meta: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v):
        if not re.match(r"^[A-Z0-9-_]+$", v):
            raise ValidationException("SKU must contain only uppercase letters, numbers, hyphens, and underscores")
        return v

    @field_validator("compare_at_price")
    @classmethod
    def validate_compare_at_price(cls, v, info):
        price_val = info.data.get("price")
        if price_val == 0 and v and v > 0:
            raise ValidationException("If price is 0, compare_at_price must also be 0 or not set.")
        if v is not None and price_val and v <= price_val:
            raise ValidationException("Compare at price must be greater than price")
        return v

class ProductUpdateRequest(BaseModel):
    category_id: Optional[str] = None
    brand_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    cost_per_item: Optional[Decimal] = Field(None, gt=0)
    track_quantity: Optional[bool] = None
    continue_selling: Optional[bool] = None
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[Dict[str, Any]] = None
    materials: Optional[List[str]] = None
    care_instructions: Optional[str] = None
    origin_country: Optional[str] = None
    manufacturing_details: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    seo_meta: Optional[Dict[str, Any]] = None

    @field_validator("compare_at_price")
    @classmethod
    def validate_compare_at_price(cls, v, info):
        price_val = info.data.get("price")
        if price_val == 0 and v and v > 0:
            raise ValidationException("If price is 0, compare_at_price must also be 0 or not set.")
        if v is not None and price_val and v <= price_val:
            raise ValidationException("Compare at price must be greater than price")
        return v

class ProductFilterRequest(BaseModel):
    category_id: Optional[str] = None
    brand_id: Optional[str] = None
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    search: Optional[str] = Field(None, max_length=255)
    sort_by: Optional[str] = Field(default="created_at", pattern="^(created_at|price|name)$")
    sort_order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

    @field_validator("max_price")
    @classmethod
    def validate_price_range(cls, v, info):
        if v is not None and info.data.get("min_price") and v <= info.data["min_price"]:
            raise ValidationException("Max price must be greater than min price")
        return v

class ProductApprovalRequest(BaseModel):
    approved: bool = Field(..., description="True to approve, False to reject")
    approval_notes: Optional[str] = None
    
    @field_validator("approval_notes")
    @classmethod
    def validate_rejection_reason(cls, v, info):
        if info.data.get("approved") is False and not v:
            raise ValidationException("Rejection reason is required when rejecting a product")
        return v

class ProductInventoryUpdateRequest(BaseModel):
    quantity: int = Field(..., ge=0)
    location: Optional[str] = None
    low_stock_threshold: Optional[int] = Field(None, ge=0)
