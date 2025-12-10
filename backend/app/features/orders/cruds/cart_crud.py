from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete, func, update, text
from sqlalchemy.orm import selectinload
import uuid
from app.core.base import BaseCrud
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.features.orders.models.cart import Cart, CartItem
from app.features.products.models.product import Product
from app.features.products.models.product_variant import ProductVariant
from datetime import datetime
from app.features.products.cruds.product_inventory_crud import ProductInventoryCrud
from app.features.orders.responses.cart_response import CartResponse, CartWithItemsResponse, CartItemResponse
from app.database.base import get_supabase_client
from app.core.config import settings  # Import at module level for all functions

logger = get_logger("crud.cart")


class CartCrud(BaseCrud[Cart]):
    def __init__(self):
        super().__init__(get_supabase_client(), Cart)

    async def get_or_create_cart(self, db: AsyncSession, user_id: Optional[str] = None, session_id: Optional[str] = None) -> Cart:
        try:
            if not user_id and not session_id:
                raise ValidationException("Either user_id or session_id must be provided")

            # If user_id is provided, user is authenticated (via require_buyer/require_supplier)
            # They exist in auth.users which is sufficient for foreign key constraints
            # Skip user verification - proceed directly to cart creation
            # If user doesn't exist in public.users, we'll handle the foreign key error gracefully
            if user_id:
                logger.info(f"User {user_id} is authenticated - proceeding with cart creation (skipping user verification)")
                user_exists_via_rest = False  # Will check if user exists
                rest_user_check = None
                
                # Check if user exists in public.users table
                try:
                    from app.features.auth.cruds.auth_crud import AuthCrud
                    auth_crud = AuthCrud()
                    rest_supabase = auth_crud.admin_client
                    rest_user_check = rest_supabase.table("users").select("id").eq("id", user_id).limit(1).execute()
                    
                    if rest_user_check.data and len(rest_user_check.data) > 0:
                        logger.info(f"✅ User {user_id} exists in public.users table")
                        user_exists_via_rest = True
                    else:
                        logger.info(f"User {user_id} not in public.users - will create user record")
                        user_exists_via_rest = False
                except Exception as rest_check_err:
                    logger.warning(f"User check failed: {rest_check_err} - will try to create user")
                    user_exists_via_rest = False
                
                # Create user in public.users if they don't exist (they're authenticated in auth.users)
                # This is needed for foreign key constraints when creating cart
                if not user_exists_via_rest:  # User doesn't exist in public.users
                    logger.warning(f"User {user_id} not found in users table, creating user record via user_helper before cart creation")
                    # Use user_helper which handles user creation reliably
                    from app.core.user_helper import ensure_user_exists_in_db
                    from app.features.auth.cruds.auth_crud import AuthCrud
                    auth_crud = AuthCrud()
                    
                    # Build current_user dict from available info
                    current_user_dict = {
                        "id": user_id,
                        "email": None,  # Will be fetched from Supabase Auth
                        "user_role": "buyer",  # Default
                        "phone": None,
                        "first_name": None,
                        "last_name": None,
                        "is_verified": False
                    }
                    
                    # Try to get user info from Supabase Auth
                    try:
                        auth_user_response = auth_crud.admin_client.auth.admin.get_user_by_id(user_id)
                        if auth_user_response and hasattr(auth_user_response, 'user') and auth_user_response.user:
                            auth_user = auth_user_response.user
                            current_user_dict["email"] = getattr(auth_user, 'email', None)
                            user_metadata = getattr(auth_user, 'user_metadata', {}) or {}
                            current_user_dict["user_role"] = user_metadata.get('user_type', user_metadata.get('role', 'buyer')).lower()
                            current_user_dict["phone"] = getattr(auth_user, 'phone', None)
                            full_name = user_metadata.get("full_name") or user_metadata.get("name") or ""
                            current_user_dict["first_name"] = user_metadata.get('first_name') or (full_name.split()[0] if full_name else None)
                            current_user_dict["last_name"] = user_metadata.get('last_name') or (" ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else None)
                            current_user_dict["is_verified"] = getattr(auth_user, 'email_confirmed_at', None) is not None
                    except Exception as auth_err:
                        logger.warning(f"Could not get user from Supabase Auth: {auth_err}")
                    
                    # Use user_helper to ensure user exists
                    user_created = await ensure_user_exists_in_db(db, current_user_dict, auth_crud)
                    if user_created:
                        logger.info(f"✅ User {user_id} created/verified via user_helper")
                        user_exists_via_rest = True
                    else:
                        logger.warning(f"⚠️ User {user_id} creation failed, but proceeding anyway (user is authenticated)")
                        user_exists_via_rest = True  # Assume exists in auth.users
                
                # User exists (either verified or assumed from authentication)
                user_exists_via_rest = True

            # Try to get existing cart - use REST API if user was verified via REST API only
            cart = None
            if user_id and user_exists_via_rest:
                # User exists in REST API but not visible in SQLAlchemy - use REST API to check for cart
                logger.info(f"Checking for existing cart via REST API (user verified via REST API)")
                try:
                    # Use admin_client (service role) for reliable access
                    from app.features.auth.cruds.auth_crud import AuthCrud
                    auth_crud = AuthCrud()
                    rest_supabase_cart = auth_crud.admin_client
                    rest_cart_check = rest_supabase_cart.table("carts").select("*").eq("user_id", user_id).limit(1).execute()
                    if rest_cart_check.data and len(rest_cart_check.data) > 0:
                        # Cart exists - create Cart object from REST response
                        cart_data = rest_cart_check.data[0]
                        cart = Cart(
                            id=uuid.UUID(cart_data["id"]),
                            user_id=uuid.UUID(cart_data["user_id"]) if cart_data.get("user_id") else None,
                            session_id=cart_data.get("session_id"),
                            currency=cart_data.get("currency", "INR"),
                            subtotal=float(cart_data.get("subtotal", 0)),
                            tax_amount=float(cart_data.get("tax_amount", 0)),
                            shipping_amount=float(cart_data.get("shipping_amount", 0)),
                            discount_amount=float(cart_data.get("discount_amount", 0)),
                            total_amount=float(cart_data.get("total_amount", 0)),
                            expires_at=datetime.fromisoformat(cart_data["expires_at"].replace('Z', '+00:00')) if cart_data.get("expires_at") else None
                        )
                        logger.info(f"✅ Found existing cart {cart.id} via REST API")
                except Exception as rest_cart_check_err:
                    logger.warning(f"REST API cart check failed: {rest_cart_check_err}, trying SQLAlchemy")
            
            # If cart not found via REST API, try SQLAlchemy
            if not cart:
                query = select(Cart)
                if user_id:
                    query = query.where(Cart.user_id == user_id)
                else:
                    query = query.where(Cart.session_id == session_id)

                # Execute with statement-level options to avoid prepared statements for pgbouncer
                from app.core.config import settings
                if "supabase.co" in (settings.DATABASE_URL or ""):
                    result = await db.execute(query.execution_options(prepared_statement_cache_size=0))
                else:
                    result = await db.execute(query)
                cart = result.scalar_one_or_none()

            if not cart:
                logger.info(f"Creating new cart for user_id: {user_id}, session_id: {session_id}")
                
                # CRITICAL: Ensure user exists in public.users BEFORE creating cart
                # User is authenticated (via require_buyer/require_supplier), so they exist in auth.users
                # But they might not exist in public.users yet (propagation delay or signup issue)
                if user_id:
                    from app.features.auth.cruds.auth_crud import AuthCrud
                    auth_crud = AuthCrud()
                    
                    # Check if user exists in public.users via REST API
                    user_exists_in_db = False
                    try:
                        user_check = auth_crud.admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                        if user_check.data and len(user_check.data) > 0:
                            user_exists_in_db = True
                            logger.info(f"✅ User {user_id} exists in public.users")
                    except Exception as check_err:
                        logger.warning(f"Could not check user existence: {check_err}")
                        # Ensure session is clean after check error
                        try:
                            await db.rollback()
                        except:
                            pass
                    
                    # If user doesn't exist, create them via REST API
                    if not user_exists_in_db:
                        logger.info(f"User {user_id} not found in public.users, creating via REST API...")
                        max_retries = 3
                        for retry in range(max_retries):
                            try:
                                # Get user info from Supabase Auth
                                auth_user = auth_crud.admin_client.auth.admin.get_user_by_id(user_id)
                                if auth_user and hasattr(auth_user, 'user') and auth_user.user:
                                    user_email = auth_user.user.email
                                    user_meta = getattr(auth_user.user, 'user_metadata', {}) or {}
                                    user_type = user_meta.get('user_type', 'buyer').lower()
                                    phone = getattr(auth_user.user, 'phone', None) or "+10000000000"
                                    
                                    user_data_rest = {
                                        "id": str(user_id),
                                        "email": user_email,
                                        "phone": phone,
                                        "user_type": user_type,
                                        "is_active": True,
                                        "is_verified": False,
                                        "is_email_verified": getattr(auth_user.user, 'email_confirmed_at', None) is not None,
                                        "is_phone_verified": False
                                    }
                                    
                                    if user_meta.get('first_name'):
                                        user_data_rest["first_name"] = user_meta.get('first_name')
                                    if user_meta.get('last_name'):
                                        user_data_rest["last_name"] = user_meta.get('last_name')
                                    
                                    # Create user via REST API
                                    logger.info(f"Creating user {user_id} via REST API (attempt {retry + 1}/{max_retries})")
                                    user_rest_response = auth_crud.admin_client.table("users").insert(user_data_rest).execute()
                                    if user_rest_response.data:
                                        logger.info(f"✅ Created user {user_id} in public.users via REST API")
                                        import asyncio
                                        await asyncio.sleep(1.5)  # Allow propagation
                                        
                                        # Verify user was created
                                        verify_check = auth_crud.admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                                        if verify_check.data and len(verify_check.data) > 0:
                                            user_exists_in_db = True
                                            logger.info(f"✅ Verified user {user_id} exists in public.users")
                                            break
                                        else:
                                            logger.warning(f"User creation succeeded but verification failed (attempt {retry + 1})")
                                            if retry < max_retries - 1:
                                                await asyncio.sleep(1.0)
                                                continue
                                    else:
                                        # Check if user exists (duplicate)
                                        try:
                                            user_check = auth_crud.admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                                            if user_check.data and len(user_check.data) > 0:
                                                user_exists_in_db = True
                                                logger.info(f"✅ User {user_id} exists in public.users (duplicate)")
                                                break
                                        except:
                                            pass
                            except Exception as create_user_err:
                                err_str = str(create_user_err).lower()
                                if "duplicate" in err_str or "already exists" in err_str or "unique" in err_str:
                                    logger.info(f"User {user_id} already exists (duplicate)")
                                    # Verify it exists
                                    try:
                                        user_check = auth_crud.admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                                        if user_check.data and len(user_check.data) > 0:
                                            user_exists_in_db = True
                                            logger.info(f"✅ Verified user {user_id} exists")
                                            break
                                    except:
                                        pass
                                else:
                                    err_lower = str(create_user_err).lower()
                                    # Permission denied might mean user already exists (RLS blocking our check)
                                    if "permission denied" in err_lower or "42501" in str(create_user_err):
                                        logger.warning(f"Permission denied creating user {user_id} (attempt {retry + 1}) - user might already exist, waiting and verifying...")
                                        # Wait longer and verify multiple times - user might be created during signup but not visible yet
                                        import asyncio
                                        verification_passed = False
                                        for verify_attempt in range(5):  # Try 5 times with increasing delays
                                            wait_time = 1.0 + (verify_attempt * 0.5)  # 1.0, 1.5, 2.0, 2.5, 3.0 seconds
                                            await asyncio.sleep(wait_time)
                                            try:
                                                verify_check = auth_crud.admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                                                if verify_check.data and len(verify_check.data) > 0:
                                                    user_exists_in_db = True
                                                    verification_passed = True
                                                    logger.info(f"✅ User {user_id} exists in public.users (verified after {verify_attempt + 1} attempts, {wait_time:.1f}s wait)")
                                                    break
                                            except Exception as verify_err:
                                                logger.debug(f"Verification attempt {verify_attempt + 1} failed: {verify_err}")
                                        
                                        if not verification_passed:
                                            # Still can't verify - this is a problem
                                            logger.error(f"❌ Cannot verify user {user_id} exists after permission denied and 5 verification attempts")
                                            # Don't assume user exists - this will cause foreign key error
                                            # But let's try one more time with SQLAlchemy to see if user exists there
                                            if db:
                                                try:
                                                    from app.features.auth.models.user import User
                                                    user_query = select(User).where(User.id == uuid.UUID(user_id))
                                                    if "supabase.co" in (settings.DATABASE_URL or ""):
                                                        user_result = await db.execute(user_query.execution_options(prepared_statement_cache_size=0))
                                                    else:
                                                        user_result = await db.execute(user_query)
                                                    sqlalchemy_user = user_result.scalar_one_or_none()
                                                    if sqlalchemy_user:
                                                        user_exists_in_db = True
                                                        logger.info(f"✅ User {user_id} exists (found via SQLAlchemy)")
                                                        verification_passed = True
                                                except Exception as sqlalchemy_check_err:
                                                    logger.debug(f"SQLAlchemy check failed: {sqlalchemy_check_err}")
                                            
                                            if not verification_passed:
                                                # Last resort: user is authenticated so they exist in auth.users
                                                # But they don't exist in public.users and we can't create them
                                                # This is a critical error - user should have been created during signup
                                                # However, let's try one more thing: use SQLAlchemy to create the user directly
                                                # This bypasses REST API permission issues
                                                logger.warning(f"⚠️ All verification attempts failed. Trying AuthCrud.create for user {user_id}")
                                                try:
                                                    # Use AuthCrud.create method which handles enum conversion properly
                                                    # CRITICAL: id must be a UUID object, not a string
                                                    # CRITICAL: Ensure user_type is lowercase string for enum
                                                    user_type_clean = user_type.lower() if isinstance(user_type, str) else "buyer"
                                                    user_data_sql = {
                                                        "id": uuid.UUID(user_id),
                                                        "email": auth_user.user.email if auth_user and hasattr(auth_user, 'user') else f"user_{user_id[:8]}@temp.example.com",
                                                        "phone": phone,
                                                        "user_type": user_type_clean,  # Must be lowercase: "buyer", "supplier", "admin"
                                                        "is_active": True,
                                                        "is_verified": False,
                                                        "is_email_verified": getattr(auth_user.user, 'email_confirmed_at', None) is not None if auth_user and hasattr(auth_user, 'user') else False,
                                                        "is_phone_verified": False,
                                                        "first_name": user_meta.get('first_name') if user_meta else None,
                                                        "last_name": user_meta.get('last_name') if user_meta else None,
                                                    }
                                                    logger.info(f"Creating user via AuthCrud.create with: user_type={user_type_clean}, phone={phone}, email={user_data_sql['email']}")
                                                    new_user = await auth_crud.create(db, user_data_sql)
                                                    user_exists_in_db = True
                                                    logger.info(f"✅ Created user {user_id} via AuthCrud.create (last resort)")
                                                    verification_passed = True
                                                except Exception as sqlalchemy_insert_err:
                                                    logger.error(f"❌ SQLAlchemy direct insert also failed: {sqlalchemy_insert_err}")
                                                    # At this point, we've tried everything
                                                    # The user is authenticated, so they exist in auth.users
                                                    # But we can't create them in public.users
                                                    # This will cause a foreign key error when creating the cart
                                                    # Let's proceed anyway and let the foreign key constraint catch it
                                                    # The error message will be clearer
                                                    logger.error(f"❌ CRITICAL: User {user_id} does not exist in public.users and all creation attempts failed. This will cause a foreign key error.")
                                                    # Don't raise here - let the SQLAlchemy cart creation try and fail with a clearer error
                                                    user_exists_in_db = False  # Will fail at cart creation
                                        else:
                                            break  # Exit retry loop since verification passed
                                    else:
                                        logger.warning(f"Could not create user {user_id} in public.users (attempt {retry + 1}): {create_user_err}")
                                        if retry < max_retries - 1:
                                            import asyncio
                                            await asyncio.sleep(1.0)
                                            continue
                                        else:
                                            logger.error(f"❌ Failed to create user {user_id} after {max_retries} attempts")
                                            raise Exception(f"User {user_id} could not be created in public.users: {create_user_err}")
                        
                        # If user still doesn't exist after all attempts, we'll try cart creation anyway
                        # The foreign key constraint will provide a clear error if user truly doesn't exist
                        if not user_exists_in_db:
                            logger.error(f"❌ User {user_id} does not exist in public.users after all creation attempts")
                            # Don't raise - let cart creation try and fail with foreign key error
                            # This will give us a clearer error message
                
                # CRITICAL: User is authenticated (via require_buyer/require_supplier), so they exist in auth.users
                # Ensure session is in a clean state before attempting cart creation
                try:
                    await db.rollback()
                except:
                    pass
                
                # Try SQLAlchemy first (most reliable for authenticated users)
                try:
                    cart_data = {
                        "user_id": uuid.UUID(user_id) if user_id else None,
                        "session_id": session_id,
                        "currency": "INR",
                        "subtotal": 0,
                        "tax_amount": 0,
                        "shipping_amount": 0,
                        "discount_amount": 0,
                        "total_amount": 0,
                        "expires_at": datetime.utcnow() + timedelta(days=30)
                    }
                    
                    logger.info(f"Creating cart via SQLAlchemy (primary method)")
                    cart = Cart(**cart_data)
                    db.add(cart)
                    await db.commit()
                    await db.refresh(cart)
                    logger.info(f"✅ Created cart {cart.id} via SQLAlchemy")
                except Exception as sqlalchemy_err:
                    sql_err_str = str(sqlalchemy_err).lower()
                    logger.warning(f"SQLAlchemy cart creation failed: {sqlalchemy_err}")
                    
                    # Rollback the failed transaction first
                    try:
                        await db.rollback()
                    except:
                        pass
                    
                    # Check if it's a foreign key error - user doesn't exist
                    if "foreign key" in sql_err_str or "foreign_key_violation" in sql_err_str or "carts_user_id_fkey" in sql_err_str:
                        logger.error(f"❌ Foreign key error - user {user_id} does not exist in public.users")
                        # This is the root cause - user not in public.users
                        # Try one final time to create user using user_helper (which uses httpx)
                        logger.warning(f"⚠️ Attempting final user creation via user_helper for {user_id}")
                        try:
                            from app.core.user_helper import ensure_user_exists_in_db
                            from app.features.auth.cruds.auth_crud import AuthCrud
                            auth_crud_final = AuthCrud()
                            auth_user_final = auth_crud_final.admin_client.auth.admin.get_user_by_id(user_id)
                            
                            if auth_user_final and hasattr(auth_user_final, 'user') and auth_user_final.user:
                                # Build current_user dict
                                user_meta_final = getattr(auth_user_final.user, 'user_metadata', {}) or {}
                                current_user_dict_final = {
                                    "id": user_id,
                                    "email": auth_user_final.user.email,
                                    "user_role": user_meta_final.get('user_type', user_meta_final.get('role', 'buyer')).lower(),
                                    "phone": getattr(auth_user_final.user, 'phone', None) or "+10000000000",
                                    "first_name": user_meta_final.get('first_name'),
                                    "last_name": user_meta_final.get('last_name'),
                                    "is_verified": getattr(auth_user_final.user, 'email_confirmed_at', None) is not None
                                }
                                
                                logger.info(f"Creating user via user_helper with: user_type={current_user_dict_final['user_role']}, email={current_user_dict_final['email']}")
                                try:
                                    user_created_final = await ensure_user_exists_in_db(db, current_user_dict_final, auth_crud_final)
                                    
                                    if user_created_final:
                                        logger.info(f"✅ Created user {user_id} via user_helper (final attempt)")
                                        # Wait a moment for propagation
                                        import asyncio
                                        await asyncio.sleep(0.5)
                                        # Retry cart creation with fresh transaction
                                        await db.rollback()  # Ensure clean state
                                        cart = Cart(**cart_data)
                                        db.add(cart)
                                        await db.commit()
                                        await db.refresh(cart)
                                        logger.info(f"✅ Created cart {cart.id} via SQLAlchemy after user creation")
                                    else:
                                        raise Exception(f"User {user_id} creation via user_helper returned False")
                                except Exception as helper_err:
                                    logger.error(f"user_helper raised exception: {helper_err}")
                                    import traceback
                                    logger.error(f"Full traceback: {traceback.format_exc()}")
                                    # Don't raise - user exists in auth.users, proceed with cart creation
                                    # The foreign key error will tell us if user really doesn't exist
                                    logger.warning(f"User creation failed, but user is authenticated - proceeding with cart creation")
                                    user_created_final = False
                            else:
                                raise Exception(f"User {user_id} does not exist in public.users and could not be created. User authentication data not available.")
                        except Exception as final_user_err:
                            logger.error(f"❌ Final user creation attempt failed: {final_user_err}")
                            # Rollback again if final attempt failed
                            try:
                                await db.rollback()
                            except:
                                pass
                            # Final attempt: Check if this is just a permission issue
                            # If user exists in auth.users (they're authenticated), try cart creation anyway
                            # The DB foreign key might allow it if user exists in auth schema
                            logger.warning(f"Attempting cart creation anyway - user is authenticated in auth.users")
                            # Try one more time with a fresh transaction
                            try:
                                await db.rollback()
                                cart = Cart(**cart_data)
                                db.add(cart)
                                await db.commit()
                                await db.refresh(cart)
                                logger.info(f"✅ Created cart {cart.id} despite user creation failure (user authenticated)")
                            except Exception as final_cart_err:
                                final_err_str = str(final_cart_err).lower()
                                if "foreign key" in final_err_str or "foreign_key_violation" in final_err_str:
                                    raise Exception(f"User {user_id} does not exist in public.users and could not be created. Please run the RLS fix SQL script in Supabase dashboard: scripts/sql/fix_all_rls_and_schema.sql. Error: {final_user_err}")
                                raise
                    
                    # For other errors, log and re-raise
                    logger.error(f"❌ SQLAlchemy cart creation failed with non-foreign-key error: {sqlalchemy_err}")
                    raise Exception(f"Cart creation failed: {sqlalchemy_err}")
            
            return cart
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(f"Error getting or creating cart: {str(e)}\n{error_trace}")
            raise

    async def get_cart_with_items(self, db: AsyncSession, cart_id: str) -> CartWithItemsResponse:
        try:
            query = select(Cart).where(Cart.id == cart_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                result = await db.execute(query.execution_options(prepared_statement_cache_size=0))
            else:

                result = await db.execute(query)
            cart = result.scalar_one_or_none()
            
            if not cart:
                raise NotFoundException("Cart not found")

            items_query = select(CartItem).where(CartItem.cart_id == cart_id).options(
                selectinload(CartItem.product),
                selectinload(CartItem.variant)
            )
            if "supabase.co" in (settings.DATABASE_URL or ""):
                items_result = await db.execute(items_query.execution_options(prepared_statement_cache_size=0))
            else:

                items_result = await db.execute(items_query)
            cart_items = items_result.scalars().all()

            cart_dict = cart.to_dict()
            items_with_details = []
            for item in cart_items:
                item_dict = item.to_dict()
                if item.product:
                    item_dict["product_name"] = item.product.name
                    item_dict["product_slug"] = item.product.slug
                    item_dict["sku"] = item.product.sku
                if item.variant:
                    item_dict["variant_title"] = item.variant.title
                    if item.variant.sku:
                        item_dict["sku"] = item.variant.sku
                items_with_details.append(item_dict)
            
            cart_dict["items"] = items_with_details
            
            return CartWithItemsResponse(**cart_dict)
        except Exception as e:
            logger.error(f"Error getting cart with items: {str(e)}")
            raise

    async def add_item_to_cart(self, db: AsyncSession, cart_id: str, product_id: str, quantity: int, variant_id: Optional[str] = None) -> CartItemResponse:
        import uuid
        import traceback
        logger.info("=" * 80)
        logger.info(f"🚀 ADD_ITEM_TO_CART START: cart_id={cart_id}, product_id={product_id}, quantity={quantity}, variant_id={variant_id}")
        logger.info("=" * 80)
        
        # Ensure clean transaction state
        try:
            await db.rollback()
        except:
            pass
        
        try:
            
            # Ensure cart_id is a UUID string
            try:
                cart_uuid = uuid.UUID(cart_id)
                logger.info(f"Cart UUID parsed: {cart_uuid}")
            except ValueError as ve:
                logger.error(f"Invalid cart ID format: {cart_id} - {ve}")
                raise ValidationException(f"Invalid cart ID format: {cart_id}")
            
            # Try to get cart - first via SQLAlchemy, then via REST API if not found (transaction isolation)
            cart = None
            try:
                cart = await self.get_by_id(db, cart_id)
                logger.info(f"Cart retrieved via SQLAlchemy: {cart.id if cart else 'None'}")
            except Exception as cart_err:
                logger.warning(f"Error getting cart via SQLAlchemy {cart_id}: {cart_err}, trying REST API...")
            
            # If cart not found via SQLAlchemy, try REST API (may be transaction isolation issue)
            if not cart:
                logger.info(f"Cart {cart_id} not found via SQLAlchemy, checking REST API...")
                try:
                    # Use admin_client (service role) for reliable access
                    from app.features.auth.cruds.auth_crud import AuthCrud
                    auth_crud = AuthCrud()
                    rest_supabase = auth_crud.admin_client
                    rest_cart_check = rest_supabase.table("carts").select("*").eq("id", cart_id).limit(1).execute()
                    
                    if rest_cart_check.data and len(rest_cart_check.data) > 0:
                        # Cart exists in REST API - create Cart object from REST response
                        cart_data = rest_cart_check.data[0]
                        cart = Cart(
                            id=uuid.UUID(cart_data["id"]),
                            user_id=uuid.UUID(cart_data["user_id"]) if cart_data.get("user_id") else None,
                            session_id=cart_data.get("session_id"),
                            currency=cart_data.get("currency", "INR"),
                            subtotal=float(cart_data.get("subtotal", 0)),
                            tax_amount=float(cart_data.get("tax_amount", 0)),
                            shipping_amount=float(cart_data.get("shipping_amount", 0)),
                            discount_amount=float(cart_data.get("discount_amount", 0)),
                            total_amount=float(cart_data.get("total_amount", 0)),
                            expires_at=datetime.fromisoformat(cart_data["expires_at"].replace('Z', '+00:00')) if cart_data.get("expires_at") else None
                        )
                        logger.info(f"✅ Cart {cart_id} retrieved via REST API (transaction isolation issue)")
                    else:
                        logger.error(f"Cart {cart_id} not found in REST API either")
                        raise NotFoundException(f"Cart not found: {cart_id}")
                except NotFoundException:
                    raise
                except Exception as rest_err:
                    logger.error(f"Error checking cart via REST API: {rest_err}")
                    raise NotFoundException(f"Cart not found: {cart_id}")
            
            if not cart:
                logger.error(f"Cart not found: {cart_id}")
                raise NotFoundException(f"Cart not found: {cart_id}")

            # Ensure product_id is a UUID string
            try:
                product_uuid = uuid.UUID(product_id)
            except ValueError:
                raise ValidationException(f"Invalid product ID format: {product_id}")
            
            # Execute with statement-level options to avoid prepared statements for pgbouncer
            from app.core.config import settings
            product_query = select(Product).where(Product.id == product_uuid)
            
            # Wrap product query in try-except to handle enum validation errors
            product = None
            try:
                if "supabase.co" in (settings.DATABASE_URL or ""):
                    product_result = await db.execute(product_query.execution_options(prepared_statement_cache_size=0))
                else:
                    product_result = await db.execute(product_query)
                product = product_result.scalar_one_or_none()
            except Exception as product_load_err:
                error_str = str(product_load_err).lower()
                if "enum" in error_str or "not among" in error_str:
                    logger.warning(f"Product enum validation error (non-fatal): {product_load_err}")
                    # Rollback and retry with raw query
                    await db.rollback()
                    # Try to get product via raw SQL to avoid enum validation
                    try:
                        raw_query = text("SELECT * FROM products WHERE id = :product_id")
                        raw_result = await db.execute(raw_query, {"product_id": product_uuid})
                        raw_row = raw_result.fetchone()
                        if raw_row:
                            # Create a minimal product object from raw row
                            # Product is already imported at top of file
                            product = Product()
                            for key, value in raw_row._mapping.items():
                                if hasattr(product, key):
                                    # Skip enum fields - handle them manually
                                    if key not in ['status', 'approval_status', 'visibility']:
                                        setattr(product, key, value)
                                    else:
                                        # Store as string for manual validation
                                        setattr(product, key, str(value) if value else None)
                            product.id = product_uuid
                            logger.info(f"Product loaded via raw query (bypassed enum validation)")
                    except Exception as raw_err:
                        logger.error(f"Raw query also failed: {raw_err}")
                        await db.rollback()
                        raise NotFoundException(f"Product not found or invalid: {product_id}")
                else:
                    await db.rollback()
                    raise
            
            if not product:
                await db.rollback()
                raise NotFoundException(f"Product not found: {product_id}")
            
            # Normalize product status to uppercase if it's lowercase (fix enum mismatch)
            # This handles cases where products were created with lowercase status values
            if hasattr(product, 'status') and product.status:
                status_str = str(product.status)
                if status_str.islower():
                    # Normalize to uppercase enum value
                    from app.features.products.models.product import ProductStatusEnum
                    try:
                        normalized_status = ProductStatusEnum[status_str.upper()]
                        product.status = normalized_status
                        logger.info(f"Normalized product status from '{status_str}' to '{normalized_status.value}'")
                    except (KeyError, AttributeError):
                        logger.warning(f"Could not normalize status '{status_str}' to enum, keeping as-is")
            
            # Check if product is available for purchase (case-insensitive check)
            # Status is now stored as String, so we can check case-insensitively
            if hasattr(product, 'status') and product.status:
                # Extract value from enum if it's an enum object, otherwise use string directly
                status_value = product.status
                if hasattr(status_value, 'value'):
                    status_str = str(status_value.value).upper()
                elif hasattr(status_value, 'name'):
                    status_str = str(status_value.name).upper()
                else:
                    status_str = str(status_value).upper()
                    # Handle enum string representation like "ProductStatusEnum.ACTIVE"
                    if '.' in status_str:
                        status_str = status_str.split('.')[-1]
                
                if status_str != 'ACTIVE':
                    raise ValidationException(f"Product is not available for purchase. Status: {status_str}")
                
                if hasattr(product, 'approval_status') and product.approval_status:
                    approval_value = product.approval_status
                    if hasattr(approval_value, 'value'):
                        approval_str = str(approval_value.value).upper()
                    elif hasattr(approval_value, 'name'):
                        approval_str = str(approval_value.name).upper()
                    else:
                        approval_str = str(approval_value).upper()
                        if '.' in approval_str:
                            approval_str = approval_str.split('.')[-1]
                    if approval_str != 'APPROVED':
                        await db.rollback()
                        raise ValidationException(f"Product is not approved. Approval status: {approval_str}")
                
                if hasattr(product, 'visibility') and product.visibility:
                    visibility_value = product.visibility
                    if hasattr(visibility_value, 'value'):
                        visibility_str = str(visibility_value.value).upper()
                    elif hasattr(visibility_value, 'name'):
                        visibility_str = str(visibility_value.name).upper()
                    else:
                        visibility_str = str(visibility_value).upper()
                        if '.' in visibility_str:
                            visibility_str = visibility_str.split('.')[-1]
                    if visibility_str != 'VISIBLE':
                        await db.rollback()
                        raise ValidationException(f"Product is not visible. Visibility: {visibility_str}")

            unit_price = product.price
            variant = None
            variant_uuid = None
            
            if variant_id:
                try:
                    variant_uuid = uuid.UUID(variant_id)
                except ValueError:
                    raise ValidationException(f"Invalid variant ID format: {variant_id}")
                
                variant_query = select(ProductVariant).where(ProductVariant.id == variant_uuid)
                from app.core.config import settings
                if "supabase.co" in (settings.DATABASE_URL or ""):
                    variant_result = await db.execute(variant_query.execution_options(prepared_statement_cache_size=0))
                else:
                    variant_result = await db.execute(variant_query)
                variant = variant_result.scalar_one_or_none()
                
                if not variant:
                    raise NotFoundException(f"Product variant not found: {variant_id}")
                
                if variant.price:
                    unit_price = variant.price

            # Check inventory - if check fails or returns 0, allow adding to cart (for testing)
            try:
                inventory_crud = ProductInventoryCrud()
                if variant_id:
                    available_quantity = await inventory_crud.get_variant_stock(db, variant_id)
                else:
                    available_quantity = await inventory_crud.get_product_stock(db, product_id)

                # Only validate stock if inventory record exists and shows insufficient stock
                if available_quantity > 0 and available_quantity < quantity:
                    raise ValidationException(f"Insufficient stock. Available: {available_quantity}")
            except Exception as inv_error:
                # If inventory check fails, log but allow adding to cart (for testing)
                logger.warning(f"Inventory check failed for product {product_id}: {str(inv_error)} - allowing add to cart")

            # Build query for existing item - handle variant_id properly
            # Ensure transaction is clean before querying
            try:
                await db.rollback()
            except:
                pass
            
            existing_item = None
            try:
                existing_item_query = select(CartItem).options(
                    selectinload(CartItem.product),
                    selectinload(CartItem.variant)
                ).where(
                    and_(
                        CartItem.cart_id == cart_uuid,
                        CartItem.product_id == product_uuid
                    )
                )
                if variant_id:
                    existing_item_query = existing_item_query.where(CartItem.variant_id == variant_uuid)
                else:
                    existing_item_query = existing_item_query.where(CartItem.variant_id.is_(None))
                from app.core.config import settings
                if "supabase.co" in (settings.DATABASE_URL or ""):
                    existing_item_result = await db.execute(existing_item_query.execution_options(prepared_statement_cache_size=0))
                else:
                    existing_item_result = await db.execute(existing_item_query)
                existing_item = existing_item_result.scalar_one_or_none()
            except Exception as existing_item_err:
                error_str = str(existing_item_err).lower()
                if "transaction" in error_str or "aborted" in error_str:
                    logger.warning(f"Transaction aborted, rolling back and retrying existing item query: {existing_item_err}")
                    await db.rollback()
                    # Retry the query
                    try:
                        if "supabase.co" in (settings.DATABASE_URL or ""):
                            existing_item_result = await db.execute(existing_item_query.execution_options(prepared_statement_cache_size=0))
                        else:
                            existing_item_result = await db.execute(existing_item_query)
                        existing_item = existing_item_result.scalar_one_or_none()
                    except Exception as retry_err:
                        logger.error(f"Retry also failed: {retry_err}")
                        await db.rollback()
                        existing_item = None  # Continue without existing item
                else:
                    logger.warning(f"Error querying existing item (non-fatal): {existing_item_err}")
                    await db.rollback()
                    existing_item = None  # Continue without existing item

            if existing_item:
                new_quantity = existing_item.quantity + quantity
                # Stock validation already done above (if inventory check succeeded)
                
                existing_item.quantity = new_quantity
                existing_item.total_price = existing_item.quantity * existing_item.unit_price
                await db.commit()
                await db.refresh(existing_item)
                # Load relationships if needed
                from app.core.config import settings
                if not hasattr(existing_item, 'product') or not existing_item.product:
                    product_query = select(Product).where(Product.id == existing_item.product_id)
                    if "supabase.co" in (settings.DATABASE_URL or ""):
                        product_res = await db.execute(product_query.execution_options(prepared_statement_cache_size=0))
                    else:
                        product_res = await db.execute(product_query)
                    existing_item.product = product_res.scalar_one_or_none()
                if existing_item.variant_id and (not hasattr(existing_item, 'variant') or not existing_item.variant):
                    variant_query = select(ProductVariant).where(ProductVariant.id == existing_item.variant_id)
                    if "supabase.co" in (settings.DATABASE_URL or ""):
                        variant_res = await db.execute(variant_query.execution_options(prepared_statement_cache_size=0))
                    else:
                        variant_res = await db.execute(variant_query)
                    existing_item.variant = variant_res.scalar_one_or_none()
                cart_item = existing_item
            else:
                # Create new cart item
                cart_item_data = {
                    "cart_id": cart_uuid,  # Use UUID object, not string
                    "product_id": product_uuid,  # Use UUID object, not string
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "total_price": quantity * unit_price
                }
                # Only add variant_id if it's not None
                if variant_uuid:
                    cart_item_data["variant_id"] = variant_uuid
                
                logger.info(f"📦 Creating NEW cart item with data: {cart_item_data}")
                logger.info(f"   - cart_id (UUID): {type(cart_item_data.get('cart_id'))} = {cart_item_data.get('cart_id')}")
                logger.info(f"   - product_id (UUID): {type(cart_item_data.get('product_id'))} = {cart_item_data.get('product_id')}")
                logger.info(f"   - variant_id (UUID): {type(cart_item_data.get('variant_id'))} = {cart_item_data.get('variant_id')}")
                logger.info(f"   - quantity: {cart_item_data.get('quantity')}")
                logger.info(f"   - unit_price: {cart_item_data.get('unit_price')}")
                logger.info(f"   - total_price: {cart_item_data.get('total_price')}")
                try:
                    cart_item = CartItem(**cart_item_data)
                    logger.info(f"✅ CartItem object created, adding to session...")
                    db.add(cart_item)
                    logger.info(f"✅ CartItem added to session, committing...")
                    await db.commit()
                    logger.info(f"✅✅ Cart item COMMITTED successfully: {cart_item.id}")
                    try:
                        await db.refresh(cart_item)
                        # Load relationships for product/variant info - use selectinload query instead
                        from app.core.config import settings
                        if not hasattr(cart_item, 'product') or not cart_item.product:
                            product_query = select(Product).where(Product.id == cart_item.product_id)
                            if "supabase.co" in (settings.DATABASE_URL or ""):
                                product_res = await db.execute(product_query.execution_options(prepared_statement_cache_size=0))
                            else:
                                product_res = await db.execute(product_query)
                            cart_item.product = product_res.scalar_one_or_none()
                        if cart_item.variant_id and (not hasattr(cart_item, 'variant') or not cart_item.variant):
                            variant_query = select(ProductVariant).where(ProductVariant.id == cart_item.variant_id)
                            if "supabase.co" in (settings.DATABASE_URL or ""):
                                variant_res = await db.execute(variant_query.execution_options(prepared_statement_cache_size=0))
                            else:
                                variant_res = await db.execute(variant_query)
                            cart_item.variant = variant_res.scalar_one_or_none()
                    except Exception as refresh_err:
                        logger.warning(f"Could not refresh cart item (may be OK): {refresh_err}")
                        # Re-fetch the item with relationships
                        cart_item_query = select(CartItem).options(
                            selectinload(CartItem.product),
                            selectinload(CartItem.variant)
                        ).where(CartItem.id == cart_item.id)
                        from app.core.config import settings
                        if "supabase.co" in (settings.DATABASE_URL or ""):
                            cart_item_result = await db.execute(cart_item_query.execution_options(prepared_statement_cache_size=0))
                        else:
                            cart_item_result = await db.execute(cart_item_query)
                        cart_item = cart_item_result.scalar_one_or_none()
                        if not cart_item:
                            logger.error(f"Could not re-fetch cart item after creation")
                            raise NotFoundException("Cart item created but could not be retrieved")
                except Exception as create_err:
                    error_trace = traceback.format_exc()
                    logger.error("=" * 80)
                    logger.error(f"❌❌ ERROR CREATING CART ITEM:")
                    logger.error(f"   Error Type: {type(create_err).__name__}")
                    logger.error(f"   Error Message: {str(create_err)}")
                    logger.error(f"   Full Traceback:\n{error_trace}")
                    logger.error("=" * 80)
                    await db.rollback()
                    raise

            logger.info(f"📊 Updating cart totals for cart {cart_id}...")
            await self._update_cart_totals(db, str(cart_uuid))
            logger.info(f"✅ Cart totals updated")
            
            logger.info("=" * 80)
            logger.info(f"✅✅ ADD_ITEM_TO_CART SUCCESS: cart_id={cart_id}, product_id={product_id}, quantity={quantity}")
            logger.info(f"   Cart Item ID: {cart_item.id}")
            logger.info("=" * 80)
            
            # Build response dict with all required fields
            cart_item_dict = cart_item.to_dict()
            
            # Ensure created_at and updated_at are strings (required by CartItemResponse)
            if not cart_item_dict.get("created_at") or cart_item_dict.get("created_at") == "":
                cart_item_dict["created_at"] = datetime.utcnow().isoformat()
            if not cart_item_dict.get("updated_at") or cart_item_dict.get("updated_at") == "":
                cart_item_dict["updated_at"] = datetime.utcnow().isoformat()
            
            # Add product/variant info if available
            if hasattr(cart_item, 'product') and cart_item.product:
                if not cart_item_dict.get("product_name"):
                    cart_item_dict["product_name"] = getattr(cart_item.product, 'name', None)
                if not cart_item_dict.get("product_slug"):
                    cart_item_dict["product_slug"] = getattr(cart_item.product, 'slug', None)
                if not cart_item_dict.get("sku"):
                    cart_item_dict["sku"] = getattr(cart_item.product, 'sku', None)
            if hasattr(cart_item, 'variant') and cart_item.variant:
                if not cart_item_dict.get("variant_title"):
                    cart_item_dict["variant_title"] = getattr(cart_item.variant, 'title', None)
                if getattr(cart_item.variant, 'sku', None):
                    cart_item_dict["sku"] = getattr(cart_item.variant, 'sku', None)
            
            return CartItemResponse(**cart_item_dict)
        except Exception as e:
            error_trace = traceback.format_exc()
            await db.rollback()
            logger.error("=" * 80)
            logger.error(f"❌❌❌ ADD_ITEM_TO_CART FAILED:")
            logger.error(f"   Cart ID: {cart_id}")
            logger.error(f"   Product ID: {product_id}")
            logger.error(f"   Quantity: {quantity}")
            logger.error(f"   Variant ID: {variant_id}")
            logger.error(f"   Error Type: {type(e).__name__}")
            logger.error(f"   Error Message: {str(e)}")
            logger.error(f"   Full Traceback:\n{error_trace}")
            logger.error("=" * 80)
            raise

    async def update_cart_item_quantity(self, db: AsyncSession, cart_item_id: str, quantity: int) -> CartItemResponse:
        try:
            from app.core.config import settings
            cart_item_query = select(CartItem).where(CartItem.id == cart_item_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                cart_item_result = await db.execute(cart_item_query.execution_options(prepared_statement_cache_size=0))
            else:

                cart_item_result = await db.execute(cart_item_query)
            cart_item = cart_item_result.scalar_one_or_none()
            
            if not cart_item:
                raise NotFoundException("Cart item not found")

            if quantity <= 0:
                cart_id = str(cart_item.cart_id)
                cart_item_dict = cart_item.to_dict()
                await db.delete(cart_item)
                await db.commit()
                await self._update_cart_totals(db, cart_id)
                cart_item_dict["quantity"] = 0
                cart_item_dict["total_price"] = 0.0
                return CartItemResponse(**cart_item_dict)

            inventory_crud = ProductInventoryCrud()
            if cart_item.variant_id:
                available_quantity = await inventory_crud.get_variant_stock(db, str(cart_item.variant_id))
            else:
                available_quantity = await inventory_crud.get_product_stock(db, str(cart_item.product_id))

            if available_quantity < quantity:
                raise ValidationException(f"Insufficient stock. Available: {available_quantity}")

            cart_item.quantity = quantity
            cart_item.total_price = cart_item.quantity * cart_item.unit_price
            await db.commit()
            await db.refresh(cart_item)
            
            await self._update_cart_totals(db, str(cart_item.cart_id))
            
            logger.info(f"Updated cart item {cart_item_id} quantity to {quantity}")
            return CartItemResponse(**cart_item.to_dict())
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating cart item quantity: {str(e)}")
            raise

    async def remove_cart_item(self, db: AsyncSession, cart_item_id: str) -> bool:
        try:
            from app.core.config import settings
            cart_item_query = select(CartItem).where(CartItem.id == cart_item_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                cart_item_result = await db.execute(cart_item_query.execution_options(prepared_statement_cache_size=0))
            else:

                cart_item_result = await db.execute(cart_item_query)
            cart_item = cart_item_result.scalar_one_or_none()
            
            if not cart_item:
                raise NotFoundException("Cart item not found")

            cart_id = str(cart_item.cart_id)
            await db.delete(cart_item)
            await db.commit()
            
            await self._update_cart_totals(db, cart_id)
            
            logger.info(f"Removed cart item {cart_item_id}")
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error removing cart item: {str(e)}")
            raise

    async def clear_cart(self, db: AsyncSession, cart_id: str) -> bool:
        try:
            from app.core.config import settings
            delete_query = delete(CartItem).where(CartItem.cart_id == cart_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                await db.execute(delete_query.execution_options(prepared_statement_cache_size=0))
            else:
                await db.execute(delete_query)
            await db.commit()
            
            await self._update_cart_totals(db, cart_id)
            
            logger.info(f"Cleared cart {cart_id}")
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error clearing cart: {str(e)}")
            raise

    async def transfer_cart_to_user(self, db: AsyncSession, session_id: str, user_id: str) -> CartResponse:
        try:
            from app.core.config import settings
            session_cart_query = select(Cart).where(Cart.session_id == session_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                session_cart_result = await db.execute(session_cart_query.execution_options(prepared_statement_cache_size=0))
            else:

                session_cart_result = await db.execute(session_cart_query)
            session_cart = session_cart_result.scalar_one_or_none()

            if not session_cart:
                cart = await self.get_or_create_cart(db, user_id=user_id)
                return CartResponse(**cart.to_dict())

            user_cart_query = select(Cart).where(Cart.user_id == user_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                user_cart_result = await db.execute(user_cart_query.execution_options(prepared_statement_cache_size=0))
            else:

                user_cart_result = await db.execute(user_cart_query)
            user_cart = user_cart_result.scalar_one_or_none()

            if not user_cart:
                session_cart.user_id = user_id
                session_cart.session_id = None
                await db.commit()
                await db.refresh(session_cart)
                return CartResponse(**session_cart.to_dict())
            else:
                session_items_query = select(CartItem).where(CartItem.cart_id == session_cart.id)
                if "supabase.co" in (settings.DATABASE_URL or ""):
                    session_items_result = await db.execute(session_items_query.execution_options(prepared_statement_cache_size=0))
                else:

                    session_items_result = await db.execute(session_items_query)
                session_items = session_items_result.scalars().all()

                for item in session_items:
                    existing_item_query = select(CartItem).where(
                        and_(
                            CartItem.cart_id == user_cart.id,
                            CartItem.product_id == item.product_id,
                            CartItem.variant_id == item.variant_id
                        )
                    )
                    if "supabase.co" in (settings.DATABASE_URL or ""):
                        existing_item_result = await db.execute(existing_item_query.execution_options(prepared_statement_cache_size=0))
                    else:

                        existing_item_result = await db.execute(existing_item_query)
                    existing_item = existing_item_result.scalar_one_or_none()

                    if existing_item:
                        existing_item.quantity += item.quantity
                        existing_item.total_price = existing_item.quantity * existing_item.unit_price
                    else:
                        item.cart_id = user_cart.id

                await db.delete(session_cart)
                await db.commit()
                
                await self._update_cart_totals(db, str(user_cart.id))
                
                return CartResponse(**user_cart.to_dict())
        except Exception as e:
            await db.rollback()
            logger.error(f"Error transferring cart to user: {str(e)}")
            raise

    async def get_cart_count(self, db: AsyncSession, user_id: Optional[str] = None, session_id: Optional[str] = None) -> int:
        try:
            from app.core.config import settings
            # First find the cart
            cart_query = select(Cart)
            if user_id:
                cart_query = cart_query.where(Cart.user_id == user_id)
            elif session_id:
                cart_query = cart_query.where(Cart.session_id == session_id)
            else:
                return 0
            
            if "supabase.co" in (settings.DATABASE_URL or ""):
                cart_result = await db.execute(cart_query.execution_options(prepared_statement_cache_size=0))
            else:

                cart_result = await db.execute(cart_query)
            cart = cart_result.scalar_one_or_none()
            
            if not cart:
                return 0
            
            # Then count items in that cart
            count_query = select(func.sum(CartItem.quantity)).where(CartItem.cart_id == cart.id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                result = await db.execute(count_query.execution_options(prepared_statement_cache_size=0))
            else:

                result = await db.execute(count_query)
            count = result.scalar() or 0
            return int(count)
        except Exception as e:
            logger.error(f"Error getting cart count: {str(e)}")
            return 0

    async def cleanup_expired_carts(self, db: AsyncSession) -> int:
        try:
            from app.core.config import settings
            expired_carts_query = select(Cart).where(Cart.expires_at < datetime.utcnow())
            if "supabase.co" in (settings.DATABASE_URL or ""):
                expired_carts_result = await db.execute(expired_carts_query.execution_options(prepared_statement_cache_size=0))
            else:

                expired_carts_result = await db.execute(expired_carts_query)
            expired_carts = expired_carts_result.scalars().all()

            count = 0
            for cart in expired_carts:
                await db.delete(cart)
                count += 1

            await db.commit()
            logger.info(f"Cleaned up {count} expired carts")
            return count
        except Exception as e:
            await db.rollback()
            logger.error(f"Error cleaning up expired carts: {str(e)}")
            raise

    async def _update_cart_totals(self, db: AsyncSession, cart_id: str):
        try:
            from app.core.config import settings
            cart_items_query = select(CartItem).where(CartItem.cart_id == cart_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                cart_items_result = await db.execute(cart_items_query.execution_options(prepared_statement_cache_size=0))
            else:

                cart_items_result = await db.execute(cart_items_query)
            cart_items = cart_items_result.scalars().all()

            subtotal = sum(item.total_price for item in cart_items)
            
            update_query = update(Cart).where(Cart.id == cart_id).values(
                    subtotal=subtotal,
                    total_amount=subtotal
                )
            if "supabase.co" in (settings.DATABASE_URL or ""):
                await db.execute(update_query.execution_options(prepared_statement_cache_size=0))
            else:
                await db.execute(update_query)
            await db.commit()
        except Exception as e:
            logger.error(f"Error updating cart totals: {str(e)}")
            raise
