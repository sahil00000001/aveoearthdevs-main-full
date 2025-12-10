from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum, UUID, TypeDecorator
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.base import Base, BaseTimeStamp, BaseUUID

class UserTypeEnum(str, PyEnum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class UserTypeEnumType(TypeDecorator):
    """Custom type that ensures enum values (lowercase strings) are used, not names"""
    impl = Enum(UserTypeEnum, native_enum=False)
    cache_ok = True
    
    def __init__(self):
        super().__init__(UserTypeEnum, native_enum=False)
    
    def load_dialect_impl(self, dialect):
        """Use PostgreSQL ENUM type when using PostgreSQL, String otherwise"""
        if dialect.name == 'postgresql':
            # Use PostgreSQL native enum type
            return dialect.type_descriptor(PG_ENUM(UserTypeEnum, name='user_type', create_type=False))
        else:
            return dialect.type_descriptor(String(20))
    
    def process_bind_param(self, value, dialect):
        """Convert enum to lowercase string value"""
        if value is None:
            return None
        # Get the lowercase string value
        if isinstance(value, UserTypeEnum):
            value_str = value.value  # "buyer", "supplier", "admin"
        elif isinstance(value, str):
            value_str = value.lower()
        else:
            value_str = str(value).lower()
        
        # Ensure it's a valid enum value
        valid_values = ["buyer", "supplier", "admin"]
        if value_str not in valid_values:
            value_str = "buyer"  # Default
        
        return value_str
    
    def process_result_value(self, value, dialect):
        """Convert string from database to enum object"""
        if value is None:
            return None
        if isinstance(value, UserTypeEnum):
            return value
        # Convert string to enum by value (not name)
        value_lower = value.lower() if isinstance(value, str) else str(value).lower()
        for enum_member in UserTypeEnum:
            if enum_member.value == value_lower:
                return enum_member
        return UserTypeEnum.BUYER  # Default fallback

class User(BaseUUID, BaseTimeStamp, Base):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(25), unique=True, nullable=True)
    user_type = Column(UserTypeEnumType(), nullable=False, default=UserTypeEnum.BUYER.value)
    first_name = Column(String(100))
    last_name = Column(String(100))
    avatar_url = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_phone_verified = Column(Boolean, default=False)
    is_email_verified = Column(Boolean, default=False)
    google_id = Column(String(255))
    last_login_at = Column(DateTime)
    referral_code = Column(String(10), unique=True, nullable=True, index=True)

    profile = relationship("UserProfile", back_populates="user", uselist=False, passive_deletes=True)
    addresses = relationship("Address", back_populates="user", passive_deletes=True)
    referrals_made = relationship("Referral", foreign_keys="Referral.referrer_id", back_populates="referrer", passive_deletes=True)
    referrals_received = relationship("Referral", foreign_keys="Referral.referee_id", back_populates="referee", passive_deletes=True)
    supplier_business = relationship("SupplierBusiness", foreign_keys="SupplierBusiness.supplier_id", back_populates="supplier", uselist=False, passive_deletes=True)
    activities = relationship("UserActivity", back_populates="user", passive_deletes=True)
    behavior_profile = relationship("UserBehaviorProfile", back_populates="user", uselist=False, passive_deletes=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "phone": self.phone,
            "user_type": self.user_type.value if self.user_type else None,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "avatar_url": self.avatar_url,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "is_phone_verified": self.is_phone_verified,
            "is_email_verified": self.is_email_verified,
            "google_id": self.google_id,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "referral_code": self.referral_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }