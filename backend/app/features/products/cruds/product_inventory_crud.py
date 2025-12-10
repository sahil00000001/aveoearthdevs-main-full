from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from supabase_auth import datetime
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.products.models.product_inventory import ProductInventory
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger

logger = get_logger("crud.product_inventory")

class ProductInventoryCrud(BaseCrud[ProductInventory]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductInventory)

    async def get_product_inventory(self, db: AsyncSession, product_id: str, variant_id: Optional[str] = None) -> Optional[ProductInventory]:
        try:
            query = select(ProductInventory)
            if variant_id:
                query = query.where(ProductInventory.variant_id == variant_id)
            else:
                query = query.where(
                    and_(
                        ProductInventory.product_id == product_id,
                        ProductInventory.variant_id.is_(None)
                    )
                )
            
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting inventory for product {product_id}, variant {variant_id}: {str(e)}")
            raise

    async def update_inventory(
        self,
        db: AsyncSession,
        product_id: str,
        quantity: int,
        variant_id: Optional[str] = None,
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            existing_inventory = await self.get_product_inventory(db, product_id, variant_id)
            
            if existing_inventory:
                inventory_data = {
                    "quantity": quantity,
                    "last_restocked_at": datetime.utcnow()
                }
                if location:
                    inventory_data["location"] = location
                
                updated_inventory = await self.update(db, str(existing_inventory.id), inventory_data)
                logger.info(f"Inventory updated for product {product_id}, variant {variant_id}")
                return updated_inventory.to_dict()
            else:
                inventory_data = {
                    "product_id": product_id if not variant_id else None,
                    "variant_id": variant_id,
                    "quantity": quantity,
                    "location": location,
                    "last_restocked_at": datetime.utcnow()
                }
                
                created_inventory = await self.create(db, inventory_data)
                logger.info(f"Inventory created for product {product_id}, variant {variant_id}")
                return created_inventory.to_dict()
        except Exception as e:
            logger.error(f"Error updating inventory for product {product_id}: {str(e)}")
            raise

    async def reserve_inventory(
        self,
        db: AsyncSession,
        product_id: str,
        quantity: int,
        variant_id: Optional[str] = None
    ) -> bool:
        try:
            inventory = await self.get_product_inventory(db, product_id, variant_id)
            if not inventory:
                return False
            
            if inventory.available_quantity < quantity:
                return False
            
            new_reserved = inventory.reserved_quantity + quantity
            await self.update(db, str(inventory.id), {"reserved_quantity": new_reserved})
            
            logger.info(f"Reserved {quantity} units for product {product_id}, variant {variant_id}")
            return True
        except Exception as e:
            logger.error(f"Error reserving inventory for product {product_id}: {str(e)}")
            return False

    async def release_inventory(
        self,
        db: AsyncSession,
        product_id: str,
        quantity: int,
        variant_id: Optional[str] = None
    ) -> bool:
        try:
            inventory = await self.get_product_inventory(db, product_id, variant_id)
            if not inventory:
                return False
            
            new_reserved = max(0, inventory.reserved_quantity - quantity)
            await self.update(db, str(inventory.id), {"reserved_quantity": new_reserved})
            
            logger.info(f"Released {quantity} units for product {product_id}, variant {variant_id}")
            return True
        except Exception as e:
            logger.error(f"Error releasing inventory for product {product_id}: {str(e)}")
            return False

    async def get_low_stock_products(self, db: AsyncSession, supplier_id: str) -> List[Dict[str, Any]]:
        try:
            result = await db.execute(
                select(ProductInventory)
                .join("products")
                .where("products.supplier_id == supplier_id")
                .where("product_inventory.available_quantity <= product_inventory.low_stock_threshold")
            )
            low_stock_items = result.scalars().all()
            
            return [item.to_dict() for item in low_stock_items]
        except Exception as e:
            logger.error(f"Error getting low stock products for supplier {supplier_id}: {str(e)}")
            raise

    async def get_product_stock(self, db: AsyncSession, product_id: str) -> int:
        try:
            inventory = await self.get_product_inventory(db, product_id, None)
            if inventory:
                return inventory.available_quantity
            return 0
        except Exception as e:
            logger.error(f"Error getting stock for product {product_id}: {str(e)}")
            return 0

    async def get_variant_stock(self, db: AsyncSession, variant_id: str) -> int:
        try:
            query = select(ProductInventory).where(ProductInventory.variant_id == variant_id)
            result = await db.execute(query)
            inventory = result.scalar_one_or_none()
            if inventory:
                return inventory.available_quantity
            return 0
        except Exception as e:
            logger.error(f"Error getting stock for variant {variant_id}: {str(e)}")
            return 0
