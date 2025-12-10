from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseUUID, BaseTimeStamp

class ProductView(BaseUUID, Base, BaseTimeStamp):
    __tablename__ = "product_views"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    session_id = Column(String(255))
    ip_address = Column(INET)
    user_agent = Column(Text)
    referrer = Column(Text)
    viewed_at = Column(DateTime, default=datetime.utcnow(), index=True)

    product = relationship("Product", back_populates="views", passive_deletes=True)
    user = relationship("User", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "user_id": str(self.user_id) if self.user_id else None,
            "session_id": self.session_id,
            "ip_address": str(self.ip_address) if self.ip_address else None,
            "user_agent": self.user_agent,
            "referrer": self.referrer,
            "viewed_at": self.viewed_at.isoformat() if self.viewed_at else None
        }
