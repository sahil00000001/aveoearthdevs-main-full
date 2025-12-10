from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.products.models.product_view import ProductView
from app.core.logging import get_logger

logger = get_logger("crud.product_views")

class ProductViewCrud(BaseCrud[ProductView]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductView)

    async def record_view(
        self,
        db: AsyncSession,
        product_id: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        referrer: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            view_data = {
                "product_id": product_id,
                "user_id": user_id,
                "session_id": session_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "referrer": referrer
            }
            
            created_view = await self.create(db, view_data)
            logger.debug(f"Product view recorded for product {product_id}")
            return created_view.to_dict()
        except Exception as e:
            logger.error(f"Error recording view for product {product_id}: {str(e)}")
            raise

    async def get_product_view_count(self, db: AsyncSession, product_id: str) -> int:
        try:
            result = await db.execute(
                select(func.count())
                .select_from(ProductView)
                .where(ProductView.product_id == product_id)
            )
            return result.scalar() or 0
        except Exception as e:
            logger.error(f"Error getting view count for product {product_id}: {str(e)}")
            return 0

    async def get_product_unique_views(self, db: AsyncSession, product_id: str) -> int:
        try:
            result = await db.execute(
                select(func.count(func.distinct(
                    func.coalesce(ProductView.user_id, ProductView.session_id)
                )))
                .where(ProductView.product_id == product_id)
            )
            return result.scalar() or 0
        except Exception as e:
            logger.error(f"Error getting unique views for product {product_id}: {str(e)}")
            return 0

    async def get_supplier_analytics(self, db: AsyncSession, supplier_id: str, days: int = 30) -> Dict[str, Any]:
        try:
            from datetime import datetime, timedelta
            start_date = datetime.utcnow() - timedelta(days=days)
            
            total_views_result = await db.execute(
                select(func.count())
                .select_from(ProductView)
                .join("products")
                .where(and_(
                    "products.supplier_id == supplier_id",
                    ProductView.viewed_at >= start_date
                ))
            )
            total_views = total_views_result.scalar() or 0
            
            unique_views_result = await db.execute(
                select(func.count(func.distinct(
                    func.coalesce(ProductView.user_id, ProductView.session_id)
                )))
                .select_from(ProductView)
                .join("products")
                .where(and_(
                    "products.supplier_id == supplier_id",
                    ProductView.viewed_at >= start_date
                ))
            )
            unique_views = unique_views_result.scalar() or 0
            
            most_viewed_result = await db.execute(
                select(
                    ProductView.product_id,
                    func.count().label("view_count")
                )
                .join("products")
                .where(and_(
                    "products.supplier_id == supplier_id",
                    ProductView.viewed_at >= start_date
                ))
                .group_by(ProductView.product_id)
                .order_by(desc("view_count"))
                .limit(10)
            )
            most_viewed = most_viewed_result.all()
            
            return {
                "total_views": total_views,
                "unique_views": unique_views,
                "most_viewed_products": [
                    {"product_id": str(row.product_id), "view_count": row.view_count}
                    for row in most_viewed
                ],
                "period_days": days
            }
        except Exception as e:
            logger.error(f"Error getting analytics for supplier {supplier_id}: {str(e)}")
            raise
