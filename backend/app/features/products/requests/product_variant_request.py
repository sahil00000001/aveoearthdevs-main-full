from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from decimal import Decimal
import re
from app.core.exceptions import ValidationException

class ProductVariantCreateRequest(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    price: Decimal = Field(..., gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    option1_name: Optional[str] = Field(None, max_length=100)
    option1_value: Optional[str] = Field(None, max_length=100)
    option2_name: Optional[str] = Field(None, max_length=100)
    option2_value: Optional[str] = Field(None, max_length=100)
    option3_name: Optional[str] = Field(None, max_length=100)
    option3_value: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    is_default: bool = Field(default=False)

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
        if v is not None and price_val and v <= price_val:
            raise ValidationException("Compare at price must be greater than price")
        return v

class ProductVariantUpdateRequest(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    price: Optional[Decimal] = Field(None, gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[Dict[str, Any]] = None
    option1_name: Optional[str] = Field(None, max_length=100)
    option1_value: Optional[str] = Field(None, max_length=100)
    option2_name: Optional[str] = Field(None, max_length=100)
    option2_value: Optional[str] = Field(None, max_length=100)
    option3_name: Optional[str] = Field(None, max_length=100)
    option3_value: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    is_default: Optional[bool] = None

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v):
        if v and not re.match(r"^[A-Z0-9-_]+$", v):
            raise ValidationException("SKU must contain only uppercase letters, numbers, hyphens, and underscores")
        return v

    @field_validator("compare_at_price")
    @classmethod
    def validate_compare_at_price(cls, v, info):
        price_val = info.data.get("price")
        if v is not None and price_val and v <= price_val:
            raise ValidationException("Compare at price must be greater than price")
        return v
