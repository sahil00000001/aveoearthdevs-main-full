from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.base import Base, BaseTimeStamp, BaseUUID
import uuid
import enum


class PaymentMethodStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Payment(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "payments"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_gateway = Column(String(50), nullable=False)
    gateway_transaction_id = Column(String(255))
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), default="INR")
    status = Column(String(50), default='pending')
    gateway_response = Column(JSONB)
    failure_reason = Column(Text)
    refund_amount = Column(DECIMAL(12, 2), default=0)
    processed_at = Column(DateTime(timezone=True))
    
    order = relationship("Order", back_populates="payments", passive_deletes=True)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "payment_method": self.payment_method,
            "payment_gateway": self.payment_gateway,
            "gateway_transaction_id": self.gateway_transaction_id,
            "amount": float(self.amount) if self.amount else 0,
            "currency": self.currency,
            "status": self.status if isinstance(self.status, str) else (self.status.value if self.status else None),
            "gateway_response": self.gateway_response,
            "failure_reason": self.failure_reason,
            "refund_amount": float(self.refund_amount) if self.refund_amount else 0,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }