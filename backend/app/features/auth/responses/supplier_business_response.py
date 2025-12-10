from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class SupplierBusinessResponse(BaseModel):
    id: str
    supplier_id: str
    business_name: str
    website: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    verification_status: str
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
