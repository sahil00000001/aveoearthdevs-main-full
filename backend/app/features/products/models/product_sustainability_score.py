from datetime import datetime
from sqlalchemy import Column, DECIMAL, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductSustainabilityScore(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "product_sustainability_scores"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(DECIMAL(3, 2), nullable=False, index=True)
    environmental_score = Column(DECIMAL(3, 2))
    social_score = Column(DECIMAL(3, 2))
    governance_score = Column(DECIMAL(3, 2))
    carbon_footprint = Column(DECIMAL(10, 2))
    water_usage = Column(DECIMAL(10, 2))
    waste_score = Column(DECIMAL(3, 2))
    recyclability_score = Column(DECIMAL(3, 2))
    certifications_score = Column(DECIMAL(3, 2))
    labor_practices_score = Column(DECIMAL(3, 2))
    community_impact_score = Column(DECIMAL(3, 2))
    transparency_score = Column(DECIMAL(3, 2))
    calculated_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

    product = relationship("Product", back_populates="sustainability_scores", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "overall_score": float(self.overall_score) if self.overall_score else None,
            "environmental_score": float(self.environmental_score) if self.environmental_score else None,
            "social_score": float(self.social_score) if self.social_score else None,
            "governance_score": float(self.governance_score) if self.governance_score else None,
            "carbon_footprint": float(self.carbon_footprint) if self.carbon_footprint else None,
            "water_usage": float(self.water_usage) if self.water_usage else None,
            "waste_score": float(self.waste_score) if self.waste_score else None,
            "recyclability_score": float(self.recyclability_score) if self.recyclability_score else None,
            "certifications_score": float(self.certifications_score) if self.certifications_score else None,
            "labor_practices_score": float(self.labor_practices_score) if self.labor_practices_score else None,
            "community_impact_score": float(self.community_impact_score) if self.community_impact_score else None,
            "transparency_score": float(self.transparency_score) if self.transparency_score else None,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
