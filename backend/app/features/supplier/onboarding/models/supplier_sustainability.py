from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UUID, Enum, JSON
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseTimeStamp, BaseUUID

class SustainabilityStatusEnum(str, PyEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SupplierSustainability(BaseUUID, Base, BaseTimeStamp):
    __tablename__ = "supplier_sustainability"

    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey("supplier_businesses.id", ondelete="CASCADE"), nullable=False)
    sustainability_practices = Column(Text, nullable=False)
    certifications = Column(JSON)
    sustainability_score = Column(String(10))
    sustainability_status = Column(Enum(SustainabilityStatusEnum, native_enum=False), default=SustainabilityStatusEnum.PENDING)
    assessment_notes = Column(Text)
    assessed_at = Column(DateTime)
    assessed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    business = relationship("SupplierBusiness", foreign_keys=[business_id], passive_deletes=True)
    assessed_by_user = relationship("User", foreign_keys=[assessed_by], passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "supplier_id": str(self.supplier_id),
            "business_id": str(self.business_id),
            "sustainability_practices": self.sustainability_practices,
            "certifications": self.certifications or [],
            "sustainability_score": self.sustainability_score,
            "sustainability_status": self.sustainability_status,
            "assessment_notes": self.assessment_notes,
            "assessed_at": self.assessed_at.isoformat() if self.assessed_at else None,
            "assessed_by": str(self.assessed_by) if self.assessed_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
