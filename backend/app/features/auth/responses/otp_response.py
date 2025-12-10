from pydantic import BaseModel
from enum import Enum

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class OTPResponse(BaseModel):
    message: str
    expires_in: int
    phone: str
