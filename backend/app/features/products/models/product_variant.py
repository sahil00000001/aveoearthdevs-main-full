from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, Text, DECIMAL, Boolean, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductVariant(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_variants"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255))
    price = Column(DECIMAL(12, 2), nullable=False)
    compare_at_price = Column(DECIMAL(12, 2))
    cost_per_item = Column(DECIMAL(12, 2))
    weight = Column(DECIMAL(8, 2))
    dimensions = Column(JSONB)
    option1_name = Column(String(100))
    option1_value = Column(String(255))
    option2_name = Column(String(100))
    option2_value = Column(String(255))
    option3_name = Column(String(100))
    option3_value = Column(String(255))
    is_default = Column(Boolean, default=False)

    product = relationship("Product", back_populates="variants", passive_deletes=True)
    inventory = relationship("ProductInventory", back_populates="variant", passive_deletes=True)
    images = relationship("ProductImage", back_populates="variant", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "sku": self.sku,
            "title": self.title,
            "price": float(self.price) if self.price else None,
            "compare_at_price": float(self.compare_at_price) if self.compare_at_price else None,
            "cost_per_item": float(self.cost_per_item) if self.cost_per_item else None,
            "weight": float(self.weight) if self.weight else None,
            "dimensions": self.dimensions or {},
            "option1_name": self.option1_name,
            "option1_value": self.option1_value,
            "option2_name": self.option2_name,
            "option2_value": self.option2_value,
            "option3_name": self.option3_name,
            "option3_value": self.option3_value,
            "is_default": self.is_default,
            "images": [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
