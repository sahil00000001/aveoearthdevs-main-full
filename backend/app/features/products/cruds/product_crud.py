from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.products.models.product import Product, ProductStatusEnum, ProductApprovalEnum, ProductVisibilityEnum
from app.features.products.models.product_image import ProductImage
from app.features.products.models.product_variant import ProductVariant
from app.core.exceptions import NotFoundException, AuthorizationException, ConflictException
from app.core.logging import get_logger

logger = get_logger("crud.products")

class ProductCrud(BaseCrud[Product]):
    def __init__(self):
        super().__init__(get_supabase_client(), Product)

    async def get_by_id(self, db: AsyncSession, id: str) -> Optional[Product]:
        try:
            result = await db.execute(
                select(Product)
                .where(Product.id == id)
                .options(
                    selectinload(Product.category),
                    selectinload(Product.brand),
                    selectinload(Product.images),
                    selectinload(Product.variants).selectinload(ProductVariant.images),
                    selectinload(Product.sustainability_scores)
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting product by id {id}: {str(e)}")
            raise

    async def get_product_by_sku(self, db: AsyncSession, sku: str) -> Optional[Product]:
        try:
            result = await db.execute(
                select(Product)
                .where(Product.sku == sku)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting product by SKU {sku}: {str(e)}")
            raise

    async def get_product_by_slug(self, db: AsyncSession, slug: str) -> Optional[Product]:
        try:
            result = await db.execute(
                select(Product)
                .where(Product.slug == slug)
                .options(
                    selectinload(Product.category),
                    selectinload(Product.brand),
                    selectinload(Product.images),
                    selectinload(Product.variants).selectinload(ProductVariant.images),
                    selectinload(Product.sustainability_scores)
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting product by slug {slug}: {str(e)}")
            raise

    async def create_product(self, db: AsyncSession, supplier_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_sku = await self.get_product_by_sku(db, product_data["sku"])
            if existing_sku:
                raise ConflictException("Product with this SKU already exists")
            if product_data.get("slug"):
                existing_slug = await self.get_product_by_slug(db, product_data["slug"])
                if existing_slug:
                    raise ConflictException("Product with this slug already exists")
            product_data["supplier_id"] = supplier_id
            product_data["status"] = ProductStatusEnum.DRAFT.value
            product_data["approval_status"] = ProductApprovalEnum.PENDING.value
            product_data["visibility"] = ProductVisibilityEnum.HIDDEN.value
            created_product = await self.create(db, product_data)
            result_dict = created_product.to_dict()
            product_image_crud = ProductImageCrud()
            images = await product_image_crud.get_product_images(db, created_product.id)
            result_dict["images"] = [img.to_dict() for img in images]
            logger.info(f"Product created: {created_product.id} by supplier {supplier_id}")
            return result_dict
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            raise

    async def update_product(self, db: AsyncSession, product_id: str, supplier_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_product = await self.get_by_id(db, product_id)
            if not existing_product:
                raise NotFoundException("Product not found")
            if str(existing_product.supplier_id) != supplier_id:
                raise AuthorizationException("You can only update your own products")
            if product_data.get("sku") and product_data.get("sku") != existing_product.sku:
                sku_check = await self.get_product_by_sku(db, product_data["sku"])
                if sku_check and str(sku_check.id) != product_id:
                    raise ConflictException("Product with this SKU already exists")
            if product_data.get("slug") and product_data.get("slug") != existing_product.slug:
                slug_check = await self.get_product_by_slug(db, product_data["slug"])
                if slug_check and str(slug_check.id) != product_id:
                    raise ConflictException("Product with this slug already exists")
            updated_product = await self.update(db, product_id, product_data)
            result_dict = updated_product.to_dict()
            product_image_crud = ProductImageCrud()
            images = await product_image_crud.get_product_images(db, product_id)
            result_dict["images"] = [img.to_dict() for img in images]
            logger.info(f"Product updated: {product_id} by supplier {supplier_id}")
            return result_dict
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {str(e)}")
            raise

    async def get_supplier_products(
        self,
        db: AsyncSession,
        supplier_id: str,
        pagination: PaginationParams,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> PaginatedResponse[Dict[str, Any]]:
        try:
            query = select(Product).where(Product.supplier_id == supplier_id)
            if status:
                query = query.where(Product.status == status)
            if search:
                search_term = f"%{search}%"
                query = query.where(
                    or_(
                        Product.name.ilike(search_term),
                        Product.sku.ilike(search_term),
                        Product.description.ilike(search_term)
                    )
                )
            query = query.options(
                selectinload(Product.category),
                selectinload(Product.brand),
                selectinload(Product.images)
            ).order_by(desc(Product.created_at))
            count_query = select(func.count()).select_from(Product).where(Product.supplier_id == supplier_id)
            if status:
                count_query = count_query.where(Product.status == status)
            if search:
                search_term = f"%{search}%"
                count_query = count_query.where(
                    or_(
                        Product.name.ilike(search_term),
                        Product.sku.ilike(search_term),
                        Product.description.ilike(search_term)
                    )
                )
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            products = result.scalars().all()
            products_data = []
            for product in products:
                product_dict = product.to_dict()
                product_dict["category"] = product.category.to_dict() if product.category else None
                product_dict["brand"] = product.brand.to_dict() if product.brand else None
                product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
                products_data.append(product_dict)
            return PaginatedResponse.create(
                items=products_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting supplier products for {supplier_id}: {str(e)}")
            raise

    async def get_public_products(
        self,
        db: Optional[AsyncSession],
        pagination: PaginationParams,
        category_id: Optional[str] = None,
        brand_id: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ) -> PaginatedResponse[Dict[str, Any]]:
        # PRIORITY: Use Supabase REST API (products are created via Supabase RPC)
        from app.core.config import settings
        import httpx
        
        supabase_url = (settings.SUPABASE_URL or "").strip()
        service_role_key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()
        
        if not supabase_url or not service_role_key:
            logger.warning(f"Supabase not configured - URL: {bool(supabase_url)}, Key: {bool(service_role_key)}")
            return PaginatedResponse[Dict[str, Any]](
                items=[],
                total=0,
                page=pagination.page,
                limit=pagination.limit,
                total_pages=0
            )
        
        if supabase_url and service_role_key:
            try:
                # Build Supabase REST API query using PostgREST syntax
                from urllib.parse import quote
                base_url = f"{supabase_url}/rest/v1/products"
                
                # Select specific columns - include all required fields for ProductListResponse
                select_cols = "id,supplier_id,name,slug,sku,price,short_description,category_id,brand_id,status,approval_status,visibility,created_at,tags"
                
                # Build the filtered query
                query_params = [f"select={select_cols}"]
                
                # DEBUG: Query all products first (client-side filtering workaround for PostgREST enum filter issue)
                debug_url_no_filters = f"{base_url}?select={select_cols}&limit=50"
                try:
                    async with httpx.AsyncClient(timeout=10.0) as debug_client:
                        debug_response = await debug_client.get(
                            debug_url_no_filters,
                            headers={
                                "apikey": service_role_key,
                                "Authorization": f"Bearer {service_role_key}",
                                "Content-Type": "application/json"
                            }
                        )
                        if debug_response.status_code == 200:
                            debug_data = debug_response.json()
                            if isinstance(debug_data, list) and len(debug_data) > 0:
                                # Filter client-side for products matching our criteria
                                matching = [p for p in debug_data if str(p.get('status', '')).upper() == 'ACTIVE' and str(p.get('approval_status', '')).upper() == 'APPROVED' and str(p.get('visibility', '')).upper() == 'VISIBLE']
                                if len(matching) > 0:
                                    logger.info(f"✅ Found {len(matching)} matching products (client-side filtered)")
                                    # Apply pagination
                                    start_idx = (pagination.page - 1) * pagination.limit
                                    end_idx = start_idx + pagination.limit
                                    paginated_products = matching[start_idx:end_idx]
                                    # Convert to response format - match ProductListResponse schema
                                    items = []
                                    for p in paginated_products:
                                        from datetime import datetime
                                        import json
                                        try:
                                            tags_list = json.loads(p.get("tags", "[]")) if isinstance(p.get("tags"), str) else (p.get("tags") or [])
                                        except:
                                            tags_list = []
                                        created_at_val = p.get("created_at")
                                        if isinstance(created_at_val, str):
                                            try:
                                                created_at_val = datetime.fromisoformat(created_at_val.replace("Z", "+00:00"))
                                            except:
                                                created_at_val = datetime.utcnow()
                                        elif created_at_val is None:
                                            created_at_val = datetime.utcnow()
                                        items.append({
                                            "id": str(p.get("id")),
                                            "supplier_id": str(p.get("supplier_id")) if p.get("supplier_id") else "00000000-0000-0000-0000-000000000000",
                                            "category_id": str(p.get("category_id")) if p.get("category_id") else "00000000-0000-0000-0000-000000000000",
                                            "brand_id": str(p.get("brand_id")) if p.get("brand_id") else None,
                                            "sku": p.get("sku", ""),
                                            "name": p.get("name", ""),
                                            "slug": p.get("slug", ""),
                                            "short_description": p.get("short_description") or None,
                                            "price": float(p.get("price", 0)),
                                            "compare_at_price": None,
                                            "status": p.get("status", "ACTIVE"),
                                            "approval_status": p.get("approval_status", "approved"),
                                            "visibility": p.get("visibility", "visible"),
                                            "tags": tags_list,
                                            "category": None,
                                            "brand": None,
                                            "images": [],
                                            "sustainability_scores": [],
                                            "created_at": created_at_val
                                        })
                                    return PaginatedResponse.create(
                                        items=items,
                                        total=len(matching),
                                        page=pagination.page,
                                        limit=pagination.limit
                                    )
                except Exception as debug_err:
                    logger.warning(f"Debug query failed: {debug_err}")
                
                # Continue with PostgREST query if client-side filtering didn't return results
                # Add filters for PostgREST query
                query_params.extend([
                    "status=eq.ACTIVE",
                    "approval_status=eq.approved",
                    "visibility=eq.visible"
                ])
                logger.info(f"Querying with filters: status=ACTIVE, approval_status=APPROVED, visibility=VISIBLE")
                print(f"🔍 Filters: status=ACTIVE, approval_status=APPROVED, visibility=VISIBLE")
                
                if category_id:
                    query_params.append(f"category_id=eq.{category_id}")
                if brand_id:
                    query_params.append(f"brand_id=eq.{brand_id}")
                if min_price is not None:
                    query_params.append(f"price=gte.{min_price}")
                if max_price is not None:
                    query_params.append(f"price=lte.{max_price}")
                if search:
                    # PostgREST search: use ilike with % wildcards
                    search_encoded = quote(f"%{search}%")
                    query_params.append(f"or=(name.ilike.{search_encoded},description.ilike.{search_encoded})")
                
                # Add ordering and pagination
                query_params.append(f"order={sort_by}.{sort_order}")
                query_params.append(f"limit={pagination.limit}")
                query_params.append(f"offset={(pagination.page - 1) * pagination.limit}")
                
                url = f"{base_url}?{'&'.join(query_params)}"
                logger.info(f"🔍 Querying Supabase REST API: {url[:300]}")
                print(f"🔍 Supabase query: {url[:300]}")
                
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(
                        url,
                        headers={
                            "apikey": service_role_key,
                            "Authorization": f"Bearer {service_role_key}",
                            "Content-Type": "application/json",
                            "Prefer": "count=exact"
                        }
                    )
                    
                    response_text = response.text
                    logger.info(f"Supabase response: status={response.status_code}, headers={dict(response.headers)}, body={response_text[:500]}")
                    print(f"📥 Supabase response: status={response.status_code}, body={response_text[:500]}")
                    
                    if response.status_code == 200:
                        try:
                            products_data = response.json()
                            if not isinstance(products_data, list):
                                logger.warning(f"Supabase returned non-list data: {type(products_data)}, value={products_data}")
                                products_data = []
                            
                            # Get total count from Content-Range header
                            content_range = response.headers.get("content-range", "")
                            total = len(products_data)
                            if content_range and "/" in content_range:
                                try:
                                    # Format: "0-4/100" means items 0-4 of 100 total
                                    total = int(content_range.split("/")[1])
                                    logger.info(f"Got total from Content-Range: {total}")
                                except Exception as range_err:
                                    logger.warning(f"Could not parse Content-Range '{content_range}': {range_err}")
                            
                            logger.info(f"Parsed {len(products_data)} products from Supabase response, total={total}")
                            if len(products_data) > 0:
                                logger.info(f"First product sample: status={products_data[0].get('status')}, approval_status={products_data[0].get('approval_status')}, visibility={products_data[0].get('visibility')}")
                            
                            # Convert to response format - match ProductListResponse schema
                            items = []
                            for p in products_data:
                                from datetime import datetime
                                import json
                                try:
                                    tags_list = json.loads(p.get("tags", "[]")) if isinstance(p.get("tags"), str) else (p.get("tags") or [])
                                except:
                                    tags_list = []
                                created_at_val = p.get("created_at")
                                if isinstance(created_at_val, str):
                                    try:
                                        created_at_val = datetime.fromisoformat(created_at_val.replace("Z", "+00:00"))
                                    except:
                                        created_at_val = datetime.utcnow()
                                elif created_at_val is None:
                                    created_at_val = datetime.utcnow()
                                items.append({
                                    "id": str(p.get("id")),
                                    "supplier_id": str(p.get("supplier_id")) if p.get("supplier_id") else "00000000-0000-0000-0000-000000000000",
                                    "category_id": str(p.get("category_id")) if p.get("category_id") else "00000000-0000-0000-0000-000000000000",
                                    "brand_id": str(p.get("brand_id")) if p.get("brand_id") else None,
                                    "sku": p.get("sku", ""),
                                    "name": p.get("name", ""),
                                    "slug": p.get("slug", ""),
                                    "short_description": p.get("short_description") or None,
                                    "price": float(p.get("price", 0)),
                                    "compare_at_price": None,
                                    "status": p.get("status", "ACTIVE"),
                                    "approval_status": p.get("approval_status", "approved"),
                                    "visibility": p.get("visibility", "visible"),
                                    "tags": tags_list,
                                    "category": None,
                                    "brand": None,
                                    "images": [],
                                    "sustainability_scores": [],
                                    "created_at": created_at_val
                                })
                            
                            logger.info(f"✅ Found {total} products from Supabase REST API")
                            return PaginatedResponse.create(
                                items=items,
                                total=total,
                                page=pagination.page,
                                limit=pagination.limit
                            )
                        except Exception as parse_error:
                            logger.error(f"Failed to parse Supabase response: {parse_error}, body: {response_text[:500]}")
                            # Don't raise - return empty instead
                            return PaginatedResponse[Dict[str, Any]](
                                items=[],
                                total=0,
                                page=pagination.page,
                                limit=pagination.limit,
                                total_pages=0
                            )
                    else:
                        error_msg = f"Supabase REST API returned {response.status_code}: {response_text[:500]}"
                        logger.error(error_msg)
                        # Don't raise - return empty instead
                        return PaginatedResponse[Dict[str, Any]](
                            items=[],
                            total=0,
                            page=pagination.page,
                            limit=pagination.limit,
                            total_pages=0
                        )
            except Exception as supabase_error:
                import traceback
                error_trace = traceback.format_exc()
                logger.error(f"❌ Supabase REST API query failed: {supabase_error}")
                logger.error(f"Error traceback: {error_trace}")
                print(f"❌ Supabase query error: {supabase_error}")
                print(f"Full traceback: {error_trace}")
                # Return empty instead of raising - Supabase only approach
                logger.warning("Returning empty products list due to Supabase query error")
                return PaginatedResponse[Dict[str, Any]](
                    items=[],
                    total=0,
                    page=pagination.page,
                    limit=pagination.limit,
                    total_pages=0
                )
        
        # If Supabase query failed, return empty (Supabase-only approach)
        logger.warning("Supabase query not available or failed, returning empty products list")
        return PaginatedResponse[Dict[str, Any]](
            items=[],
            total=0,
            page=pagination.page,
            limit=pagination.limit,
            total_pages=0
        )
        
        # REMOVED: Database fallback - using Supabase only
        # All product queries should go through Supabase REST API

    async def publish_product(self, db: AsyncSession, product_id: str, supplier_id: str) -> Dict[str, Any]:
        try:
            product = await self.get_by_id(db, product_id)
            if not product:
                raise NotFoundException("Product not found")
            if str(product.supplier_id) != supplier_id:
                raise AuthorizationException("You can only publish your own products")
            update_data = {
                "status": ProductStatusEnum.PENDING.value,
                "published_at": datetime.utcnow()
            }
            updated_product = await self.update(db, product_id, update_data)
            result_dict = updated_product.to_dict()
            product_image_crud = ProductImageCrud()
            images = await product_image_crud.get_product_images(db, product_id)
            result_dict["images"] = [img.to_dict() for img in images]
            logger.info(f"Product published: {product_id} by supplier {supplier_id}")
            return result_dict
        except Exception as e:
            logger.error(f"Error publishing product {product_id}: {str(e)}")
            raise

    async def approve_product(self, db: AsyncSession, product_id: str, admin_id: str, approval_notes: Optional[str] = None) -> Dict[str, Any]:
        try:
            product = await self.get_by_id(db, product_id)
            if not product:
                raise NotFoundException("Product not found")
            update_data = {
                "approval_status": ProductApprovalEnum.APPROVED.value,
                "status": ProductStatusEnum.ACTIVE.value,
                "visibility": ProductVisibilityEnum.VISIBLE.value,
                "approved_at": datetime.utcnow(),
                "approved_by": admin_id,
                "approval_notes": approval_notes
            }
            updated_product = await self.update(db, product_id, update_data)
            result_dict = updated_product.to_dict()
            product_image_crud = ProductImageCrud()
            images = await product_image_crud.get_product_images(db, product_id)
            result_dict["images"] = [img.to_dict() for img in images]
            logger.info(f"Product approved: {product_id} by admin {admin_id}")
            return result_dict
        except Exception as e:
            logger.error(f"Error approving product {product_id}: {str(e)}")
            raise

    async def reject_product(self, db: AsyncSession, product_id: str, admin_id: str, rejection_notes: str) -> Dict[str, Any]:
        try:
            product = await self.get_by_id(db, product_id)
            if not product:
                raise NotFoundException("Product not found")
            update_data = {
                "approval_status": ProductApprovalEnum.REJECTED.value,
                "status": ProductStatusEnum.REJECTED.value,
                "approved_by": admin_id,
                "approval_notes": rejection_notes
            }
            updated_product = await self.update(db, product_id, update_data)
            result_dict = updated_product.to_dict()
            product_image_crud = ProductImageCrud()
            images = await product_image_crud.get_product_images(db, product_id)
            result_dict["images"] = [img.to_dict() for img in images]
            logger.info(f"Product rejected: {product_id} by admin {admin_id}")
            return result_dict
        except Exception as e:
            logger.error(f"Error rejecting product {product_id}: {str(e)}")
            raise


class ProductImageCrud(BaseCrud[ProductImage]):
    def __init__(self):
        super().__init__(get_supabase_client(), ProductImage)

    async def get_product_images(self, db: AsyncSession, product_id: str) -> List[ProductImage]:
        try:
            result = await db.execute(
                select(ProductImage)
                .where(ProductImage.product_id == product_id)
                .order_by(ProductImage.sort_order, ProductImage.created_at)
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error getting images for product {product_id}: {str(e)}")
            raise

    async def delete_product_image(self, db: AsyncSession, image_id: str, supplier_id: str = None) -> bool:
        try:
            image = await self.get_by_id(db, image_id)
            if not image:
                raise NotFoundException("Image not found")
            if supplier_id:
                product = await db.execute(
                    select(Product).where(Product.id == image.product_id)
                )
                product = product.scalar_one_or_none()
                
                if not product or str(product.supplier_id) != supplier_id:
                    raise AuthorizationException("You can only delete images from your own products")
            await self.delete(db, image_id)
            return True
        except Exception as e:
            logger.error(f"Error deleting image {image_id}: {str(e)}")
            raise

    async def delete_product_image_simple(self, db: AsyncSession, image_id: str) -> bool:
        try:
            result = await db.execute(
                select(ProductImage).where(ProductImage.id == image_id)
            )
            image = result.scalar_one_or_none()
            if not image:
                raise NotFoundException("Image not found")
            await db.delete(image)
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting image {image_id}: {str(e)}")
            raise

    async def get_supplier_products_paginated(
        self,
        db: AsyncSession,
        supplier_id: Optional[str],
        pagination: PaginationParams,
        status: Optional[str] = None
    ) -> tuple[List[Dict[str, Any]], int]:
        try:
            query = select(Product)
            if supplier_id:
                query = query.where(Product.supplier_id == supplier_id)
            if status:
                query = query.where(Product.approval_status == status)
                
            query = query.options(
                selectinload(Product.category),
                selectinload(Product.brand),
                selectinload(Product.images)
            ).order_by(desc(Product.created_at))
            count_query = select(func.count()).select_from(Product)
            if supplier_id:
                count_query = count_query.where(Product.supplier_id == supplier_id)
            if status:
                count_query = count_query.where(Product.approval_status == status)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            products = result.scalars().all()
            products_data = []
            for product in products:
                product_dict = product.to_dict()
                product_dict["category"] = product.category.to_dict() if product.category else None
                product_dict["brand"] = product.brand.to_dict() if product.brand else None
                product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
                products_data.append(product_dict)
            return products_data, total
        except Exception as e:
            logger.error(f"Error getting paginated products: {str(e)}")
            raise

    async def get_products_paginated(
        self,
        db: AsyncSession,
        pagination: PaginationParams
    ) -> tuple[List[Dict[str, Any]], int]:
        try:
            query = select(Product).options(
                selectinload(Product.category),
                selectinload(Product.brand),
                selectinload(Product.images)
            ).order_by(desc(Product.created_at))
            count_query = select(func.count()).select_from(Product)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            products = result.scalars().all()
            products_data = []
            for product in products:
                product_dict = product.to_dict()
                product_dict["category"] = product.category.to_dict() if product.category else None
                product_dict["brand"] = product.brand.to_dict() if product.brand else None
                product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
                products_data.append(product_dict)
            return products_data, total
        except Exception as e:
            logger.error(f"Error getting all products paginated: {str(e)}")
            raise