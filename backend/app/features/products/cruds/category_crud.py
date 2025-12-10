from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.products.models.category import Category
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.logging import get_logger
from app.features.products.models.product import Product

logger = get_logger("crud.categories")

class CategoryCrud(BaseCrud[Category]):
    def __init__(self):
        super().__init__(get_supabase_client(), Category)

    async def get_categories_tree(self, db: Optional[AsyncSession]) -> List[Dict[str, Any]]:
        # Handle case when database is not available
        if db is None:
            logger.warning("Database not available, returning empty categories list")
            return []
        
        try:
            result = await db.execute(
                select(Category)
                .where(Category.is_active == True)
                .options(selectinload(Category.children))
                .where(Category.parent_id.is_(None))
                .order_by(Category.sort_order, Category.name)
            )
            root_categories = result.scalars().all()
            
            categories_tree = []
            for category in root_categories:
                category_dict = category.to_dict()
                category_dict["children"] = [child.to_dict() for child in category.children if child.is_active]
                categories_tree.append(category_dict)
            
            return categories_tree
        except Exception as e:
            logger.error(f"Error getting categories tree: {str(e)}")
            raise

    async def get_category_by_slug(self, db: AsyncSession, slug: str) -> Optional[Category]:
        try:
            result = await db.execute(
                select(Category)
                .where(Category.slug == slug)
                .where(Category.is_active == True)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting category by slug {slug}: {str(e)}")
            raise

    async def create_category(self, db: AsyncSession, category_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if category_data.get("parent_id"):
                parent = await self.get_by_id(db, category_data["parent_id"])
                if not parent:
                    raise NotFoundException("Parent category not found")
            
            if category_data.get("slug"):
                existing = await self.get_category_by_slug(db, category_data["slug"])
                if existing:
                    raise ConflictException("Category with this slug already exists")
            
            created_category = await self.create(db, category_data)
            logger.info(f"Category created: {created_category.id}")
            return created_category.to_dict()
        except Exception as e:
            logger.error(f"Error creating category: {str(e)}")
            raise

    async def update_category(self, db: AsyncSession, category_id: str, category_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_category = await self.get_by_id(db, category_id)
            if not existing_category:
                raise NotFoundException("Category not found")
            
            if category_data.get("slug") and category_data.get("slug") != existing_category.slug:
                slug_check = await self.get_category_by_slug(db, category_data["slug"])
                if slug_check and str(slug_check.id) != category_id:
                    raise ConflictException("Category with this slug already exists")
            
            if category_data.get("parent_id"):
                parent = await self.get_by_id(db, category_data["parent_id"])
                if not parent:
                    raise NotFoundException("Parent category not found")
                if category_data["parent_id"] == category_id:
                    raise ValidationException("Category cannot be its own parent")
            
            updated_category = await self.update(db, category_id, category_data)
            logger.info(f"Category updated: {category_id}")
            return updated_category.to_dict()
        except Exception as e:
            logger.error(f"Error updating category {category_id}: {str(e)}")
            raise

    async def get_category_with_products_count(self, db: AsyncSession, category_id: str) -> Optional[Dict[str, Any]]:
        try:
            category = await self.get_by_id(db, category_id)
            if not category:
                return None
            
            result = await db.execute(
                select(func.count())
                .select_from(Product)
                .where(Product.category_id == category_id)
            )
            products_count = result.scalar()
            
            category_dict = category.to_dict()
            category_dict["products_count"] = products_count
            return category_dict
        except Exception as e:
            logger.error(f"Error getting category with products count {category_id}: {str(e)}")
            raise
