from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, Text, Integer, Boolean, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID

class Category(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"))
    image_url = Column(Text)
    icon_url = Column(Text)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    seo_meta = Column(JSONB, default={})
    meta_keywords = Column(Text)

    parent = relationship("Category", remote_side="Category.id", back_populates="children", passive_deletes=True)
    children = relationship("Category", back_populates="parent", passive_deletes=True)
    products = relationship("Product", back_populates="category", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "image_url": self.image_url,
            "icon_url": self.icon_url,
            "sort_order": self.sort_order,
            "is_active": self.is_active,
            "seo_meta": self.seo_meta or {},
            "meta_keywords": self.meta_keywords,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
