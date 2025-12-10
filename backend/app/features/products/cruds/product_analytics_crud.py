from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, text, case, update
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta

from app.features.products.models.product import Product
from app.features.products.models.product_search_log import ProductSearchLog
from app.features.products.models.product_price_history import ProductPriceHistory
from app.features.products.models.product_view import ProductView
from app.features.products.models.product_review import ProductReview
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.logging import get_logger

logger = get_logger("crud.product_analytics")

class ProductAnalyticsCrud(BaseCrud[ProductSearchLog]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductSearchLog)

    async def log_search(self, db: AsyncSession, search_data: Dict[str, Any]) -> ProductSearchLog:
        try:
            search_log_data = {
                "user_id": search_data.get("user_id"),
                "session_id": search_data.get("session_id"),
                "query_term": search_data.get("query_term", ""),
                "search_type": search_data.get("search_type", "general"),
                "filters_applied": search_data.get("filters_applied"),
                "results_count": str(search_data.get("results_count", 0)),
                "search_duration_ms": search_data.get("search_duration_ms"),
                "user_agent": search_data.get("user_agent"),
                "ip_address": search_data.get("ip_address")
            }
            
            search_log = await self.create(db, search_log_data)
            logger.info(f"Search logged: {search_log.id} for query: {search_data.get('query_term')}")
            return search_log
        except Exception as e:
            logger.error(f"Error logging search: {str(e)}")
            raise

    async def log_product_click(self, db: AsyncSession, log_id: str, product_id: str) -> bool:
        try:
            await self.update(db, log_id, {"clicked_product_id": product_id})
            logger.info(f"Product click logged: {product_id} for search log: {log_id}")
            return True
        except Exception as e:
            logger.error(f"Error logging product click: {str(e)}")
            return False

    async def log_purchase_conversion(self, db: AsyncSession, log_id: str) -> bool:
        try:
            await self.update(db, log_id, {"resulted_in_purchase": True})
            logger.info(f"Purchase conversion logged for search log: {log_id}")
            return True
        except Exception as e:
            logger.error(f"Error logging purchase conversion: {str(e)}")
            return False

    async def get_search_trends(self, db: AsyncSession, days_back: int = 30) -> Dict[str, Any]:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            trends_query = select(
                func.date(ProductSearchLog.created_at).label('search_date'),
                func.count().label('total_searches'),
                func.count(func.distinct(ProductSearchLog.user_id)).label('unique_users'),
                func.count(func.distinct(ProductSearchLog.query_term)).label('unique_queries')
            ).where(
                ProductSearchLog.created_at >= cutoff_date
            ).group_by(
                func.date(ProductSearchLog.created_at)
            ).order_by(
                func.date(ProductSearchLog.created_at).desc()
            )
            
            result = await db.execute(trends_query)
            trends_data = []
            
            for row in result.fetchall():
                trends_data.append({
                    "date": row[0].isoformat(),
                    "total_searches": row[1],
                    "unique_users": row[2],
                    "unique_queries": row[3],
                    "avg_duration_ms": 0
                })
            
            return {"trends": trends_data, "period_days": days_back}
        except Exception as e:
            logger.error(f"Error getting search trends: {str(e)}")
            raise

    async def get_popular_search_terms(self, db: AsyncSession, limit: int = 20, days_back: int = 30) -> List[Dict[str, Any]]:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            popular_query = select(
                ProductSearchLog.query_term,
                func.count().label('search_count'),
                func.count(func.distinct(ProductSearchLog.user_id)).label('unique_users'),
                func.count(case((ProductSearchLog.clicked_product_id.isnot(None), 1))).label('clicks'),
                func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))).label('conversions'),
                (func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))) * 100.0 / func.count()).label('conversion_rate')
            ).where(
                ProductSearchLog.created_at >= cutoff_date
            ).group_by(
                ProductSearchLog.query_term
            ).order_by(
                func.count().desc()
            ).limit(limit)
            
            result = await db.execute(popular_query)
            popular_terms = []
            
            for row in result.fetchall():
                popular_terms.append({
                    "term": row[0],
                    "search_count": row[1],
                    "unique_users": row[2],
                    "clicks": row[3],
                    "conversions": row[4],
                    "conversion_rate": round(float(row[5]), 2) if row[5] else 0.0
                })
            
            return popular_terms
        except Exception as e:
            logger.error(f"Error getting popular search terms: {str(e)}")
            raise

    async def get_no_results_queries(self, db: AsyncSession, limit: int = 20, days_back: int = 30) -> List[Dict[str, Any]]:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            no_results_query = select(
                ProductSearchLog.query_term,
                func.count().label('search_count'),
                func.count(func.distinct(ProductSearchLog.user_id)).label('unique_users')
            ).where(
                and_(
                    ProductSearchLog.created_at >= cutoff_date,
                    or_(
                        ProductSearchLog.results_count == '0',
                        ProductSearchLog.results_count.is_(None)
                    )
                )
            ).group_by(
                ProductSearchLog.query_term
            ).order_by(
                desc('search_count')
            ).limit(limit)
            
            result = await db.execute(no_results_query)
            no_results = []
            
            for row in result.fetchall():
                no_results.append({
                    "term": row[0],
                    "search_count": row[1],
                    "unique_users": row[2]
                })
            
            return no_results
        except Exception as e:
            logger.error(f"Error getting no results queries: {str(e)}")
            raise

    async def get_product_performance_metrics(self, db: AsyncSession, product_id: str, days_back: int = 30) -> Dict[str, Any]:
        try:
            from app.features.products.models.product_review import ProductReview
            
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            performance_query = select(
                func.count(func.distinct(ProductView.user_id)).label('unique_viewers'),
                func.count(ProductView.id).label('total_views'),
                func.count(func.distinct(
                    case((ProductSearchLog.clicked_product_id == product_id, ProductSearchLog.user_id))
                )).label('search_clicks'),
                func.count(
                    case((
                        and_(
                            ProductSearchLog.resulted_in_purchase == True,
                            ProductSearchLog.clicked_product_id == product_id
                        ), 1
                    ))
                ).label('conversions'),
                func.avg(ProductReview.rating).label('avg_rating'),
                func.count(ProductReview.id).label('review_count')
            ).select_from(
                Product.__table__.outerjoin(ProductView.__table__, 
                    and_(Product.id == ProductView.product_id, ProductView.viewed_at >= cutoff_date)
                ).outerjoin(ProductSearchLog.__table__,
                    and_(Product.id == ProductSearchLog.clicked_product_id, ProductSearchLog.created_at >= cutoff_date)
                ).outerjoin(ProductReview.__table__,
                    and_(Product.id == ProductReview.product_id, 
                         ProductReview.created_at >= cutoff_date)
                )
            ).where(
                Product.id == product_id
            ).group_by(Product.id)
            
            result = await db.execute(performance_query)
            row = result.fetchone()
            
            if row:
                conversion_rate = (row[3] / row[1] * 100) if row[1] > 0 else 0
                return {
                    "product_id": product_id,
                    "unique_viewers": row[0] or 0,
                    "total_views": row[1] or 0,
                    "search_clicks": row[2] or 0,
                    "conversions": row[3] or 0,
                    "conversion_rate": round(conversion_rate, 2),
                    "avg_rating": float(row[4]) if row[4] else 0,
                    "review_count": row[5] or 0,
                    "period_days": days_back
                }
            else:
                return {
                    "product_id": product_id,
                    "unique_viewers": 0,
                    "total_views": 0,
                    "search_clicks": 0,
                    "conversions": 0,
                    "conversion_rate": 0,
                    "avg_rating": 0,
                    "review_count": 0,
                    "period_days": days_back
                }
        except Exception as e:
            logger.error(f"Error getting product performance metrics: {str(e)}")
            raise

    async def get_category_search_analytics(self, db: AsyncSession, days_back: int = 30, category_id: str = None) -> List[Dict[str, Any]]:
        try:
            from app.features.products.models.category import Category
            
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            category_query = select(
                Category.name.label('category_name'),
                Category.id.label('category_id'),
                func.count(func.distinct(ProductSearchLog.id)).label('total_searches'),
                func.count(func.distinct(ProductSearchLog.user_id)).label('unique_searchers'),
                func.count(case((ProductSearchLog.clicked_product_id.isnot(None), 1))).label('clicks'),
                func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))).label('conversions'),
                case(
                    (func.count(func.distinct(ProductSearchLog.id)) > 0,
                     func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))) * 100.0 / 
                     func.count(func.distinct(ProductSearchLog.id))),
                    else_=0.0
                ).label('conversion_rate')
            ).select_from(
                Category.__table__.outerjoin(Product.__table__, Category.id == Product.category_id)
                .outerjoin(ProductSearchLog.__table__, 
                    and_(Product.id == ProductSearchLog.clicked_product_id,
                         ProductSearchLog.created_at >= cutoff_date)
                )
            )
            
            where_conditions = [Category.is_active == True]
            if category_id:
                where_conditions.append(Category.id == category_id)
            
            category_query = category_query.where(and_(*where_conditions)).group_by(
                Category.id, Category.name
            ).order_by(
                func.count(func.distinct(ProductSearchLog.id)).desc()
            )
            
            result = await db.execute(category_query)
            category_analytics = []
            
            for row in result.fetchall():
                category_analytics.append({
                    "category_name": row[0],
                    "category_id": str(row[1]),
                    "total_searches": row[2] or 0,
                    "unique_searchers": row[3] or 0,
                    "clicks": row[4] or 0,
                    "conversions": row[5] or 0,
                    "conversion_rate": float(row[6]) if row[6] else 0
                })
            
            return category_analytics
        except Exception as e:
            logger.error(f"Error getting category search analytics: {str(e)}")
            raise

    async def get_brand_search_analytics(self, db: AsyncSession, days_back: int = 30, brand_id: str = None) -> List[Dict[str, Any]]:
        try:
            from app.features.products.models.brand import Brand
            
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            brand_query = select(
                Brand.name.label('brand_name'),
                Brand.id.label('brand_id'),
                func.count(func.distinct(ProductSearchLog.id)).label('total_searches'),
                func.count(func.distinct(ProductSearchLog.user_id)).label('unique_searchers'),
                func.count(case((ProductSearchLog.clicked_product_id.isnot(None), 1))).label('clicks'),
                func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))).label('conversions'),
                case(
                    (func.count(func.distinct(ProductSearchLog.id)) > 0,
                     func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))) * 100.0 / 
                     func.count(func.distinct(ProductSearchLog.id))),
                    else_=0.0
                ).label('conversion_rate')
            ).select_from(
                Brand.__table__.outerjoin(Product.__table__, Brand.id == Product.brand_id)
                .outerjoin(ProductSearchLog.__table__, 
                    and_(Product.id == ProductSearchLog.clicked_product_id,
                         ProductSearchLog.created_at >= cutoff_date)
                )
            )
            
            where_conditions = [Brand.is_active == True]
            if brand_id:
                where_conditions.append(Brand.id == brand_id)
            
            brand_query = brand_query.where(and_(*where_conditions)).group_by(
                Brand.id, Brand.name
            ).order_by(
                func.count(func.distinct(ProductSearchLog.id)).desc()
            )
            
            result = await db.execute(brand_query)
            brand_analytics = []
            
            for row in result.fetchall():
                brand_analytics.append({
                    "brand_name": row[0],
                    "brand_id": str(row[1]),
                    "total_searches": row[2] or 0,
                    "unique_searchers": row[3] or 0,
                    "clicks": row[4] or 0,
                    "conversions": row[5] or 0,
                    "conversion_rate": float(row[6]) if row[6] else 0
                })
            
            return brand_analytics
        except Exception as e:
            logger.error(f"Error getting brand search analytics: {str(e)}")
            raise

    async def get_user_search_behavior(self, db: AsyncSession, user_id: str, days_back: int = 30) -> Dict[str, Any]:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            behavior_query = select(
                func.count().label('total_searches'),
                func.count(func.distinct(ProductSearchLog.query_term)).label('unique_queries'),
                func.count(case((ProductSearchLog.clicked_product_id.isnot(None), 1))).label('clicks'),
                func.count(case((ProductSearchLog.resulted_in_purchase == True, 1))).label('purchases'),
                func.avg(func.cast(ProductSearchLog.search_duration_ms, func.Float)).label('avg_search_duration')
            ).where(
                and_(
                    ProductSearchLog.user_id == user_id,
                    ProductSearchLog.created_at >= cutoff_date
                )
            )
            
            recent_queries_query = select(
                ProductSearchLog.query_term
            ).where(
                and_(
                    ProductSearchLog.user_id == user_id,
                    ProductSearchLog.created_at >= cutoff_date
                )
            ).distinct().order_by(
                desc(ProductSearchLog.created_at)
            ).limit(10)
            
            result = await db.execute(behavior_query)
            row = result.fetchone()
            
            recent_result = await db.execute(recent_queries_query)
            recent_queries = [row[0] for row in recent_result.fetchall()]
            
            if row:
                click_through_rate = (row[2] / row[0] * 100) if row[0] > 0 else 0
                conversion_rate = (row[3] / row[0] * 100) if row[0] > 0 else 0
                
                return {
                    "user_id": user_id,
                    "total_searches": row[0] or 0,
                    "unique_queries": row[1] or 0,
                    "clicks": row[2] or 0,
                    "purchases": row[3] or 0,
                    "click_through_rate": round(click_through_rate, 2),
                    "conversion_rate": round(conversion_rate, 2),
                    "avg_search_duration_ms": float(row[4]) if row[4] else 0,
                    "recent_queries": recent_queries,
                    "period_days": days_back
                }
            else:
                return {
                    "user_id": user_id,
                    "total_searches": 0,
                    "unique_queries": 0,
                    "clicks": 0,
                    "purchases": 0,
                    "click_through_rate": 0,
                    "conversion_rate": 0,
                    "avg_search_duration_ms": 0,
                    "recent_queries": recent_queries,
                    "period_days": days_back
                }
        except Exception as e:
            logger.error(f"Error getting user search behavior: {str(e)}")
            raise

