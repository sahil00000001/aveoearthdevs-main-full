from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class VerificationStatusEnum(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class LegalEntityTypeEnum(str, Enum):
    SOLE_PROPRIETORSHIP = "sole_proprietorship"
    TRUSTS_AND_NGOS = "trusts_and_ngos"
    PVT_LTD = "pvt_ltd"
    LIMITED_LIABILITY_PARTNERSHIP = "limited_liability_partnership"
    PARTNERSHIP_FIRMS = "partnership_firms"

class DocumentStatusEnum(str, Enum):
    UPLOADED = "uploaded"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SustainabilityStatusEnum(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SupplierDocumentResponse(BaseModel):
    id: str
    document_type: str
    document_name: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    document_status: DocumentStatusEnum
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class SupplierSustainabilityResponse(BaseModel):
    id: str
    sustainability_practices: str
    certifications: List[Dict[str, Any]] = []
    sustainability_score: Optional[str] = None
    sustainability_status: SustainabilityStatusEnum
    assessment_notes: Optional[str] = None
    assessed_at: Optional[datetime] = None
    assessed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class SupplierBusinessResponse(BaseModel):
    id: str
    supplier_id: str
    business_name: str
    legal_entity_type: LegalEntityTypeEnum
    pan_gst_number: str
    bank_name: str
    bank_account_number: str
    ifsc_code: str
    business_address: str
    is_msme_registered: bool
    website: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    verification_status: VerificationStatusEnum
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    documents: List[SupplierDocumentResponse] = []
    created_at: datetime
    updated_at: datetime

class OnboardingStatusResponse(BaseModel):
    user_id: str
    user_type: str
    is_onboarding_complete: bool
    supplier_business: Optional[SupplierBusinessResponse] = None

class DocumentUploadResponse(BaseModel):
    message: str
    document_id: str
    file_url: str

class BusinessOnboardingResponse(BaseModel):
    message: str
    supplier_business: SupplierBusinessResponse
    uploaded_files: Dict[str, str]

class SupplierListItemResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_email: str
    supplier_phone: Optional[str] = None
    supplier_first_name: Optional[str] = None
    supplier_last_name: Optional[str] = None
    business_name: str
    legal_entity_type: LegalEntityTypeEnum
    verification_status: VerificationStatusEnum
    website: Optional[str] = None
    logo_url: Optional[str] = None
    total_documents: int = 0
    verified_documents: int = 0
    has_sustainability_profile: bool = False
    created_at: datetime
    updated_at: datetime

class SupplierWithDetailsResponse(SupplierBusinessResponse):
    supplier_email: str
    supplier_phone: Optional[str] = None
    supplier_first_name: Optional[str] = None
    supplier_last_name: Optional[str] = None
    sustainability_profile: Optional[SupplierSustainabilityResponse] = None
