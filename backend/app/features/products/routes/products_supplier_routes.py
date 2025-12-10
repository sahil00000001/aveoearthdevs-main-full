from typing import Dict, Any, Optional, List, Union
from datetime import timedelta
import asyncio
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.role_auth import require_supplier
from app.core.pagination import PaginationParams
from app.database.session import get_async_session
from app.core.exceptions import ValidationException, NotFoundException, AuthorizationException, ConflictException, BadRequestException
from app.core.logging import get_logger
from app.core.supabase_storage import (
    SupabaseStorageClient,
    validate_image_file,
    extract_blob_path_from_url,
    list_images,
    upload_product_image
)
from app.features.products.cruds.product_crud import ProductCrud, ProductImageCrud
from app.features.products.cruds.category_crud import CategoryCrud
from app.features.products.cruds.brand_crud import BrandCrud
from app.features.products.cruds.product_inventory_crud import ProductInventoryCrud
from app.features.products.cruds.product_view_crud import ProductViewCrud
from app.features.products.cruds.product_variant_crud import ProductVariantCrud, ProductVariantImageCrud
from app.features.products.cruds.product_analytics_crud import ProductAnalyticsCrud, ProductPriceHistoryCrud
from app.features.products.requests.product_request import (
    ProductInventoryUpdateRequest
)
from app.features.products.requests.product_variant_request import (
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest
)
from app.features.products.responses.product_response import (
    ProductResponse,
    ProductDetailResponse,
    ProductListResponse
)
from app.features.products.responses.category_response import CategoryResponse
from app.features.products.responses.brand_response import BrandResponse
from app.features.products.responses.analytics_response import SupplierAnalyticsResponse
from app.core.pagination import PaginatedResponse
from app.core.base import SuccessResponse
from app.core.config import settings
import os
import uuid
from datetime import datetime

products_supplier_router = APIRouter(prefix="/supplier/products", tags=["Supplier Products"])
logger = get_logger("products.supplier")

