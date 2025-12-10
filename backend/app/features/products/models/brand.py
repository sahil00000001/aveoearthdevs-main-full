from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class Brand(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "brands"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    logo_url = Column(Text)
    website = Column(String(255))
    is_active = Column(Boolean, default=True, index=True)

    products = relationship("Product", back_populates="brand", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "logo_url": self.logo_url,
            "website": self.website,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
