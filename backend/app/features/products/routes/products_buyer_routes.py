from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.role_auth import get_all_users, get_optional_user, require_buyer, require_buyer_or_supplier
from app.core.pagination import PaginationParams
from app.database.session import get_async_session
from app.core.exceptions import ValidationException, NotFoundException, AuthorizationException, ConflictException, AuthenticationException
from app.core.base import SuccessResponse
from app.core.logging import get_logger
from app.features.products.cruds.product_crud import ProductCrud
from app.features.products.cruds.category_crud import CategoryCrud
from app.features.products.cruds.brand_crud import BrandCrud
from app.features.products.cruds.product_review_crud import ProductReviewCrud
from app.features.products.cruds.product_view_crud import ProductViewCrud
from app.features.products.cruds.wishlist_crud import WishlistCrud
from app.features.products.cruds.product_search_crud import ProductSearchCRUD
from app.features.products.cruds.product_analytics_crud import ProductAnalyticsCrud
from app.features.products.requests.product_request import ProductFilterRequest
from app.features.products.requests.product_review_request import (
    ProductReviewCreateRequest,
    ProductReviewUpdateRequest,
    ProductReviewFilterRequest
)
from app.features.products.requests.wishlist_request import WishlistAddRequest, WishlistFilterRequest
from app.features.products.requests.product_search_request import (
    ProductComparisonRequest, ProductPersonalizedRequest
)
from app.features.products.responses.product_response import ProductDetailResponse, ProductListResponse
from app.features.products.responses.category_response import CategoryTreeResponse
from app.features.products.responses.brand_response import BrandResponse
from app.features.products.responses.product_review_response import (
    ProductReviewResponse,
    ProductReviewStatsResponse,
    UserReviewResponse
)
from app.features.products.responses.wishlist_response import WishlistItemResponse
from app.features.products.responses.product_search_response import (
    ProductComparisonDetailResponse, ProductPersonalizedResponse, ProductSearchItemResponse
)
from app.core.pagination import PaginatedResponse
from app.core.config import settings
import os
from datetime import datetime

products_buyer_router = APIRouter(prefix="/products", tags=["Products"])
logger = get_logger("products.buyer")