@products_supplier_router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    request: Request,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    # Determine content type and extract fields
    content_type = request.headers.get("content-type", "").lower()
    form = None
    json_body: Dict[str, Any] = {}
    images: Optional[List[UploadFile]] = None

    if content_type.startswith("application/json"):
        try:
            json_body = await request.json()
        except Exception:
            json_body = {}
    else:
        try:
            form = await request.form()
            # Collect files if present
            images = form.getlist("images") if "images" in form else None
        except Exception:
            form = None

    # Helper to fetch field from form/json with default
    def get_field(key: str, default: Any = None):
        if form is not None and key in form:
            return form.get(key)
        return json_body.get(key, default)

    name = get_field("name")
    category_id = get_field("category_id")
    sku = get_field("sku")
    price = get_field("price")
    try:
        price = float(price) if price is not None else None
    except Exception:
        pass
    brand_id = get_field("brand_id")
    short_description = get_field("short_description")
    description = get_field("description")
    compare_at_price = get_field("compare_at_price")
    try:
        if isinstance(compare_at_price, str) and compare_at_price.strip():
            compare_at_price = float(compare_at_price)
    except Exception:
        pass
    cost_per_item = get_field("cost_per_item")
    try:
        if isinstance(cost_per_item, str) and cost_per_item.strip():
            cost_per_item = float(cost_per_item)
    except Exception:
        pass
    track_quantity = get_field("track_quantity", True)
    if isinstance(track_quantity, str):
        track_quantity = track_quantity.lower() in ("1","true","yes","on")
    continue_selling = get_field("continue_selling", False)
    if isinstance(continue_selling, str):
        continue_selling = continue_selling.lower() in ("1","true","yes","on")
    weight = get_field("weight")
    dimensions = get_field("dimensions")
    materials = get_field("materials")
    care_instructions = get_field("care_instructions")
    origin_country = get_field("origin_country")
    manufacturing_details = get_field("manufacturing_details")
    visibility = get_field("visibility", "visible")
    tags = get_field("tags")
    seo_meta = get_field("seo_meta")

    # In DEBUG/local mode, allow creating products without real storage/DB by using placeholders
    allow_fake = settings.DEBUG and os.getenv("ALLOW_FAKE_UPLOADS", "true").lower() in ("1", "true", "yes")
    
    if (not images or len(images) == 0) and not allow_fake:
        raise ValidationException("At least one product image is required.")
    
    product_data = {
        "name": name,
        "category_id": category_id if category_id and category_id != "0" else None,
        "sku": sku,
        "slug": name.lower().replace(" ", "-").replace("_", "-"),
        "price": price,
        "brand_id": brand_id if brand_id and brand_id != "0" else None,
        "short_description": short_description,
        "description": description,
        "compare_at_price": compare_at_price,
        "cost_per_item": cost_per_item,
        "track_quantity": track_quantity,
        "continue_selling": continue_selling,
        "weight": weight,
        "care_instructions": care_instructions,
        "origin_country": origin_country,
        "visibility": visibility
    }
    
    if dimensions and dimensions.strip():
        try:
            product_data["dimensions"] = json.loads(dimensions)
        except json.JSONDecodeError:
            raise ValidationException("Invalid dimensions JSON")
    
    if materials and materials.strip():
        try:
            product_data["materials"] = json.loads(materials)
        except json.JSONDecodeError:
            raise ValidationException("Invalid materials JSON")
            
    if manufacturing_details and manufacturing_details.strip():
        try:
            product_data["manufacturing_details"] = json.loads(manufacturing_details)
        except json.JSONDecodeError:
            raise ValidationException("Invalid manufacturing details JSON")
            
    if tags and tags.strip():
        try:
            product_data["tags"] = json.loads(tags)
        except json.JSONDecodeError:
            raise ValidationException("Invalid tags JSON")
            
    if seo_meta and seo_meta.strip():
        try:
            product_data["seo_meta"] = json.loads(seo_meta)
        except json.JSONDecodeError:
            raise ValidationException("Invalid SEO meta JSON")
    
    product_crud = ProductCrud()
    category_crud = CategoryCrud()
    
    if category_id and not allow_fake:
        category = await category_crud.get_by_id(db, category_id)
        if not category:
            raise ValidationException("Category not found")
    
    if brand_id and not allow_fake:
        brand_crud = BrandCrud()
        brand = await brand_crud.get_by_id(db, brand_id)
        if not brand:
            raise ValidationException("Brand not found")
    
    uploaded_images = []
    upload_errors = []
    
    async def upload_single_image(i: int, image: UploadFile):
        if image and image.filename and image.filename.strip():
            try:
                image_url = await upload_product_image(image, current_user['id'])
                return {
                    "url": image_url,
                    "alt_text": f"{name} image {i+1}",
                    "sort_order": i,
                    "is_primary": i == 0
                }, None
            except Exception as e:
                return None, f"Failed to upload image {i+1} ({image.filename}): {str(e)}"
        else:
            return None, f"Invalid image at position {i+1}: not a valid file upload"
    
    upload_results = []
    if images and len(images) > 0:
        upload_results = await asyncio.gather(*[upload_single_image(i, image) for i, image in enumerate(images)], return_exceptions=True)
    
    for result in upload_results:
        if isinstance(result, Exception):
            upload_errors.append(f"Upload failed with exception: {str(result)}")
        else:
            uploaded_img, error = result
            if uploaded_img:
                uploaded_images.append(uploaded_img)
            if error:
                upload_errors.append(error)
    
    if upload_errors and not allow_fake:
        storage_client = SupabaseStorageClient()
        for uploaded_img in uploaded_images:
            try:
                blob_path = extract_blob_path_from_url(uploaded_img["url"])[1]
                storage_client.delete_file("product-assets", blob_path)
            except:
                pass
        raise ValidationException(f"Image upload failed: {'; '.join(upload_errors)}")
    
    if not uploaded_images and not allow_fake:
        raise ValidationException("No images were successfully uploaded.")
    
    if product_data["price"] == 0 and not allow_fake:
        if product_data["compare_at_price"] and product_data["compare_at_price"] > 0:
            raise ValidationException("If price is 0, compare_at_price must also be 0 or not set.")
    if product_data["compare_at_price"] and product_data["compare_at_price"] > 0 and not allow_fake:
        if not product_data["price"] or product_data["price"] <= 0:
            raise ValidationException("If compare_at_price is set, price must be greater than 0.")
        if product_data["price"] >= product_data["compare_at_price"]:
            raise ValidationException("Price must be less than compare_at_price.")

    try:
        # SUPABASE ONLY: Use Supabase RPC for product creation (like bulk upload)
        service_role_key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()
        supabase_url = (settings.SUPABASE_URL or "").strip()
        
        if supabase_url and service_role_key and not allow_fake:
            # Ensure supplier exists in Supabase Auth
            try:
                from supabase import create_client
                admin_client = create_client(supabase_url, service_role_key)
                try:
                    auth_user = admin_client.auth.admin.get_user_by_id(current_user["id"])
                    if not auth_user or not auth_user.user:
                        logger.info(f"Creating supplier in Supabase Auth: {current_user['id']}")
                        admin_client.auth.admin.create_user({
                            "id": current_user["id"],
                            "email": f"supplier-{current_user['id']}@example.com",
                            "password": "TempPassword123!",
                            "email_confirm": True,
                            "user_metadata": {"user_type": "supplier"}
                        })
                except Exception as e:
                    logger.warning(f"Supplier auth check/create: {e}")
            except Exception as e:
                logger.warning(f"Supabase auth setup failed: {e}")
            
            # Create product via Supabase RPC
            try:
                product_uuid = str(uuid.uuid4())
                now = datetime.utcnow()
                
                rpc_payload = {
                    "p_id": product_uuid,
                    "p_name": name,
                    "p_sku": sku,
                    "p_slug": product_data["slug"],
                    "p_price": float(price) if price else 0.0,
                    "p_short_description": short_description or "",
                    "p_description": description or "",
                    "p_category_id": product_data.get("category_id"),
                    "p_brand_id": product_data.get("brand_id"),
                    "p_supplier_id": current_user["id"],
                    "p_status": "ACTIVE",
                    "p_approval_status": "approved",
                    "p_visibility": visibility if visibility else "visible",
                    "p_tags": json.dumps(tags) if tags else json.dumps([]),
                    "p_created_at": now.isoformat(),
                    "p_updated_at": now.isoformat()
                }
                
                rpc_url = f"{supabase_url}/rest/v1/rpc/insert_product_bulk"
                import httpx
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        rpc_url,
                        json=rpc_payload,
                        headers={
                            "apikey": service_role_key,
                            "Authorization": f"Bearer {service_role_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        }
                    )
                    
                    if response.status_code in [200, 201]:
                        created_id = response.json()
                        if isinstance(created_id, list) and len(created_id) > 0:
                            created_id = created_id[0]
                        if isinstance(created_id, dict):
                            created_id = created_id.get("insert_product_bulk") or created_id.get("id")
                        product_id = str(created_id) if created_id else product_uuid
                        
                        result = {
                            "id": product_id,
                            "supplier_id": current_user["id"],
                            "category_id": product_data.get("category_id"),
                            "brand_id": product_data.get("brand_id"),
                            "sku": sku,
                            "name": name,
                            "slug": product_data["slug"],
                            "short_description": short_description,
                            "description": description,
                            "price": float(price) if price else 0.0,
                            "compare_at_price": compare_at_price,
                            "cost_per_item": cost_per_item,
                            "track_quantity": bool(track_quantity),
                            "continue_selling": bool(continue_selling),
                            "weight": weight,
                            "dimensions": product_data.get("dimensions", {}),
                            "materials": product_data.get("materials", []),
                            "care_instructions": product_data.get("care_instructions"),
                            "origin_country": product_data.get("origin_country"),
                            "manufacturing_details": product_data.get("manufacturing_details", {}),
                            "status": "ACTIVE",
                            "approval_status": "approved",
                            "visibility": visibility if visibility else "visible",
                            "tags": tags if tags else [],
                            "seo_meta": product_data.get("seo_meta", {}),
                            "images": uploaded_images,
                            "created_at": now,
                            "updated_at": now
                        }
                        logger.info(f"✅ Product created via Supabase RPC: {product_id}")
                        return result
                    else:
                        error_text = response.text[:500]
                        logger.error(f"Supabase RPC failed: {response.status_code} - {error_text}")
                        raise ValidationException(f"Failed to create product: {error_text}")
            except Exception as supabase_error:
                logger.error(f"Supabase product creation failed: {supabase_error}")
                raise ValidationException(f"Failed to create product via Supabase: {str(supabase_error)}")
        
        # If running in fake mode, bypass DB/storage and return a synthetic product
        if allow_fake:
            from app.core.memory_store import memory_store
            fake_id = str(uuid.uuid4())
            now = datetime.utcnow()
            placeholder_image = {
                "id": str(uuid.uuid4()),
                "url": os.getenv("PLACEHOLDER_IMAGE_URL", "http://localhost:5173/placeholder-product.jpg"),
                "alt_text": f"{name} image 1",
                "sort_order": 0,
                "is_primary": True,
            }
            result = {
                "id": fake_id,
                "supplier_id": current_user["id"],
                "category_id": product_data.get("category_id") or "00000000-0000-0000-0000-000000000001",
                "brand_id": product_data.get("brand_id"),
                "sku": sku,
                "name": name,
                "slug": product_data["slug"],
                "short_description": short_description,
                "description": description,
                "price": price or 0.0,
                "compare_at_price": compare_at_price,
                "cost_per_item": cost_per_item,
                "track_quantity": bool(track_quantity),
                "continue_selling": bool(continue_selling),
                "weight": weight,
                "dimensions": {},
                "materials": [],
                "care_instructions": product_data.get("care_instructions"),
                "origin_country": product_data.get("origin_country"),
                "manufacturing_details": {},
                "status": "ACTIVE",  # Make it active so it shows in listings
                "approval_status": "approved",
                "approval_notes": None,
                "approved_at": now,
                "approved_by": None,
                "visibility": "visible",  # Make it visible so it shows in listings
                "published_at": now,
                "tags": [],
                "seo_meta": {},
                "images": [placeholder_image],
                "created_at": now,
                "updated_at": now,
            }
            # Store in memory so it appears in listings
            memory_store.add_product(result)
        else:
            result = await product_crud.create_product(db, current_user["id"], product_data)
        
        if uploaded_images and not allow_fake:
            product_image_crud = ProductImageCrud()
            created_images = []
            for image_data in uploaded_images:
                image_record = {
                    "product_id": result["id"],
                    "url": image_data["url"],
                    "alt_text": image_data["alt_text"],
                    "sort_order": image_data["sort_order"],
                    "is_primary": image_data["is_primary"]
                }
                created_image = await product_image_crud.create(db, image_record)
                created_images.append(created_image.to_dict())
            result["images"] = created_images
        
        if not allow_fake:
            await db.commit()
        
        try:
            return ProductResponse(**result)
        except Exception as e:
            logger.error(f"Error creating ProductResponse: {str(e)}")
            raise ValidationException(f"Error processing product data: {str(e)}")
    except Exception as e:
        if allow_fake:
            # As a last resort, return a minimal acceptable response
            fake_id = str(uuid.uuid4())
            now = datetime.utcnow()
            result = {
                "id": fake_id,
                "supplier_id": current_user["id"],
                "category_id": product_data.get("category_id") or "00000000-0000-0000-0000-000000000001",
                "brand_id": product_data.get("brand_id"),
                "sku": sku,
                "name": name,
                "slug": product_data.get("slug", name.lower().replace(" ", "-")),
                "short_description": short_description,
                "description": description,
                "price": price or 0.0,
                "compare_at_price": compare_at_price,
                "cost_per_item": cost_per_item,
                "track_quantity": bool(track_quantity),
                "continue_selling": bool(continue_selling),
                "weight": weight,
                "dimensions": {},
                "materials": [],
                "care_instructions": product_data.get("care_instructions"),
                "origin_country": product_data.get("origin_country"),
                "manufacturing_details": {},
                "status": "DRAFT",
                "approval_status": "approved",
                "approval_notes": None,
                "approved_at": None,
                "approved_by": None,
                "visibility": product_data.get("visibility", "visible"),
                "published_at": None,
                "tags": [],
                "seo_meta": {},
                "images": [{
                    "id": str(uuid.uuid4()),
                    "url": os.getenv("PLACEHOLDER_IMAGE_URL", "http://localhost:5173/placeholder-product.jpg"),
                    "alt_text": f"{name} image 1",
                    "sort_order": 0,
                    "is_primary": True,
                }],
                "created_at": now,
                "updated_at": now,
            }
            return ProductResponse(**result)
        else:
            await db.rollback()
            storage_client = SupabaseStorageClient()
            for uploaded_img in uploaded_images:
                try:
                    blob_path = extract_blob_path_from_url(uploaded_img["url"])[1]
                    storage_client.delete_file("product-assets", blob_path)
                except:
                    pass
            logger.error(f"Error creating product: {str(e)}")
            raise BadRequestException(f"Failed to create product: {str(e)}")

