from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class UserTypeEnum(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"
    ADMIN = "admin"

class ReferralStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"

class ReferredUserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime

class ReferralResponse(BaseModel):
    id: str
    referrer_id: str
    referee_id: Optional[str] = None
    referral_code: str
    status: ReferralStatusEnum
    reward_amount: Optional[float] = None
    reward_type: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    referee: Optional[ReferredUserResponse] = None

class ReferralStatsResponse(BaseModel):
    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    referrals: List[Dict[str, Any]]

class UserReferralResponse(BaseModel):
    user_referral_code: Optional[str] = None
    referral_stats: ReferralStatsResponse
