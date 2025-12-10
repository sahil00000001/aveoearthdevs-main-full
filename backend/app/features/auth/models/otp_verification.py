from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum, UUID
from enum import Enum as PyEnum
from app.core.base import Base, BaseUUID, BaseTimeStamp

class OTPTypeEnum(str, PyEnum):
    PHONE = "phone"
    EMAIL = "email"
    PASSWORD_RESET = "password_reset"

class OTPVerification(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "otp_verifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(25))
    email = Column(String(255))
    otp_code = Column(String(10), nullable=False)
    type = Column(Enum(OTPTypeEnum, native_enum=False), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified_at = Column(DateTime)
    attempts = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "phone": self.phone,
            "email": self.email,
            "otp_code": self.otp_code,
            "type": self.type,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "attempts": self.attempts,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
