from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ProductSearchItemResponse(BaseModel):
    id: UUID
    sku: str
    name: str
    slug: str
    short_description: Optional[str]
    price: Decimal
    compare_at_price: Optional[Decimal]
    discount_percentage: Optional[float] = None
    primary_image: Optional[str] = None
    rating: Optional[float] = None
    review_count: int = 0
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None
    sustainability_score: Optional[float] = None
    is_on_sale: bool = False
    tags: List[str] = Field(default_factory=list)
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductSearchResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
    filters_applied: Dict[str, Any]
    available_filters: Dict[str, Any]


class ProductFilterOptionsResponse(BaseModel):
    categories: List[Dict[str, Any]]
    brands: List[Dict[str, Any]]
    price_range: Dict[str, Decimal]
    rating_range: Dict[str, float]
    sustainability_range: Dict[str, float]
    materials: List[str]
    origin_countries: List[str]
    tags: List[str]


class ProductComparisonResponse(BaseModel):
    products: List[Dict[str, Any]]
    comparison_attributes: List[str]


class ProductRecommendationResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    recommendation_type: str
    total: int

class ProductAutoCompleteResponse(BaseModel):
    suggestions: List[Dict[str, Any]]
    categories: List[Dict[str, Any]]
    brands: List[Dict[str, Any]]
    products: List[Dict[str, Any]]

class ProductSearchSuggestionsResponse(BaseModel):
    suggestions: List[str]
    trending_searches: List[str]
    user_history: List[str]

class ProductTrendingResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    trend_score: Optional[float] = None
    time_period: str
    total: int

class ProductSeasonalResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    season: str
    seasonal_score: Optional[float] = None
    total: int

class ProductNewArrivalsResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    days_back: int
    total: int

class ProductBestSellersResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    sales_data: List[Dict[str, Any]]
    time_period: str
    total: int

class ProductSimilarResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    similarity_scores: List[float]
    base_product_id: UUID
    total: int

class ProductBundleRecommendationResponse(BaseModel):
    bundles: List[Dict[str, Any]]
    bundle_savings: List[float]
    total: int

class ProductCrossSellingResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    cross_sell_score: List[float]
    base_product_id: UUID
    total: int

class ProductUpSellingResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    price_differences: List[float]
    upgrade_benefits: List[Dict[str, Any]]
    base_product_id: UUID
    total: int

class ProductPersonalizedResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    recommendation_reasons: List[str]
    personalization_score: List[float]
    user_id: UUID
    total: int

class ProductVisualSearchResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    visual_similarity_scores: List[float]
    color_matches: List[Dict[str, Any]]
    style_matches: List[Dict[str, Any]]
    total: int

class ProductLocationBasedResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    distances: List[float]
    local_suppliers: List[Dict[str, Any]]
    shipping_info: List[Dict[str, Any]]
    total: int

class ProductPriceHistoryResponse(BaseModel):
    product_id: UUID
    price_history: List[Dict[str, Any]]
    current_price: Decimal
    lowest_price: Decimal
    highest_price: Decimal
    average_price: Decimal
    price_trend: str

class ProductStockAlertResponse(BaseModel):
    alerts: List[Dict[str, Any]]
    low_stock_products: List[UUID]
    out_of_stock_products: List[UUID]
    total_alerts: int

class ProductBulkSearchResponse(BaseModel):
    products: List[Dict[str, Any]]
    found_count: int
    not_found_ids: List[UUID]
    inventory_data: Optional[List[Dict[str, Any]]] = None
    pricing_data: Optional[List[Dict[str, Any]]] = None

class ProductSearchAnalyticsResponse(BaseModel):
    search_volume: Dict[str, int]
    popular_terms: List[Dict[str, Any]]
    conversion_rates: Dict[str, float]
    category_performance: List[Dict[str, Any]]
    brand_performance: List[Dict[str, Any]]
    time_series_data: List[Dict[str, Any]]

class ProductComparisonDetailResponse(BaseModel):
    products: List[Dict[str, Any]]
    comparison_matrix: Dict[str, List[Any]]
    feature_differences: Dict[str, List[str]]
    price_comparison: Dict[str, Any]
    rating_comparison: Dict[str, Any]
    sustainability_comparison: Dict[str, Any]
    recommendation: Optional[str] = None

class ProductAdvancedFilterResponse(BaseModel):
    products: List[ProductSearchItemResponse]
    total: int
    applied_filters: Dict[str, Any]
    filter_results_count: Dict[str, int]
    suggested_filters: Dict[str, Any]
    price_range_applied: Optional[Dict[str, float]] = None
    page: int
    per_page: int
    total_pages: int

class ProductFilterInsightsResponse(BaseModel):
    filter_performance: Dict[str, Any]
    popular_filters: List[Dict[str, Any]]
    filter_combinations: List[Dict[str, Any]]
    conversion_by_filter: Dict[str, float]