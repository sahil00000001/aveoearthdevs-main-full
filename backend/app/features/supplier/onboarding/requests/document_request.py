from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class VerificationStatusEnum(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class DocumentTypeEnum(str, Enum):
    PAN_CARD = "pan_card"
    ADDRESS_PROOF = "address_proof"
    FSSAI_LICENSE = "fssai_license"
    TRADE_LICENSE = "trade_license"
    MSME_CERTIFICATE = "msme_certificate"
    SUSTAINABILITY_CERTIFICATE = "sustainability_certificate"
    OTHER = "other"

class DocumentUploadRequest(BaseModel):
    document_type: DocumentTypeEnum = Field(...)
    document_name: str = Field(..., min_length=1)
    file_path: str = Field(..., min_length=1)
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class SustainabilityUploadRequest(BaseModel):
    sustainability_practices: str = Field(..., min_length=1)
    certification_files: Optional[List[str]] = Field(default=[])

class CompleteOnboardingRequest(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255)
    legal_entity_type: str = Field(..., min_length=1)
    pan_gst_number: str = Field(..., min_length=1, max_length=50)
    bank_name: str = Field(..., min_length=1, max_length=255)
    bank_account_number: str = Field(..., min_length=1, max_length=50)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    business_address: str = Field(..., min_length=1)
    is_msme_registered: bool = Field(default=False)
    website: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    sustainability_data: Optional[SustainabilityUploadRequest] = None
    documents: Optional[List[DocumentUploadRequest]] = Field(default=[])
