from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, Text, Integer, Boolean, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductReview(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_reviews"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    order_item_id = Column(UUID(as_uuid=True))
    rating = Column(Integer, nullable=False, index=True)
    title = Column(String(255))
    content = Column(Text)
    images = Column(JSONB, default=[])
    is_verified_purchase = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)

    product = relationship("Product", back_populates="reviews", passive_deletes=True)
    user = relationship("User", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "user_id": str(self.user_id),
            "order_item_id": str(self.order_item_id) if self.order_item_id else None,
            "rating": self.rating,
            "title": self.title,
            "content": self.content,
            "images": self.images or [],
            "is_verified_purchase": self.is_verified_purchase,
            "helpful_count": self.helpful_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
