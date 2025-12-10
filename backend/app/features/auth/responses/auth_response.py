from pydantic import BaseModel
from typing import Optional
from enum import Enum
from app.features.auth.responses.user_response import UserResponse

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
    requires_phone_verification: bool = False
    referral_code: Optional[str] = None
