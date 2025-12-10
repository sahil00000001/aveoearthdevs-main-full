from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.products.models.brand import Brand
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.logging import get_logger

logger = get_logger("crud.brands")

class BrandCrud(BaseCrud[Brand]):
    def __init__(self):
        super().__init__(get_supabase_client(), Brand)

    async def get_brand_by_slug(self, db: AsyncSession, slug: str) -> Optional[Brand]:
        try:
            result = await db.execute(
                select(Brand)
                .where(Brand.slug == slug)
                .where(Brand.is_active == True)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting brand by slug {slug}: {str(e)}")
            raise

    async def create_brand(self, db: AsyncSession, brand_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if brand_data.get("slug"):
                existing = await self.get_brand_by_slug(db, brand_data["slug"])
                if existing:
                    raise ConflictException("Brand with this slug already exists")
            
            created_brand = await self.create(db, brand_data)
            logger.info(f"Brand created: {created_brand.id}")
            return created_brand.to_dict()
        except Exception as e:
            logger.error(f"Error creating brand: {str(e)}")
            raise

    async def update_brand(self, db: AsyncSession, brand_id: str, brand_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_brand = await self.get_by_id(db, brand_id)
            if not existing_brand:
                raise NotFoundException("Brand not found")
            
            if brand_data.get("slug") and brand_data.get("slug") != existing_brand.slug:
                slug_check = await self.get_brand_by_slug(db, brand_data["slug"])
                if slug_check and str(slug_check.id) != brand_id:
                    raise ConflictException("Brand with this slug already exists")
            
            updated_brand = await self.update(db, brand_id, brand_data)
            logger.info(f"Brand updated: {brand_id}")
            return updated_brand.to_dict()
        except Exception as e:
            logger.error(f"Error updating brand {brand_id}: {str(e)}")
            raise

    async def get_active_brands(self, db: Optional[AsyncSession]) -> List[Dict[str, Any]]:
        # Handle case when database is not available
        if db is None:
            logger.warning("Database not available, returning empty brands list")
            return []
        try:
            result = await db.execute(
                select(Brand)
                .where(Brand.is_active == True)
                .order_by(Brand.name)
            )
            brands = result.scalars().all()
            return [brand.to_dict() for brand in brands]
        except Exception as e:
            logger.error(f"Error getting active brands: {str(e)}")
            raise