@products_supplier_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_async_session)
):
    category_crud = CategoryCrud()
    categories = await category_crud.get_categories_tree(db)
    result = []
    for cat in categories:
        try:
            result.append(CategoryResponse(**cat))
        except Exception as e:
            logger.error(f"Error creating CategoryResponse: {str(e)}")
            continue
    return result

@products_supplier_router.get("/brands", response_model=List[BrandResponse])
async def get_brands(
    db: AsyncSession = Depends(get_async_session)
):
    brand_crud = BrandCrud()
    brands = await brand_crud.get_active_brands(db)
    result = []
    for brand in brands:
        try:
            result.append(BrandResponse(**brand))
        except Exception as e:
            logger.error(f"Error creating BrandResponse: {str(e)}")
            continue
    return result

@products_supplier_router.get("/", response_model=PaginatedResponse[ProductListResponse])
async def get_supplier_products(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        pagination = PaginationParams(page=page, limit=limit)
        product_crud = ProductCrud()
        return await product_crud.get_supplier_products(
            db, current_user["id"], pagination, status_filter, search
        )
    except Exception as e:
        logger.error(f"Database error in get_supplier_products: {str(e)}")
        # Return empty results when database is not available
        return PaginatedResponse[ProductListResponse].create(
            items=[],
            total=0,
            page=page,
            limit=limit
        )

@products_supplier_router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view your own products")
    
    product_dict = product.to_dict()
    product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
    return ProductDetailResponse(**product_dict)

@products_supplier_router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    sku: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    brand_id: Union[str, None] = Form(None),
    short_description: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    compare_at_price: Optional[float] = Form(None),
    cost_per_item: Optional[float] = Form(None),
    track_quantity: Optional[bool] = Form(None),
    continue_selling: Optional[bool] = Form(None),
    weight: Optional[float] = Form(None),
    dimensions: Union[str, None] = Form(None),
    materials: Union[str, None] = Form(None),
    care_instructions: Union[str, None] = Form(None),
    origin_country: Union[str, None] = Form(None),
    manufacturing_details: Union[str, None] = Form(None),
    visibility: Union[str, None] = Form(None),
    tags: Union[str, None] = Form(None),
    seo_meta: Union[str, None] = Form(None),
    new_images: Union[List[UploadFile], List[str], None] = File(default=None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")

    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update your own products")

    update_data = {}
    if name is not None:
        update_data["name"] = name
        update_data["slug"] = name.lower().replace(" ", "-").replace("_", "-")
    if category_id is not None:
        update_data["category_id"] = category_id if category_id and category_id != "0" else None
    if sku is not None:
        update_data["sku"] = sku
    if price is not None:
        update_data["price"] = price
    if brand_id is not None:
        update_data["brand_id"] = brand_id if brand_id and brand_id != "0" else None
    if short_description is not None:
        update_data["short_description"] = short_description
    if description is not None:
        update_data["description"] = description
    if compare_at_price is not None:
        update_data["compare_at_price"] = compare_at_price
    if cost_per_item is not None:
        update_data["cost_per_item"] = cost_per_item
    if track_quantity is not None:
        update_data["track_quantity"] = track_quantity
    if continue_selling is not None:
        update_data["continue_selling"] = continue_selling
    if weight is not None:
        update_data["weight"] = weight
    if care_instructions is not None:
        update_data["care_instructions"] = care_instructions
    if origin_country is not None:
        update_data["origin_country"] = origin_country
    if visibility is not None:
        update_data["visibility"] = visibility
    
    if dimensions is not None and dimensions.strip():
        try:
            update_data["dimensions"] = json.loads(dimensions)
        except json.JSONDecodeError:
            raise ValidationException("Invalid dimensions JSON")
    
    if materials is not None and materials.strip():
        try:
            update_data["materials"] = json.loads(materials)
        except json.JSONDecodeError:
            raise ValidationException("Invalid materials JSON")
            
    if manufacturing_details is not None and manufacturing_details.strip():
        try:
            update_data["manufacturing_details"] = json.loads(manufacturing_details)
        except json.JSONDecodeError:
            raise ValidationException("Invalid manufacturing details JSON")
            
    if tags is not None and tags.strip():
        try:
            update_data["tags"] = json.loads(tags)
        except json.JSONDecodeError:
            raise ValidationException("Invalid tags JSON")
            
    if seo_meta is not None and seo_meta.strip():
        try:
            update_data["seo_meta"] = json.loads(seo_meta)
        except json.JSONDecodeError:
            raise ValidationException("Invalid SEO meta JSON")
    
    if new_images:
        storage_client = SupabaseStorageClient()
        
        if product.images:
            for img in product.images:
                if img.url:
                    try:
                        blob_path = extract_blob_path_from_url(img.url)[1]
                        storage_client.delete_file("product-assets", blob_path)
                    except:
                        pass
        
        uploaded_images = []
        
        for i, image in enumerate(new_images):
            if isinstance(image, UploadFile):
                try:
                    image_url = await upload_product_image(image, current_user['id'])
                    uploaded_images.append({
                        "url": image_url,
                        "alt_text": f"{update_data.get('name', product.name)} image {i+1}",
                        "sort_order": i,
                        "is_primary": False
                    })
                except Exception as e:
                    for uploaded_img in uploaded_images:
                        try:
                            blob_path = extract_blob_path_from_url(uploaded_img["url"])[1]
                            storage_client.delete_file("product-assets", blob_path)
                        except:
                            pass
                    logger.error(f"Failed to upload image {i}: {str(e)}")
                    raise ValidationException(f"Failed to upload image {i+1}: {str(e)}")
        
        update_data["new_images"] = uploaded_images
    
    # Price consistency enforcement
    price_val = update_data.get("price", product.price)
    compare_val = update_data.get("compare_at_price", product.compare_at_price)
    if price_val == 0:
        if compare_val and compare_val > 0:
            raise ValidationException("If price is 0, compare_at_price must also be 0 or not set.")
    if compare_val and compare_val > 0:
        if not price_val or price_val <= 0:
            raise ValidationException("If compare_at_price is set, price must be greater than 0.")
        if price_val >= compare_val:
            raise ValidationException("Price must be less than compare_at_price.")
    try:
        result = await product_crud.update_product(db, product_id, current_user["id"], update_data)
        try:
            return ProductResponse(**result)
        except Exception as e:
            logger.error(f"Error creating ProductResponse: {str(e)}")
            raise ValidationException(f"Error processing product data: {str(e)}")
    except Exception as e:
        if new_images and "new_images" in update_data:
            storage_client = SupabaseStorageClient()
            for uploaded_img in update_data["new_images"]:
                try:
                    blob_path = extract_blob_path_from_url(uploaded_img["url"])[1]
                    storage_client.delete_file("product-assets", blob_path)
                except:
                    pass
        logger.error(f"Error updating product: {str(e)}")
        raise BadRequestException(f"Failed to update product: {str(e)}")

@products_supplier_router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only delete your own products")
    
    storage_client = SupabaseStorageClient()
    
    if product.images:
        for img in product.images:
            if img.url:
                try:
                    blob_path = extract_blob_path_from_url(img.url)[1]
                    storage_client.delete_file("product-assets", blob_path)
                except:
                    pass
    
    if product.variants:
        for variant in product.variants:
            if hasattr(variant, 'images') and variant.images:
                for variant_img in variant.images:
                    if variant_img.url:
                        try:
                            blob_path = extract_blob_path_from_url(variant_img.url)[1]
                            storage_client.delete_file("product-assets", blob_path)
                        except:
                            pass
    
    await product_crud.delete(db, product_id)
    return SuccessResponse(message="Product deleted successfully")

@products_supplier_router.post("/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product_data = await product_crud.publish_product(db, product_id, current_user["id"])
    try:
        return ProductResponse(**product_data)
    except Exception as e:
        logger.error(f"Error creating ProductResponse: {str(e)}")
        raise ValidationException(f"Error processing product data: {str(e)}")

@products_supplier_router.post("/{product_id}/images")
async def upload_product_images(
    product_id: str,
    image: Union[UploadFile, str, None] = File(default=None),
    alt_text: Union[str, None] = Form(None),
    is_primary: bool = Form(False),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")

    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only upload images for your own products")

    if not image or not isinstance(image, UploadFile):
        raise ValidationException("Image file is required")
    
    validate_image_file(image)
    
    uploaded_image_url = None
    try:
        image_url = await upload_product_image(image, current_user['id'])
        uploaded_image_url = image_url
        
        image_data = {
            "product_id": product_id,
            "url": image_url,
            "alt_text": alt_text or f"{product.name} image",
            "is_primary": is_primary,
            "sort_order": 0
        }
        
        from app.features.products.cruds.product_crud import ProductImageCrud
        image_crud = ProductImageCrud()
        
        created_image = await image_crud.create(db, image_data)
        await db.commit()
        
        return {
            "message": "Image uploaded successfully",
            "image": {
                "id": str(created_image.id),
                "url": image_url,
                "alt_text": alt_text,
                "is_primary": is_primary
            }
        }
    except Exception as e:
        await db.rollback()
        if uploaded_image_url:
            try:
                storage_client = SupabaseStorageClient()
                blob_path = extract_blob_path_from_url(uploaded_image_url)[1]
                storage_client.delete_file("product-assets", blob_path)
            except:
                pass
        logger.error(f"Failed to upload image: {str(e)}")
        raise ValidationException(f"Failed to upload image: {str(e)}")

@products_supplier_router.put("/{product_id}/inventory", response_model=Dict[str, Any])
async def update_product_inventory(
    product_id: str,
    request: ProductInventoryUpdateRequest,
    variant_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update inventory for your own products")
    
    inventory_crud = ProductInventoryCrud()
    inventory_data = await inventory_crud.update_inventory(
        db, product_id, request.quantity, variant_id, request.location
    )
    return inventory_data

@products_supplier_router.get("/analytics/overview", response_model=SupplierAnalyticsResponse)
async def get_supplier_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    view_crud = ProductViewCrud()
    analytics_data = await view_crud.get_supplier_analytics(db, current_user["id"], days)
    try:
        return SupplierAnalyticsResponse(**analytics_data)
    except Exception as e:
        logger.error(f"Error creating SupplierAnalyticsResponse: {str(e)}")
        raise ValidationException(f"Error processing analytics data: {str(e)}")

@products_supplier_router.get("/inventory/low-stock")
async def get_low_stock_products(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    inventory_crud = ProductInventoryCrud()
    low_stock_products = await inventory_crud.get_low_stock_products(db, current_user["id"])
    return {"low_stock_products": low_stock_products}

@products_supplier_router.get("/images/product-images")
async def list_product_images(
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    try:
        images = list_images("product-assets", "products/")
        return {"bucket": "product-assets", "images": images, "total": len(images)}
    except Exception as e:
        logger.error(f"Failed to list product images: {str(e)}")
        raise ValidationException(f"Failed to list product images: {str(e)}")

@products_supplier_router.delete("/images/product-images/{file_name}")
async def delete_product_image(
    file_name: str,
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    storage_client = SupabaseStorageClient()
    try:
        result = storage_client.delete_file("product-assets", file_name)
        if result:
            logger.info(f"Product image {file_name} deleted by supplier {current_user['id']}")
            return SuccessResponse(message=f"Image {file_name} deleted successfully")
        else:
            raise NotFoundException(f"Image {file_name} not found")
    except Exception as e:
        logger.error(f"Failed to delete product image {file_name}: {str(e)}")
        raise ValidationException(f"Failed to delete image: {str(e)}")

@products_supplier_router.get("/images/supplier-business-assets")
async def list_business_images(
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    try:
        images = list_images("supplier-assets")
        return {"bucket": "supplier-assets", "images": images, "total": len(images)}
    except Exception as e:
        logger.error(f"Failed to list business images: {str(e)}")
        raise ValidationException(f"Failed to list business images: {str(e)}")

@products_supplier_router.delete("/images/supplier-business-assets/{file_name}")
async def delete_business_image(
    file_name: str,
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    storage_client = SupabaseStorageClient()
    try:
        result = storage_client.delete_file("supplier-assets", file_name)
        if result:
            logger.info(f"Business image {file_name} deleted by supplier {current_user['id']}")
            return SuccessResponse(message=f"Image {file_name} deleted successfully")
        else:
            raise NotFoundException(f"Image {file_name} not found")
    except Exception as e:
        logger.error(f"Failed to delete business image {file_name}: {str(e)}")
        raise ValidationException(f"Failed to delete image: {str(e)}")

@products_supplier_router.get("/{product_id}/images")
async def get_product_images(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("Not authorized to access this product")
    
    images = []
    if product.images:
        for img in product.images:
            images.append({
                "id": str(img.id),
                "url": img.url,
                "alt_text": img.alt_text,
                "display_order": img.display_order,
                "is_primary": img.is_primary
            })
    
    return {"product_id": product_id, "images": images, "total": len(images)}

@products_supplier_router.delete("/{product_id}/images/{image_id}")
async def delete_product_image_by_id(
    product_id: str,
    image_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("Not authorized to access this product")
    
    image_to_delete = None
    for img in product.images:
        if str(img.id) == image_id:
            image_to_delete = img
            break
    
    if not image_to_delete:
        raise NotFoundException("Image not found")
    
    try:
        if image_to_delete.url:
            storage_client = SupabaseStorageClient()
            blob_path = extract_blob_path_from_url(image_to_delete.url)[1]
            storage_client.delete_file("product-assets", blob_path)
        
        await product_crud.delete_product_image_simple(db, image_id)
        logger.info(f"Product image {image_id} deleted by supplier {current_user['id']}")
        return SuccessResponse(message="Product image deleted successfully")
    except Exception as e:
        logger.error(f"Failed to delete product image {image_id}: {str(e)}")
        raise ValidationException(f"Failed to delete product image: {str(e)}")

@products_supplier_router.post("/{product_id}/variants", status_code=status.HTTP_201_CREATED)
async def create_product_variant(
    product_id: str,
    sku: str = Form(...),
    title: Optional[str] = Form(None),
    price: float = Form(...),
    compare_at_price: Optional[float] = Form(None),
    weight: Optional[float] = Form(None),
    dimensions: Optional[str] = Form(None),
    option1_name: Optional[str] = Form(None),
    option1_value: Optional[str] = Form(None),
    option2_name: Optional[str] = Form(None),
    option2_value: Optional[str] = Form(None),
    option3_name: Optional[str] = Form(None),
    option3_value: Optional[str] = Form(None),
    is_default: bool = Form(False),
    images: List[UploadFile] = File([]),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only create variants for your own products")
    
    variant_data = {
        "sku": sku,
        "title": title,
        "price": price,
        "compare_at_price": compare_at_price,
        "weight": weight,
        "option1_name": option1_name,
        "option1_value": option1_value,
        "option2_name": option2_name,
        "option2_value": option2_value,
        "option3_name": option3_name,
        "option3_value": option3_value,
        "is_default": is_default
    }
    
    if dimensions and dimensions.strip():
        try:
            variant_data["dimensions"] = json.loads(dimensions)
        except json.JSONDecodeError:
            raise ValidationException("Invalid dimensions JSON")
    
    variant_crud = ProductVariantCrud()
    
    try:
        created_variant = await variant_crud.create_variant(db, product_id, variant_data)
        
        if images and len(images) > 0:
            variant_image_crud = ProductVariantImageCrud()
            uploaded_images = await variant_image_crud.upload_variant_images(
                db, created_variant["id"], product_id, images, current_user["id"]
            )
            created_variant["images"] = uploaded_images
        
        await db.commit()
        return created_variant
    except Exception as e:
        await db.rollback()
        raise ValidationException(f"Failed to create variant: {str(e)}")

@products_supplier_router.get("/{product_id}/variants")
async def get_product_variants(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view variants for your own products")
    
    variant_crud = ProductVariantCrud()
    variants = await variant_crud.get_product_variants(db, product_id)
    return {"variants": variants}

@products_supplier_router.put("/{product_id}/variants/{variant_id}")
async def update_product_variant(
    product_id: str,
    variant_id: str,
    sku: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    compare_at_price: Optional[float] = Form(None),
    weight: Optional[float] = Form(None),
    dimensions: Optional[str] = Form(None),
    option1_name: Optional[str] = Form(None),
    option1_value: Optional[str] = Form(None),
    option2_name: Optional[str] = Form(None),
    option2_value: Optional[str] = Form(None),
    option3_name: Optional[str] = Form(None),
    option3_value: Optional[str] = Form(None),
    is_default: Optional[bool] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update variants for your own products")
    
    update_data = {}
    if sku is not None:
        update_data["sku"] = sku
    if title is not None:
        update_data["title"] = title
    if price is not None:
        update_data["price"] = price
    if compare_at_price is not None:
        update_data["compare_at_price"] = compare_at_price
    if weight is not None:
        update_data["weight"] = weight
    if option1_name is not None:
        update_data["option1_name"] = option1_name
    if option1_value is not None:
        update_data["option1_value"] = option1_value
    if option2_name is not None:
        update_data["option2_name"] = option2_name
    if option2_value is not None:
        update_data["option2_value"] = option2_value
    if option3_name is not None:
        update_data["option3_name"] = option3_name
    if option3_value is not None:
        update_data["option3_value"] = option3_value
    if is_default is not None:
        update_data["is_default"] = is_default
    
    if dimensions is not None and dimensions.strip():
        try:
            update_data["dimensions"] = json.loads(dimensions)
        except json.JSONDecodeError:
            raise ValidationException("Invalid dimensions JSON")
    
    variant_crud = ProductVariantCrud()
    variant_data = await variant_crud.update_variant(db, variant_id, update_data)
    return variant_data

@products_supplier_router.delete("/{product_id}/variants/{variant_id}")
async def delete_product_variant(
    product_id: str,
    variant_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only delete variants for your own products")
    
    variant_crud = ProductVariantCrud()
    variant = await variant_crud.get_variant_by_id(db, variant_id)
    
    if variant and hasattr(variant, 'images') and variant.images:
        storage_client = SupabaseStorageClient()
        for variant_img in variant.images:
            if variant_img.url:
                try:
                    blob_path = extract_blob_path_from_url(variant_img.url)[1]
                    storage_client.delete_file("product-assets", blob_path)
                except:
                    pass
    
    await variant_crud.delete_variant(db, variant_id)
    return SuccessResponse(message="Product variant deleted successfully")

@products_supplier_router.post("/{product_id}/variants/{variant_id}/set-default")
async def set_default_variant(
    product_id: str,
    variant_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only modify variants for your own products")
    
    variant_crud = ProductVariantCrud()
    variant_data = await variant_crud.set_default_variant(db, variant_id)
    return variant_data

@products_supplier_router.post("/{product_id}/variants/{variant_id}/images", status_code=status.HTTP_201_CREATED)
async def upload_variant_images(
    product_id: str,
    variant_id: str,
    images: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only upload images for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    uploaded_images = await variant_image_crud.upload_variant_images(
        db, variant_id, product_id, images, current_user["id"]
    )
    return {"images": uploaded_images}

@products_supplier_router.get("/{product_id}/variants/{variant_id}/images")
async def get_variant_images(
    product_id: str,
    variant_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view images for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    images = await variant_image_crud.get_variant_images(db, variant_id)
    return {"images": images}

@products_supplier_router.delete("/{product_id}/variants/{variant_id}/images/{image_id}")
async def delete_variant_image(
    product_id: str,
    variant_id: str,
    image_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only delete images for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    variant_image = await variant_image_crud.get_variant_image_by_id(db, image_id)
    
    if variant_image and variant_image.url:
        storage_client = SupabaseStorageClient()
        try:
            blob_path = extract_blob_path_from_url(variant_image.url)[1]
            storage_client.delete_file("product-assets", blob_path)
        except:
            pass
    
    await variant_image_crud.delete_variant_image(db, image_id)
    return SuccessResponse(message="Variant image deleted successfully")

@products_supplier_router.put("/{product_id}/variants/{variant_id}/images/{image_id}/set-primary")
async def set_primary_variant_image(
    product_id: str,
    variant_id: str,
    image_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only modify images for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    updated_image = await variant_image_crud.set_primary_image(db, image_id)
    return updated_image

@products_supplier_router.put("/{product_id}/variants/{variant_id}/images/reorder")
async def reorder_variant_images(
    product_id: str,
    variant_id: str,
    image_orders: List[Dict[str, Any]],
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only reorder images for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    updated_images = await variant_image_crud.update_image_order(db, variant_id, image_orders)
    return {"images": updated_images}

@products_supplier_router.get("/analytics/products/{product_id}")
async def get_product_analytics(
    product_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view analytics for your own products")
    
    analytics_crud = ProductAnalyticsCrud()
    analytics_data = await analytics_crud.get_product_performance_metrics(db, product_id, days)
    return analytics_data


@products_supplier_router.put("/{product_id}/variants/{variant_id}/default", response_model=Dict[str, Any])
async def set_default_variant(
    product_id: str,
    variant_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only set default variant for your own products")
    
    variant_crud = ProductVariantCrud()
    variant_data = await variant_crud.set_default_variant(db, variant_id)
    return {"variant": variant_data}

@products_supplier_router.post("/{product_id}/variants/{variant_id}/images")
async def upload_variant_images(
    product_id: str,
    variant_id: str,
    images: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only upload images for your own products")
    
    if not images or len(images) == 0:
        raise ValidationException("At least one image is required")
    
    try:
        variant_image_crud = ProductVariantImageCrud()
        uploaded_images = await variant_image_crud.upload_variant_images(
            db, variant_id, product_id, images, current_user["id"]
        )
        
        await db.commit()
        return {"images": uploaded_images}
    except Exception as e:
        await db.rollback()
        raise ValidationException(f"Failed to upload variant images: {str(e)}")


@products_supplier_router.put("/{product_id}/variants/{variant_id}/images/{image_id}/primary", response_model=Dict[str, Any])
async def set_primary_variant_image(
    product_id: str,
    variant_id: str,
    image_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only set primary image for your own products")
    
    variant_image_crud = ProductVariantImageCrud()
    image_data = await variant_image_crud.set_primary_image(db, image_id)
    return {"image": image_data}

@products_supplier_router.get("/{product_id}/inventory")
async def get_product_inventory(
    product_id: str,
    variant_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view inventory for your own products")
    
    inventory_crud = ProductInventoryCrud()
    inventory_data = await inventory_crud.get_inventory(db, product_id, variant_id)
    return inventory_data

@products_supplier_router.post("/inventory/reserve")
async def reserve_inventory(
    product_id: str = Form(...),
    quantity: int = Form(...),
    variant_id: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only reserve inventory for your own products")
    
    inventory_crud = ProductInventoryCrud()
    reservation_data = await inventory_crud.reserve_inventory(db, product_id, quantity, variant_id)
    return reservation_data

@products_supplier_router.post("/inventory/release")
async def release_inventory(
    product_id: str = Form(...),
    quantity: int = Form(...),
    variant_id: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only release inventory for your own products")
    
    inventory_crud = ProductInventoryCrud()
    release_data = await inventory_crud.release_inventory(db, product_id, quantity, variant_id)
    return release_data

@products_supplier_router.get("/{product_id}/price-history")
async def get_product_price_history(
    product_id: str,
    days: int = Query(365, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view price history for your own products")
    
    price_history_crud = ProductPriceHistoryCrud()
    history_data = await price_history_crud.get_price_history(db, product_id, days)
    analytics_data = await price_history_crud.get_price_analytics(db, product_id, days)
    
    return {
        "price_history": history_data,
        "analytics": analytics_data
    }

@products_supplier_router.post("/{product_id}/price-update")
async def update_product_price_with_history(
    product_id: str,
    new_price: float = Form(...),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update price for your own products")
    
    price_history_crud = ProductPriceHistoryCrud()
    await price_history_crud.record_price_change(db, product_id, new_price)
    
    await product_crud.update_product(db, product_id, current_user["id"], {"price": new_price})
    
    return SuccessResponse(message="Product price updated successfully")

@products_supplier_router.get("/analytics/search-trends")
async def get_search_trends(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    trends_data = await analytics_crud.get_search_trends(db, days)
    return trends_data

@products_supplier_router.get("/analytics/popular-terms")
async def get_popular_search_terms(
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    terms_data = await analytics_crud.get_popular_search_terms(db, limit, days)
    return {"popular_terms": terms_data}

@products_supplier_router.get("/products/{product_id}/price-history")
async def get_product_price_history(
    product_id: str,
    days: int = Query(365, ge=1, le=730),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view price history for your own products")
    
    price_history_crud = ProductPriceHistoryCrud()
    history_data = await price_history_crud.get_price_history(db, product_id, days)
    return {"price_history": history_data}

@products_supplier_router.post("/products/{product_id}/price-change")
async def log_price_change(
    product_id: str,
    price: float = Form(...),
    compare_at_price: Optional[float] = Form(None),
    cost_per_item: Optional[float] = Form(None),
    change_reason: Optional[str] = Form(None),
    effective_from: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only modify price for your own products")
    
    price_change_data = {
        "product_id": product_id,
        "price": price,
        "compare_at_price": compare_at_price,
        "cost_per_item": cost_per_item,
        "change_reason": change_reason,
        "changed_by": current_user["id"],
        "effective_from": effective_from
    }
    
    price_history_crud = ProductPriceHistoryCrud()
    history_entry = await price_history_crud.log_price_change(db, price_change_data)
    
    await product_crud.update(db, product_id, {
        "price": price,
        "compare_at_price": compare_at_price,
        "cost_per_item": cost_per_item
    })
    
    return {"message": "Price change logged successfully", "history_id": str(history_entry.id)}

@products_supplier_router.get("/products/{product_id}/price-analytics")
async def get_product_price_analytics(
    product_id: str,
    days: int = Query(90, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only view analytics for your own products")
    
    price_history_crud = ProductPriceHistoryCrud()
    analytics_data = await price_history_crud.get_price_analytics(db, product_id, days)
    return analytics_data

@products_supplier_router.post("/products/bulk-update")
async def bulk_update_products(
    product_ids: str = Form(...),
    status: Optional[str] = Form(None),
    visibility: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    try:
        product_ids_list = json.loads(product_ids)
    except json.JSONDecodeError:
        raise ValidationException("Invalid product_ids JSON")
    
    if not product_ids_list or len(product_ids_list) > 50:
        raise ValidationException("Product IDs list must contain 1-50 items")
    
    update_data = {}
    if status is not None:
        update_data["status"] = status
    if visibility is not None:
        update_data["visibility"] = visibility
    if tags is not None:
        try:
            update_data["tags"] = json.loads(tags)
        except json.JSONDecodeError:
            raise ValidationException("Invalid tags JSON")
    
    if not update_data:
        raise ValidationException("At least one field must be provided for update")
    
    product_crud = ProductCrud()
    updated_products = []
    
    for product_id in product_ids_list:
        try:
            product = await product_crud.get_by_id(db, product_id)
            if product and str(product.supplier_id) == current_user["id"]:
                await product_crud.update(db, product_id, update_data)
                updated_products.append(product_id)
        except Exception as e:
            logger.error(f"Failed to update product {product_id}: {str(e)}")
            continue
    
    return {
        "message": f"Updated {len(updated_products)} products",
        "updated_product_ids": updated_products,
        "total_requested": len(product_ids_list)
    }

@products_supplier_router.put("/{product_id}/visibility")
async def update_product_visibility(
    product_id: str,
    visibility: str = Form(..., pattern="^(visible|hidden|scheduled)$"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update visibility for your own products")
    
    update_data = {"visibility": visibility}
    await product_crud.update(db, product_id, update_data)
    
    return {
        "message": "Product visibility updated successfully",
        "product_id": product_id,
        "visibility": visibility
    }

@products_supplier_router.post("/bulk-visibility-update")
async def bulk_update_product_visibility(
    product_ids: str = Form(...),
    visibility: str = Form(..., pattern="^(visible|hidden|scheduled)$"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    try:
        product_ids_list = json.loads(product_ids)
    except json.JSONDecodeError:
        raise ValidationException("Invalid product_ids JSON")
    
    if not product_ids_list or len(product_ids_list) > 50:
        raise ValidationException("Product IDs list must contain 1-50 items")
    
    product_crud = ProductCrud()
    updated_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids_list:
        try:
            product = await product_crud.get_by_id(db, product_id)
            if not product:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Product not found"})
                continue
                
            if str(product.supplier_id) != current_user["id"]:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Not authorized to update this product"})
                continue
                
            await product_crud.update(db, product_id, {"visibility": visibility})
            updated_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk visibility update completed: {updated_count} updated, {failed_count} failed",
        "updated_count": updated_count,
        "failed_count": failed_count,
        "visibility": visibility,
        "total_requested": len(product_ids_list),
        "errors": errors
    }

@products_supplier_router.put("/{product_id}/status")
async def update_product_status(
    product_id: str,
    status: str = Form(..., pattern="^(DRAFT|PENDING|ACTIVE|INACTIVE)$"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    
    if not product:
        raise NotFoundException("Product not found")
    
    if str(product.supplier_id) != current_user["id"]:
        raise AuthorizationException("You can only update status for your own products")
    
    update_data = {"status": status}
    await product_crud.update(db, product_id, update_data)
    
    return {
        "message": "Product status updated successfully",
        "product_id": product_id,
        "status": status
    }

@products_supplier_router.post("/bulk-status-update")
async def bulk_update_product_status(
    product_ids: str = Form(...),
    status: str = Form(..., pattern="^(DRAFT|PENDING|ACTIVE|INACTIVE)$"),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    import json
    
    try:
        product_ids_list = json.loads(product_ids)
    except json.JSONDecodeError:
        raise ValidationException("Invalid product_ids JSON")
    
    if not product_ids_list or len(product_ids_list) > 50:
        raise ValidationException("Product IDs list must contain 1-50 items")
    
    product_crud = ProductCrud()
    updated_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids_list:
        try:
            product = await product_crud.get_by_id(db, product_id)
            if not product:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Product not found"})
                continue
                
            if str(product.supplier_id) != current_user["id"]:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Not authorized to update this product"})
                continue
                
            await product_crud.update(db, product_id, {"status": status})
            updated_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk status update completed: {updated_count} updated, {failed_count} failed",
        "updated_count": updated_count,
        "failed_count": failed_count,
        "status": status,
        "total_requested": len(product_ids_list),
        "errors": errors
    }
