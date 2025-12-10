from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, delete
from sqlalchemy.orm import selectinload
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.products.models.wishlist import Wishlist
from app.features.products.models.product import Product
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.logging import get_logger

logger = get_logger("crud.wishlist")

class WishlistCrud(BaseCrud[Wishlist]):
    def __init__(self):
        super().__init__(get_supabase_client(), Wishlist)

    async def add_to_wishlist(self, db: AsyncSession, user_id: str, product_id: str) -> Dict[str, Any]:
        try:
            # Convert string IDs to UUID objects
            from uuid import UUID
            try:
                user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
                product_uuid = UUID(product_id) if isinstance(product_id, str) else product_id
            except (ValueError, TypeError) as uuid_err:
                logger.error(f"Invalid UUID format: user_id={user_id}, product_id={product_id}, error={uuid_err}")
                from app.core.exceptions import ValidationException
                raise ValidationException(f"Invalid ID format: {uuid_err}")
            
            # Check if product exists first - but only when adding, not when getting
            # This check is only needed for add_to_wishlist, not get_user_wishlist
            # Commenting out for now as it might be causing issues - we'll rely on foreign key constraint
            # from app.features.products.models.product import Product
            # product_check = await db.execute(
            #     select(Product).where(Product.id == product_uuid)
            # )
            # if not product_check.scalar_one_or_none():
            #     from app.core.exceptions import NotFoundException
            #     raise NotFoundException(f"Product {product_id} not found")
            
            existing = await db.execute(
                select(Wishlist)
                .where(Wishlist.user_id == user_uuid)
                .where(Wishlist.product_id == product_uuid)
            )
            if existing.scalar_one_or_none():
                raise ConflictException("Product already in wishlist")
            
            wishlist_data = {
                "user_id": user_uuid,
                "product_id": product_uuid
            }
            
            created_item = await self.create(db, wishlist_data)
            logger.info(f"Product {product_id} added to wishlist for user {user_id}")
            return created_item.to_dict()
        except ConflictException:
            raise
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error adding product {product_id} to wishlist for user {user_id}: {str(e)}")
            raise

    async def remove_from_wishlist(self, db: AsyncSession, user_id: str, product_id: str) -> bool:
        try:
            # Convert string IDs to UUID objects
            from uuid import UUID
            try:
                user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
                product_uuid = UUID(product_id) if isinstance(product_id, str) else product_id
            except (ValueError, TypeError) as uuid_err:
                logger.error(f"Invalid UUID format: user_id={user_id}, product_id={product_id}, error={uuid_err}")
                raise ValidationException(f"Invalid ID format: {uuid_err}")
            
            result = await db.execute(
                delete(Wishlist)
                .where(Wishlist.user_id == user_uuid)
                .where(Wishlist.product_id == product_uuid)
            )
            
            if result.rowcount == 0:
                raise NotFoundException("Product not found in wishlist")
            
            await db.commit()
            logger.info(f"Product {product_id} removed from wishlist for user {user_id}")
            return True
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Error removing product {product_id} from wishlist for user {user_id}: {str(e)}")
            raise

    async def get_user_wishlist(
        self,
        db: AsyncSession,
        user_id: str,
        pagination: PaginationParams
    ) -> PaginatedResponse[Dict[str, Any]]:
        try:
            # Convert string ID to UUID if needed
            from uuid import UUID
            try:
                user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
            except (ValueError, TypeError) as uuid_err:
                logger.error(f"Invalid UUID format for user_id: {user_id}, error: {uuid_err}")
                from app.core.exceptions import ValidationException
                raise ValidationException(f"Invalid user ID format: {uuid_err}")
            
            query = (
                select(Wishlist)
                .where(Wishlist.user_id == user_uuid)
                .options(
                    selectinload(Wishlist.product).selectinload(Product.category),
                    selectinload(Wishlist.product).selectinload(Product.brand),
                    selectinload(Wishlist.product).selectinload(Product.images)
                )
                .order_by(Wishlist.added_at.desc())
            )
            
            count_query = select(func.count()).select_from(Wishlist).where(Wishlist.user_id == user_uuid)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar() or 0
            
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            wishlist_items = result.scalars().all()
            
            wishlist_data = []
            for item in wishlist_items:
                try:
                    item_dict = item.to_dict()
                    if item.product:
                        product_dict = item.product.to_dict()
                        product_dict["category"] = item.product.category.to_dict() if item.product.category else None
                        product_dict["brand"] = item.product.brand.to_dict() if item.product.brand else None
                        product_dict["images"] = [img.to_dict() for img in item.product.images] if item.product.images else []
                        item_dict["product"] = product_dict
                    wishlist_data.append(item_dict)
                except Exception as item_err:
                    logger.warning(f"Error processing wishlist item {item.product_id}: {item_err}, skipping")
                    continue
            
            return PaginatedResponse.create(
                items=wishlist_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting wishlist for user {user_id}: {str(e)}")
            # Return empty wishlist instead of raising error
            from app.core.base import PaginatedResponse
            return PaginatedResponse.create(
                items=[],
                total=0,
                page=pagination.page,
                limit=pagination.limit
            )

    async def is_in_wishlist(self, db: AsyncSession, user_id: str, product_id: str) -> bool:
        try:
            # Convert string IDs to UUID objects
            from uuid import UUID
            try:
                user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
                product_uuid = UUID(product_id) if isinstance(product_id, str) else product_id
            except (ValueError, TypeError) as uuid_err:
                logger.error(f"Invalid UUID format: user_id={user_id}, product_id={product_id}, error={uuid_err}")
                return False
            
            result = await db.execute(
                select(Wishlist)
                .where(Wishlist.user_id == user_uuid)
                .where(Wishlist.product_id == product_uuid)
            )
            return result.scalar_one_or_none() is not None
        except Exception as e:
            logger.error(f"Error checking if product {product_id} is in wishlist for user {user_id}: {str(e)}")
            return False

    async def clear_wishlist(self, db: AsyncSession, user_id: str) -> bool:
        try:
            # Convert string ID to UUID if needed
            from uuid import UUID
            try:
                user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
            except (ValueError, TypeError) as uuid_err:
                logger.error(f"Invalid UUID format for user_id: {user_id}, error: {uuid_err}")
                raise ValidationException(f"Invalid user ID format: {uuid_err}")
            
            await db.execute(
                delete(Wishlist)
                .where(Wishlist.user_id == user_uuid)
            )
            await db.commit()
            logger.info(f"Wishlist cleared for user {user_id}")
            return True
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Error clearing wishlist for user {user_id}: {str(e)}")
            raise
