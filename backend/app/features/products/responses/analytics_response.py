from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SupplierAnalyticsResponse(BaseModel):
    total_views: int
    unique_views: int
    most_viewed_products: List[Dict[str, Any]]
    period_days: int

class ProductAnalyticsResponse(BaseModel):
    product_id: str
    unique_viewers: int
    total_views: int
    search_clicks: int
    conversions: int
    conversion_rate: float
    avg_rating: float
    review_count: int
    period_days: int

class SearchTrendsResponse(BaseModel):
    trends: List[Dict[str, Any]]
    period_days: int

class PopularSearchTermsResponse(BaseModel):
    popular_terms: List[Dict[str, Any]]
    period_days: int

class CategoryAnalyticsResponse(BaseModel):
    category_analytics: List[Dict[str, Any]]
    period_days: int

class UserSearchBehaviorResponse(BaseModel):
    user_id: str
    total_searches: int
    unique_queries: int
    clicks: int
    purchases: int
    click_through_rate: float
    conversion_rate: float
    avg_search_duration_ms: float
    recent_queries: List[str]
    period_days: int

class PriceAnalyticsResponse(BaseModel):
    product_id: str
    current_price: float
    min_price: float
    max_price: float
    avg_price: float
    price_changes: int
    price_volatility: float
    period_days: int