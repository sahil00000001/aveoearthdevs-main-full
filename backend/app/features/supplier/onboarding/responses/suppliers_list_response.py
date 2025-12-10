from typing import Optional
from app.features.supplier.onboarding.responses.supplier_business_response import SupplierBusinessResponse

class SupplierListResponse(SupplierBusinessResponse):
    supplier_email: str
    supplier_phone: Optional[str] = None
    supplier_first_name: Optional[str] = None
    supplier_last_name: Optional[str] = None
    total_documents: int = 0
    verified_documents: int = 0
    has_sustainability_profile: bool = False