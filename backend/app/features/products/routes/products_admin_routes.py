import json
from typing import Dict, Any, Optional, List, Union
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.role_auth import require_admin
from app.core.pagination import PaginationParams
from app.database.session import get_async_session
from app.core.exceptions import ValidationException, NotFoundException, AuthorizationException, ConflictException, BadRequestException
from app.core.logging import get_logger
from app.core.supabase_storage import SupabaseStorageClient
from app.features.products.cruds.product_crud import ProductCrud, ProductImageCrud, ProductImageCrud
from app.features.products.cruds.category_crud import CategoryCrud
from app.features.products.cruds.brand_crud import BrandCrud
from app.features.products.cruds.product_inventory_crud import ProductInventoryCrud
from app.features.products.cruds.product_view_crud import ProductViewCrud
from app.features.products.cruds.product_analytics_crud import ProductAnalyticsCrud, ProductPriceHistoryCrud
from app.features.products.cruds.product_review_crud import ProductReviewCrud
from app.features.products.requests.product_request import ProductApprovalRequest
from app.features.products.responses.product_response import ProductApprovalEnum, ProductResponse, ProductListResponse
from app.features.products.responses.category_response import CategoryResponse, CategoryWithStatsResponse
from app.features.products.responses.brand_response import BrandResponse
from app.core.pagination import PaginatedResponse
from app.core.base import SuccessResponse
from datetime import datetime

products_admin_router = APIRouter(prefix="/admin/products", tags=["Admin Products"])
logger = get_logger("products.admin")

@products_admin_router.get("/pending", response_model=PaginatedResponse[ProductListResponse])
async def get_pending_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    product_image_crud = ProductImageCrud()
    products, total = await product_image_crud.get_supplier_products_paginated(
        db=db,
        supplier_id=None,
        pagination=pagination,
        status=ProductApprovalEnum.PENDING.value
    )
    
    result = []
    for product in products:
        try:
            result.append(ProductListResponse(**product))
        except Exception as e:
            logger.error(f"Error creating ProductListResponse: {str(e)}")
            continue
    
    return PaginatedResponse.create(
        items=result,
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )

@products_admin_router.get("/", response_model=PaginatedResponse[ProductListResponse])
async def get_all_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    product_image_crud = ProductImageCrud()
    
    if status_filter:
        products, total = await product_image_crud.get_supplier_products_paginated(
            db=db,
            supplier_id=None,
            pagination=pagination,
            status=status_filter
        )
    else:
        products, total = await product_image_crud.get_products_paginated(db, pagination)
    
    result = []
    for product in products:
        try:
            result.append(ProductListResponse(**product))
        except Exception as e:
            logger.error(f"Error creating ProductListResponse: {str(e)}")
            continue
    
    return PaginatedResponse.create(
        items=result,
        total=total,
        page=pagination.page,
        limit=pagination.limit
    )

