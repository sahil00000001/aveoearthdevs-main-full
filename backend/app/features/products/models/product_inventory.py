from sqlalchemy import Column, String, Integer, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductInventory(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_inventory"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), index=True)
    quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, default=10)
    location = Column(String(255))
    warehouse_id = Column(UUID(as_uuid=True))
    last_restocked_at = Column(DateTime)

    product = relationship("Product", back_populates="inventory", passive_deletes=True)
    variant = relationship("ProductVariant", back_populates="inventory", passive_deletes=True)

    @property
    def available_quantity(self):
        return self.quantity - self.reserved_quantity

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id) if self.product_id else None,
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "quantity": self.quantity,
            "reserved_quantity": self.reserved_quantity,
            "available_quantity": self.available_quantity,
            "low_stock_threshold": self.low_stock_threshold,
            "location": self.location,
            "warehouse_id": str(self.warehouse_id) if self.warehouse_id else None,
            "last_restocked_at": self.last_restocked_at.isoformat() if self.last_restocked_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
