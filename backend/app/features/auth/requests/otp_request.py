from pydantic import BaseModel, Field, validator
from enum import Enum
from app.core.exceptions import ValidationException

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=25)
    
    @validator("phone")
    def validate_phone(cls, v):
        if not v.startswith("+"):
            raise ValidationException("Phone number must include international code (e.g., +91)")
        return v

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=25)
    otp_code: str = Field(..., min_length=6, max_length=6)
    
    @validator("phone")
    def validate_phone(cls, v):
        if not v.startswith("+"):
            raise ValidationException("Phone number must include international code (e.g., +91)")
        return v