@products_admin_router.post("/{product_id}/review", response_model=ProductResponse)
async def review_product(
    product_id: str,
    request: ProductApprovalRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    if request.approved:
        product_data = await product_crud.approve_product(
            db, product_id, current_user["id"], request.approval_notes
        )
    else:
        product_data = await product_crud.reject_product(
            db, product_id, current_user["id"], request.approval_notes
        )
    return ProductResponse(**product_data)

@products_admin_router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    storage_client = SupabaseStorageClient()
    
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    
    if product:
        storage_client = get_storage_client()
        
        if product.images:
            for img in product.images:
                if img.url:
                    try:
                        blob_path = extract_blob_path_from_url(img.url)[1]
                        storage_client.delete_file("aveoearth-product-assets", blob_path)
                    except:
                        pass
        
        if product.variants:
            for variant in product.variants:
                if hasattr(variant, 'images') and variant.images:
                    for variant_img in variant.images:
                        if variant_img.url:
                            try:
                                blob_path = extract_blob_path_from_url(variant_img.url)[1]
                                storage_client.delete_file("aveoearth-product-assets", blob_path)
                            except:
                                pass
    
    await product_crud.delete(db, product_id)
    return SuccessResponse(message="Product deleted successfully")

@products_admin_router.post("/bulk-approve")
async def bulk_approve_products(
    product_ids: List[str] = Form(...),
    approval_notes: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    approved_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids:
        try:
            await product_crud.approve_product(db, product_id, current_user["id"], approval_notes)
            approved_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk approval completed: {approved_count} approved, {failed_count} failed",
        "approved_count": approved_count,
        "failed_count": failed_count,
        "errors": errors
    }

@products_admin_router.post("/bulk-reject")
async def bulk_reject_products(
    product_ids: List[str] = Form(...),
    rejection_notes: str = Form(...),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    rejected_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids:
        try:
            await product_crud.reject_product(db, product_id, current_user["id"], rejection_notes)
            rejected_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk rejection completed: {rejected_count} rejected, {failed_count} failed",
        "rejected_count": rejected_count,
        "failed_count": failed_count,
        "errors": errors
    }

@products_admin_router.post("/bulk-update")
async def bulk_update_products(
    product_ids: List[str] = Form(...),
    action: str = Form(..., pattern="^(approve|reject|activate|deactivate)$"),
    notes: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    updated_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids:
        try:
            if action == "approve":
                await product_crud.approve_product(db, product_id, current_user["id"], notes)
            elif action == "reject":
                await product_crud.reject_product(db, product_id, current_user["id"], notes)
            elif action == "activate":
                await product_crud.update_product(db, product_id, None, {"status": "ACTIVE"})
            elif action == "deactivate":
                await product_crud.update_product(db, product_id, None, {"status": "INACTIVE"})
            
            updated_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk update completed: {updated_count} updated, {failed_count} failed",
        "updated_count": updated_count,
        "failed_count": failed_count,
        "errors": errors
    }

@products_admin_router.put("/{product_id}/visibility")
async def update_product_visibility(
    product_id: str,
    visibility: str = Form(..., pattern="^(visible|hidden|scheduled)$"),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    
    if not product:
        raise NotFoundException("Product not found")
    
    update_data = {"visibility": visibility}
    await product_crud.update(db, product_id, update_data)
    
    return {
        "message": "Product visibility updated successfully",
        "product_id": product_id,
        "visibility": visibility
    }

@products_admin_router.post("/bulk-visibility-update")
async def bulk_update_product_visibility(
    product_ids: List[str] = Form(...),
    visibility: str = Form(..., pattern="^(visible|hidden|scheduled)$"),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    if len(product_ids) > 100:
        raise ValidationException("Cannot update more than 100 products at once")
    
    product_crud = ProductCrud()
    updated_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids:
        try:
            product = await product_crud.get_by_id(db, product_id)
            if product:
                await product_crud.update(db, product_id, {"visibility": visibility})
                updated_count += 1
            else:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Product not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk visibility update completed: {updated_count} updated, {failed_count} failed",
        "updated_count": updated_count,
        "failed_count": failed_count,
        "visibility": visibility,
        "errors": errors
    }

@products_admin_router.put("/{product_id}/status")
async def update_product_status(
    product_id: str,
    status: str = Form(..., pattern="^(DRAFT|PENDING|ACTIVE|INACTIVE|REJECTED)$"),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    
    if not product:
        raise NotFoundException("Product not found")
    
    update_data = {"status": status}
    await product_crud.update(db, product_id, update_data)
    
    return {
        "message": "Product status updated successfully",
        "product_id": product_id,
        "status": status
    }

@products_admin_router.post("/bulk-status-update")
async def bulk_update_product_status(
    product_ids: List[str] = Form(...),
    status: str = Form(..., pattern="^(DRAFT|PENDING|ACTIVE|INACTIVE|REJECTED)$"),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    if len(product_ids) > 100:
        raise ValidationException("Cannot update more than 100 products at once")
    
    product_crud = ProductCrud()
    updated_count = 0
    failed_count = 0
    errors = []
    
    for product_id in product_ids:
        try:
            product = await product_crud.get_by_id(db, product_id)
            if product:
                await product_crud.update(db, product_id, {"status": status})
                updated_count += 1
            else:
                failed_count += 1
                errors.append({"product_id": product_id, "error": "Product not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"product_id": product_id, "error": str(e)})
    
    return {
        "message": f"Bulk status update completed: {updated_count} updated, {failed_count} failed",
        "updated_count": updated_count,
        "failed_count": failed_count,
        "status": status,
        "errors": errors
    }

@products_admin_router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    name: str = Form(...),
    description: Union[str, None] = Form(None),
    parent_id: Union[str, None] = Form(None),
    meta_keywords: Union[str, None] = Form(None),
    sort_order: int = Form(0),
    seo_meta: Union[str, None] = Form(None),
    image: Union[UploadFile, str, None] = File(default=None),
    icon: Union[UploadFile, str, None] = File(default=None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    category_crud = CategoryCrud()
    uploaded_files = []

    try:
        category_data = {
            "name": name,
            "description": description,
            "parent_id": parent_id if parent_id and parent_id != "0" else None,
            "meta_keywords": meta_keywords,
            "sort_order": sort_order,
            "is_active": True,
            "slug": name.lower().replace(" ", "-").replace("_", "-") if name else ""
        }
        
        if seo_meta and seo_meta.strip():
            try:
                category_data["seo_meta"] = json.loads(seo_meta)
            except json.JSONDecodeError:
                raise ValidationException("Invalid seo_meta JSON")
        
        created_category = await category_crud.create_category(db, category_data)
        
        if icon and hasattr(icon, 'filename') and icon.filename:
            icon_url = await upload_category_icon(icon, current_user["id"])
            uploaded_files.append(icon_url)
            await category_crud.update_category(db, str(created_category["id"]), {"icon_url": icon_url})
            
        if image and hasattr(image, 'filename') and image.filename:
            image_url = await upload_category_image(image, current_user["id"])
            uploaded_files.append(image_url)
            await category_crud.update_category(db, str(created_category["id"]), {"image_url": image_url})
        
        return CategoryResponse(**created_category)
        
    except Exception as e:
        for file_url in uploaded_files:
            try:
                delete_file_from_url(file_url)
            except:
                pass
        raise ValidationException(f"Category creation failed: {str(e)}")

@products_admin_router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    name: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    parent_id: Union[str, None] = Form(None),
    meta_keywords: Union[str, None] = Form(None),
    sort_order: Union[int, None] = Form(None),
    is_active: Union[bool, None] = Form(None),
    seo_meta: Union[str, None] = Form(None),
    image: Union[UploadFile, str, None] = File(default=None),
    icon: Union[UploadFile, str, None] = File(default=None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    category_crud = CategoryCrud()
    category = await category_crud.get_by_id(db, category_id)
    uploaded_files = []

    try:
        update_data = {}
        if name is not None:
            update_data["name"] = name
            update_data["slug"] = name.lower().replace(" ", "-").replace("_", "-")
        if description is not None:
            update_data["description"] = description
        if parent_id is not None:
            update_data["parent_id"] = parent_id if parent_id and parent_id != "0" else None
        if meta_keywords is not None:
            update_data["meta_keywords"] = meta_keywords
        if sort_order is not None:
            update_data["sort_order"] = sort_order
        if is_active is not None:
            update_data["is_active"] = is_active
        
        if seo_meta and seo_meta.strip():
            try:
                update_data["seo_meta"] = json.loads(seo_meta)
            except json.JSONDecodeError:
                raise ValidationException("Invalid seo_meta JSON")
        
        if icon and hasattr(icon, 'filename') and icon.filename:
            if category and hasattr(category, 'icon_url') and category.icon_url:
                try:
                    delete_file_from_url(category.icon_url)
                except:
                    pass
            icon_url = await upload_category_icon(icon, current_user["id"])
            uploaded_files.append(icon_url)
            update_data["icon_url"] = icon_url
            
        if image and hasattr(image, 'filename') and image.filename:
            if category and hasattr(category, 'image_url') and category.image_url:
                try:
                    delete_file_from_url(category.image_url)
                except:
                    pass
            image_url = await upload_category_image(image, current_user["id"])
            uploaded_files.append(image_url)
            update_data["image_url"] = image_url
        
        category_data = await category_crud.update_category(db, category_id, update_data)
        return CategoryResponse(**category_data)
        
    except Exception as e:
        for file_url in uploaded_files:
            try:
                delete_file_from_url(file_url)
            except:
                pass
        raise

@products_admin_router.get("/categories", response_model=List[CategoryWithStatsResponse])
async def get_categories_with_stats(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    category_crud = CategoryCrud()
    categories = await category_crud.get_categories_tree(db)
    
    categories_with_stats = []
    for category in categories:
        category_stats = await category_crud.get_category_with_products_count(db, category["id"])
        if category_stats:
            categories_with_stats.append(CategoryWithStatsResponse(**category_stats))
    
    return categories_with_stats

@products_admin_router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    category_crud = CategoryCrud()
    category = await category_crud.get_by_id(db, category_id)
    
    if category:
        if hasattr(category, 'image_url') and category.image_url:
            try:
                delete_file_from_url(category.image_url)
            except:
                pass
        
        if hasattr(category, 'icon_url') and category.icon_url:
            try:
                delete_file_from_url(category.icon_url)
            except:
                pass
    
    await category_crud.delete(db, category_id)
    return SuccessResponse(message="Category deleted successfully")

@products_admin_router.post("/brands", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    name: str = Form(...),
    description: Union[str, None] = Form(None),
    website_url: Union[str, None] = Form(None),
    meta_keywords: Union[str, None] = Form(None),
    seo_meta: Union[str, None] = Form(None),
    logo: Union[UploadFile, str, None] = File(default=None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    brand_crud = BrandCrud()
    uploaded_files = []

    try:
        brand_data = {
            "name": name,
            "description": description,
            "website_url": website_url,
            "meta_keywords": meta_keywords,
            "is_active": True,
            "slug": name.lower().replace(" ", "-").replace("_", "-") if name else ""
        }
        
        if seo_meta and seo_meta.strip():
            try:
                brand_data["seo_meta"] = json.loads(seo_meta)
            except json.JSONDecodeError:
                raise ValidationException("Invalid seo_meta JSON")
        
        created_brand = await brand_crud.create_brand(db, brand_data)
        
        if logo and hasattr(logo, 'filename') and logo.filename:
            logo_url = await upload_brand_logo(logo, current_user["id"])
            uploaded_files.append(logo_url)
            await brand_crud.update_brand(db, str(created_brand["id"]), {"logo_url": logo_url})
        
        return BrandResponse(**created_brand)
        
    except Exception as e:
        for file_url in uploaded_files:
            try:
                delete_file_from_url(file_url)
            except:
                pass
        raise ValidationException(f"Brand creation failed: {str(e)}")

@products_admin_router.put("/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: str,
    name: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    website_url: Union[str, None] = Form(None),
    meta_keywords: Union[str, None] = Form(None),
    is_active: Union[bool, None] = Form(None),
    seo_meta: Union[str, None] = Form(None),
    logo: Union[UploadFile, str, None] = File(default=None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    brand_crud = BrandCrud()
    brand = await brand_crud.get_by_id(db, brand_id)
    uploaded_files = []

    try:
        update_data = {}
        if name is not None:
            update_data["name"] = name
            update_data["slug"] = name.lower().replace(" ", "-").replace("_", "-")
        if description is not None:
            update_data["description"] = description
        if website_url is not None:
            update_data["website_url"] = website_url
        if meta_keywords is not None:
            update_data["meta_keywords"] = meta_keywords
        if is_active is not None:
            update_data["is_active"] = is_active
        
        if seo_meta and seo_meta.strip():
            try:
                update_data["seo_meta"] = json.loads(seo_meta)
            except json.JSONDecodeError:
                raise ValidationException("Invalid seo_meta JSON")
        
        if logo and hasattr(logo, 'filename') and logo.filename:
            if brand and hasattr(brand, 'logo_url') and brand.logo_url:
                try:
                    delete_file_from_url(brand.logo_url)
                except:
                    pass
            logo_url = await upload_brand_logo(logo, current_user["id"])
            uploaded_files.append(logo_url)
            update_data["logo_url"] = logo_url
        
        brand_data = await brand_crud.update_brand(db, brand_id, update_data)
        return BrandResponse(**brand_data)
        
    except Exception as e:
        for file_url in uploaded_files:
            try:
                delete_file_from_url(file_url)
            except:
                pass
        raise

@products_admin_router.get("/brands", response_model=List[BrandResponse])
async def get_all_brands(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    brand_crud = BrandCrud()
    brands = await brand_crud.get_active_brands(db)
    return [BrandResponse(**brand) for brand in brands]

@products_admin_router.delete("/brands/{brand_id}")
async def delete_brand(
    brand_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    brand_crud = BrandCrud()
    brand = await brand_crud.get_by_id(db, brand_id)
    
    if brand and hasattr(brand, 'logo_url') and brand.logo_url:
        try:
            delete_file_from_url(brand.logo_url)
        except:
            pass
    
    await brand_crud.delete(db, brand_id)
    return SuccessResponse(message="Brand deleted successfully")

@products_admin_router.get("/reviews", response_model=PaginatedResponse[Dict[str, Any]])
async def get_all_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    product_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    review_crud = ProductReviewCrud()
    
    filters = {}
    if product_id:
        filters["product_id"] = product_id
    if user_id:
        filters["user_id"] = user_id
    
    return await review_crud.get_all_reviews(db, pagination, filters)

@products_admin_router.delete("/reviews/{review_id}", response_model=SuccessResponse)
async def delete_review(
    review_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    review_crud = ProductReviewCrud()
    await review_crud.delete_review(db, review_id, None)
    return SuccessResponse(message="Review deleted successfully")

@products_admin_router.get("/inventory/low-stock")
async def get_low_stock_products(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, List[Dict[str, Any]]]:
    from app.features.products.models.product_inventory import ProductInventory
    from app.features.products.models.product import Product
    from sqlalchemy import select
    
    result = await db.execute(
        select(ProductInventory)
        .join(Product)
        .where((ProductInventory.quantity - ProductInventory.reserved_quantity) <= 10)
        .order_by(ProductInventory.quantity - ProductInventory.reserved_quantity)
    )
    low_stock_items = result.scalars().all()
    
    return {"low_stock_products": [item.to_dict() for item in low_stock_items]}

@products_admin_router.get("/inventory/out-of-stock")
async def get_out_of_stock_products(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, List[Dict[str, Any]]]:
    from app.features.products.models.product_inventory import ProductInventory
    from app.features.products.models.product import Product
    from sqlalchemy import select
    
    result = await db.execute(
        select(ProductInventory)
        .join(Product)
        .where((ProductInventory.quantity - ProductInventory.reserved_quantity) == 0)
        .order_by(ProductInventory.updated_at.desc())
    )
    out_of_stock_items = result.scalars().all()
    
    return {"out_of_stock_products": [item.to_dict() for item in out_of_stock_items]}

@products_admin_router.get("/inventory/report")
async def get_inventory_report(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from sqlalchemy import select, func, case, Integer
    from app.features.products.models.product_inventory import ProductInventory
    
    available_qty = ProductInventory.quantity - ProductInventory.reserved_quantity
    
    inventory_query = select(
        func.count(ProductInventory.id).label("total_products"),
        func.sum(ProductInventory.quantity).label("total_inventory"),
        func.sum(ProductInventory.reserved_quantity).label("total_reserved"),
        func.sum(available_qty).label("total_available"),
        func.count(
            case((available_qty <= ProductInventory.low_stock_threshold, 1), else_=None)
        ).label("low_stock_count"),
        func.count(
            case((available_qty == 0, 1), else_=None)
        ).label("out_of_stock_count")
    )
    
    result = await db.execute(inventory_query)
    row = result.first()
    
    return {
        "total_products": row.total_products or 0,
        "total_inventory": row.total_inventory or 0,
        "total_reserved": row.total_reserved or 0,
        "total_available": row.total_available or 0,
        "low_stock_count": row.low_stock_count or 0,
        "out_of_stock_count": row.out_of_stock_count or 0
    }

@products_admin_router.put("/inventory/{product_id}/adjust")
async def adjust_inventory(
    product_id: str,
    adjustment: int = Form(...),
    reason: str = Form(...),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    inventory_crud = ProductInventoryCrud()
    inventory_data = await inventory_crud.adjust_inventory(db, product_id, adjustment, reason)
    return inventory_data

@products_admin_router.get("/analytics/overview")
async def get_admin_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    
    search_trends = await analytics_crud.get_search_trends(db, days)
    popular_terms = await analytics_crud.get_popular_search_terms(db, 10, days)
    no_results = await analytics_crud.get_no_results_queries(db, 10, days)
    category_analytics = await analytics_crud.get_category_search_analytics(db, days)
    
    return {
        "search_trends": search_trends,
        "popular_terms": popular_terms,
        "no_results_queries": no_results,
        "category_performance": category_analytics[:10],
        "period_days": days
    }

@products_admin_router.get("/analytics/search-trends")
async def get_search_trends(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    trends_data = await analytics_crud.get_search_trends(db, days)
    return trends_data

@products_admin_router.get("/analytics/popular-search-terms")
async def get_popular_search_terms(
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    terms_data = await analytics_crud.get_popular_search_terms(db, limit, days)
    return {"popular_terms": terms_data, "period_days": days}

@products_admin_router.get("/analytics/no-results-queries")
async def get_no_results_queries(
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    queries_data = await analytics_crud.get_no_results_queries(db, limit, days)
    return {"no_results_queries": queries_data, "period_days": days}

@products_admin_router.get("/analytics/products/{product_id}")
async def get_product_performance_metrics(
    product_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    metrics = await analytics_crud.get_product_performance_metrics(db, product_id, days)
    return metrics

@products_admin_router.get("/analytics/category/{category_id}")
async def get_category_analytics(
    category_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    analytics = await analytics_crud.get_category_search_analytics(db, days, category_id)
    return analytics

@products_admin_router.get("/analytics/brand/{brand_id}")
async def get_brand_analytics(
    brand_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    analytics_crud = ProductAnalyticsCrud()
    analytics = await analytics_crud.get_brand_search_analytics(db, days, brand_id)
    return analytics

@products_admin_router.get("/analytics/product-views")
async def get_product_views_analytics(
    days: int = Query(30, ge=1, le=365),
    product_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    view_crud = ProductViewCrud()
    if product_id:
        view_count = await view_crud.get_product_view_count(db, product_id)
        return {"product_id": product_id, "view_count": view_count}
    else:
        analytics = await view_crud.get_analytics(db, days)
        return analytics

@products_admin_router.get("/storage/{bucket_name}/images")
async def list_storage_images(
    bucket_name: str,
    prefix: str = Query(""),
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    try:
        images = list_bucket_files(bucket_name, prefix, limit)
        return {"images": images, "bucket": bucket_name, "prefix": prefix}
    except Exception as e:
        raise BadRequestException(f"Error listing bucket images: {str(e)}")

@products_admin_router.delete("/storage/{bucket_name}/images/{filename}")
async def delete_storage_image(
    bucket_name: str,
    filename: str,
    current_user: Dict[str, Any] = Depends(require_admin())
):
    try:
        delete_bucket_file(bucket_name, filename)
        return SuccessResponse(message=f"Image {filename} deleted successfully")
    except Exception as e:
        raise BadRequestException(f"Error deleting bucket image: {str(e)}")

@products_admin_router.delete("/storage/{bucket_name}/images")
async def delete_multiple_images(
    bucket_name: str,
    filenames: List[str],
    current_user: Dict[str, Any] = Depends(require_admin())
):
    try:
        delete_multiple_files(bucket_name, filenames)
        return SuccessResponse(message=f"Deleted {len(filenames)} images successfully")
    except Exception as e:
        raise BadRequestException(f"Error deleting bucket images: {str(e)}")

@products_admin_router.get("/dashboard")
async def get_admin_dashboard(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    from sqlalchemy import select, func
    from app.features.products.models.product import Product
    from app.features.products.models.product_review import ProductReview
    from app.features.products.models.product_view import ProductView
    
    total_products = await db.execute(select(func.count()).select_from(Product))
    pending_products = await db.execute(
        select(func.count()).select_from(Product).where(Product.approval_status == "pending")
    )
    total_reviews = await db.execute(select(func.count()).select_from(ProductReview))
    total_views = await db.execute(select(func.count()).select_from(ProductView))
    
    from app.features.products.models.product_inventory import ProductInventory
    
    low_stock_result = await db.execute(
        select(func.count()).select_from(ProductInventory)
        .where((ProductInventory.quantity - ProductInventory.reserved_quantity) <= ProductInventory.low_stock_threshold)
    )
    low_stock_count = low_stock_result.scalar()
    
    out_of_stock_result = await db.execute(
        select(func.count()).select_from(ProductInventory)
        .where((ProductInventory.quantity - ProductInventory.reserved_quantity) == 0)
    )
    out_of_stock_count = out_of_stock_result.scalar()
    
    return {
        "total_products": total_products.scalar(),
        "pending_products": pending_products.scalar(),
        "total_reviews": total_reviews.scalar(),
        "total_views": total_views.scalar(),
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "timestamp": datetime.utcnow().isoformat()
    }

@products_admin_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    product_crud = ProductCrud()
    product = await product_crud.get_by_id(db, product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    product_dict = product.to_dict()
    product_dict["images"] = [img.to_dict() for img in product.images] if product.images else []
    return ProductResponse(**product_dict)