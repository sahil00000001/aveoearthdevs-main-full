from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, text, case, cast, String
from sqlalchemy.orm import selectinload, joinedload
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from decimal import Decimal

from app.database.base import get_supabase_client
from app.features.products.models.product import Product
from app.features.products.models.category import Category
from app.features.products.models.brand import Brand
from app.features.products.models.product_inventory import ProductInventory
from app.features.products.models.product_review import ProductReview
from app.features.products.models.product_sustainability_score import ProductSustainabilityScore
from app.features.products.models.product_image import ProductImage
from app.features.products.models.product_view import ProductView
from app.features.products.requests.product_search_request import (
    ProductSearchRequest, SortByEnum, ProductFilterRequest, ProductComparisonRequest,
    ProductAutoCompleteRequest, ProductSearchSuggestionsRequest, ProductTrendingRequest,
    ProductSeasonalRequest, ProductNewArrivalsRequest, ProductBestSellersRequest,
    ProductSimilarRequest, ProductBundleRecommendationRequest, ProductCrossSellingRequest,
    ProductUpSellingRequest, ProductPersonalizedRequest, ProductVisualSearchRequest,
    ProductLocationBasedRequest, ProductPriceHistoryRequest, ProductStockAlertRequest,
    ProductBulkSearchRequest, ProductSearchAnalyticsRequest, AdvancedFilterRequest
)
from app.core.base import BaseCrud
from app.core.logging import get_logger
        
logger = get_logger("products.search_crud")

