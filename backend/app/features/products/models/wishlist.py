from datetime import datetime
from sqlalchemy import Column, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class Wishlist(Base, BaseTimeStamp, BaseUUID):
    __tablename__ = "wishlists"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", passive_deletes=True)
    product = relationship("Product", back_populates="wishlist_items", passive_deletes=True)

    def to_dict(self):
        return {
            "user_id": str(self.user_id),
            "product_id": str(self.product_id),
            "added_at": self.added_at.isoformat() if self.added_at else None
        }
