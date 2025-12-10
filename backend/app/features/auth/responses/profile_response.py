from pydantic import BaseModel
from typing import Optional, Dict, Any, List
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

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    preferences: Dict[str, Any] = {}
    social_links: Dict[str, Any] = {}
    notification_settings: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

class UserProfileResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    user_type: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    is_active: bool = True
    is_phone_verified: bool = False
    is_email_verified: bool = False
    last_login_at: Optional[datetime] = None
    referral_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CompleteUserProfileResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    user_type: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    is_active: bool = True
    is_phone_verified: bool = False
    is_email_verified: bool = False
    last_login_at: Optional[datetime] = None
    referral_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    profile: Optional[ProfileResponse] = None

class AvatarUploadResponse(BaseModel):
    message: str
    avatar_url: str
    user_id: str

class AccountStatsResponse(BaseModel):
    total_orders: int = 0
    total_spent: float = 0.0
    wishlist_items: int = 0
    reviews_written: int = 0
    referrals_made: int = 0
    account_age_days: int = 0
    last_order_date: Optional[datetime] = None
    favorite_category: Optional[str] = None

class UserActivityResponse(BaseModel):
    recent_orders: List[Dict[str, Any]] = []
    recent_reviews: List[Dict[str, Any]] = []
    recent_wishlist_additions: List[Dict[str, Any]] = []
    browsing_history: List[Dict[str, Any]] = []
    search_history: List[Dict[str, Any]] = []

class PrivacySettingsResponse(BaseModel):
    is_profile_public: bool = True
    show_online_status: bool = True
    allow_friend_requests: bool = True
    show_purchase_history: bool = False
    show_wishlist: bool = True
    data_processing_consent: bool = False
    marketing_consent: bool = False

class SecurityInfoResponse(BaseModel):
    two_factor_enabled: bool = False
    last_password_change: Optional[datetime] = None
    active_sessions: int = 0
    login_attempts: int = 0
    security_questions_set: bool = False

class AccountOverviewResponse(BaseModel):
    user: CompleteUserProfileResponse
    stats: AccountStatsResponse
    activity: UserActivityResponse
    privacy_settings: PrivacySettingsResponse
    security_info: SecurityInfoResponse
