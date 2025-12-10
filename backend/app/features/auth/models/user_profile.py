from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UUID
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class UserProfile(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date_of_birth = Column(DateTime)
    gender = Column(String(20))
    bio = Column(Text)
    preferences = Column(JSONB, default={})
    social_links = Column(JSONB, default={})
    notification_settings = Column(JSONB, default={})

    user = relationship("User", back_populates="profile", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender,
            "bio": self.bio,
            "preferences": self.preferences or {},
            "social_links": self.social_links or {},
            "notification_settings": self.notification_settings or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
