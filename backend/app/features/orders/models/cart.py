from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, validates
from app.core.base import Base, BaseTimeStamp, BaseUUID
from app.core.exceptions import ValidationException

class Cart(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "carts"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(255), nullable=True)
    currency = Column(String(3), default="INR")
    subtotal = Column(DECIMAL(12, 2), default=0)
    tax_amount = Column(DECIMAL(12, 2), default=0)
    shipping_amount = Column(DECIMAL(12, 2), default=0)
    discount_amount = Column(DECIMAL(12, 2), default=0)
    total_amount = Column(DECIMAL(12, 2), default=0)
    expires_at = Column(DateTime(timezone=True))
    
    user = relationship("User", passive_deletes=True)
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", passive_deletes=True)
    
    @validates('user_id', 'session_id')
    def validate_user_or_session(self, key, value):
        return value
    
    def calculate_totals(self):
        try:
            if hasattr(self, 'items') and self.items:
                self.subtotal = sum(item.total_price for item in self.items)
            else:
                self.subtotal = 0
        except:
            self.subtotal = 0
        self.total_amount = self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount
    
    def to_dict(self):
        try:
            items_count = len(self.items) if hasattr(self, 'items') and self.items else 0
        except:
            items_count = 0
        
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "session_id": self.session_id,
            "currency": self.currency,
            "subtotal": float(self.subtotal) if self.subtotal else 0,
            "tax_amount": float(self.tax_amount) if self.tax_amount else 0,
            "shipping_amount": float(self.shipping_amount) if self.shipping_amount else 0,
            "discount_amount": float(self.discount_amount) if self.discount_amount else 0,
            "total_amount": float(self.total_amount) if self.total_amount else 0,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "items_count": items_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class CartItem(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "cart_items"
    
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    total_price = Column(DECIMAL(12, 2), nullable=False)
    
    cart = relationship("Cart", back_populates="items", passive_deletes=True)
    product = relationship("Product", passive_deletes=True)
    variant = relationship("ProductVariant", passive_deletes=True)
    
    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValidationException("Quantity must be greater than 0")
        return value
    
    def calculate_total_price(self):
        self.total_price = self.quantity * self.unit_price
    
    def to_dict(self):
        result = {
            "id": str(self.id),
            "cart_id": str(self.cart_id),
            "product_id": str(self.product_id),
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price) if self.unit_price else 0,
            "total_price": float(self.total_price) if self.total_price else 0,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else ""
        }
        # Add optional product/variant info if available
        if hasattr(self, 'product') and self.product:
            result["product_name"] = getattr(self.product, 'name', None)
            result["product_slug"] = getattr(self.product, 'slug', None)
            result["sku"] = getattr(self.product, 'sku', None)
        if hasattr(self, 'variant') and self.variant:
            result["variant_title"] = getattr(self.variant, 'title', None)
            if getattr(self.variant, 'sku', None):
                result["sku"] = getattr(self.variant, 'sku', None)
        return result
