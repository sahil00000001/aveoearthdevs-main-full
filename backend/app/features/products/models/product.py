from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, Text, DECIMAL, Boolean, DateTime, UUID, ForeignKey, Enum, TypeDecorator
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseTimeStamp, BaseUUID

class ProductStatusEnum(str, PyEnum):
    DRAFT = "DRAFT"  # Database expects uppercase
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    REJECTED = "REJECTED"
    
    @classmethod
    def from_string(cls, value):
        """Convert string to enum, handling case-insensitive matching"""
        if value is None:
            return None
        if isinstance(value, cls):
            return value
        value_str = str(value).upper()
        try:
            return cls[value_str]
        except (KeyError, AttributeError):
            # Fallback: try to find by value
            for status in cls:
                if status.value.upper() == value_str:
                    return status
            # Last resort: return ACTIVE if it looks like it could be active
            if 'active' in value_str.lower():
                return cls.ACTIVE
            raise ValueError(f"Invalid ProductStatusEnum value: {value}")

class ProductApprovalEnum(str, PyEnum):
    PENDING = "PENDING"  # Database expects uppercase
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ProductVisibilityEnum(str, PyEnum):
    VISIBLE = "VISIBLE"  # Database expects uppercase
    HIDDEN = "HIDDEN"
    SCHEDULED = "SCHEDULED"

class Product(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "products"

    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id", ondelete="SET NULL"), index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    short_description = Column(Text)
    description = Column(Text)
    price = Column(DECIMAL(12, 2), nullable=False, index=True)
    compare_at_price = Column(DECIMAL(12, 2))
    cost_per_item = Column(DECIMAL(12, 2))
    track_quantity = Column(Boolean, default=True)
    continue_selling = Column(Boolean, default=False)
    weight = Column(DECIMAL(8, 2))
    dimensions = Column(JSONB)
    materials = Column(JSONB, default=[])
    care_instructions = Column(Text)
    origin_country = Column(String(100))
    manufacturing_details = Column(JSONB)
    status = Column(String(50), default=ProductStatusEnum.DRAFT.value, index=True)  # Use String instead of Enum to handle case-insensitive values
    approval_status = Column(String(50), default=ProductApprovalEnum.PENDING.value, index=True)  # Use String instead of Enum
    approval_notes = Column(Text)
    approved_at = Column(DateTime)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    visibility = Column(String(50), default=ProductVisibilityEnum.VISIBLE.value, index=True)  # Use String instead of Enum
    published_at = Column(DateTime)
    tags = Column(JSONB, default=[])
    seo_meta = Column(JSONB, default={})

    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    category = relationship("Category", back_populates="products", passive_deletes=True)
    brand = relationship("Brand", back_populates="products", passive_deletes=True)
    approved_by_user = relationship("User", foreign_keys=[approved_by], passive_deletes=True)
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    inventory = relationship("ProductInventory", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    sustainability_scores = relationship("ProductSustainabilityScore", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    wishlist_items = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    views = relationship("ProductView", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)
    price_history = relationship("ProductPriceHistory", back_populates="product", cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "supplier_id": str(self.supplier_id),
            "category_id": str(self.category_id),
            "brand_id": str(self.brand_id) if self.brand_id else None,
            "sku": self.sku,
            "name": self.name,
            "slug": self.slug,
            "short_description": self.short_description,
            "description": self.description,
            "price": float(self.price) if self.price else None,
            "compare_at_price": float(self.compare_at_price) if self.compare_at_price else None,
            "cost_per_item": float(self.cost_per_item) if self.cost_per_item else None,
            "track_quantity": self.track_quantity,
            "continue_selling": self.continue_selling,
            "weight": float(self.weight) if self.weight else None,
            "dimensions": self.dimensions or {},
            "materials": self.materials or [],
            "care_instructions": self.care_instructions,
            "origin_country": self.origin_country,
            "manufacturing_details": self.manufacturing_details or {},
            "status": self.status,
            "approval_status": self.approval_status,
            "approval_notes": self.approval_notes,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approved_by": str(self.approved_by) if self.approved_by else None,
            "visibility": self.visibility,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "tags": self.tags or [],
            "seo_meta": self.seo_meta or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
