from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from enum import Enum
import re
from urllib.parse import urlparse
from app.core.exceptions import ValidationException

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

class SupplierBusinessOnboardingRequest(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255)
    legal_entity_type: LegalEntityTypeEnum = Field(...)
    pan_gst_number: str = Field(..., min_length=1, max_length=50)
    bank_name: str = Field(..., min_length=1, max_length=255)
    bank_account_number: str = Field(..., min_length=1, max_length=50)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    business_address: str = Field(..., min_length=1)
    is_msme_registered: bool = Field(default=False)
    website: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    
    @field_validator("pan_gst_number")
    def validate_pan_gst_number(cls, v):
        if v:
            v = v.strip().upper()
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
            
            if not (re.match(pan_pattern, v) or re.match(gst_pattern, v)):
                raise ValidationException("Invalid PAN/GST format. PAN: ABCDE1234F, GST: 12ABCDE1234F1Z5")
        return v
    
    @field_validator("ifsc_code")
    def validate_ifsc_code(cls, v):
        if v:
            v = v.strip().upper()
            ifsc_pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
            if not re.match(ifsc_pattern, v):
                raise ValidationException("Invalid IFSC code format. Example: SBIN0001234")
        return v
    
    @field_validator("bank_account_number")
    def validate_bank_account_number(cls, v):
        if v:
            v = v.strip()
            if not v.isdigit():
                raise ValidationException("Bank account number should contain only digits")
            if len(v) < 9 or len(v) > 18:
                raise ValidationException("Bank account number should be between 9 and 18 digits")
        return v

    @field_validator("website")
    def validate_website(cls, v):
        if v and v.strip():
            v = v.strip()
            try:
                parsed = urlparse(v)
                if not parsed.scheme or parsed.scheme not in ['http', 'https']:
                    raise ValidationException("Website must start with http:// or https://")
                if not parsed.netloc:
                    raise ValidationException("Website must have a valid domain name")
                if not re.match(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', parsed.netloc.split(':')[0]):
                    raise ValidationException("Website must have a valid domain format")
            except Exception:
                raise ValidationException("Please enter a valid website URL (e.g., https://example.com)")
        return v

class SupplierBusinessUpdateRequest(BaseModel):
    business_name: Optional[str] = Field(None, min_length=1, max_length=255)
    legal_entity_type: Optional[LegalEntityTypeEnum] = None
    pan_gst_number: Optional[str] = Field(None, min_length=1, max_length=50)
    bank_name: Optional[str] = Field(None, min_length=1, max_length=255)
    bank_account_number: Optional[str] = Field(None, min_length=1, max_length=50)
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11)
    business_address: Optional[str] = None
    is_msme_registered: Optional[bool] = None
    website: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    
    @field_validator("pan_gst_number")
    def validate_pan_gst_number(cls, v):
        if v:
            v = v.strip().upper()
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
            
            if not (re.match(pan_pattern, v) or re.match(gst_pattern, v)):
                raise ValidationException("Invalid PAN/GST format. PAN: ABCDE1234F, GST: 12ABCDE1234F1Z5")
        return v
    
    @field_validator("ifsc_code")
    def validate_ifsc_code(cls, v):
        if v:
            v = v.strip().upper()
            ifsc_pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
            if not re.match(ifsc_pattern, v):
                raise ValidationException("Invalid IFSC code format. Example: SBIN0001234")
        return v
    
    @field_validator("bank_account_number")
    def validate_bank_account_number(cls, v):
        if v:
            v = v.strip()
            if not v.isdigit():
                raise ValidationException("Bank account number should contain only digits")
            if len(v) < 9 or len(v) > 18:
                raise ValidationException("Bank account number should be between 9 and 18 digits")
        return v

    @field_validator("website")
    def validate_website(cls, v):
        if v and v.strip():
            v = v.strip()
            try:
                parsed = urlparse(v)
                if not parsed.scheme or parsed.scheme not in ['http', 'https']:
                    raise ValidationException("Website must start with http:// or https://")
                if not parsed.netloc:
                    raise ValidationException("Website must have a valid domain name")
                if not re.match(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', parsed.netloc.split(':')[0]):
                    raise ValidationException("Website must have a valid domain format")
            except Exception:
                raise ValidationException("Please enter a valid website URL (e.g., https://example.com)")
        return v

class SupplierSustainabilityRequest(BaseModel):
    sustainability_practices: str = Field(..., min_length=1)
    certifications: Optional[List[str]] = Field(default=[])

class SupplierDocumentUploadRequest(BaseModel):
    document_type: str = Field(..., min_length=1)
    document_name: str = Field(..., min_length=1)
    file_path: str = Field(..., min_length=1)
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class CompleteOnboardingRequest(BaseModel):
    business_data: SupplierBusinessOnboardingRequest
    sustainability_data: Optional[SupplierSustainabilityRequest] = None
    documents: Optional[List[SupplierDocumentUploadRequest]] = Field(default=[])