class ProductPriceHistoryCrud(BaseCrud[ProductPriceHistory]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductPriceHistory)

    async def log_price_change(self, db: AsyncSession, price_change_data: Dict[str, Any]) -> ProductPriceHistory:
        try:
            price_history_data = {
                "product_id": price_change_data["product_id"],
                "price": price_change_data["price"],
                "compare_at_price": price_change_data.get("compare_at_price"),
                "cost_per_item": price_change_data.get("cost_per_item"),
                "change_reason": price_change_data.get("change_reason"),
                "changed_by": price_change_data.get("changed_by"),
                "effective_from": price_change_data.get("effective_from", datetime.utcnow()),
                "is_active": "true",
                "metadata": price_change_data.get("metadata")
            }
            
            await self._deactivate_previous_prices(db, price_change_data["product_id"])
            
            price_history = await self.create(db, price_history_data)
            logger.info(f"Price change logged: {price_history.id} for product: {price_change_data['product_id']}")
            return price_history
        except Exception as e:
            logger.error(f"Error logging price change: {str(e)}")
            raise

    async def _deactivate_previous_prices(self, db: AsyncSession, product_id: str) -> None:
        try:
            from app.features.products.models.product_price_history import ProductPriceHistory
            
            update_stmt = (
                update(ProductPriceHistory)
                .where(
                    and_(
                        ProductPriceHistory.product_id == product_id,
                        ProductPriceHistory.is_active == "true"
                    )
                )
                .values(
                    is_active="false",
                    effective_to=func.now()
                )
            )
            
            await db.execute(update_stmt)
            await db.commit()
        except Exception as e:
            logger.error(f"Error deactivating previous prices: {str(e)}")
            raise

    async def get_price_history(self, db: AsyncSession, product_id: str, days_back: int = 365) -> List[Dict[str, Any]]:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            history_query = select(ProductPriceHistory).where(
                and_(
                    ProductPriceHistory.product_id == product_id,
                    ProductPriceHistory.created_at >= cutoff_date
                )
            ).order_by(ProductPriceHistory.effective_from.desc())
            
            result = await db.execute(history_query)
            price_history = result.scalars().all()
            
            return [history.to_dict() for history in price_history]
        except Exception as e:
            logger.error(f"Error getting price history: {str(e)}")
            raise

    async def get_price_analytics(self, db: AsyncSession, product_id: str, days_back: int = 90) -> Dict[str, Any]:
        try:
            from app.features.products.models.product_price_history import ProductPriceHistory
            
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            analytics_query = select(
                func.min(ProductPriceHistory.price).label('min_price'),
                func.max(ProductPriceHistory.price).label('max_price'),
                func.avg(ProductPriceHistory.price).label('avg_price'),
                func.count().label('price_changes'),
                func.stddev_pop(ProductPriceHistory.price).label('price_volatility')
            ).where(
                and_(
                    ProductPriceHistory.product_id == product_id,
                    ProductPriceHistory.created_at >= cutoff_date
                )
            )
            
            result = await db.execute(analytics_query)
            row = result.fetchone()
            
            if row:
                current_price_query = select(ProductPriceHistory.price).where(
                    and_(
                        ProductPriceHistory.product_id == product_id,
                        ProductPriceHistory.is_active == "true"
                    )
                ).order_by(ProductPriceHistory.effective_from.desc()).limit(1)
                
                current_result = await db.execute(current_price_query)
                current_price = current_result.scalar()
                
                return {
                    "product_id": product_id,
                    "current_price": float(current_price) if current_price else 0,
                    "min_price": float(row[0]) if row[0] else 0,
                    "max_price": float(row[1]) if row[1] else 0,
                    "avg_price": float(row[2]) if row[2] else 0,
                    "price_changes": row[3] or 0,
                    "price_volatility": float(row[4]) if row[4] else 0,
                    "period_days": days_back
                }
            else:
                return {
                    "product_id": product_id,
                    "current_price": 0,
                    "min_price": 0,
                    "max_price": 0,
                    "avg_price": 0,
                    "price_changes": 0,
                    "price_volatility": 0,
                    "period_days": days_back
                }
        except Exception as e:
            logger.error(f"Error getting price analytics: {str(e)}")
            raise
