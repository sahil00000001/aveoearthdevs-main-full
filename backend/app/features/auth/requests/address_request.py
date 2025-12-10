from pydantic import BaseModel, Field, validator
from typing import Optional, List
from app.features.auth.models.address import AddressTypeEnum
from app.core.exceptions import ValidationException

class AddressCreateRequest(BaseModel):
    type: AddressTypeEnum
    is_default: Optional[bool] = False
    label: Optional[str] = Field(None, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    address_line_1: str = Field(..., min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(default="India", max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and len(v) < 10:
            raise ValidationException('Phone number must be at least 10 digits')
        return v

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v and not v.strip():
            raise ValidationException('Name cannot be empty or only whitespace')
        return v.strip() if v else v

    @validator('address_line_1', 'city', 'state')
    def validate_required_fields(cls, v):
        if not v or not v.strip():
            raise ValidationException('This field cannot be empty')
        return v.strip()

    @validator('postal_code')
    def validate_postal_code(cls, v):
        if not v or not v.strip():
            raise ValidationException('Postal code is required')
        v = v.strip()
        if not v.replace('-', '').replace(' ', '').isalnum():
            raise ValidationException('Invalid postal code format')
        return v

class AddressUpdateRequest(BaseModel):
    type: Optional[AddressTypeEnum] = None
    is_default: Optional[bool] = None
    label: Optional[str] = Field(None, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    address_line_1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    @validator('phone')
    def validate_phone(cls, v):
        if v and len(v) < 10:
            raise ValidationException('Phone number must be at least 10 digits')
        return v

    @validator('first_name', 'last_name', 'address_line_1', 'city', 'state')
    def validate_non_empty_fields(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValidationException('Field cannot be empty')
        return v.strip() if v else v

    @validator('postal_code')
    def validate_postal_code(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValidationException('Postal code cannot be empty')
            v = v.strip()
            if not v.replace('-', '').replace(' ', '').isalnum():
                raise ValidationException('Invalid postal code format')
        return v

class AddressSearchRequest(BaseModel):
    search_term: str = Field(..., min_length=1, max_length=100)
    address_type: Optional[AddressTypeEnum] = None