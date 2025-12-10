from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.core.exceptions import ValidationException

class ProductReviewCreateRequest(BaseModel):
    product_id: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)
    order_item_id: Optional[str] = None

    @field_validator("images")
    @classmethod
    def validate_images(cls, v):
        if v and len(v) > 5:
            raise ValidationException("Maximum 5 images allowed per review")
        return v

class ProductReviewUpdateRequest(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    images: Optional[List[str]] = None

    @field_validator("images")
    @classmethod
    def validate_images(cls, v):
        if v and len(v) > 5:
            raise ValidationException("Maximum 5 images allowed per review")
        return v

class ProductReviewFilterRequest(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