@products_buyer_router.get("/", response_model=PaginatedResponse[ProductListResponse])
async def get_products(
    category_id: Optional[str] = Query(None),
    brand_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at", pattern="^(created_at|price|name)$"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    allow_fake = settings.DEBUG and os.getenv("ALLOW_FAKE_UPLOADS", "true").lower() in ("1","true","yes")
    try:
        if db is None:
            # Return empty if no database
            return PaginatedResponse[ProductListResponse].create(
                items=[],
                total=0,
                page=page,
                limit=limit
            )
        
        pagination = PaginationParams(page=page, limit=limit)
        product_crud = ProductCrud()
        result = await product_crud.get_public_products(
            db=db,
            pagination=pagination,
            category_id=category_id,
            brand_id=brand_id,
            min_price=min_price,
            max_price=max_price,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        logger.error(f"Database error in get_products: {str(e)}")
        # Always return empty on error to prevent 500s - no fake/demo products
        return PaginatedResponse[ProductListResponse].create(
            items=[],
            total=0,
            page=page,
            limit=limit
        )

@products_buyer_router.get("/categories", response_model=List[CategoryTreeResponse])
async def get_categories_alias():
    return []

@products_buyer_router.get("/brands", response_model=List[BrandResponse])
async def get_brands_alias():
    return []

@products_buyer_router.get("/{product_slug}", response_model=ProductDetailResponse)
async def get_product_by_slug(
    product_slug: str,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_product_by_slug(db, product_slug)
    if not product:
        raise NotFoundException("Product not found")
    
    product_dict = product.to_dict()
    
    if product.category:
        product_dict["category"] = product.category.to_dict()
    if product.brand:
        product_dict["brand"] = product.brand.to_dict()
    if product.images:
        product_dict["images"] = [img.to_dict() for img in product.images]
    if product.variants:
        variant_dicts = []
        for variant in product.variants:
            await db.refresh(variant, ["images"])
            variant_dicts.append(variant.to_dict())
        product_dict["variants"] = variant_dicts
    if product.sustainability_scores:
        product_dict["sustainability_scores"] = [score.to_dict() for score in product.sustainability_scores]
    
    view_crud = ProductViewCrud()
    await view_crud.record_view(
        db=db,
        product_id=str(product.id),
        user_id=current_user["id"] if current_user else None,
        session_id=request.headers.get("session-id"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer")
    )
    
    product_dict["view_count"] = await view_crud.get_product_view_count(db, str(product.id))
    
    if current_user:
        wishlist_crud = WishlistCrud()
        product_dict["is_in_wishlist"] = await wishlist_crud.is_in_wishlist(
            db, current_user["id"], str(product.id)
        )
    
    return ProductDetailResponse(**product_dict)

@products_buyer_router.get("/categories/tree", response_model=List[CategoryTreeResponse])
async def get_categories_tree(
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    try:
        category_crud = CategoryCrud()
        categories = await category_crud.get_categories_tree(db)
        result = []
        for cat in categories:
            try:
                result.append(CategoryTreeResponse(**cat))
            except Exception as e:
                logger.error(f"Error creating CategoryTreeResponse: {str(e)}")
                continue
        return result
    except Exception as e:
        logger.error(f"Database error in get_categories_tree: {str(e)}")
        # Return empty categories when database is not available
        return []

@products_buyer_router.get("/brands/active", response_model=List[BrandResponse])
async def get_active_brands(
    db: Optional[AsyncSession] = Depends(get_async_session)
):
    try:
        brand_crud = BrandCrud()
        brands = await brand_crud.get_active_brands(db)
        result = []
        for brand in brands:
            try:
                result.append(BrandResponse(**brand))
            except Exception as e:
                logger.error(f"Error creating BrandResponse: {str(e)}")
                continue
        return result
    except Exception as e:
        logger.error(f"Database error in get_active_brands: {str(e)}")
        # Return empty brands when database is not available
        return []

# WISHLIST ROUTES - Must be defined BEFORE dynamic routes like /{product_slug}
# to prevent route conflicts
@products_buyer_router.get("/wishlist", response_model=PaginatedResponse[WishlistItemResponse])
async def get_wishlist(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        # Ensure user exists in database
        from app.core.user_helper import ensure_user_exists_in_db
        from app.features.auth.cruds.auth_crud import AuthCrud
        auth_crud = AuthCrud()
        await ensure_user_exists_in_db(db, current_user, auth_crud)
        
        pagination = PaginationParams(page=page, limit=limit)
        wishlist_crud = WishlistCrud()
        result = await wishlist_crud.get_user_wishlist(db, current_user["id"], pagination)
        return result
    except Exception as e:
        logger.error(f"Error in get_wishlist: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Return empty wishlist instead of raising error
        from app.core.pagination import PaginatedResponse
        return PaginatedResponse.create(
            items=[],
            total=0,
            page=page,
            limit=limit
        )

@products_buyer_router.post("/wishlist", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    request: WishlistAddRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        # Ensure user exists in public.users before adding to wishlist
        from app.core.user_helper import ensure_user_exists_in_db
        from app.features.auth.cruds.auth_crud import AuthCrud
        auth_crud = AuthCrud()
        user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
        
        if not user_exists:
            # If user creation failed, try one more time with a small delay
            import asyncio
            await asyncio.sleep(0.5)
            user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
            if not user_exists:
                logger.error(f"Failed to create user {current_user['id']} in public.users table")
                from app.core.exceptions import ValidationException
                raise ValidationException(f"User account not properly set up. Please try logging out and back in.")
        
        wishlist_crud = WishlistCrud()
        await wishlist_crud.add_to_wishlist(db, current_user["id"], request.product_id)
        return SuccessResponse(message="Product added to wishlist")
    except ConflictException:
        return SuccessResponse(message="Product already in wishlist")
    except Exception as e:
        logger.error(f"Error adding to wishlist: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise

@products_buyer_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    wishlist_crud = WishlistCrud()
    await wishlist_crud.remove_from_wishlist(db, current_user["id"], product_id)
    return SuccessResponse(message="Product removed from wishlist")

@products_buyer_router.delete("/wishlist/clear")
async def clear_wishlist(
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    wishlist_crud = WishlistCrud()
    await wishlist_crud.clear_wishlist(db, current_user["id"])
    return SuccessResponse(message="Wishlist cleared successfully")

@products_buyer_router.post("/{product_id}/reviews", response_model=ProductReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: str,
    request: ProductReviewCreateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    review_data = request.model_dump()
    review_data["product_id"] = product_id
    
    review_crud = ProductReviewCrud()
    review_data = await review_crud.create_review(db, current_user["id"], review_data)
    return ProductReviewResponse(**review_data)

@products_buyer_router.get("/{product_id}/reviews", response_model=PaginatedResponse[ProductReviewResponse])
async def get_product_reviews(
    product_id: str,
    rating: Optional[int] = Query(None, ge=1, le=5),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    review_crud = ProductReviewCrud()
    return await review_crud.get_product_reviews(db, product_id, pagination, rating)

@products_buyer_router.get("/{product_id}/reviews/stats", response_model=ProductReviewStatsResponse)
async def get_product_review_stats(
    product_id: str,
    db: AsyncSession = Depends(get_async_session)
):
    review_crud = ProductReviewCrud()
    stats = await review_crud.get_product_review_stats(db, product_id)
    return ProductReviewStatsResponse(**stats)

@products_buyer_router.put("/reviews/{review_id}", response_model=ProductReviewResponse)
async def update_product_review(
    review_id: str,
    request: ProductReviewUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    review_crud = ProductReviewCrud()
    review_data = await review_crud.update_review(
        db, review_id, current_user["id"], request.model_dump(exclude_unset=True)
    )
    return ProductReviewResponse(**review_data)

@products_buyer_router.delete("/reviews/{review_id}")
async def delete_product_review(
    review_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    review_crud = ProductReviewCrud()
    await review_crud.delete_review(db, review_id, current_user["id"])
    return SuccessResponse(message="Review deleted successfully")

@products_buyer_router.get("/reviews/my", response_model=PaginatedResponse[UserReviewResponse])
async def get_my_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    review_crud = ProductReviewCrud()
    return await review_crud.get_user_reviews(db, current_user["id"], pagination)


@products_buyer_router.put("/reviews/{review_id}", response_model=ProductReviewResponse)
async def update_review(
    review_id: str,
    request: ProductReviewUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    review_data = request.model_dump(exclude_none=True)
    review_crud = ProductReviewCrud()
    updated_review = await review_crud.update_review(db, review_id, current_user["id"], review_data)
    return ProductReviewResponse(**updated_review)

@products_buyer_router.delete("/reviews/{review_id}", response_model=SuccessResponse)
async def delete_review(
    review_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    review_crud = ProductReviewCrud()
    await review_crud.delete_review(db, review_id, current_user["id"])
    return SuccessResponse(message="Review deleted successfully")

@products_buyer_router.post("/compare", response_model=List[ProductComparisonDetailResponse])
async def compare_products(
    request: ProductComparisonRequest,
    db: AsyncSession = Depends(get_async_session)
):
    search_crud = ProductSearchCRUD()
    products = await search_crud.compare_products(db, request)
    return [ProductComparisonDetailResponse(**product.to_dict()) for product in products]

@products_buyer_router.get("/recommendations", response_model=ProductPersonalizedResponse)
async def get_personalized_recommendations(
    recommendation_type: str = Query("mixed"),
    limit: int = Query(10, ge=1, le=50),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    if not current_user:
        raise AuthenticationException("Authentication required for personalized recommendations")
    
    search_crud = ProductSearchCRUD()
    request = ProductPersonalizedRequest(
        user_id=current_user["id"],
        recommendation_type=recommendation_type,
        limit=limit
    )
    products, reasons = await search_crud.get_personalized_recommendations(db, request)
    
    product_items = []
    for i, product in enumerate(products):
        item = ProductSearchItemResponse(
            id=product.id,
            sku=product.sku,
            name=product.name,
            slug=product.slug,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            discount_percentage=None,
            primary_image=product.images[0].url if product.images else None,
            rating=None,
            review_count=0,
            in_stock=product.inventory[0].available_quantity > 0 if product.inventory else False,
            stock_quantity=product.inventory[0].available_quantity if product.inventory else 0,
            brand_name=product.brand.name if product.brand else None,
            category_name=product.category.name if product.category else None,
            supplier_name=f"{product.supplier.first_name} {product.supplier.last_name}" if product.supplier else None,
            sustainability_score=product.sustainability_score[0].overall_score if product.sustainability_score else None,
            is_on_sale=product.compare_at_price is not None,
            tags=product.tags or [],
            created_at=product.created_at
        )
        
        if product.compare_at_price:
            item.discount_percentage = float(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
        
        product_items.append(item)
    
    return ProductPersonalizedResponse(
        products=product_items,
        reasons=reasons[:len(product_items)],
        recommendation_type=recommendation_type
    )
async def compare_products(
    request: ProductComparisonRequest,
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products = await crud.compare_products(request)
    
    products_data = []
    comparison_matrix = {}
    price_comparison = {}
    rating_comparison = {}
    
    for product in products:
        product_dict = product.to_dict()
        product_dict["category"] = product.category.to_dict() if product.category else None
        product_dict["brand"] = product.brand.to_dict() if product.brand else None
        product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
        product_dict["sustainability_scores"] = [score.to_dict() for score in product.sustainability_scores] if product.sustainability_scores else []
        products_data.append(product_dict)
        
        price_comparison[str(product.id)] = {
            "price": float(product.price),
            "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None
        }
    
    return ProductComparisonDetailResponse(
        products=products_data,
        comparison_matrix=comparison_matrix,
        feature_differences={},
        price_comparison=price_comparison,
        rating_comparison=rating_comparison,
        sustainability_comparison={}
    )

@products_buyer_router.get("/recommendations/personalized", response_model=ProductPersonalizedResponse)
async def get_personalized_recommendations(
    recommendation_type: str = Query("mixed", pattern="^(viewed|purchased|wishlist|categories|mixed)$"),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    request = ProductPersonalizedRequest(
        user_id=current_user["id"],
        recommendation_type=recommendation_type,
        limit=limit
    )
    products, reasons = await crud.get_personalized_recommendations(request)
    
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

@products_buyer_router.get("/{product_id}/related")
async def get_related_products(
    product_id: str,
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    products = await crud.get_product_recommendations(
        product_id=product_id,
        recommendation_type="similar",
        limit=limit
    )
    
    products_data = []
    for product in products:
        product_dict = product.to_dict()
        product_dict["category"] = product.category.to_dict() if product.category else None
        product_dict["brand"] = product.brand.to_dict() if product.brand else None
        product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
        products_data.append(product_dict)
    
    return {"related_products": products_data, "total": len(products_data)}

@products_buyer_router.get("/{product_id}/cross-sell")
async def get_cross_sell_products(
    product_id: str,
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.products.requests.product_search_request import ProductCrossSellingRequest
    from uuid import UUID
    
    crud = ProductSearchCRUD()
    request = ProductCrossSellingRequest(
        product_id=UUID(product_id),
        limit=limit
    )
    products, scores = await crud.get_cross_selling_products(request)
    
    products_data = []
    for i, product in enumerate(products):
        product_dict = product.to_dict()
        product_dict["category"] = product.category.to_dict() if product.category else None
        product_dict["brand"] = product.brand.to_dict() if product.brand else None
        product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
        product_dict["cross_sell_score"] = scores[i] if i < len(scores) else 1.0
        products_data.append(product_dict)
    
    return {"cross_sell_products": products_data, "total": len(products_data)}

@products_buyer_router.get("/{product_id}/upsell")
async def get_upsell_products(
    product_id: str,
    price_range_factor: float = Query(1.5, ge=1.0, le=3.0),
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_async_session)
):
    from app.features.products.requests.product_search_request import ProductUpSellingRequest
    from uuid import UUID
    
    crud = ProductSearchCRUD()
    request = ProductUpSellingRequest(
        product_id=UUID(product_id),
        price_range_factor=price_range_factor,
        limit=limit
    )
    products, price_differences = await crud.get_upselling_products(request)
    
    products_data = []
    for i, product in enumerate(products):
        product_dict = product.to_dict()
        product_dict["category"] = product.category.to_dict() if product.category else None
        product_dict["brand"] = product.brand.to_dict() if product.brand else None
        product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
        product_dict["price_difference"] = price_differences[i] if i < len(price_differences) else 0
        products_data.append(product_dict)
    
    return {"upsell_products": products_data, "total": len(products_data)}

@products_buyer_router.get("/analytics/user-behavior")
async def get_user_behavior_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    behavior_data = await analytics_crud.get_user_search_behavior(db, current_user["id"], days)
    return behavior_data

@products_buyer_router.post("/{product_id}/track-view")
async def track_product_view(
    product_id: str,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_async_session)
):
    view_crud = ProductViewCrud()
    view_data = await view_crud.record_view(
        db=db,
        product_id=product_id,
        user_id=current_user["id"] if current_user else None,
        session_id=request.headers.get("session-id"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer")
    )
    return {"message": "View tracked successfully", "view_id": view_data["id"]}

@products_buyer_router.get("/filter-options")
async def get_filter_options(
    category_id: Optional[str] = Query(None),
    brand_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_async_session)
):
    crud = ProductSearchCRUD()
    filters = await crud.get_filter_options()
    return filters

@products_buyer_router.get("/trending-categories")
async def get_trending_categories(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(7, ge=1, le=30),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    trending_data = await analytics_crud.get_category_search_analytics(db, days)
    return {"trending_categories": trending_data[:limit], "period_days": days}
