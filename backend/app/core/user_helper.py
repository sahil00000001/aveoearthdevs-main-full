"""
Helper functions to ensure user exists in public.users table
"""
from typing import Dict, Any, Optional
from app.core.logging import get_logger
from app.features.auth.cruds.auth_crud import AuthCrud
from app.features.auth.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = get_logger("core.user_helper")

async def ensure_user_exists_in_db(
    db: AsyncSession,
    current_user: Dict[str, Any],
    auth_crud: Optional[AuthCrud] = None
) -> bool:
    """
    Ensure user exists in public.users table. Returns True if user exists or was created.
    Returns False if user creation failed.
    """
    if not current_user or not current_user.get("id"):
        logger.warning("ensure_user_exists_in_db: No user ID provided")
        return False
    
    user_id = current_user["id"]
    
    if not auth_crud:
        auth_crud = AuthCrud()
    
    # First, check if user exists
    try:
        user_data = await auth_crud.get_by_id(db, user_id)
        if user_data:
            logger.info(f"✅ User {user_id} already exists in database")
            return True
    except Exception as get_err:
        logger.warning(f"Error checking user existence: {get_err}")
    
    # User doesn't exist, create them
    logger.info(f"User {user_id} not found in database, creating user record")
    try:
        admin_client = auth_crud.admin_client
        
        # Get user info from Supabase Auth
        user_email = current_user.get("email", "")
        user_type_str = current_user.get("user_role", "buyer")
        if isinstance(user_type_str, str):
            user_type_str = user_type_str.lower()
        
        first_name = current_user.get("first_name")
        last_name = current_user.get("last_name")
        
        # Try to get more info from Supabase Auth
        try:
            auth_user_response = admin_client.auth.admin.get_user_by_id(user_id)
            if auth_user_response and hasattr(auth_user_response, 'user') and auth_user_response.user:
                auth_user = auth_user_response.user
                if not user_email:
                    user_email = getattr(auth_user, 'email', '')
                user_metadata = getattr(auth_user, 'user_metadata', {}) or {}
                if not user_type_str or user_type_str == 'buyer':
                    user_type_from_meta = user_metadata.get('user_type', user_metadata.get('role', 'buyer'))
                    user_type_str = user_type_from_meta.lower() if isinstance(user_type_from_meta, str) else 'buyer'
                if not first_name:
                    full_name = user_metadata.get("full_name") or user_metadata.get("name") or ""
                    first_name = user_metadata.get("first_name") or (full_name.split()[0] if full_name else "User")
                    last_name = user_metadata.get("last_name") or (" ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else "")
        except Exception as auth_err:
            logger.warning(f"Could not get user from Supabase Auth: {auth_err}")
        
        # Prepare user data - ensure all required fields are present and correctly formatted
        user_rest_data = {
            "id": str(user_id),  # Ensure it's a string
            "email": user_email or f"user-{str(user_id)[:8]}@temp.example.com",
            "phone": current_user.get("phone") or "+10000000000",
            "user_type": user_type_str.lower() if isinstance(user_type_str, str) else "buyer",  # Must be lowercase
            "is_verified": current_user.get("is_verified", False),
            "is_active": True,
            "is_email_verified": current_user.get("is_verified", False),
            "is_phone_verified": False
        }
        
        # Add optional fields only if they exist
        if first_name:
            user_rest_data["first_name"] = first_name
        if last_name:
            user_rest_data["last_name"] = last_name
        
        # FIRST: Check if user already exists (to avoid unnecessary creation attempts)
        try:
            from app.core.config import settings
            import httpx
            
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
                # Check if user exists first
                check_url = f"{settings.SUPABASE_URL}/rest/v1/users?id=eq.{user_id}&select=id"
                check_headers = {
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                }
                async with httpx.AsyncClient(timeout=10.0) as check_client:
                    check_response = await check_client.get(check_url, headers=check_headers)
                    if check_response.status_code == 200:
                        check_data = check_response.json()
                        if isinstance(check_data, list) and len(check_data) > 0:
                            logger.info(f"✅ User {user_id} already exists in public.users (verified via REST API)")
                            return True
        except Exception as check_err:
            logger.warning(f"User existence check failed (non-fatal): {check_err}")
            # Continue to creation attempt
        
        # Try REST API first (most reliable) - use httpx directly with service role key
        httpx_status = None
        httpx_error = None
        try:
            from app.core.config import settings
            import httpx
            
            logger.info(f"Attempting to create user {user_id} via httpx REST API")
            logger.info(f"SUPABASE_URL: {settings.SUPABASE_URL[:50] if settings.SUPABASE_URL else 'NOT SET'}...")
            logger.info(f"SERVICE_ROLE_KEY set: {bool(settings.SUPABASE_SERVICE_ROLE_KEY)}")
            
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
                # Use httpx directly with service role key to ensure it bypasses RLS
                rest_url = f"{settings.SUPABASE_URL}/rest/v1/users"
                headers = {
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
                
                logger.info(f"POST {rest_url} with user_data keys: {list(user_rest_data.keys())}")
                
                async with httpx.AsyncClient(timeout=10.0) as client:
                    rest_response = await client.post(rest_url, json=user_rest_data, headers=headers)
                    httpx_status = rest_response.status_code
                    
                    logger.info(f"httpx response status: {rest_response.status_code}")
                    logger.info(f"httpx response text (first 500 chars): {rest_response.text[:500]}")
                    
                    if rest_response.status_code in [200, 201]:
                        try:
                            response_data = rest_response.json()
                            if isinstance(response_data, list) and len(response_data) > 0:
                                logger.info(f"✅ Created user {user_id} via REST API (httpx)")
                                # Wait a bit and verify user exists
                                import asyncio
                                await asyncio.sleep(0.5)
                                # Verify user was created
                                verify_resp = await client.get(
                                    f"{settings.SUPABASE_URL}/rest/v1/users?id=eq.{user_id}&select=id",
                                    headers=headers
                                )
                                if verify_resp.status_code == 200:
                                    verify_data = verify_resp.json()
                                    if isinstance(verify_data, list) and len(verify_data) > 0:
                                        logger.info(f"✅ Verified user {user_id} exists in database")
                                        return True
                            elif isinstance(response_data, dict) and response_data.get("id"):
                                logger.info(f"✅ Created user {user_id} via REST API (httpx)")
                                import asyncio
                                await asyncio.sleep(0.5)
                                # Verify user was created
                                verify_resp = await client.get(
                                    f"{settings.SUPABASE_URL}/rest/v1/users?id=eq.{user_id}&select=id",
                                    headers=headers
                                )
                                if verify_resp.status_code == 200:
                                    verify_data = verify_resp.json()
                                    if isinstance(verify_data, list) and len(verify_data) > 0:
                                        logger.info(f"✅ Verified user {user_id} exists in database")
                                        return True
                            else:
                                logger.warning(f"Unexpected response format: {type(response_data)}")
                        except Exception as json_err:
                            logger.error(f"Failed to parse JSON response: {json_err}, response text: {rest_response.text[:200]}")
                    elif rest_response.status_code == 409 or "duplicate" in rest_response.text.lower():
                        logger.info(f"User {user_id} already exists (duplicate error)")
                        return True
                    elif rest_response.status_code == 401 or rest_response.status_code == 403:
                        httpx_error = f"Permission denied: {rest_response.status_code} - {rest_response.text[:200]}"
                        logger.warning(f"⚠️ {httpx_error}")
                        # Check if user exists despite permission error (might be RLS blocking insert but user exists)
                        try:
                            check_resp = await client.get(
                                f"{settings.SUPABASE_URL}/rest/v1/users?id=eq.{user_id}&select=id",
                                headers={
                                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                                    "Content-Type": "application/json"
                                }
                            )
                            if check_resp.status_code == 200:
                                check_data = check_resp.json()
                                if isinstance(check_data, list) and len(check_data) > 0:
                                    logger.info(f"✅ User {user_id} exists despite permission error (403)")
                                    return True
                        except Exception:
                            pass
                        logger.error(f"   Check if SERVICE_ROLE_KEY is correct and has proper permissions")
                        # Don't raise here - try fallback methods
                        httpx_error = f"Permission denied: {rest_response.status_code} - {rest_response.text[:200]}"
                    else:
                        httpx_error = f"REST API insert returned {rest_response.status_code}: {rest_response.text[:200]}"
                        logger.warning(f"{httpx_error}")
                        # For 400/422 errors, check if it's a validation error we can handle
                        if rest_response.status_code == 400 or rest_response.status_code == 422:
                            # Check if user exists despite the error
                            try:
                                check_resp = await client.get(
                                    f"{settings.SUPABASE_URL}/rest/v1/users?id=eq.{user_id}&select=id",
                                    headers={
                                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                                        "Content-Type": "application/json"
                                    }
                                )
                                if check_resp.status_code == 200:
                                    check_data = check_resp.json()
                                    if isinstance(check_data, list) and len(check_data) > 0:
                                        logger.info(f"User {user_id} exists despite error response")
                                        return True
                            except Exception:
                                pass
                        # Don't raise here - try fallback methods
            else:
                logger.warning("SERVICE_ROLE_KEY not configured, trying Supabase client")
                if not settings.SUPABASE_URL:
                    raise Exception("SUPABASE_URL not configured")
                if not settings.SUPABASE_SERVICE_ROLE_KEY:
                    raise Exception("SUPABASE_SERVICE_ROLE_KEY not configured")
                # Fallback to Supabase client
                rest_response = admin_client.table("users").insert(user_rest_data).execute()
                if rest_response.data and len(rest_response.data) > 0:
                    logger.info(f"✅ Created user {user_id} via REST API")
                    import asyncio
                    await asyncio.sleep(0.5)
                    return True
                else:
                    logger.warning("REST API insert returned no data, checking if user exists...")
                    check_response = admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
                    if check_response.data and len(check_response.data) > 0:
                        logger.info(f"✅ User {user_id} exists (verified after insert)")
                        return True
        except Exception as rest_err:
            error_str = str(rest_err).lower()
            if "duplicate" in error_str or "already exists" in error_str or "unique" in error_str:
                logger.info(f"User {user_id} already exists (duplicate error)")
                return True
            httpx_error = f"REST API insert failed: {rest_err}"
            logger.warning(f"{httpx_error}")
        
        # Fallback to SQLAlchemy - commented out as it may have enum issues
        # Instead, just verify user exists via query
        try:
            # Check if user was created by httpx call
            check_query = select(User).where(User.id == user_id)
            from app.core.config import settings
            if "supabase.co" in (settings.DATABASE_URL or ""):
                check_result = await db.execute(check_query.execution_options(prepared_statement_cache_size=0))
            else:
                check_result = await db.execute(check_query)
            if check_result.scalar_one_or_none():
                logger.info(f"✅ User {user_id} exists (verified via SQLAlchemy query)")
                return True
        except Exception as check_err:
            logger.warning(f"Could not verify user via SQLAlchemy: {check_err}")
        
        # Final check - maybe user was created by another process
        try:
            final_check = admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
            if final_check.data and len(final_check.data) > 0:
                logger.info(f"✅ User {user_id} exists (verified after failures)")
                return True
        except Exception:
            pass
        
        error_details = f"httpx_status={httpx_status}, httpx_error={httpx_error}" if httpx_status or httpx_error else "no httpx attempt"
        logger.error(f"❌ Failed to create user {user_id} via all methods ({error_details})")
        
        # Check if user exists anyway (maybe created by another process)
        try:
            from app.core.config import settings
            final_check_query = select(User).where(User.id == user_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                final_check_result = await db.execute(final_check_query.execution_options(prepared_statement_cache_size=0))
            else:
                final_check_result = await db.execute(final_check_query)
            if final_check_result.scalar_one_or_none():
                logger.info(f"✅ User {user_id} exists (verified after all failures)")
                return True
        except Exception as check_final_err:
            logger.warning(f"Final user check failed: {check_final_err}")
        
        # Try one more REST API check via admin_client
        try:
            final_rest_check = admin_client.table("users").select("id").eq("id", user_id).limit(1).execute()
            if final_rest_check.data and len(final_rest_check.data) > 0:
                logger.info(f"✅ User {user_id} exists (verified via REST API final check)")
                return True
        except Exception as final_check_err:
            logger.warning(f"Final REST API check failed: {final_check_err}")
        
        # Final check: Try SQLAlchemy query to see if user exists
        try:
            from app.core.config import settings
            final_check_query = select(User).where(User.id == user_id)
            if "supabase.co" in (settings.DATABASE_URL or ""):
                final_check_result = await db.execute(final_check_query.execution_options(prepared_statement_cache_size=0))
            else:
                final_check_result = await db.execute(final_check_query)
            if final_check_result.scalar_one_or_none():
                logger.info(f"✅ User {user_id} exists (verified via final SQLAlchemy check)")
                return True
        except Exception as final_sql_err:
            logger.warning(f"Final SQLAlchemy check failed: {final_sql_err}")
        
        # Return False with details about what failed (don't raise - let caller handle)
        error_summary = f"User creation failed: {error_details}"
        logger.error(error_summary)
        # Don't raise - return False so caller can decide what to do
        # The user might exist in auth.users but not in public.users, which is acceptable
        logger.warning(f"⚠️ User {user_id} not found in public.users, but may exist in auth.users")
        return False
        
    except Exception as e:
        logger.error(f"Error ensuring user exists: {e}")
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Traceback: {error_trace}")
        # Re-raise with more context
        raise Exception(f"User {user_id} creation failed: {str(e)}")

