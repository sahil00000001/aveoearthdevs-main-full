from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from decimal import Decimal
from enum import Enum
from app.core.exceptions import ValidationException


class SortByEnum(str, Enum):
    RELEVANCE = "relevance"
    PRICE_LOW_TO_HIGH = "price_low_to_high"
    PRICE_HIGH_TO_LOW = "price_high_to_low"
    NEWEST = "newest"
    OLDEST = "oldest"
    NAME_A_TO_Z = "name_a_to_z"
    NAME_Z_TO_A = "name_z_to_a"
    RATING_HIGH_TO_LOW = "rating_high_to_low"
    RATING_LOW_TO_HIGH = "rating_low_to_high"
    POPULARITY = "popularity"
    DISCOUNT = "discount"


class ProductSearchRequest(BaseModel):
    query: Optional[str] = None
    category_ids: Optional[List[UUID]] = Field(default_factory=list)
    brand_ids: Optional[List[UUID]] = Field(default_factory=list)
    supplier_ids: Optional[List[UUID]] = Field(default_factory=list)
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_rating: Optional[float] = Field(None, ge=0, le=5)
    in_stock_only: bool = Field(default=True)
    on_sale_only: bool = Field(default=False)
    tags: Optional[List[str]] = Field(default_factory=list)
    materials: Optional[List[str]] = Field(default_factory=list)
    origin_countries: Optional[List[str]] = Field(default_factory=list)
    min_sustainability_score: Optional[float] = Field(None, ge=0, le=10)
    max_sustainability_score: Optional[float] = Field(None, ge=0, le=10)
    sort_by: SortByEnum = Field(default=SortByEnum.RELEVANCE)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    
    @validator('max_price')
    def validate_max_price(cls, v, values):
        if v and values.get('min_price') and v < values['min_price']:
            raise ValidationException('max_price must be greater than min_price')
        return v
    
    @validator('max_rating')
    def validate_max_rating(cls, v, values):
        if v and values.get('min_rating') and v < values['min_rating']:
            raise ValidationException('max_rating must be greater than min_rating')
        return v
    
    @validator('max_sustainability_score')
    def validate_max_sustainability_score(cls, v, values):
        if v and values.get('min_sustainability_score') and v < values['min_sustainability_score']:
            raise ValidationException('max_sustainability_score must be greater than min_sustainability_score')
        return v


class ProductFilterRequest(BaseModel):
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    sort_by: SortByEnum = SortByEnum.RELEVANCE
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class ProductComparisonRequest(BaseModel):
    product_ids: List[UUID] = Field(..., min_items=2, max_items=5)


class ProductRecommendationRequest(BaseModel):
    product_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    recommendation_type: str = Field(default="similar")
    limit: int = Field(default=10, ge=1, le=50)


class AdvancedFilterRequest(BaseModel):
    search_term: Optional[str] = None
    category_ids: Optional[List[UUID]] = Field(default_factory=list)
    brand_ids: Optional[List[UUID]] = Field(default_factory=list)
    supplier_ids: Optional[List[UUID]] = Field(default_factory=list)
    price_range: Optional[Tuple[Optional[Decimal], Optional[Decimal]]] = None
    rating_range: Optional[Tuple[Optional[float], Optional[float]]] = None
    sustainability_range: Optional[Tuple[Optional[float], Optional[float]]] = None
    availability_status: Optional[str] = Field(None, pattern="^(in_stock|out_of_stock|all)$")
    discount_only: bool = Field(default=False)
    materials: Optional[List[str]] = Field(default_factory=list)
    origin_countries: Optional[List[str]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)
    date_range: Optional[Tuple[Optional[str], Optional[str]]] = None
    sort_by: SortByEnum = Field(default=SortByEnum.RELEVANCE)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class ProductSearchAnalyticsRequest(BaseModel):
    user_id: Optional[UUID] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    metrics: List[str] = Field(default_factory=lambda: ["views", "searches", "conversions"])

class ProductFilterOptionsRequest(BaseModel):
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    include_price_ranges: bool = Field(default=True)
    include_rating_ranges: bool = Field(default=True)
    include_sustainability_ranges: bool = Field(default=True)

class ProductAutoCompleteRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=100)
    limit: int = Field(default=10, ge=1, le=50)
    include_categories: bool = Field(default=True)
    include_brands: bool = Field(default=True)
    include_products: bool = Field(default=True)

class ProductSearchSuggestionsRequest(BaseModel):
    query: Optional[str] = None
    user_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    limit: int = Field(default=5, ge=1, le=20)

class ProductTrendingRequest(BaseModel):
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    time_period: str = Field(default="week", pattern="^(day|week|month|year)$")
    limit: int = Field(default=20, ge=1, le=100)

class ProductSeasonalRequest(BaseModel):
    season: str = Field(..., pattern="^(spring|summer|autumn|winter)$")
    category_id: Optional[UUID] = None
    limit: int = Field(default=20, ge=1, le=100)

class ProductNewArrivalsRequest(BaseModel):
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    days_back: int = Field(default=30, ge=1, le=365)
    limit: int = Field(default=20, ge=1, le=100)

class ProductBestSellersRequest(BaseModel):
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    time_period: str = Field(default="month", pattern="^(week|month|quarter|year)$")
    limit: int = Field(default=20, ge=1, le=100)

class ProductSimilarRequest(BaseModel):
    product_id: UUID
    limit: int = Field(default=10, ge=1, le=50)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)

class ProductBundleRecommendationRequest(BaseModel):
    product_ids: List[UUID] = Field(..., min_items=1, max_items=10)
    limit: int = Field(default=5, ge=1, le=20)

class ProductCrossSellingRequest(BaseModel):
    product_id: UUID
    limit: int = Field(default=8, ge=1, le=20)

class ProductUpSellingRequest(BaseModel):
    product_id: UUID
    price_range_factor: float = Field(default=1.5, ge=1.0, le=3.0)
    limit: int = Field(default=6, ge=1, le=20)

class ProductPersonalizedRequest(BaseModel):
    user_id: UUID
    recommendation_type: str = Field(default="mixed", pattern="^(viewed|purchased|wishlist|categories|mixed)$")
    exclude_owned: bool = Field(default=True)
    limit: int = Field(default=20, ge=1, le=100)

class ProductVisualSearchRequest(BaseModel):
    image_url: Optional[str] = None
    color_palette: Optional[List[str]] = Field(default_factory=list)
    style_attributes: Optional[List[str]] = Field(default_factory=list)
    limit: int = Field(default=20, ge=1, le=100)

class ProductLocationBasedRequest(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius_km: Optional[float] = Field(None, gt=0, le=1000)
    country: Optional[str] = None
    city: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)

class ProductPriceHistoryRequest(BaseModel):
    product_id: UUID
    days_back: int = Field(default=30, ge=1, le=365)

class ProductStockAlertRequest(BaseModel):
    product_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    alert_threshold: int = Field(default=5, ge=0, le=100)

class ProductBulkSearchRequest(BaseModel):
    product_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    include_details: bool = Field(default=False)
    include_inventory: bool = Field(default=False)
    include_pricing: bool = Field(default=True)