from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from uuid import UUID

from app.database.session import get_async_session
from app.core.role_auth import get_all_users, get_optional_user, require_buyer_or_supplier
from app.features.products.cruds.product_search_crud import ProductSearchCRUD
from app.features.products.cruds.product_view_crud import ProductViewCrud
from app.features.products.cruds.product_analytics_crud import ProductAnalyticsCrud
from app.features.products.requests.product_search_request import (
    ProductSearchRequest, ProductFilterRequest, ProductComparisonRequest,
    ProductAutoCompleteRequest, ProductSearchSuggestionsRequest, ProductTrendingRequest,
    ProductSeasonalRequest, ProductNewArrivalsRequest, ProductBestSellersRequest,
    ProductCrossSellingRequest, ProductUpSellingRequest, ProductPersonalizedRequest,
    ProductPriceHistoryRequest, ProductStockAlertRequest, ProductBulkSearchRequest,
    ProductSearchAnalyticsRequest, AdvancedFilterRequest
)
from app.features.products.responses.product_search_response import (
    ProductSearchResponse, ProductFilterOptionsResponse, 
    ProductRecommendationResponse, ProductSearchItemResponse,
    ProductComparisonDetailResponse, ProductAutoCompleteResponse, ProductSearchSuggestionsResponse,
    ProductTrendingResponse, ProductSeasonalResponse, ProductNewArrivalsResponse,
    ProductBestSellersResponse, ProductCrossSellingResponse, ProductUpSellingResponse,
    ProductPersonalizedResponse, ProductPriceHistoryResponse, ProductStockAlertResponse,
    ProductBulkSearchResponse, ProductSearchAnalyticsResponse, ProductAdvancedFilterResponse
)

product_search_router = APIRouter(prefix="/search", tags=["product-search"])


