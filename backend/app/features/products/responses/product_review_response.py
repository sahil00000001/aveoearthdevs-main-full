from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductReviewUserResponse(BaseModel):
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ProductReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    images: List[str] = []
    is_verified_purchase: bool
    helpful_count: int
    user: Optional[ProductReviewUserResponse] = None
    created_at: datetime
    updated_at: datetime

class ProductReviewStatsResponse(BaseModel):
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[str, int]

class UserReviewProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    price: Optional[float] = None

class UserReviewResponse(BaseModel):
    id: str
    product_id: str
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    images: List[str] = []
    is_verified_purchase: bool
    helpful_count: int
    product: Optional[UserReviewProductResponse] = None
    created_at: datetime
    updated_at: datetime
