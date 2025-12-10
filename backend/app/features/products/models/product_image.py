from sqlalchemy import Column, String, Text, Integer, Boolean, UUID, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID
from datetime import datetime

class ProductImage(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_images"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), index=True)
    url = Column(Text, nullable=False)
    alt_text = Column(String(255))
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="images", passive_deletes=True)
    variant = relationship("ProductVariant", back_populates="images", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "url": self.url,
            "alt_text": self.alt_text,
            "sort_order": self.sort_order,
            "is_primary": self.is_primary,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