@product_search_router.post("/", response_model=ProductSearchResponse)
async def search_products(
    request: ProductSearchRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    try:
        if db is None:
            # Return empty results if database is not available
            return ProductSearchResponse(
                products=[],
                total=0,
                page=request.page,
                per_page=request.per_page,
                total_pages=0,
                filters_applied=request.model_dump(exclude_none=True),
                available_filters={}
            )
        
        crud = ProductSearchCRUD()
        products, total = await crud.search_products(db, request)
        
        if current_user and request.query:
            try:
                analytics_crud = ProductAnalyticsCrud()
                await analytics_crud.log_search(db, {
                    "user_id": current_user["id"],
                    "query_term": request.query,
                    "search_type": "general",
                    "results_count": total
                })
            except Exception as e:
                # Log search analytics failure but continue
                from app.core.logging import get_logger
                logger = get_logger("search")
                logger.warning(f"Could not log search analytics: {e}")
        
        product_items = []
        for product in products:
            try:
                item = ProductSearchItemResponse(
                    id=product.id,
                    sku=product.sku,
                    name=product.name,
                    slug=product.slug,
                    short_description=product.short_description,
                    price=product.price,
                    compare_at_price=product.compare_at_price,
                    discount_percentage=None,
                    primary_image=product.images[0].url if product.images and len(product.images) > 0 else None,
                    rating=None,
                    review_count=0,
                    in_stock=product.inventory[0].available_quantity > 0 if product.inventory and len(product.inventory) > 0 else False,
                    stock_quantity=product.inventory[0].available_quantity if product.inventory and len(product.inventory) > 0 else 0,
                    brand_name=product.brand.name if product.brand else None,
                    category_name=product.category.name if product.category else None,
                    supplier_name=f"{product.supplier.first_name} {product.supplier.last_name}" if product.supplier else None,
                    sustainability_score=product.sustainability_score[0].overall_score if product.sustainability_score and len(product.sustainability_score) > 0 else None,
                    is_on_sale=product.compare_at_price is not None,
                    tags=product.tags or [],
                    created_at=product.created_at
                )
                
                if product.compare_at_price:
                    item.discount_percentage = float(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                
                product_items.append(item)
            except Exception as e:
                # Skip products that fail to convert
                from app.core.logging import get_logger
                logger = get_logger("search")
                logger.warning(f"Could not convert product to response: {e}")
                continue
        
        total_pages = (total + request.per_page - 1) // request.per_page if request.per_page > 0 else 0
        
        return ProductSearchResponse(
            products=product_items,
            total=total,
            page=request.page,
            per_page=request.per_page,
            total_pages=total_pages,
            filters_applied=request.model_dump(exclude_none=True),
            available_filters={}
        )
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger("search")
        logger.error(f"Search error: {e}")
        # Return empty results on error
        return ProductSearchResponse(
            products=[],
            total=0,
            page=request.page,
            per_page=request.per_page,
            total_pages=0,
            filters_applied=request.model_dump(exclude_none=True),
            available_filters={}
        )


@product_search_router.get("/filters", response_model=ProductFilterOptionsResponse)
async def get_filter_options(db: Optional[AsyncSession] = Depends(get_async_session)):
    crud = ProductSearchCRUD()
    filters = await crud.get_filter_options(db)
    return ProductFilterOptionsResponse(**filters)


@product_search_router.get("/recommendations", response_model=ProductRecommendationResponse)
async def get_product_recommendations(
    product_id: Optional[UUID] = Query(None),
    recommendation_type: str = Query(default="similar"),
    limit: int = Query(default=10, ge=1, le=50),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    
    user_id = current_user["id"] if current_user else None
    products = await crud.get_product_recommendations(
        db,
        product_id=product_id,
        user_id=user_id,
        recommendation_type=recommendation_type,
        limit=limit
    )
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductRecommendationResponse(
        products=product_items,
        recommendation_type=recommendation_type,
        total=len(product_items)
    )


@product_search_router.get("/trending", response_model=ProductRecommendationResponse)
async def get_trending_products(
    limit: int = Query(default=10, ge=1, le=50),
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    try:
        if db is None:
            return ProductRecommendationResponse(
                products=[],
                recommendation_type="trending",
                total=0
            )
        
        crud = ProductSearchCRUD()
        products = await crud.get_product_recommendations(
            db,
            recommendation_type="trending",
            limit=limit
        )
        
        product_items = []
        for product in products:
            try:
                item = ProductSearchItemResponse(
                    id=str(product.id),
                    sku=product.sku or "",
                    name=product.name or "",
                    slug=product.slug or "",
                    short_description=product.short_description or "",
                    price=float(product.price) if product.price else 0.0,
                    compare_at_price=float(product.compare_at_price) if product.compare_at_price else None,
                    primary_image=product.images[0].url if product.images and len(product.images) > 0 else None,
                    brand_name=product.brand.name if product.brand else None,
                    category_name=product.category.name if product.category else None,
                    is_on_sale=product.compare_at_price is not None,
                    tags=product.tags or [],
                    created_at=product.created_at
                )
                product_items.append(item)
            except Exception as e:
                # Skip products that can't be serialized
                continue
        
        return ProductRecommendationResponse(
            products=product_items,
            recommendation_type="trending",
            total=len(product_items)
        )
    except Exception as e:
        # Return empty result on any error
        return ProductRecommendationResponse(
            products=[],
            recommendation_type="trending",
            total=0
        )


@product_search_router.get("/top-rated", response_model=ProductRecommendationResponse)
async def get_top_rated_products(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products = await crud.get_product_recommendations(
        db,
        recommendation_type="top_rated",
        limit=limit
    )
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductRecommendationResponse(
        products=product_items,
        recommendation_type="top_rated",
        total=len(product_items)
    )

@product_search_router.post("/filter", response_model=ProductAdvancedFilterResponse)
async def filter_products(
    request: ProductFilterRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products, total = await crud.filter_products(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    total_pages = (total + request.per_page - 1) // request.per_page
    
    return ProductAdvancedFilterResponse(
        products=product_items,
        total=total,
        applied_filters=request.model_dump(exclude_none=True),
        filter_results_count={"total": total},
        suggested_filters={},
        page=request.page,
        per_page=request.per_page,
        total_pages=total_pages
    )

@product_search_router.post("/compare", response_model=ProductComparisonDetailResponse)
async def compare_products(
    request: ProductComparisonRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products = await crud.compare_products(db, request)
    
    products_data = []
    for product in products:
        product_dict = product.to_dict()
        product_dict["category"] = product.category.to_dict() if product.category else None
        product_dict["brand"] = product.brand.to_dict() if product.brand else None
        product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
        products_data.append(product_dict)
    
    return ProductComparisonDetailResponse(
        products=products_data,
        comparison_matrix={},
        feature_differences={},
        price_comparison={},
        rating_comparison={},
        sustainability_comparison={}
    )

@product_search_router.get("/autocomplete", response_model=ProductAutoCompleteResponse)
async def autocomplete_search(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    include_categories: bool = Query(True),
    include_brands: bool = Query(True),
    include_products: bool = Query(True),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductAutoCompleteRequest(
        query=query,
        limit=limit,
        include_categories=include_categories,
        include_brands=include_brands,
        include_products=include_products
    )
    results = await crud.autocomplete_search(db, request)
    return ProductAutoCompleteResponse(**results)

@product_search_router.get("/suggestions", response_model=ProductSearchSuggestionsResponse)
async def get_search_suggestions(
    query: Optional[str] = Query(None),
    limit: int = Query(5, ge=1, le=20),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductSearchSuggestionsRequest(
        query=query,
        user_id=current_user["id"] if current_user else None,
        limit=limit
    )
    results = await crud.get_search_suggestions(db, request)
    return ProductSearchSuggestionsResponse(**results)

@product_search_router.get("/trending-advanced", response_model=ProductTrendingResponse)
async def get_trending_products_advanced(
    time_period: str = Query("week", pattern="^(day|week|month|year)$"),
    category_id: Optional[UUID] = Query(None),
    brand_id: Optional[UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductTrendingRequest(
        time_period=time_period,
        category_id=category_id,
        brand_id=brand_id,
        limit=limit
    )
    products, total = await crud.get_trending_products_advanced(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductTrendingResponse(
        products=product_items,
        time_period=time_period,
        total=total
    )

@product_search_router.get("/seasonal", response_model=ProductSeasonalResponse)
async def get_seasonal_products(
    season: str = Query(..., pattern="^(spring|summer|autumn|winter)$"),
    category_id: Optional[UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductSeasonalRequest(
        season=season,
        category_id=category_id,
        limit=limit
    )
    products, total = await crud.get_seasonal_products(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductSeasonalResponse(
        products=product_items,
        season=season,
        total=total
    )

@product_search_router.get("/new-arrivals", response_model=ProductNewArrivalsResponse)
async def get_new_arrivals(
    days_back: int = Query(30, ge=1, le=365),
    category_id: Optional[UUID] = Query(None),
    brand_id: Optional[UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductNewArrivalsRequest(
        days_back=days_back,
        category_id=category_id,
        brand_id=brand_id,
        limit=limit
    )
    products, total = await crud.get_new_arrivals(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductNewArrivalsResponse(
        products=product_items,
        days_back=days_back,
        total=total
    )

@product_search_router.get("/best-sellers", response_model=ProductBestSellersResponse)
async def get_best_sellers(
    time_period: str = Query("month", pattern="^(week|month|quarter|year)$"),
    category_id: Optional[UUID] = Query(None),
    brand_id: Optional[UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductBestSellersRequest(
        time_period=time_period,
        category_id=category_id,
        brand_id=brand_id,
        limit=limit
    )
    products, sales_data = await crud.get_best_sellers(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductBestSellersResponse(
        products=product_items,
        sales_data=sales_data["sales_data"],
        time_period=time_period,
        total=len(product_items)
    )

@product_search_router.get("/cross-sell/{product_id}", response_model=ProductCrossSellingResponse)
async def get_cross_selling_products(
    product_id: UUID,
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductCrossSellingRequest(
        product_id=product_id,
        limit=limit
    )
    products, scores = await crud.get_cross_selling_products(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductCrossSellingResponse(
        products=product_items,
        cross_sell_score=scores,
        base_product_id=product_id,
        total=len(product_items)
    )

@product_search_router.get("/upsell/{product_id}", response_model=ProductUpSellingResponse)
async def get_upselling_products(
    product_id: UUID,
    price_range_factor: float = Query(1.5, ge=1.0, le=3.0),
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductUpSellingRequest(
        product_id=product_id,
        price_range_factor=price_range_factor,
        limit=limit
    )
    products, price_differences = await crud.get_upselling_products(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductUpSellingResponse(
        products=product_items,
        price_differences=price_differences,
        upgrade_benefits=[],
        base_product_id=product_id,
        total=len(product_items)
    )

@product_search_router.get("/personalized", response_model=ProductPersonalizedResponse)
async def get_personalized_recommendations(
    recommendation_type: str = Query("mixed", pattern="^(viewed|purchased|wishlist|categories|mixed)$"),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_buyer_or_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductPersonalizedRequest(
        user_id=current_user["id"],
        recommendation_type=recommendation_type,
        limit=limit
    )
    products, reasons = await crud.get_personalized_recommendations(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductPersonalizedResponse(
        products=product_items,
        recommendation_reasons=reasons,
        personalization_score=[1.0] * len(product_items),
        user_id=current_user["id"],
        total=len(product_items)
    )

@product_search_router.get("/price-history/{product_id}", response_model=ProductPriceHistoryResponse)
async def get_product_price_history(
    product_id: UUID,
    days_back: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductPriceHistoryRequest(
        product_id=product_id,
        days_back=days_back
    )
    price_data = await crud.get_product_price_history(db, request)
    return ProductPriceHistoryResponse(**price_data)

@product_search_router.post("/stock-alerts", response_model=ProductStockAlertResponse)
async def get_stock_alerts(
    request: ProductStockAlertRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    alerts_data = await crud.get_stock_alerts(db, request)
    return ProductStockAlertResponse(**alerts_data)

@product_search_router.post("/bulk-search", response_model=ProductBulkSearchResponse)
async def bulk_search_products(
    request: ProductBulkSearchRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    bulk_data = await crud.bulk_search_products(db, request)
    return ProductBulkSearchResponse(**bulk_data)

@product_search_router.get("/analytics", response_model=ProductSearchAnalyticsResponse)
async def get_search_analytics(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: Optional[UUID] = Query(None),
    category_id: Optional[UUID] = Query(None),
    brand_id: Optional[UUID] = Query(None),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductSearchAnalyticsRequest(
        date_from=date_from,
        date_to=date_to,
        user_id=user_id or (current_user["id"] if current_user else None),
        category_id=category_id,
        brand_id=brand_id
    )
    analytics_data = await crud.get_search_analytics(db, request)
    return ProductSearchAnalyticsResponse(**analytics_data)

@product_search_router.post("/advanced-filter", response_model=ProductAdvancedFilterResponse)
async def advanced_filter_products(
    request: AdvancedFilterRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products, filter_results = await crud.advanced_filter_products(db, request)
    
    product_items = []
    for product in products:
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            primary_image=product.images[0].url if product.images else None,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        product_items.append(item)
    
    return ProductAdvancedFilterResponse(
        products=product_items,
        total=filter_results["total"],
        applied_filters=filter_results["applied_filters"],
        filter_results_count={"total": filter_results["total"]},
        suggested_filters={},
        page=filter_results["page"],
        per_page=filter_results["per_page"],
        total_pages=filter_results["total_pages"]
    )