class ProductSearchCRUD(BaseCrud[Product]):
    def __init__(self):
        super().__init__(get_supabase_client(), Product)

    async def search_products(self, db: AsyncSession, request: ProductSearchRequest) -> Tuple[List[Product], int]:
        base_query = select(Product).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        count_query = select(func.count(Product.id)).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        if request.query:
            search_filter = or_(
                Product.name.ilike(f"%{request.query}%"),
                Product.description.ilike(f"%{request.query}%"),
                Product.short_description.ilike(f"%{request.query}%"),
                cast(Product.tags, String).ilike(f"%{request.query}%")
            )
            base_query = base_query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        if request.category_ids:
            base_query = base_query.where(Product.category_id.in_(request.category_ids))
            count_query = count_query.where(Product.category_id.in_(request.category_ids))
        
        if request.brand_ids:
            base_query = base_query.where(Product.brand_id.in_(request.brand_ids))
            count_query = count_query.where(Product.brand_id.in_(request.brand_ids))
        
        if request.supplier_ids:
            base_query = base_query.where(Product.supplier_id.in_(request.supplier_ids))
            count_query = count_query.where(Product.supplier_id.in_(request.supplier_ids))
        
        if request.min_price is not None:
            base_query = base_query.where(Product.price >= request.min_price)
            count_query = count_query.where(Product.price >= request.min_price)
        
        if request.max_price is not None:
            base_query = base_query.where(Product.price <= request.max_price)
            count_query = count_query.where(Product.price <= request.max_price)
        
        if request.on_sale_only:
            base_query = base_query.where(Product.compare_at_price.isnot(None))
            count_query = count_query.where(Product.compare_at_price.isnot(None))
        
        if request.tags:
            for tag in request.tags:
                tag_filter = cast(Product.tags, String).ilike(f"%{tag}%")
                base_query = base_query.where(tag_filter)
                count_query = count_query.where(tag_filter)
        
        if request.materials:
            for material in request.materials:
                material_filter = cast(Product.materials, String).ilike(f"%{material}%")
                base_query = base_query.where(material_filter)
                count_query = count_query.where(material_filter)
        
        if request.origin_countries:
            base_query = base_query.where(Product.origin_country.in_(request.origin_countries))
            count_query = count_query.where(Product.origin_country.in_(request.origin_countries))
        
        if request.in_stock_only:
            base_query = base_query.join(ProductInventory).where(
                ProductInventory.available_quantity > 0
            )
            count_query = count_query.join(ProductInventory).where(
                ProductInventory.available_quantity > 0
            )
        
        if request.min_sustainability_score is not None or request.max_sustainability_score is not None:
            base_query = base_query.join(ProductSustainabilityScore)
            count_query = count_query.join(ProductSustainabilityScore)
            
            if request.min_sustainability_score is not None:
                base_query = base_query.where(ProductSustainabilityScore.overall_score >= request.min_sustainability_score)
                count_query = count_query.where(ProductSustainabilityScore.overall_score >= request.min_sustainability_score)
            
            if request.max_sustainability_score is not None:
                base_query = base_query.where(ProductSustainabilityScore.overall_score <= request.max_sustainability_score)
                count_query = count_query.where(ProductSustainabilityScore.overall_score <= request.max_sustainability_score)
        
        if request.min_rating is not None or request.max_rating is not None:
            avg_rating = (
                select(func.avg(ProductReview.rating))
                .where(ProductReview.product_id == Product.id)
                .scalar_subquery()
            )
            
            if request.min_rating is not None:
                base_query = base_query.where(avg_rating >= request.min_rating)
                count_query = count_query.where(avg_rating >= request.min_rating)
            
            if request.max_rating is not None:
                base_query = base_query.where(avg_rating <= request.max_rating)
                count_query = count_query.where(avg_rating <= request.max_rating)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        base_query = self._apply_sorting(base_query, request.sort_by)
        
        base_query = base_query.options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.inventory),
            selectinload(Product.sustainability_scores),
            selectinload(Product.supplier)
        )
        
        offset = (request.page - 1) * request.per_page
        base_query = base_query.offset(offset).limit(request.per_page)
        
        result = await db.execute(base_query)
        products = result.scalars().all()
        
        return products, total
    
    def _apply_sorting(self, query, sort_by: SortByEnum):
        if sort_by == SortByEnum.PRICE_LOW_TO_HIGH:
            return query.order_by(asc(Product.price))
        elif sort_by == SortByEnum.PRICE_HIGH_TO_LOW:
            return query.order_by(desc(Product.price))
        elif sort_by == SortByEnum.NEWEST:
            return query.order_by(desc(Product.created_at))
        elif sort_by == SortByEnum.OLDEST:
            return query.order_by(asc(Product.created_at))
        elif sort_by == SortByEnum.NAME_A_TO_Z:
            return query.order_by(asc(Product.name))
        elif sort_by == SortByEnum.NAME_Z_TO_A:
            return query.order_by(desc(Product.name))
        elif sort_by == SortByEnum.RATING_HIGH_TO_LOW:
            avg_rating = (
                select(func.avg(ProductReview.rating))
                .where(ProductReview.product_id == Product.id)
                .scalar_subquery()
            )
            return query.order_by(desc(avg_rating))
        elif sort_by == SortByEnum.RATING_LOW_TO_HIGH:
            avg_rating = (
                select(func.avg(ProductReview.rating))
                .where(ProductReview.product_id == Product.id)
                .scalar_subquery()
            )
            return query.order_by(asc(avg_rating))
        elif sort_by == SortByEnum.POPULARITY:
            view_count = (
                select(func.count(ProductView.id))
                .where(ProductView.product_id == Product.id)
                .scalar_subquery()
            )
            return query.order_by(desc(view_count))
        elif sort_by == SortByEnum.DISCOUNT:
            discount = case(
                (Product.compare_at_price.isnot(None), 
                 ((Product.compare_at_price - Product.price) / Product.compare_at_price) * 100),
                else_=0
            )
            return query.order_by(desc(discount))
        else:
            return query.order_by(desc(Product.created_at))
    
    async def get_filter_options(self, db: AsyncSession) -> Dict[str, Any]:
        categories_query = select(Category).where(Category.is_active == True)
        brands_query = select(Brand).where(Brand.is_active == True)
        
        price_range_query = select(
            func.min(Product.price).label('min_price'),
            func.max(Product.price).label('max_price')
        ).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        avg_ratings_subquery = select(
            func.avg(ProductReview.rating).label('avg_rating')
        ).group_by(ProductReview.product_id).subquery()
        
        rating_range_query = select(
            func.min(avg_ratings_subquery.c.avg_rating).label('min_rating'),
            func.max(avg_ratings_subquery.c.avg_rating).label('max_rating')
        )
        
        sustainability_range_query = select(
            func.min(ProductSustainabilityScore.overall_score).label('min_score'),
            func.max(ProductSustainabilityScore.overall_score).label('max_score')
        )
        
        materials_query = select(Product.materials).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.materials.isnot(None)
            )
        ).distinct()
        
        countries_query = select(Product.origin_country).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.origin_country.isnot(None)
            )
        ).distinct()
        
        tags_query = select(Product.tags).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.tags.isnot(None)
            )
        ).distinct()
        
        categories_result = await db.execute(categories_query)
        brands_result = await db.execute(brands_query)
        price_result = await db.execute(price_range_query)
        rating_result = await db.execute(rating_range_query)
        sustainability_result = await db.execute(sustainability_range_query)
        materials_result = await db.execute(materials_query)
        countries_result = await db.execute(countries_query)
        tags_result = await db.execute(tags_query)
        
        categories = [{"id": str(cat.id), "name": cat.name} for cat in categories_result.scalars().all()]
        brands = [{"id": str(brand.id), "name": brand.name} for brand in brands_result.scalars().all()]
        
        price_range = price_result.first()
        rating_range = rating_result.first()
        sustainability_range = sustainability_result.first()
        
        all_materials = set()
        for material_list in materials_result.scalars().all():
            if material_list:
                all_materials.update(material_list)
        
        all_countries = [country for country in countries_result.scalars().all() if country]
        
        all_tags = set()
        for tag_list in tags_result.scalars().all():
            if tag_list:
                all_tags.update(tag_list)
        
        return {
            "categories": categories,
            "brands": brands,
            "price_range": {
                "min": price_range.min_price if price_range else 0,
                "max": price_range.max_price if price_range else 0
            },
            "rating_range": {
                "min": float(rating_range.min_rating) if rating_range and rating_range.min_rating else 0.0,
                "max": float(rating_range.max_rating) if rating_range and rating_range.max_rating else 5.0
            },
            "sustainability_range": {
                "min": float(sustainability_range.min_score) if sustainability_range and sustainability_range.min_score else 0.0,
                "max": float(sustainability_range.max_score) if sustainability_range and sustainability_range.max_score else 100.0
            },
            "materials": list(all_materials),
            "origin_countries": all_countries,
            "tags": list(all_tags)
        }
    
    async def get_product_recommendations(self, db: Optional[AsyncSession], product_id: Optional[UUID] = None, 
                                        user_id: Optional[UUID] = None, 
                                        recommendation_type: str = "similar", 
                                        limit: int = 10) -> List[Product]:
        # Return empty if no database
        if db is None:
            return []
        
        try:
            if recommendation_type == "similar" and product_id:
                return await self._get_similar_products(db, product_id, limit)
            elif recommendation_type == "viewed_together" and product_id:
                return await self._get_frequently_viewed_together(db, product_id, limit)
            elif recommendation_type == "trending":
                return await self._get_trending_products(db, limit)
            elif recommendation_type == "top_rated":
                return await self._get_top_rated_products(db, limit)
            elif recommendation_type == "user_based" and user_id:
                return await self._get_user_based_recommendations(db, user_id, limit)
            else:
                return await self._get_trending_products(db, limit)
        except Exception as e:
            logger.error(f"Error getting product recommendations: {str(e)}")
            return []  # Return empty list on error

    async def _get_similar_products(self, db: AsyncSession, product_id: UUID, limit: int) -> List[Product]:
        product_query = select(Product).where(Product.id == product_id)
        product_result = await db.execute(product_query)
        product = product_result.scalar_one_or_none()
        
        if not product:
            return []
        
        similar_query = select(Product).where(
            and_(
                Product.id != product_id,
                or_(
                    Product.category_id == product.category_id,
                    Product.brand_id == product.brand_id
                ),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(limit)
        
        result = await db.execute(similar_query)
        return result.scalars().all()
    
    async def _get_frequently_viewed_together(self, db: AsyncSession, product_id: UUID, limit: int) -> List[Product]:
        product_sessions_subquery = select(
            ProductView.session_id
        ).where(
            ProductView.product_id == product_id
        ).distinct().subquery()
        
        co_viewed_subquery = select(
            ProductView.product_id,
            func.count().label('co_view_count')
        ).select_from(
            ProductView.join(product_sessions_subquery, 
                           ProductView.session_id == product_sessions_subquery.c.session_id)
        ).where(
            ProductView.product_id != product_id
        ).group_by(
            ProductView.product_id
        ).order_by(
            desc('co_view_count')
        ).limit(limit).subquery()
        
        products_query = select(Product).join(
            co_viewed_subquery, Product.id == co_viewed_subquery.c.product_id
        ).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(co_viewed_subquery.c.co_view_count))
        
        result = await db.execute(products_query)
        products = result.scalars().all()
        
        if not products:
            product_query = select(Product).where(Product.id == product_id)
            product_result = await db.execute(product_query)
            product = product_result.scalar_one_or_none()
            
            if product:
                fallback_query = select(Product).where(
                    and_(
                        Product.id != product_id,
                        or_(
                            Product.category_id == product.category_id,
                            Product.brand_id == product.brand_id
                        ),
                        Product.status == ProductStatusEnum.ACTIVE,
                        Product.approval_status == "approved",
                        Product.visibility == "visible"
                    )
                ).options(
                    selectinload(Product.brand),
                    selectinload(Product.category),
                    selectinload(Product.images)
                ).limit(limit)
                
                fallback_result = await db.execute(fallback_query)
                products = fallback_result.scalars().all()
        
        return products
    
    async def _get_trending_products(self, db: AsyncSession, limit: int) -> List[Product]:
        try:
            # Try with ProductView join first
            try:
                trending_query = select(Product).outerjoin(ProductView).where(
                    and_(
                        Product.status == ProductStatusEnum.ACTIVE,
                        Product.approval_status == "approved",
                        Product.visibility == "visible"
                    )
                ).group_by(Product.id).order_by(
                    desc(func.coalesce(func.count(ProductView.id), 0)),
                    desc(Product.created_at)
                ).options(
                    selectinload(Product.brand),
                    selectinload(Product.category),
                    selectinload(Product.images)
                ).limit(limit)
                
                result = await db.execute(trending_query)
                products = result.scalars().all()
                
                if products:
                    return products
            except Exception:
                # If ProductView join fails, use simple query
                pass
            
            # Fallback: simple query without ProductView join
            fallback_query = select(Product).where(
                and_(
                    Product.status == ProductStatusEnum.ACTIVE,
                    Product.approval_status == "approved",
                    Product.visibility == "visible"
                )
            ).order_by(desc(Product.created_at)).options(
                selectinload(Product.brand),
                selectinload(Product.category),
                selectinload(Product.images)
            ).limit(limit)
            
            fallback_result = await db.execute(fallback_query)
            products = fallback_result.scalars().all()
            return products
        except Exception as e:
            logger.error(f"Error getting trending products: {str(e)}")
            return []  # Return empty list on error
    
    async def _get_top_rated_products(self, db: AsyncSession, limit: int) -> List[Product]:
        top_rated_query = select(Product).outerjoin(ProductReview).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).group_by(Product.id).order_by(
            desc(func.coalesce(func.avg(ProductReview.rating), 0)),
            desc(Product.created_at)
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(limit)
        
        result = await db.execute(top_rated_query)
        products = result.scalars().all()
        
        if not products:
            fallback_query = select(Product).where(
                and_(
                    Product.status == ProductStatusEnum.ACTIVE,
                    Product.approval_status == "approved",
                    Product.visibility == "visible"
                )
            ).order_by(desc(Product.created_at)).options(
                selectinload(Product.brand),
                selectinload(Product.category),
                selectinload(Product.images)
            ).limit(limit)
            
            fallback_result = await db.execute(fallback_query)
            products = fallback_result.scalars().all()
        
        return products
    
    async def _get_user_based_recommendations(self, db: AsyncSession, user_id: UUID, limit: int) -> List[Product]:
        user_viewed_categories = select(Product.category_id).join(ProductView).where(
            ProductView.user_id == user_id
        ).distinct().subquery()
        
        recommendations_query = select(Product).where(
            and_(
                Product.category_id.in_(select(user_viewed_categories)),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(Product.created_at)).limit(limit)
        
        result = await db.execute(recommendations_query)
        products = result.scalars().all()
        
        if not products:
            fallback_query = select(Product).where(
                and_(
                    Product.status == ProductStatusEnum.ACTIVE,
                    Product.approval_status == "approved",
                    Product.visibility == "visible"
                )
            ).order_by(desc(Product.created_at)).options(
                selectinload(Product.brand),
                selectinload(Product.category),
                selectinload(Product.images)
            ).limit(limit)
            
            fallback_result = await db.execute(fallback_query)
            products = fallback_result.scalars().all()
        
        return products

    async def filter_products(self, db: AsyncSession, request: ProductFilterRequest) -> Tuple[List[Product], int]:
        base_query = select(Product).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        count_query = select(func.count(Product.id)).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        if request.category_id:
            category_filter = Product.category_id == request.category_id
            base_query = base_query.where(category_filter)
            count_query = count_query.where(category_filter)
        
        if request.brand_id:
            brand_filter = Product.brand_id == request.brand_id
            base_query = base_query.where(brand_filter)
            count_query = count_query.where(brand_filter)
        
        if request.supplier_id:
            supplier_filter = Product.supplier_id == request.supplier_id
            base_query = base_query.where(supplier_filter)
            count_query = count_query.where(supplier_filter)
        
        if request.min_price is not None:
            price_filter = Product.price >= request.min_price
            base_query = base_query.where(price_filter)
            count_query = count_query.where(price_filter)
        
        if request.max_price is not None:
            price_filter = Product.price <= request.max_price
            base_query = base_query.where(price_filter)
            count_query = count_query.where(price_filter)
        
        base_query = self._apply_sorting(base_query, request.sort_by)
        
        base_query = base_query.options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.supplier),
            selectinload(Product.images),
            selectinload(Product.inventory),
            selectinload(Product.sustainability_scores)
        )
        
        offset = (request.page - 1) * request.per_page
        base_query = base_query.offset(offset).limit(request.per_page)
        
        products_result = await db.execute(base_query)
        products = products_result.scalars().all()
        
        count_result = await db.execute(count_query)
        total = count_result.scalar()
        
        return products, total

    async def compare_products(self, db: AsyncSession, request: ProductComparisonRequest) -> List[Product]:
        comparison_query = select(Product).where(
            and_(
                Product.id.in_(request.product_ids),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.supplier),
            selectinload(Product.images),
            selectinload(Product.inventory),
            selectinload(Product.sustainability_scores),
            selectinload(Product.variants)
        )
        
        result = await db.execute(comparison_query)
        return result.scalars().all()

    async def autocomplete_search(self, db: AsyncSession, request: ProductAutoCompleteRequest) -> Dict[str, Any]:
        query = request.query.lower()
        results = {"suggestions": [], "categories": [], "brands": [], "products": []}
        
        if request.include_products:
            products_query = select(Product.name, Product.id, Product.slug).where(
                and_(
                    Product.name.ilike(f"%{query}%"),
                    Product.status == ProductStatusEnum.ACTIVE,
                    Product.approval_status == "approved",
                    Product.visibility == "visible"
                )
            ).limit(request.limit)
            
            products_result = await db.execute(products_query)
            results["products"] = [
                {"id": str(row.id), "name": row.name, "slug": row.slug, "type": "product"}
                for row in products_result.fetchall()
            ]
        
        if request.include_categories:
            categories_query = select(Category.name, Category.id, Category.slug).where(
                and_(
                    Category.name.ilike(f"%{query}%"),
                    Category.is_active == True
                )
            ).limit(request.limit)
            
            categories_result = await db.execute(categories_query)
            results["categories"] = [
                {"id": str(row.id), "name": row.name, "slug": row.slug, "type": "category"}
                for row in categories_result.fetchall()
            ]
        
        if request.include_brands:
            brands_query = select(Brand.name, Brand.id, Brand.slug).where(
                and_(
                    Brand.name.ilike(f"%{query}%"),
                    Brand.is_active == True
                )
            ).limit(request.limit)
            
            brands_result = await db.execute(brands_query)
            results["brands"] = [
                {"id": str(row.id), "name": row.name, "slug": row.slug, "type": "brand"}
                for row in brands_result.fetchall()
            ]
        
        all_suggestions = results["products"] + results["categories"] + results["brands"]
        results["suggestions"] = sorted(all_suggestions, key=lambda x: x["name"])[:request.limit]
        
        return results

    async def get_search_suggestions(self, db: AsyncSession, request: ProductSearchSuggestionsRequest) -> Dict[str, Any]:
        from app.features.products.models.product_search_log import ProductSearchLog
        
        cutoff_date = func.current_date() - text("INTERVAL '7 days'")
        
        trending_query = select(
            ProductSearchLog.query_term,
            func.count().label('search_count')
        ).where(
            ProductSearchLog.created_at >= cutoff_date
        ).group_by(
            ProductSearchLog.query_term
        ).order_by(
            desc('search_count')
        ).limit(request.limit)
        
        trending_result = await db.execute(trending_query)
        trending_searches = [row[0] for row in trending_result.fetchall()]
        
        user_history = []
        if request.user_id:
            history_query = select(
                ProductSearchLog.query_term,
                ProductSearchLog.created_at
            ).where(
                ProductSearchLog.user_id == request.user_id
            ).distinct().order_by(
                desc(ProductSearchLog.created_at)
            ).limit(request.limit)
            
            history_result = await db.execute(history_query)
            user_history = [row[0] for row in history_result.fetchall()]
        
        suggestions = []
        if request.query:
            similar_query = select(
                ProductSearchLog.query_term,
                ProductSearchLog.created_at
            ).where(
                and_(
                    ProductSearchLog.query_term.ilike(f"%{request.query}%"),
                    ProductSearchLog.query_term != request.query
                )
            ).distinct().order_by(
                desc(ProductSearchLog.created_at)
            ).limit(request.limit)
            
            similar_result = await db.execute(similar_query)
            suggestions = [row[0] for row in similar_result.fetchall()]
        
        return {
            "suggestions": suggestions,
            "trending_searches": trending_searches,
            "user_history": user_history
        }

    async def get_trending_products_advanced(self, db: AsyncSession, request: ProductTrendingRequest) -> Tuple[List[Product], int]:
        time_mapping = {
            "day": "1 day",
            "week": "7 days",
            "month": "30 days",
            "year": "365 days"
        }
        interval = time_mapping.get(request.time_period, "7 days")
        
        trending_query = select(Product).join(ProductView).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible",
                ProductView.viewed_at >= func.current_date() - text(f"INTERVAL '{interval}'")
            )
        )
        
        if request.category_id:
            trending_query = trending_query.where(Product.category_id == request.category_id)
        
        if request.brand_id:
            trending_query = trending_query.where(Product.brand_id == request.brand_id)
        
        trending_query = trending_query.group_by(Product.id).order_by(
            desc(func.count(ProductView.id))
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(request.limit)
        
        result = await db.execute(trending_query)
        products = result.scalars().all()
        
        return products, len(products)

    async def get_seasonal_products(self, db: AsyncSession, request: ProductSeasonalRequest) -> Tuple[List[Product], int]:
        seasonal_tags = {
            "spring": ["spring", "fresh", "renewal", "growth"],
            "summer": ["summer", "hot", "vacation", "outdoor"],
            "autumn": ["autumn", "fall", "harvest", "cozy"],
            "winter": ["winter", "warm", "holiday", "indoor"]
        }
        
        tags = seasonal_tags.get(request.season, [])
        
        seasonal_query = select(Product).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible",
                or_(*[cast(Product.tags, String).ilike(f"%{tag}%") for tag in tags])
            )
        )
        
        if request.category_id:
            seasonal_query = seasonal_query.where(Product.category_id == request.category_id)
        
        seasonal_query = seasonal_query.options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(Product.created_at)).limit(request.limit)
        
        result = await db.execute(seasonal_query)
        products = result.scalars().all()
        
        return products, len(products)

    async def get_new_arrivals(self, db: AsyncSession, request: ProductNewArrivalsRequest) -> Tuple[List[Product], int]:
        cutoff_date = func.current_date() - text(f"INTERVAL '{request.days_back} days'")
        
        new_arrivals_query = select(Product).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible",
                Product.created_at >= cutoff_date
            )
        )
        
        if request.category_id:
            new_arrivals_query = new_arrivals_query.where(Product.category_id == request.category_id)
        
        if request.brand_id:
            new_arrivals_query = new_arrivals_query.where(Product.brand_id == request.brand_id)
        
        new_arrivals_query = new_arrivals_query.options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(Product.created_at)).limit(request.limit)
        
        result = await db.execute(new_arrivals_query)
        products = result.scalars().all()
        
        return products, len(products)

    async def get_best_sellers(self, db: AsyncSession, request: ProductBestSellersRequest) -> Tuple[List[Product], Dict[str, Any]]:
        trending_query = select(Product).join(ProductView).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        if request.category_id:
            trending_query = trending_query.where(Product.category_id == request.category_id)
        
        if request.brand_id:
            trending_query = trending_query.where(Product.brand_id == request.brand_id)
        
        time_mapping = {
            "week": 7,
            "month": 30,
            "quarter": 90,
            "year": 365
        }
        days = time_mapping.get(request.time_period, 30)
        cutoff_date = func.current_date() - text(f"INTERVAL '{days} days'")
        
        trending_query = trending_query.where(
            ProductView.viewed_at >= cutoff_date
        ).group_by(Product.id).order_by(
            desc(func.count(ProductView.id))
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(request.limit)
        
        result = await db.execute(trending_query)
        products = result.scalars().all()
        
        sales_data = []
        for product in products:
            view_count_query = select(
                func.count(ProductView.id)
            ).where(
                and_(
                    ProductView.product_id == product.id,
                    ProductView.viewed_at >= cutoff_date
                )
            )
            
            view_result = await db.execute(view_count_query)
            view_count = view_result.scalar()
            
            sales_data.append({
                "product_id": str(product.id),
                "sales_count": view_count or 0,
                "revenue": 0
            })
        
        return products, {"sales_data": sales_data, "time_period": request.time_period}

    async def get_cross_selling_products(self, db: AsyncSession, request: ProductCrossSellingRequest) -> Tuple[List[Product], List[float]]:
        base_product_query = select(Product).where(Product.id == request.product_id)
        base_result = await db.execute(base_product_query)
        base_product = base_result.scalar_one_or_none()
        
        if not base_product:
            return [], []
        
        similar_products_query = select(Product).where(
            and_(
                Product.id != request.product_id,
                or_(
                    Product.category_id == base_product.category_id,
                    Product.brand_id == base_product.brand_id
                ),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(request.limit)
        
        result = await db.execute(similar_products_query)
        products = result.scalars().all()
        
        scores = []
        for product in products:
            if product.category_id == base_product.category_id and product.brand_id == base_product.brand_id:
                scores.append(3.0)
            elif product.category_id == base_product.category_id:
                scores.append(2.0)
            elif product.brand_id == base_product.brand_id:
                scores.append(1.5)
            else:
                scores.append(1.0)
        
        return products, scores

    async def get_upselling_products(self, db: AsyncSession, request: ProductUpSellingRequest) -> Tuple[List[Product], List[float]]:
        base_product_query = select(Product).where(Product.id == request.product_id)
        base_result = await db.execute(base_product_query)
        base_product = base_result.scalar_one_or_none()
        
        if not base_product:
            return [], []
        
        max_price = base_product.price * request.price_range_factor
        min_price = base_product.price
        
        upsell_query = select(Product).where(
            and_(
                Product.id != request.product_id,
                Product.category_id == base_product.category_id,
                Product.price > min_price,
                Product.price <= max_price,
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(Product.price).limit(request.limit)
        
        result = await db.execute(upsell_query)
        products = result.scalars().all()
        
        price_differences = [float(product.price - base_product.price) for product in products]
        
        return products, price_differences

    async def get_personalized_recommendations(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        if request.recommendation_type == "viewed":
            return await self._get_based_on_viewed_products(db, request)
        elif request.recommendation_type == "purchased":
            return await self._get_based_on_purchased_products(db, request)
        elif request.recommendation_type == "wishlist":
            return await self._get_based_on_wishlist(db, request)
        elif request.recommendation_type == "categories":
            return await self._get_based_on_categories(db, request)
        else:
            return await self._get_mixed_recommendations(db, request)

    async def _get_based_on_viewed_products(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        viewed_categories_query = select(Product.category_id).join(ProductView).where(
            ProductView.user_id == request.user_id
        ).distinct().limit(5)
        
        viewed_categories_result = await db.execute(viewed_categories_query)
        category_ids = [row[0] for row in viewed_categories_result.fetchall()]
        
        if not category_ids:
            return [], []
        
        recommendations_query = select(Product).where(
            and_(
                Product.category_id.in_(category_ids),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(Product.created_at)).limit(request.limit)
        
        result = await db.execute(recommendations_query)
        products = result.scalars().all()
        reasons = ["Based on your viewing history"] * len(products)
        
        return products, reasons

    async def _get_based_on_purchased_products(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        viewed_categories_query = select(Product.category_id).join(ProductView).where(
            ProductView.user_id == request.user_id
        ).distinct().limit(5)
        
        viewed_categories_result = await db.execute(viewed_categories_query)
        category_ids = [row[0] for row in viewed_categories_result.fetchall()]
        
        if not category_ids:
            return [], []
        
        recommendations_query = select(Product).where(
            and_(
                Product.category_id.in_(category_ids),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved", 
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).order_by(desc(Product.created_at)).limit(request.limit)
        
        result = await db.execute(recommendations_query)
        products = result.scalars().all()
        reasons = ["Based on your purchase history"] * len(products)
        
        return products, reasons

    async def _get_based_on_wishlist(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        from app.features.products.models.wishlist import Wishlist
        
        wishlist_query = select(
            Product.category_id,
            Product.brand_id
        ).select_from(
            Product.join(Wishlist, Product.id == Wishlist.product_id)
        ).where(
            Wishlist.user_id == request.user_id
        ).limit(5)
        
        wishlist_result = await db.execute(wishlist_query)
        wishlist_data = wishlist_result.fetchall()
        
        if not wishlist_data:
            return [], []
        
        category_ids = [row[0] for row in wishlist_data if row[0]]
        brand_ids = [row[1] for row in wishlist_data if row[1]]
        
        filters = []
        if category_ids:
            filters.append(Product.category_id.in_(category_ids))
        if brand_ids:
            filters.append(Product.brand_id.in_(brand_ids))
        
        if not filters:
            return [], []
        
        recommendations_query = select(Product).where(
            and_(
                or_(*filters),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        ).limit(request.limit)
        
        result = await db.execute(recommendations_query)
        products = result.scalars().all()
        reasons = ["Based on your wishlist preferences"] * len(products)
        
        return products, reasons

    async def _get_based_on_categories(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        return await self._get_based_on_viewed_products(db, request)

    async def _get_mixed_recommendations(self, db: AsyncSession, request: ProductPersonalizedRequest) -> Tuple[List[Product], List[str]]:
        all_products = []
        all_reasons = []
        per_type_limit = request.limit // 3
        
        viewed_products, viewed_reasons = await self._get_based_on_viewed_products(
            db, ProductPersonalizedRequest(
                user_id=request.user_id,
                recommendation_type="viewed",
                limit=per_type_limit
            )
        )
        
        purchased_products, purchased_reasons = await self._get_based_on_purchased_products(
            db, ProductPersonalizedRequest(
                user_id=request.user_id,
                recommendation_type="purchased", 
                limit=per_type_limit
            )
        )
        
        wishlist_products, wishlist_reasons = await self._get_based_on_wishlist(
            db, ProductPersonalizedRequest(
                user_id=request.user_id,
                recommendation_type="wishlist",
                limit=per_type_limit
            )
        )
        
        all_products.extend(viewed_products)
        all_reasons.extend(viewed_reasons)
        all_products.extend(purchased_products)
        all_reasons.extend(purchased_reasons)
        all_products.extend(wishlist_products)
        all_reasons.extend(wishlist_reasons)
        
        return all_products[:request.limit], all_reasons[:request.limit]

    async def get_product_price_history(self, db: AsyncSession, request: ProductPriceHistoryRequest) -> Dict[str, Any]:
        from app.features.products.models.product_price_history import ProductPriceHistory
        
        cutoff_date = func.current_date() - text(f"INTERVAL '{request.days_back} days'")
        
        price_history_query = select(
            ProductPriceHistory.price,
            ProductPriceHistory.created_at
        ).where(
            and_(
                ProductPriceHistory.product_id == request.product_id,
                ProductPriceHistory.created_at >= cutoff_date
            )
        ).order_by(ProductPriceHistory.created_at.asc())
        
        result = await db.execute(price_history_query)
        history_data = [{"price": float(row[0]), "date": row[1].isoformat()} for row in result.fetchall()]
        
        current_product_query = select(Product.price).where(Product.id == request.product_id)
        current_result = await db.execute(current_product_query)
        current_price = current_result.scalar()
        
        if history_data:
            prices = [item["price"] for item in history_data]
            lowest_price = min(prices)
            highest_price = max(prices)
            average_price = sum(prices) / len(prices)
            
            if len(prices) > 1:
                trend = "increasing" if prices[-1] > prices[0] else "decreasing" if prices[-1] < prices[0] else "stable"
            else:
                trend = "stable"
        else:
            lowest_price = highest_price = average_price = float(current_price) if current_price else 0
            trend = "stable"
        
        return {
            "product_id": request.product_id,
            "price_history": history_data,
            "current_price": float(current_price) if current_price else 0,
            "lowest_price": lowest_price,
            "highest_price": highest_price,
            "average_price": average_price,
            "price_trend": trend
        }

    async def get_stock_alerts(self, db: AsyncSession, request: ProductStockAlertRequest) -> Dict[str, Any]:
        stock_query = select(
            Product.id,
            Product.name,
            ProductInventory.available_quantity,
            ProductInventory.low_stock_threshold
        ).join(ProductInventory).where(
            Product.id.in_(request.product_ids)
        )
        
        result = await db.execute(stock_query)
        stock_data = result.fetchall()
        
        alerts = []
        low_stock_products = []
        out_of_stock_products = []
        
        for row in stock_data:
            product_id, name, available_qty, threshold = row
            
            if available_qty == 0:
                out_of_stock_products.append(product_id)
                alerts.append({
                    "product_id": str(product_id),
                    "product_name": name,
                    "alert_type": "out_of_stock",
                    "available_quantity": available_qty,
                    "threshold": threshold
                })
            elif available_qty <= request.alert_threshold or (threshold and available_qty <= threshold):
                low_stock_products.append(product_id)
                alerts.append({
                    "product_id": str(product_id),
                    "product_name": name,
                    "alert_type": "low_stock",
                    "available_quantity": available_qty,
                    "threshold": threshold or request.alert_threshold
                })
        
        return {
            "alerts": alerts,
            "low_stock_products": [str(pid) for pid in low_stock_products],
            "out_of_stock_products": [str(pid) for pid in out_of_stock_products],
            "total_alerts": len(alerts)
        }

    async def bulk_search_products(self, db: AsyncSession, request: ProductBulkSearchRequest) -> Dict[str, Any]:
        products_query = select(Product).where(
            and_(
                Product.id.in_(request.product_ids),
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved"
            )
        ).options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images)
        )
        
        if request.include_inventory:
            products_query = products_query.options(selectinload(Product.inventory))
        
        result = await db.execute(products_query)
        found_products = result.scalars().all()
        
        found_ids = {product.id for product in found_products}
        not_found_ids = [pid for pid in request.product_ids if pid not in found_ids]
        
        products_data = []
        inventory_data = []
        pricing_data = []
        
        for product in found_products:
            product_dict = product.to_dict()
            
            if request.include_details:
                product_dict["category"] = product.category.to_dict() if product.category else None
                product_dict["brand"] = product.brand.to_dict() if product.brand else None
                product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
            
            products_data.append(product_dict)
            
            if request.include_inventory and product.inventory:
                inventory_data.extend([inv.to_dict() for inv in product.inventory])
            
            if request.include_pricing:
                pricing_data.append({
                    "product_id": str(product.id),
                    "price": float(product.price),
                    "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None,
                    "cost_per_item": float(product.cost_per_item) if product.cost_per_item else None
                })
        
        return {
            "products": products_data,
            "found_count": len(found_products),
            "not_found_ids": not_found_ids,
            "inventory_data": inventory_data if request.include_inventory else None,
            "pricing_data": pricing_data if request.include_pricing else None
        }

    async def get_search_analytics(self, db: AsyncSession, request: ProductSearchAnalyticsRequest) -> Dict[str, Any]:
        from app.features.products.models.product_search_log import ProductSearchLog
        
        base_filters = [True]
        
        if request.date_from:
            base_filters.append(ProductSearchLog.created_at >= request.date_from)
        
        if request.date_to:
            base_filters.append(ProductSearchLog.created_at <= request.date_to)
        
        if request.user_id:
            base_filters.append(ProductSearchLog.user_id == request.user_id)
        
        search_volume_query = select(
            func.date(ProductSearchLog.created_at).label('search_date'),
            func.count().label('search_count')
        ).where(
            and_(*base_filters)
        ).group_by(
            func.date(ProductSearchLog.created_at)
        ).order_by(
            desc('search_date')
        )
        
        popular_terms_query = select(
            ProductSearchLog.query_term,
            func.count().label('search_count')
        ).where(
            and_(*base_filters)
        ).group_by(
            ProductSearchLog.query_term
        ).order_by(
            desc('search_count')
        ).limit(20)
        
        conversion_query = select(
            ProductSearchLog.query_term,
            func.count().label('searches'),
            func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))).label('conversions'),
            func.round(
                func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))) * 100.0 / func.count(), 2
            ).label('conversion_rate')
        ).where(
            and_(*base_filters)
        ).group_by(
            ProductSearchLog.query_term
        ).having(
            func.count() >= 10
        ).order_by(
            desc('conversion_rate')
        ).limit(10)
        
        search_volume_result = await db.execute(search_volume_query)
        popular_terms_result = await db.execute(popular_terms_query)
        conversion_result = await db.execute(conversion_query)
        
        search_volume = {str(row[0]): row[1] for row in search_volume_result.fetchall()}
        popular_terms = [{"term": row[0], "count": row[1]} for row in popular_terms_result.fetchall()]
        conversion_rates = {row[0]: float(row[3]) for row in conversion_result.fetchall()}
        
        return {
            "search_volume": search_volume,
            "popular_terms": popular_terms,
            "conversion_rates": conversion_rates,
            "category_performance": [],
            "brand_performance": [],
            "time_series_data": []
        }

    async def advanced_filter_products(self, db: AsyncSession, request: AdvancedFilterRequest) -> Tuple[List[Product], Dict[str, Any]]:
        base_query = select(Product).where(
            and_(
                Product.status == ProductStatusEnum.ACTIVE,
                Product.approval_status == "approved",
                Product.visibility == "visible"
            )
        )
        
        applied_filters = {}
        
        if request.search_term:
            search_filter = or_(
                Product.name.ilike(f"%{request.search_term}%"),
                Product.description.ilike(f"%{request.search_term}%"),
                cast(Product.tags, String).ilike(f"%{request.search_term}%")
            )
            base_query = base_query.where(search_filter)
            applied_filters["search_term"] = request.search_term
        
        if request.category_ids:
            base_query = base_query.where(Product.category_id.in_(request.category_ids))
            applied_filters["category_ids"] = request.category_ids
        
        if request.brand_ids:
            base_query = base_query.where(Product.brand_id.in_(request.brand_ids))
            applied_filters["brand_ids"] = request.brand_ids
        
        if request.supplier_ids:
            base_query = base_query.where(Product.supplier_id.in_(request.supplier_ids))
            applied_filters["supplier_ids"] = request.supplier_ids
        
        if request.price_range:
            min_price, max_price = request.price_range
            if min_price is not None:
                base_query = base_query.where(Product.price >= min_price)
                applied_filters["min_price"] = min_price
            if max_price is not None:
                base_query = base_query.where(Product.price <= max_price)
                applied_filters["max_price"] = max_price
        
        if request.discount_only:
            base_query = base_query.where(Product.compare_at_price.isnot(None))
            applied_filters["discount_only"] = True
        
        if request.materials:
            for material in request.materials:
                material_filter = cast(Product.materials, String).ilike(f"%{material}%")
                base_query = base_query.where(material_filter)
            applied_filters["materials"] = request.materials
        
        if request.origin_countries:
            base_query = base_query.where(Product.origin_country.in_(request.origin_countries))
            applied_filters["origin_countries"] = request.origin_countries
        
        if request.tags:
            for tag in request.tags:
                tag_filter = cast(Product.tags, String).ilike(f"%{tag}%")
                base_query = base_query.where(tag_filter)
            applied_filters["tags"] = request.tags
        
        base_query = self._apply_sorting(base_query, request.sort_by)
        
        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        base_query = base_query.options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.sustainability_scores)
        )
        
        offset = (request.page - 1) * request.per_page
        base_query = base_query.offset(offset).limit(request.per_page)
        
        result = await db.execute(base_query)
        products = result.scalars().all()
        
        total_pages = (total + request.per_page - 1) // request.per_page
        
        filter_results = {
            "total": total,
            "applied_filters": applied_filters,
            "page": request.page,
            "per_page": request.per_page,
            "total_pages": total_pages
        }
        
        return products, filter_results