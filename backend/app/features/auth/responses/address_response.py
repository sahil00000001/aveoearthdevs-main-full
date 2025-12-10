from pydantic import BaseModel, Field, computed_field
from typing import Optional, List
from datetime import datetime
from app.features.auth.models.address import AddressTypeEnum

class AddressResponse(BaseModel):
    id: str
    user_id: str
    type: AddressTypeEnum
    is_default: bool
    label: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @computed_field
    @property
    def full_name(self) -> str:
        parts = []
        if self.first_name:
            parts.append(self.first_name)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(parts)

    @computed_field
    @property
    def formatted_address(self) -> str:
        parts = [self.address_line_1]
        if self.address_line_2:
            parts.append(self.address_line_2)
        parts.extend([self.city, self.state, self.postal_code, self.country])
        return ", ".join(parts)

class AddressListResponse(BaseModel):
    addresses: List[AddressResponse]
    total: int

    class Config:
        from_attributes = True

class AddressStatsResponse(BaseModel):
    total_addresses: int
    shipping_addresses: int
    billing_addresses: int
    home_addresses: int
    work_addresses: int
    other_addresses: int
    has_default_shipping: bool
    has_default_billing: bool

class AddressSummaryResponse(BaseModel):
    id: str
    type: AddressTypeEnum
    is_default: bool
    label: Optional[str] = None
    formatted_address: str
    full_name: str

class BulkAddressResponse(BaseModel):
    created_addresses: List[AddressResponse]
    total_created: int
    errors: List[str] = Field(default_factory=list)

class AddressSearchResponse(BaseModel):
    addresses: List[AddressResponse]
    total: int
    search_term: str