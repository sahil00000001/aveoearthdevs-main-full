from sqlalchemy import Column, String, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import enum

from app.core.base import Base, BaseTimeStamp, BaseUUID


class AddressTypeEnum(str, enum.Enum):
    HOME = "home"
    WORK = "work"
    BILLING = "billing"
    SHIPPING = "shipping"
    OTHER = "other"


class Address(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "addresses"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(AddressTypeEnum, native_enum=False), nullable=False)
    is_default = Column(Boolean, default=False)
    label = Column(String(100))
    first_name = Column(String(100))
    last_name = Column(String(100))
    company = Column(String(200))
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False, default="India")
    phone = Column(String(20))
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    
    user = relationship("User", back_populates="addresses", passive_deletes=True)
    
    def __repr__(self):
        return f"<Address {self.id}: {self.address_line_1}, {self.city}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type.value if self.type else None,
            "is_default": self.is_default,
            "label": self.label,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "company": self.company,
            "address_line_1": self.address_line_1,
            "address_line_2": self.address_line_2,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "country": self.country,
            "phone": self.phone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }