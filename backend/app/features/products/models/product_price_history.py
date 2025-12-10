from sqlalchemy import Column, String, DECIMAL, DateTime, UUID, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductPriceHistory(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_price_history"
    
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    price = Column(DECIMAL(12, 2), nullable=False)
    compare_at_price = Column(DECIMAL(12, 2), nullable=True)
    cost_per_item = Column(DECIMAL(12, 2), nullable=True)
    change_reason = Column(String(100), nullable=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    effective_from = Column(DateTime, nullable=False)
    effective_to = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    additional_data = Column(Text, nullable=True)
    
    product = relationship("Product", back_populates="price_history", passive_deletes=True)
    changed_by_user = relationship("User", foreign_keys=[changed_by], passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "price": float(self.price) if self.price else None,
            "compare_at_price": float(self.compare_at_price) if self.compare_at_price else None,
            "cost_per_item": float(self.cost_per_item) if self.cost_per_item else None,
            "change_reason": self.change_reason,
            "changed_by": str(self.changed_by) if self.changed_by else None,
            "effective_from": self.effective_from.isoformat() if self.effective_from else None,
            "effective_to": self.effective_to.isoformat() if self.effective_to else None,
            "is_active": self.is_active,
            "additional_data": self.additional_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
