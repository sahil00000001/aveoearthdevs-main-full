from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductSearchLog(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_search_logs"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    query_term = Column(String(500), nullable=False, index=True)
    search_type = Column(String(50), default="general", index=True)
    filters_applied = Column(Text, nullable=True)
    results_count = Column(String(20), default="0")
    clicked_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    resulted_in_purchase = Column(Boolean, default=False)
    search_duration_ms = Column(String(20), nullable=True)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    user = relationship("User", foreign_keys=[user_id], passive_deletes=True)
    clicked_product = relationship("Product", foreign_keys=[clicked_product_id], passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "session_id": self.session_id,
            "query_term": self.query_term,
            "search_type": self.search_type,
            "filters_applied": self.filters_applied,
            "results_count": self.results_count,
            "clicked_product_id": str(self.clicked_product_id) if self.clicked_product_id else None,
            "resulted_in_purchase": self.resulted_in_purchase,
            "search_duration_ms": self.search_duration_ms,
            "user_agent": self.user_agent,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
