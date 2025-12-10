from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ForeignKey, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.sql import func, text
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID
import uuid
import enum


class OrderStatusEnum(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class FulfillmentStatusEnum(str, enum.Enum):
    UNFULFILLED = "unfulfilled"
    PARTIALLY_FULFILLED = "partially_fulfilled"
    FULFILLED = "fulfilled"


class OrderItemFulfillmentStatusEnum(str, enum.Enum):
    UNFULFILLED = "unfulfilled"
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "orders"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    # Use String columns and cast to enum type in SQL
    # The database has enum types, so we need to cast strings to enum on insert
    status = Column(String(50), default='pending')
    payment_status = Column(String(50), default='pending')
    fulfillment_status = Column(String(50), default='unfulfilled')
    currency = Column(String(3), default="INR")
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    tax_amount = Column(DECIMAL(12, 2), default=0)
    shipping_amount = Column(DECIMAL(12, 2), default=0)
    discount_amount = Column(DECIMAL(12, 2), default=0)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    billing_address = Column(JSONB, nullable=False)
    shipping_address = Column(JSONB, nullable=False)
    customer_notes = Column(Text)
    admin_notes = Column(Text)
    processed_at = Column(DateTime(timezone=True))
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    cancel_reason = Column(Text)
    
    user = relationship("User", passive_deletes=True)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", passive_deletes=True)
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan", passive_deletes=True)
    shipments = relationship("Shipment", back_populates="order", cascade="all, delete-orphan", passive_deletes=True)
    returns = relationship("Return", back_populates="order", cascade="all, delete-orphan", passive_deletes=True)
    
    def to_dict(self):
        try:
            items_count = len(self.items) if hasattr(self, 'items') and self.items else 0
        except:
            items_count = 0
            
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "order_number": self.order_number,
            "status": self.status if isinstance(self.status, str) else (self.status.value if self.status else None),
            "payment_status": self.payment_status if isinstance(self.payment_status, str) else (self.payment_status.value if self.payment_status else None),
            "fulfillment_status": self.fulfillment_status if isinstance(self.fulfillment_status, str) else (self.fulfillment_status.value if self.fulfillment_status else None),
            "currency": self.currency,
            "subtotal": float(self.subtotal) if self.subtotal else 0,
            "tax_amount": float(self.tax_amount) if self.tax_amount else 0,
            "shipping_amount": float(self.shipping_amount) if self.shipping_amount else 0,
            "discount_amount": float(self.discount_amount) if self.discount_amount else 0,
            "total_amount": float(self.total_amount) if self.total_amount else 0,
            "billing_address": self.billing_address,
            "shipping_address": self.shipping_address,
            "customer_notes": self.customer_notes,
            "admin_notes": self.admin_notes,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "cancel_reason": self.cancel_reason,
            "items_count": items_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class OrderItem(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "order_items"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    product_name = Column(String(500), nullable=False)
    variant_title = Column(String(255))
    sku = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    total_price = Column(DECIMAL(12, 2), nullable=False)
    fulfillment_status = Column(String(50), default='unfulfilled')
    tracking_number = Column(String(100))
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    order = relationship("Order", back_populates="items", passive_deletes=True)
    product = relationship("Product", passive_deletes=True)
    variant = relationship("ProductVariant", passive_deletes=True)
    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    returns = relationship("Return", back_populates="order_item", cascade="all, delete-orphan", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "product_id": str(self.product_id),
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "supplier_id": str(self.supplier_id),
            "product_name": self.product_name,
            "variant_title": self.variant_title,
            "sku": self.sku,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price) if self.unit_price else 0,
            "total_price": float(self.total_price) if self.total_price else 0,
            "fulfillment_status": self.fulfillment_status.value if self.fulfillment_status else None,
            "tracking_number": self.tracking_number,
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
