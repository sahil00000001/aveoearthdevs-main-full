from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=25)
    avatar_url: Optional[str] = None

class UserProfileUpdateRequest(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = Field(None, max_length=500)
    
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        if v and v > datetime.now():
            raise ValueError('Date of birth cannot be in the future')
        return v

class PreferencesUpdateRequest(BaseModel):
    language: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, max_length=3)
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    marketing_emails: Optional[bool] = None
    product_recommendations: Optional[bool] = None
    price_alerts: Optional[bool] = None
    newsletter: Optional[bool] = None

class NotificationSettingsRequest(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    order_updates: Optional[bool] = None
    promotional_offers: Optional[bool] = None
    security_alerts: Optional[bool] = None
    marketing_communications: Optional[bool] = None
    product_updates: Optional[bool] = None
    review_reminders: Optional[bool] = None
    wishlist_alerts: Optional[bool] = None

class SocialLinksRequest(BaseModel):
    facebook: Optional[str] = Field(None, max_length=200)
    twitter: Optional[str] = Field(None, max_length=200)
    instagram: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=200)
    youtube: Optional[str] = Field(None, max_length=200)
    website: Optional[str] = Field(None, max_length=200)

class CompleteProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=25)
    date_of_birth: Optional[datetime] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = Field(None, max_length=500)
    preferences: Optional[Dict[str, Any]] = None
    social_links: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, Any]] = None
    
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        if v and v > datetime.now():
            raise ValueError('Date of birth cannot be in the future')
        return v

class AccountSettingsRequest(BaseModel):
    is_profile_public: Optional[bool] = None
    show_online_status: Optional[bool] = None
    allow_friend_requests: Optional[bool] = None
    show_purchase_history: Optional[bool] = None
    show_wishlist: Optional[bool] = None
    data_processing_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None
