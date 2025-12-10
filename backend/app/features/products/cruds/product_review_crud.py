from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.products.models.product_review import ProductReview
from app.features.products.models.product import Product
from app.core.exceptions import NotFoundException, ValidationException, AuthorizationException
from app.core.logging import get_logger

logger = get_logger("crud.product_reviews")

class ProductReviewCrud(BaseCrud[ProductReview]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductReview)

    async def create_review(self, db: AsyncSession, user_id: str, review_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_review = await db.execute(
                select(ProductReview)
                .where(ProductReview.user_id == user_id)
                .where(ProductReview.product_id == review_data["product_id"])
            )
            if existing_review.scalar_one_or_none():
                raise ValidationException("You have already reviewed this product")
            
            review_data["user_id"] = user_id
            
            created_review = await self.create(db, review_data)
            logger.info(f"Review created for product {review_data['product_id']} by user {user_id}")
            return created_review.to_dict()
        except Exception as e:
            logger.error(f"Error creating review: {str(e)}")
            raise

    async def update_review(self, db: AsyncSession, review_id: str, user_id: str, review_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_review = await self.get_by_id(db, review_id)
            if not existing_review:
                raise NotFoundException("Review not found")
            
            if str(existing_review.user_id) != user_id:
                raise AuthorizationException("You can only update your own reviews")
            
            updated_review = await self.update(db, review_id, review_data)
            logger.info(f"Review updated: {review_id} by user {user_id}")
            return updated_review.to_dict()
        except Exception as e:
            logger.error(f"Error updating review {review_id}: {str(e)}")
            raise

    async def get_product_reviews(
        self,
        db: AsyncSession,
        product_id: str,
        pagination: PaginationParams,
        rating_filter: Optional[int] = None
    ) -> PaginatedResponse[Dict[str, Any]]:
        try:
            query = (
                select(ProductReview)
                .where(ProductReview.product_id == product_id)
                .options(selectinload(ProductReview.user))
            )
            
            if rating_filter:
                query = query.where(ProductReview.rating == rating_filter)
            
            query = query.order_by(desc(ProductReview.created_at))
            
            count_query = (
                select(func.count())
                .select_from(ProductReview)
                .where(ProductReview.product_id == product_id)
            )
            
            if rating_filter:
                count_query = count_query.where(ProductReview.rating == rating_filter)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            reviews = result.scalars().all()
            
            reviews_data = []
            for review in reviews:
                review_dict = review.to_dict()
                if review.user:
                    review_dict["user"] = {
                        "id": str(review.user.id),
                        "first_name": review.user.first_name,
                        "last_name": review.user.last_name,
                        "avatar_url": review.user.avatar_url
                    }
                reviews_data.append(review_dict)
            
            return PaginatedResponse.create(
                items=reviews_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting reviews for product {product_id}: {str(e)}")
            raise

    async def get_product_review_stats(self, db: AsyncSession, product_id: str) -> Dict[str, Any]:
        try:
            result = await db.execute(
                select(
                    func.count(ProductReview.id).label("total_reviews"),
                    func.avg(ProductReview.rating).label("average_rating"),
                    func.count().filter(ProductReview.rating == 5).label("five_star"),
                    func.count().filter(ProductReview.rating == 4).label("four_star"),
                    func.count().filter(ProductReview.rating == 3).label("three_star"),
                    func.count().filter(ProductReview.rating == 2).label("two_star"),
                    func.count().filter(ProductReview.rating == 1).label("one_star")
                )
                .where(ProductReview.product_id == product_id)
            )
            
            stats = result.first()
            
            return {
                "total_reviews": stats.total_reviews or 0,
                "average_rating": float(stats.average_rating) if stats.average_rating else 0.0,
                "rating_distribution": {
                    "5": stats.five_star or 0,
                    "4": stats.four_star or 0,
                    "3": stats.three_star or 0,
                    "2": stats.two_star or 0,
                    "1": stats.one_star or 0
                }
            }
        except Exception as e:
            logger.error(f"Error getting review stats for product {product_id}: {str(e)}")
            raise

    async def get_user_reviews(
        self,
        db: AsyncSession,
        user_id: str,
        pagination: PaginationParams
    ) -> PaginatedResponse[Dict[str, Any]]:
        try:
            query = (
                select(ProductReview)
                .where(ProductReview.user_id == user_id)
                .options(
                    selectinload(ProductReview.product).selectinload(Product.images)
                )
                .order_by(desc(ProductReview.created_at))
            )
            
            count_query = (
                select(func.count())
                .select_from(ProductReview)
                .where(ProductReview.user_id == user_id)
            )
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            reviews = result.scalars().all()
            
            reviews_data = []
            for review in reviews:
                review_dict = review.to_dict()
                if review.product:
                    product_dict = {
                        "id": str(review.product.id),
                        "name": review.product.name,
                        "slug": review.product.slug,
                        "price": float(review.product.price) if review.product.price else None,
                        "images": [img.to_dict() for img in review.product.images] if review.product.images else []
                    }
                    review_dict["product"] = product_dict
                reviews_data.append(review_dict)
            
            return PaginatedResponse.create(
                items=reviews_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting reviews for user {user_id}: {str(e)}")
            raise

    async def delete_review(self, db: AsyncSession, review_id: str, user_id: str) -> bool:
        try:
            existing_review = await self.get_by_id(db, review_id)
            if not existing_review:
                raise NotFoundException("Review not found")
            
            if str(existing_review.user_id) != user_id:
                raise AuthorizationException("You can only delete your own reviews")
            
            await self.delete(db, review_id)
            logger.info(f"Review deleted: {review_id} by user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting review {review_id}: {str(e)}")
            raise

    async def get_all_reviews(self, db: AsyncSession, pagination: PaginationParams, filters: Dict[str, Any] = None) -> PaginatedResponse[Dict[str, Any]]:
        try:
            query = select(ProductReview).options(
                selectinload(ProductReview.user),
                selectinload(ProductReview.product)
            )
            
            if filters:
                if "product_id" in filters:
                    query = query.where(ProductReview.product_id == filters["product_id"])
                if "user_id" in filters:
                    query = query.where(ProductReview.user_id == filters["user_id"])
            
            query = query.order_by(desc(ProductReview.created_at))
            
            count_query = select(func.count()).select_from(ProductReview)
            if filters:
                if "product_id" in filters:
                    count_query = count_query.where(ProductReview.product_id == filters["product_id"])
                if "user_id" in filters:
                    count_query = count_query.where(ProductReview.user_id == filters["user_id"])
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            reviews = result.scalars().all()
            
            reviews_data = []
            for review in reviews:
                review_dict = review.to_dict()
                if review.user:
                    review_dict["user"] = {
                        "id": str(review.user.id),
                        "first_name": review.user.first_name,
                        "last_name": review.user.last_name,
                        "avatar_url": review.user.avatar_url
                    }
                if review.product:
                    review_dict["product"] = {
                        "id": str(review.product.id),
                        "name": review.product.name,
                        "slug": review.product.slug
                    }
                reviews_data.append(review_dict)
            
            return PaginatedResponse.create(
                items=reviews_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting all reviews: {str(e)}")
            raise
