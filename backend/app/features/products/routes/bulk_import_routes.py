from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Dict, Any
import csv
import io
import json
from uuid import uuid4
from datetime import datetime
import httpx

from app.core.exceptions import BadRequestException, ValidationException
from app.core.role_auth import require_supplier
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger("bulk_import")
router = APIRouter(prefix="/supplier/products", tags=["supplier-products"])

def decode_jwt_payload(token: str) -> dict:
    """Decode JWT payload without verification (for checking role only)"""
    try:
        import base64
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        payload = parts[1]
        padding = len(payload) % 4
        if padding:
            payload += '=' * (4 - padding)
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        logger.warning(f"Failed to decode JWT: {e}")
        return {}

@router.post("/bulk-import-csv", status_code=200)
async def bulk_import_products_csv(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    """
    Bulk import products from CSV - SUPABASE ONLY (no database fallback)
    Uses Supabase RPC (Priority 1) or REST API (Priority 2)
    """
    try:
        logger.info(f"Bulk import endpoint called - user: {current_user.get('id') if current_user else 'None'}, file: {file.filename if file else 'None'}")
        logger.info(f"BULK IMPORT: Starting for user {current_user.get('id')}, file: {file.filename}")
        
        if not file or not file.filename or not file.filename.endswith('.csv'):
        raise BadRequestException("File must be a CSV file")
    
        # Verify Supabase configuration FIRST - fail early if not configured
        service_role_key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()
        supabase_url = (settings.SUPABASE_URL or "").strip()
        
        if not supabase_url or not service_role_key:
            error_msg = "Supabase is not configured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
            logger.error(error_msg)
            raise BadRequestException(error_msg)
        
        # Verify service role key
        try:
            jwt_payload = decode_jwt_payload(service_role_key)
            role = jwt_payload.get('role', 'unknown')
            logger.info(f"Service role key JWT role: {role}")
            if role != 'service_role':
                logger.warning(f"WARNING: Service role key has role '{role}', not 'service_role'!")
        except Exception as e:
            logger.warning(f"Could not decode JWT: {e}")
        
        # Ensure supplier exists in Supabase Auth (for DEBUG mode or if user doesn't exist)
        supplier_id = current_user["id"]
        try:
            from supabase import create_client
            admin_client = create_client(supabase_url, service_role_key)
            
            # Check if user exists in auth
            try:
                auth_user = admin_client.auth.admin.get_user_by_id(supplier_id)
                if not auth_user or not auth_user.user:
                    # User doesn't exist in auth - create it for DEBUG mode
                    logger.info(f"   Creating supplier in Supabase Auth: {supplier_id}")
                    created_auth_user = admin_client.auth.admin.create_user({
                        "id": supplier_id,
                        "email": f"supplier-{supplier_id}@example.com",
                        "password": "TempPassword123!",
                        "email_confirm": True,
                        "user_metadata": {
                            "user_type": "supplier",
                            "first_name": "Auto",
                            "last_name": "Supplier"
                        }
                    })
                    logger.info(f"   OK: Created supplier in Supabase Auth")
                    
                    # Create user profile in users table via REST API
                    try:
                        users_url = f"{supabase_url}/rest/v1/users"
                        user_profile = {
                            "id": supplier_id,
                            "email": f"supplier-{supplier_id}@example.com",
                            "user_type": "supplier",
                            "first_name": "Auto",
                            "last_name": "Supplier",
                            "is_active": True,
                            "is_verified": False
                        }
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            profile_response = await client.post(
                                users_url,
                                json=user_profile,
                                headers={
                                    "apikey": service_role_key,
                                    "Authorization": f"Bearer {service_role_key}",
                                    "Content-Type": "application/json",
                                    "Prefer": "return=representation"
                                }
                            )
                            if profile_response.status_code in [200, 201]:
                                logger.info(f"   OK: Created supplier profile in users table")
                            else:
                                logger.warning(f"   WARNING: Could not create profile (may already exist): {profile_response.status_code}")
                    except Exception as profile_error:
                        logger.warning(f"   WARNING: Could not create user profile: {profile_error}")
            except Exception as check_error:
                # User doesn't exist - create it
                if "not found" in str(check_error).lower() or "User not found" in str(check_error):
                    logger.info(f"   Creating supplier in Supabase Auth: {supplier_id}")
                    try:
                        created_auth_user = admin_client.auth.admin.create_user({
                            "id": supplier_id,
                            "email": f"supplier-{supplier_id}@example.com",
                            "password": "TempPassword123!",
                            "email_confirm": True,
                            "user_metadata": {
                                "user_type": "supplier",
                                "first_name": "Auto",
                                "last_name": "Supplier"
                            }
                        })
                        logger.info(f"   OK: Created supplier in Supabase Auth")
                    except Exception as create_error:
                        logger.warning(f"   WARNING: Could not create supplier in auth: {create_error}")
                else:
                    logger.warning(f"   WARNING: Error checking supplier: {check_error}")
        except Exception as auth_error:
            logger.warning(f"   WARNING: Could not ensure supplier exists in auth: {auth_error}")
        
        config_msg = f"Supabase configuration:\n"
        config_msg += f"   URL: {supabase_url[:50]}{'...' if len(supabase_url) > 50 else ''}\n"
        config_msg += f"   Service Role Key: {'SET (' + str(len(service_role_key)) + ' chars)'}\n"
        logger.info(config_msg)
        print(config_msg)
        
        # Read CSV content
        contents = await file.read()
        if not contents:
            raise BadRequestException("File is empty")
        
        try:
        text_content = contents.decode('utf-8')
        except UnicodeDecodeError as e:
            logger.error(f"Failed to decode CSV file: {e}")
            raise BadRequestException(f"Invalid file encoding: {e}")
        
        try:
            csv_reader = csv.DictReader(io.StringIO(text_content))
        products_data = list(csv_reader)
        except Exception as e:
            logger.error(f"Failed to parse CSV: {e}")
            raise BadRequestException(f"Failed to parse CSV file: {str(e)}")
        
        if not products_data:
            raise BadRequestException("CSV file is empty or has no data rows")
        
        logger.info(f"Parsed {len(products_data)} products from CSV")
        print(f"📊 Parsed {len(products_data)} products")
        
        # Initialize results
        results = {
            "total_rows": len(products_data),
            "successful": 0,
            "failed": 0,
            "errors": [],
            "created_product_ids": []
        }
        
        # Process each product row
        for index, row in enumerate(products_data, start=2):  # Start at 2 for header row
            try:
                # Required fields
                name = (row.get('name') or '').strip()
                sku = (row.get('sku') or '').strip()
                price_str = (row.get('price') or '').strip()
                
                if not name:
                    raise ValidationException("Product name is required")
                if not sku:
                    raise ValidationException("Product SKU is required")
                if not price_str:
                    raise ValidationException("Product price is required")
                
                try:
                    price = float(price_str)
                    if price < 0:
                        raise ValidationException("Price must be non-negative")
                except ValueError:
                    raise ValidationException(f"Invalid price format: {price_str}")
                
                # Optional fields
                category_id = (row.get('category_id') or '').strip() or None
                brand_id = (row.get('brand_id') or '').strip() or None
                
                # category_id is REQUIRED - users must choose from existing categories
                if not category_id or category_id == "0":
                    raise ValidationException(f"category_id is required for product '{name}' (row {index}). Please provide a valid category_id from existing categories.")
                
                short_description = (row.get('short_description') or '').strip() or None
                description = (row.get('description') or '').strip() or None
                compare_at_price_str = (row.get('compare_at_price') or '').strip()
                compare_at_price = float(compare_at_price_str) if compare_at_price_str else None
                weight_str = (row.get('weight') or '').strip()
                weight = float(weight_str) if weight_str else None
                materials = (row.get('materials') or '').strip() or None
                care_instructions = (row.get('care_instructions') or '').strip() or None
                origin_country = (row.get('origin_country') or '').strip() or None
                visibility = (row.get('visibility') or 'visible').strip().lower()
                if visibility not in ['visible', 'hidden', 'scheduled']:
                    visibility = 'visible'
                tags_str = (row.get('tags') or '').strip()
                tags = [t.strip() for t in tags_str.split(';')] if tags_str else []
                
                product_created = False
                rpc_error_msg = None
                rest_error_msg = None
                
                # PRIORITY 1: Try Supabase RPC first
                logger.info(f"🔍 Row {index}: Attempting RPC for product '{name}'")
                print(f"  [{index}] Trying RPC for: {name}")
                
                try:
                    product_uuid = str(uuid4())
                    now = datetime.utcnow()
                    
                    rpc_payload = {
                        "p_id": product_uuid,
                        "p_name": name,
                        "p_sku": sku,
                        "p_slug": name.lower().replace(" ", "-").replace("_", "-").replace("/", "-"),
                        "p_price": float(price),
                        "p_short_description": short_description or "",
                        "p_description": description or "",
                        "p_category_id": category_id,
                        "p_brand_id": brand_id if brand_id and brand_id != "0" else None,
                        "p_supplier_id": current_user["id"],
                        "p_status": "ACTIVE",
                        "p_approval_status": "APPROVED",
                        "p_visibility": "VISIBLE",
                        "p_tags": json.dumps(tags) if tags else json.dumps([]),
                        "p_created_at": now.isoformat(),
                        "p_updated_at": now.isoformat()
                    }
                    
                    rpc_url = f"{supabase_url}/rest/v1/rpc/insert_product_bulk"
                    logger.info(f"   RPC URL: {rpc_url}")
                    
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
                        
                        response_text = response.text
                        logger.info(f"   RPC response: status={response.status_code}, body={response_text[:300]}")
                        print(f"   RPC response: {response.status_code} - {response_text[:200]}")
                        
                        if response.status_code in [200, 201]:
                            try:
                                created_id = response.json()
                                
                                # Handle different response formats
                                if isinstance(created_id, str):
                                    product_id = created_id
                                elif isinstance(created_id, list) and len(created_id) > 0:
                                    product_id = created_id[0]
                                    if isinstance(product_id, dict):
                                        product_id = product_id.get("insert_product_bulk") or product_id.get("id")
                                elif isinstance(created_id, dict):
                                    product_id = created_id.get("insert_product_bulk") or created_id.get("id")
                                else:
                                    product_id = created_id
                                
                                if product_id:
                                    product_id_str = str(product_id)
                                    results["successful"] += 1
                                    results["created_product_ids"].append(product_id_str)
                                    logger.info(f"   OK: Created via RPC: {name} (ID: {product_id_str})")
                                    logger.info(f"   [OK] [{index}] Created via RPC: {name}")
                                    product_created = True
                                else:
                                    raise Exception(f"RPC returned invalid product ID: {created_id}")
                            except Exception as parse_error:
                                logger.error(f"   Failed to parse RPC response: {parse_error}")
                                raise Exception(f"RPC parse error: {parse_error}, response: {response_text}")
                        else:
                            raise Exception(f"RPC returned {response.status_code}: {response_text}")
                            
                except Exception as rpc_error:
                    import traceback
                    rpc_error_msg = str(rpc_error)
                    logger.error(f"   ERROR: RPC failed for {name}: {rpc_error_msg}")
                    logger.error(f"   Traceback: {traceback.format_exc()}")
                    logger.warning(f"   [FAIL] [{index}] RPC failed: {rpc_error_msg[:100]}")
                    
                    # PRIORITY 2: Try Supabase REST API as fallback
                    if not product_created:
                        try:
                            logger.info(f"   INFO: Attempting REST API for product {name}")
                            print(f"   [{index}] Trying REST API for: {name}")
                            
                            product_data_for_supabase = {
                                "id": str(uuid4()),
                    "name": name,
                    "sku": sku,
                    "slug": name.lower().replace(" ", "-").replace("_", "-").replace("/", "-"),
                                "price": float(price),
                    "short_description": short_description,
                    "description": description,
                                "supplier_id": current_user["id"],
                                "category_id": category_id,
                                "status": "ACTIVE",
                                "approval_status": "approved",
                                "visibility": "visible",
                                "tags": tags if tags else [],
                            }
                            
                            if brand_id and brand_id != "0":
                                product_data_for_supabase["brand_id"] = brand_id
                            
                            # Remove None values
                            product_data_for_supabase = {k: v for k, v in product_data_for_supabase.items() if v is not None}
                            
                            supabase_rest_url = f"{supabase_url}/rest/v1/products"
                            
                            async with httpx.AsyncClient(timeout=30.0) as client:
                                response = await client.post(
                                    supabase_rest_url,
                                    json=product_data_for_supabase,
                                    headers={
                                        "apikey": service_role_key,
                                        "Authorization": f"Bearer {service_role_key}",
                                        "Content-Type": "application/json",
                                        "Prefer": "return=representation"
                                    }
                                )
                                
                                response_text = response.text
                                logger.info(f"   REST response: status={response.status_code}, body={response_text[:300]}")
                                print(f"   REST response: {response.status_code} - {response_text[:200]}")
                                
                                if response.status_code in [200, 201]:
                                    created_data = response.json()
                                    if isinstance(created_data, list) and len(created_data) > 0:
                                        created_data = created_data[0]
                                    
                                    product_id = created_data.get("id", product_data_for_supabase["id"])
                    results["successful"] += 1
                                    results["created_product_ids"].append(str(product_id))
                                    logger.info(f"   OK: Created via REST: {name} (ID: {product_id})")
                                    logger.info(f"   [OK] [{index}] Created via REST: {name}")
                                    product_created = True
                                else:
                                    raise Exception(f"REST API returned {response.status_code}: {response_text}")
                                    
                        except Exception as rest_error:
                            rest_error_msg = str(rest_error)
                            logger.error(f"   ERROR: REST API also failed for {name}: {rest_error_msg}")
                            logger.warning(f"   [FAIL] [{index}] REST API failed: {rest_error_msg[:100]}")
                
                # Mark as failed if both RPC and REST failed
                if not product_created:
                    results["failed"] += 1
                    error_detail = f"Both RPC and REST API failed. "
                    if rpc_error_msg:
                        error_detail += f"RPC: {rpc_error_msg[:200]}. "
                    if rest_error_msg:
                        error_detail += f"REST: {rest_error_msg[:200]}"
                    if not rpc_error_msg and not rest_error_msg:
                        error_detail = "All Supabase methods failed (no error details captured)"
                    
                    results["errors"].append({
                        "row": index,
                        "product_name": name,
                        "error": error_detail
                    })
                    logger.error(f"   ERROR: All Supabase methods failed for '{name}' (row {index}): {error_detail}")
                    logger.error(f"   [FAIL] [{index}] All methods failed: {name}")
                
            except Exception as e:
                results["failed"] += 1
                error_msg = str(e)
                results["errors"].append({
                    "row": index,
                    "product_name": row.get('name', 'Unknown'),
                    "error": error_msg
                })
                logger.error(f"Error processing row {index}: {error_msg}")
                logger.error(f"   [FAIL] [{index}] Error: {error_msg[:100]}")
        
        logger.info(f"Bulk import completed: {results['successful']} successful, {results['failed']} failed")
        logger.info(f"[OK] Bulk import completed: {results['successful']}/{results['total_rows']} successful")
        
        return {
            "message": f"Bulk import completed: {results['successful']} successful, {results['failed']} failed",
            "results": results
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Bulk import error: {str(e)}\n{error_trace}")
        logger.error(f"[FAIL] Bulk import error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk import failed: {str(e)}")
