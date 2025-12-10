from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from sqlalchemy.orm import selectinload
from fastapi import UploadFile
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.products.models.product_variant import ProductVariant
from app.features.products.models.product_image import ProductImage
from app.core.exceptions import NotFoundException, ConflictException
from app.core.logging import get_logger
from app.core.supabase_storage import SupabaseStorageClient, extract_blob_path_from_url, delete_file_from_url, upload_product_image
import asyncio

logger = get_logger("crud.product_variants")

class ProductVariantCrud(BaseCrud[ProductVariant]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductVariant)

    async def get_by_id(self, db: AsyncSession, id: str) -> Optional[ProductVariant]:
        result = await db.execute(
            select(ProductVariant)
            .where(ProductVariant.id == id)
            .options(selectinload(ProductVariant.images))
        )
        return result.scalar_one_or_none()

    async def create_variant(self, db: AsyncSession, product_id: str, variant_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_sku = await db.execute(
                select(ProductVariant).where(ProductVariant.sku == variant_data["sku"])
            )
            if existing_sku.scalar_one_or_none():
                raise ConflictException("Variant with this SKU already exists")

            variant_data["product_id"] = product_id
            
            if variant_data.get("is_default"):
                await db.execute(
                    update(ProductVariant)
                    .where(ProductVariant.product_id == product_id)
                    .values(is_default=False)
                )

            created_variant = await self.create(db, variant_data, commit=False)
            
            await db.refresh(created_variant, ["images"])
            
            logger.info(f"Product variant created: {created_variant.id}")
            return created_variant.to_dict()
        except Exception as e:
            logger.error(f"Error creating product variant: {str(e)}")
            raise

    async def get_product_variants(self, db: AsyncSession, product_id: str) -> List[Dict[str, Any]]:
        try:
            result = await db.execute(
                select(ProductVariant)
                .where(ProductVariant.product_id == product_id)
                .order_by(ProductVariant.is_default.desc(), ProductVariant.created_at)
            )
            variants = result.scalars().all()
            variant_dicts = []
            for variant in variants:
                await db.refresh(variant, ["images"])
                variant_dicts.append(variant.to_dict())
            return variant_dicts
        except Exception as e:
            logger.error(f"Error getting variants for product {product_id}: {str(e)}")
            raise

    async def get_variant_by_sku(self, db: AsyncSession, sku: str) -> Optional[Dict[str, Any]]:
        try:
            result = await db.execute(
                select(ProductVariant)
                .where(ProductVariant.sku == sku)
            )
            variant = result.scalar_one_or_none()
            if variant:
                await db.refresh(variant, ["images"])
                return variant.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting variant by SKU {sku}: {str(e)}")
            raise

    async def update_variant(self, db: AsyncSession, variant_id: str, variant_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_variant = await self.get_by_id(db, variant_id)
            if not existing_variant:
                raise NotFoundException("Product variant not found")

            if variant_data.get("sku") and variant_data.get("sku") != existing_variant.sku:
                sku_check = await self.get_variant_by_sku(db, variant_data["sku"])
                if sku_check and str(sku_check["id"]) != str(variant_id):
                    raise ConflictException("Variant with this SKU already exists")

            if variant_data.get("is_default"):
                await db.execute(
                    update(ProductVariant)
                    .where(and_(
                        ProductVariant.product_id == existing_variant.product_id,
                        ProductVariant.id != variant_id
                    ))
                    .values(is_default=False)
                )

            updated_variant = await self.update(db, variant_id, variant_data, commit=False)
            
            await db.refresh(updated_variant, ["images"])
            
            logger.info(f"Product variant updated: {variant_id}")
            return updated_variant.to_dict()
        except Exception as e:
            logger.error(f"Error updating variant {variant_id}: {str(e)}")
            raise

    async def delete_variant(self, db: AsyncSession, variant_id: str) -> bool:
        try:
            variant = await self.get_by_id(db, variant_id)
            if not variant:
                raise NotFoundException("Product variant not found")

            await self.delete(db, variant_id)
            logger.info(f"Product variant deleted: {variant_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting variant {variant_id}: {str(e)}")
            raise

    async def get_default_variant(self, db: AsyncSession, product_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = await db.execute(
                select(ProductVariant)
                .where(and_(
                    ProductVariant.product_id == product_id,
                    ProductVariant.is_default == True
                ))
            )
            variant = result.scalar_one_or_none()
            if variant:
                await db.refresh(variant, ["images"])
                return variant.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting default variant for product {product_id}: {str(e)}")
            raise

    async def set_default_variant(self, db: AsyncSession, variant_id: str) -> Dict[str, Any]:
        try:
            variant = await self.get_by_id(db, variant_id)
            if not variant:
                raise NotFoundException("Product variant not found")

            await db.execute(
                update(ProductVariant)
                .where(ProductVariant.product_id == variant.product_id)
                .values(is_default=False)
            )

            updated_variant = await self.update(db, variant_id, {"is_default": True}, commit=False)
            await db.refresh(updated_variant, ["images"])
            logger.info(f"Set variant {variant_id} as default")
            return updated_variant.to_dict()
        except Exception as e:
            logger.error(f"Error setting default variant {variant_id}: {str(e)}")
            raise


class ProductVariantImageCrud(BaseCrud[ProductImage]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductImage)

    async def upload_variant_images(self, db: AsyncSession, variant_id: str, product_id: str, images: List[UploadFile], user_id: str) -> List[Dict[str, Any]]:
        uploaded_urls = []
        try:
            async def upload_single_image(i: int, image: UploadFile):
                if image and image.filename and image.filename.strip():
                    try:
                        image_url = await upload_product_image(image, user_id)
                        return {
                            "url": image_url,
                            "sort_order": i,
                            "is_primary": i == 0
                        }, None
                    except Exception as e:
                        return None, f"Failed to upload image {i+1} ({image.filename}): {str(e)}"
                else:
                    return None, f"Invalid image at position {i+1}: not a valid file upload"
            
            upload_results = await asyncio.gather(*[upload_single_image(i, image) for i, image in enumerate(images)], return_exceptions=True)
            
            upload_errors = []
            image_data_list = []
            
            for result in upload_results:
                if isinstance(result, Exception):
                    upload_errors.append(f"Upload failed with exception: {str(result)}")
                else:
                    uploaded_img, error = result
                    if uploaded_img:
                        uploaded_urls.append(uploaded_img["url"])
                        image_data_list.append({
                            "product_id": product_id,
                            "variant_id": variant_id,
                            "url": uploaded_img["url"],
                            "alt_text": f"Variant image {uploaded_img['sort_order'] + 1}",
                            "sort_order": uploaded_img["sort_order"],
                            "is_primary": uploaded_img["is_primary"]
                        })
                    if error:
                        upload_errors.append(error)
            
            if upload_errors:
                storage_client = get_storage_client()
                for url in uploaded_urls:
                    try:
                        blob_path = extract_blob_path_from_url(url)[1]
                        storage_client.delete_file("aveoearth-product-assets", blob_path)
                    except:
                        pass
                raise Exception(f"Image upload failed: {'; '.join(upload_errors)}")
            
            if not image_data_list:
                raise Exception("No images were successfully uploaded.")
            
            created_images = []
            for image_data in image_data_list:
                created_image = await self.create(db, image_data, commit=False)
                created_images.append(created_image.to_dict())
            
            logger.info(f"Uploaded {len(created_images)} images for variant {variant_id}")
            return created_images
        except Exception as e:
            if uploaded_urls:
                storage_client = get_storage_client()
                for url in uploaded_urls:
                    try:
                        blob_path = extract_blob_path_from_url(url)[1]
                        storage_client.delete_file("aveoearth-product-assets", blob_path)
                    except:
                        pass
            logger.error(f"Error uploading images for variant {variant_id}: {str(e)}")
            raise

    async def get_variant_images(self, db: AsyncSession, variant_id: str) -> List[Dict[str, Any]]:
        try:
            result = await db.execute(
                select(ProductImage)
                .where(ProductImage.variant_id == variant_id)
                .order_by(ProductImage.sort_order)
            )
            images = result.scalars().all()
            return [image.to_dict() for image in images]
        except Exception as e:
            logger.error(f"Error getting images for variant {variant_id}: {str(e)}")
            raise

    async def delete_variant_image(self, db: AsyncSession, image_id: str) -> bool:
        try:
            image = await self.get_by_id(db, image_id)
            if not image:
                raise NotFoundException("Image not found")
            
            try:
                delete_file_from_url(image.url)
            except Exception as e:
                logger.warning(f"Failed to delete file from storage: {str(e)}")
            
            await self.delete(db, image_id)
            logger.info(f"Deleted variant image: {image_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting variant image {image_id}: {str(e)}")
            raise

    async def update_image_order(self, db: AsyncSession, variant_id: str, image_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            for order_data in image_orders:
                await self.update(db, order_data["id"], {"sort_order": order_data["sort_order"]}, commit=False)
            
            updated_images = await self.get_variant_images(db, variant_id)
            logger.info(f"Updated image order for variant {variant_id}")
            return updated_images
        except Exception as e:
            logger.error(f"Error updating image order for variant {variant_id}: {str(e)}")
            raise

    async def set_primary_image(self, db: AsyncSession, image_id: str) -> Dict[str, Any]:
        try:
            image = await self.get_by_id(db, image_id)
            if not image:
                raise NotFoundException("Image not found")
            
            await db.execute(
                update(ProductImage)
                .where(ProductImage.variant_id == image.variant_id)
                .values(is_primary=False)
            )
            
            updated_image = await self.update(db, image_id, {"is_primary": True}, commit=False)
            logger.info(f"Set image {image_id} as primary")
            return updated_image.to_dict()
        except Exception as e:
            logger.error(f"Error setting primary image {image_id}: {str(e)}")
            raise
