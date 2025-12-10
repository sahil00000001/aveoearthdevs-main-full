from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID
import uuid
import enum


class ReturnReasonEnum(str, enum.Enum):
    DEFECTIVE_ITEM = "defective_item"
    WRONG_ITEM = "wrong_item"
    SIZE_ISSUE = "size_issue"
    QUALITY_ISSUE = "quality_issue"
    NOT_AS_DESCRIBED = "not_as_described"
    CHANGED_MIND = "changed_mind"
    DAMAGED_IN_SHIPPING = "damaged_in_shipping"
    LATE_DELIVERY = "late_delivery"
    OTHER = "other"


class ReturnStatusEnum(str, enum.Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    ITEM_SHIPPED = "item_shipped"
    ITEM_RECEIVED = "item_received"
    INSPECTING = "inspecting"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RefundStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Return(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "returns"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    return_number = Column(String(50), unique=True, nullable=False)
    reason = Column(ENUM(ReturnReasonEnum), nullable=False)
    description = Column(Text)
    quantity = Column(Integer, nullable=False)
    status = Column(ENUM(ReturnStatusEnum), default=ReturnStatusEnum.REQUESTED)
    return_tracking_number = Column(String(100))
    images = Column(JSONB, default=[])
    requested_at = Column(DateTime(timezone=True), nullable=False)
    approved_at = Column(DateTime(timezone=True))
    rejected_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    item_shipped_at = Column(DateTime(timezone=True))
    item_received_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    admin_notes = Column(Text)
    
    order = relationship("Order", back_populates="returns", passive_deletes=True)
    order_item = relationship("OrderItem", back_populates="returns", passive_deletes=True)
    user = relationship("User", foreign_keys=[user_id], passive_deletes=True)
    supplier = relationship("User", foreign_keys=[supplier_id], passive_deletes=True)
    refunds = relationship("Refund", back_populates="return_request", cascade="all, delete-orphan", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "order_item_id": str(self.order_item_id),
            "user_id": str(self.user_id),
            "supplier_id": str(self.supplier_id),
            "return_number": self.return_number,
            "reason": self.reason.value if self.reason else None,
            "description": self.description,
            "quantity": self.quantity,
            "status": self.status.value if self.status else None,
            "return_tracking_number": self.return_tracking_number,
            "images": self.images or [],
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "rejected_at": self.rejected_at.isoformat() if self.rejected_at else None,
            "rejection_reason": self.rejection_reason,
            "item_shipped_at": self.item_shipped_at.isoformat() if self.item_shipped_at else None,
            "item_received_at": self.item_received_at.isoformat() if self.item_received_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Refund(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "refunds"
    
    return_id = Column(UUID(as_uuid=True), ForeignKey("returns.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False)
    refund_number = Column(String(50), unique=True, nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), default="INR")
    status = Column(ENUM(RefundStatusEnum), default=RefundStatusEnum.PENDING)
    gateway_refund_id = Column(String(255))
    gateway_response = Column(JSONB)
    failure_reason = Column(Text)
    processed_at = Column(DateTime(timezone=True))
    admin_notes = Column(Text)
    
    return_request = relationship("Return", back_populates="refunds", passive_deletes=True)
    order = relationship("Order", passive_deletes=True)
    payment = relationship("Payment", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "return_id": str(self.return_id),
            "order_id": str(self.order_id),
            "payment_id": str(self.payment_id),
            "refund_number": self.refund_number,
            "amount": float(self.amount) if self.amount else None,
            "currency": self.currency,
            "status": self.status.value if self.status else None,
            "gateway_refund_id": self.gateway_refund_id,
            "gateway_response": self.gateway_response,
            "failure_reason": self.failure_reason,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
