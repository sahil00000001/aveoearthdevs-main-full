from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_type: UserTypeEnum
    avatar_url: Optional[str] = None
    is_verified: bool
    is_active: bool
    is_phone_verified: bool
    is_email_verified: bool
    last_login_at: Optional[datetime] = None
    referral_code: Optional[str] = None
    created_at: datetime

    @field_validator("user_type", mode="before")
    @classmethod
    def normalize_user_type(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v
