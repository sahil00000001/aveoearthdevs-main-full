from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID
import uuid
import enum


class ShipmentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED_DELIVERY = "failed_delivery"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class Shipment(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "shipments"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    tracking_number = Column(String(100), unique=True, nullable=False)
    carrier = Column(String(100), nullable=False)
    carrier_service = Column(String(100))
    status = Column(ENUM(ShipmentStatusEnum), default=ShipmentStatusEnum.PENDING)
    weight = Column(DECIMAL(8, 3))
    length = Column(DECIMAL(8, 2))
    width = Column(DECIMAL(8, 2))
    height = Column(DECIMAL(8, 2))
    shipping_cost = Column(DECIMAL(10, 2), nullable=False)
    estimated_delivery_date = Column(DateTime(timezone=True))
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    shipping_address = Column(JSONB, nullable=False)
    tracking_events = Column(JSONB, default=[])
    delivery_notes = Column(Text)
    
    order = relationship("Order", back_populates="shipments", passive_deletes=True)
    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    items = relationship("ShipmentItem", back_populates="shipment", cascade="all, delete-orphan", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "supplier_id": str(self.supplier_id),
            "tracking_number": self.tracking_number,
            "carrier": self.carrier,
            "carrier_service": self.carrier_service,
            "status": self.status.value if self.status else None,
            "weight": float(self.weight) if self.weight else None,
            "length": float(self.length) if self.length else None,
            "width": float(self.width) if self.width else None,
            "height": float(self.height) if self.height else None,
            "shipping_cost": float(self.shipping_cost) if self.shipping_cost else None,
            "estimated_delivery_date": self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "shipping_address": self.shipping_address,
            "tracking_events": self.tracking_events or [],
            "delivery_notes": self.delivery_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ShipmentItem(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "shipment_items"
    
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    
    shipment = relationship("Shipment", back_populates="items", passive_deletes=True)
    order_item = relationship("OrderItem", passive_deletes=True)
    product = relationship("Product", passive_deletes=True)
    variant = relationship("ProductVariant", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "shipment_id": str(self.shipment_id),
            "order_item_id": str(self.order_item_id),
            "product_id": str(self.product_id),
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "quantity": self.quantity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
