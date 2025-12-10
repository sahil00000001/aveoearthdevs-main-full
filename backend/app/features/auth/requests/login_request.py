from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum
from app.core.exceptions import ValidationException

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class LoginEmailRequest(BaseModel):
    email: EmailStr
    password: str

class LoginPhoneRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=25)
    password: str
    
    @validator("phone")
    def validate_phone(cls, v):
        if not v.startswith("+"):
            raise ValidationException("Phone number must include international code (e.g., +91)")
        return v
