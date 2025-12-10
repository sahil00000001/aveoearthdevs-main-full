from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from enum import Enum
from app.core.exceptions import ValidationException

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: str = Field(..., min_length=10, max_length=25)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    user_type: UserTypeEnum = UserTypeEnum.BUYER.value
    referral_code: Optional[str] = Field(None, max_length=20)
    
    @validator("phone")
    def validate_phone(cls, v):
        if not v.startswith("+"):
            raise ValidationException("Phone number must include international code (e.g., +91)")
        return v

    @validator("user_type", pre=True)
    def validate_user_type(cls, v):
        if isinstance(v, str):
            v = v.lower()
        return v
