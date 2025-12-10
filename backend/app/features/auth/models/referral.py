from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, UUID, DECIMAL
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseUUID, BaseTimeStamp

class ReferralStatusEnum(str, PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"

class Referral(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "referrals"

    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    referee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    referral_code = Column(String(20), unique=True, nullable=False)
    status = Column(Enum(ReferralStatusEnum, native_enum=False), default=ReferralStatusEnum.PENDING)
    reward_amount = Column(DECIMAL(10, 2))
    reward_type = Column(String(50))
    completed_at = Column(DateTime)

    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals_made", passive_deletes=True)
    referee = relationship("User", foreign_keys=[referee_id], back_populates="referrals_received", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "referrer_id": str(self.referrer_id),
            "referee_id": str(self.referee_id) if self.referee_id else None,
            "referral_code": self.referral_code,
            "status": self.status,
            "reward_amount": float(self.reward_amount) if self.reward_amount else None,
            "reward_type": self.reward_type,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
