from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
import re
from app.core.exceptions import ValidationException

class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    meta_keywords: Optional[str] = None
    sort_order: int = Field(default=0, ge=0)
    seo_meta: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not re.match(r"^[a-zA-Z0-9\s\-_&]+$", v):
            raise ValidationException("Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands")
        return v

class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    meta_keywords: Optional[str] = None
    sort_order: Optional[int] = Field(None, ge=0)
    seo_meta: Optional[Dict[str, Any]] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if v and not re.match(r"^[a-zA-Z0-9\s\-_&]+$", v):
            raise ValidationException("Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands")
        return v