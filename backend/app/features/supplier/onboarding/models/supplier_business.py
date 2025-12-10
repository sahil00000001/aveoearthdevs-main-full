from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UUID, Enum, Boolean
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseTimeStamp, BaseUUID

class VerificationStatusEnum(str, PyEnum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class LegalEntityTypeEnum(str, PyEnum):
    SOLE_PROPRIETORSHIP = "sole_proprietorship"
    TRUSTS_AND_NGOS = "trusts_and_ngos"
    PVT_LTD = "pvt_ltd"
    LIMITED_LIABILITY_PARTNERSHIP = "limited_liability_partnership"
    PARTNERSHIP_FIRMS = "partnership_firms"

class SupplierBusiness(BaseUUID, Base, BaseTimeStamp):
    __tablename__ = "supplier_businesses"

    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_name = Column(String(255), nullable=False)
    legal_entity_type = Column(Enum(LegalEntityTypeEnum, native_enum=False), nullable=False)
    pan_gst_number = Column(String(50), nullable=False)
    bank_name = Column(String(255), nullable=False)
    bank_account_number = Column(String(50), nullable=False)
    ifsc_code = Column(String(20), nullable=False)
    business_address = Column(Text, nullable=False)
    is_msme_registered = Column(Boolean, default=False)
    website = Column(String(255))
    description = Column(Text)
    logo_url = Column(Text)
    banner_url = Column(Text)
    verification_status = Column(Enum(VerificationStatusEnum, native_enum=False), default=VerificationStatusEnum.PENDING)
    verification_notes = Column(Text)
    verified_at = Column(DateTime)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    verified_by_user = relationship("User", foreign_keys=[verified_by], passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "supplier_id": str(self.supplier_id),
            "business_name": self.business_name,
            "legal_entity_type": self.legal_entity_type,
            "pan_gst_number": self.pan_gst_number,
            "bank_name": self.bank_name,
            "bank_account_number": self.bank_account_number,
            "ifsc_code": self.ifsc_code,
            "business_address": self.business_address,
            "is_msme_registered": self.is_msme_registered,
            "website": self.website,
            "description": self.description,
            "logo_url": self.logo_url,
            "banner_url": self.banner_url,
            "verification_status": self.verification_status,
            "verification_notes": self.verification_notes,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "verified_by": str(self.verified_by) if self.verified_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
