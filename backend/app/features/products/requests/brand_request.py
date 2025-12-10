from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re
from app.core.exceptions import ValidationException

class BrandCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not re.match(r"^[a-zA-Z0-9\s\-_&]+$", v):
            raise ValidationException("Brand name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands")
        return v

    @field_validator("website")
    @classmethod
    def validate_website(cls, v):
        if v and not re.match(r"^https?://", v):
            raise ValidationException("Website must be a valid URL starting with http:// or https://")
        return v

class BrandUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if v and not re.match(r"^[a-zA-Z0-9\s\-_&]+$", v):
            raise ValidationException("Brand name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands")
        return v

    @field_validator("website")
    @classmethod
    def validate_website(cls, v):
        if v and not re.match(r"^https?://", v):
            raise ValidationException("Website must be a valid URL starting with http:// or https://")
        return v