from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UUID, Enum, Integer
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseTimeStamp, BaseUUID

class DocumentTypeEnum(str, PyEnum):
    PAN_CARD = "pan_card"
    ADDRESS_PROOF = "address_proof"
    FSSAI_LICENSE = "fssai_license"
    TRADE_LICENSE = "trade_license"
    MSME_CERTIFICATE = "msme_certificate"
    SUSTAINABILITY_CERTIFICATE = "sustainability_certificate"
    OTHER = "other"

class DocumentStatusEnum(str, PyEnum):
    UPLOADED = "uploaded"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SupplierDocument(BaseUUID, Base, BaseTimeStamp):
    __tablename__ = "supplier_documents"

    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey("supplier_businesses.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(Enum(DocumentTypeEnum, native_enum=False), nullable=False)
    document_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_url = Column(Text)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    document_status = Column(Enum(DocumentStatusEnum, native_enum=False), default=DocumentStatusEnum.UPLOADED)
    verification_notes = Column(Text)
    verified_at = Column(DateTime)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    business = relationship("SupplierBusiness", foreign_keys=[business_id], passive_deletes=True)
    verified_by_user = relationship("User", foreign_keys=[verified_by], passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "supplier_id": str(self.supplier_id),
            "business_id": str(self.business_id),
            "document_type": self.document_type,
            "document_name": self.document_name,
            "file_path": self.file_path,
            "file_url": self.file_url,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "document_status": self.document_status,
            "verification_notes": self.verification_notes,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "verified_by": str(self.verified_by) if self.verified_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
