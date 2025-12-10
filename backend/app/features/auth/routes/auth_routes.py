from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationException
from app.core.role_auth import get_all_users
from app.database.session import get_async_session
from app.database.base import get_supabase_client
from app.features.auth.requests.phone_referral_request import SignupPhoneRequest
from app.features.auth.requests.signup_request import SignupRequest
from app.features.auth.requests.login_request import LoginEmailRequest, LoginPhoneRequest
from app.features.auth.responses.auth_response import AuthResponse, TokenResponse
from app.features.auth.responses.user_response import UserResponse
from app.features.auth.cruds.auth_crud import AuthCrud
from app.core.logging import get_logger

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger("auth.routes")

@auth_router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_async_session)):
    auth_crud = AuthCrud()
    result = await auth_crud.signup_with_email(db, request.model_dump())
    
    user_response = UserResponse(**result["user"])
    session_obj = result.get("session")
    access_token = getattr(session_obj, "access_token", "") if session_obj else ""
    refresh_token = getattr(session_obj, "refresh_token", "") if session_obj else ""
    expires_in = getattr(session_obj, "expires_in", 0) if session_obj else 0
    token_response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )
    
    return AuthResponse(
        user=user_response,
        tokens=token_response,
        requires_phone_verification=result.get("requires_phone_verification", False),
        referral_code=result.get("referral_code")
    )

@auth_router.post("/signup-phone", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_phone(request: SignupPhoneRequest, db: AsyncSession = Depends(get_async_session)):
    auth_crud = AuthCrud()
    result = await auth_crud.signup_with_phone(db, request.model_dump())
    
    user_response = UserResponse(**result["user"])
    session_obj = result.get("session")
    access_token = getattr(session_obj, "access_token", "") if session_obj else ""
    refresh_token = getattr(session_obj, "refresh_token", "") if session_obj else ""
    expires_in = getattr(session_obj, "expires_in", 0) if session_obj else 0
    token_response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )
    
    return AuthResponse(
        user=user_response,
        tokens=token_response,
        requires_phone_verification=result.get("requires_phone_verification", False),
        referral_code=result.get("referral_code")
    )

@auth_router.post("/login", response_model=AuthResponse)
async def login_email(request: LoginEmailRequest, db: AsyncSession = Depends(get_async_session)):
    auth_crud = AuthCrud()
    result = await auth_crud.login_with_email(db, request.email, request.password)
    
    user_response = UserResponse(**result["user"])
    session_obj = result.get("session")
    access_token = getattr(session_obj, "access_token", "") if session_obj else ""
    refresh_token = getattr(session_obj, "refresh_token", "") if session_obj else ""
    expires_in = getattr(session_obj, "expires_in", 0) if session_obj else 0
    token_response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )
    
    return AuthResponse(
        user=user_response,
        tokens=token_response,
        referral_code=result["user"].get("referral_code")
    )

@auth_router.post("/login-phone", response_model=AuthResponse)
async def login_phone(request: LoginPhoneRequest, db: AsyncSession = Depends(get_async_session)):
    auth_crud = AuthCrud()
    result = await auth_crud.login_with_phone(db, request.phone, request.password)
    
    user_response = UserResponse(**result["user"])
    session_obj = result.get("session")
    access_token = getattr(session_obj, "access_token", "") if session_obj else ""
    refresh_token = getattr(session_obj, "refresh_token", "") if session_obj else ""
    expires_in = getattr(session_obj, "expires_in", 0) if session_obj else 0
    token_response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )
    
    return AuthResponse(
        user=user_response,
        tokens=token_response,
        referral_code=result["user"].get("referral_code")
    )

@auth_router.post("/google", response_model=AuthResponse)
async def google_signin(db: AsyncSession = Depends(get_async_session)):
    auth_crud = AuthCrud()
    result = await auth_crud.google_signin(db)
    
    user_response = UserResponse(**result["user"])
    session_obj = result.get("session")
    access_token = getattr(session_obj, "access_token", "") if session_obj else ""
    refresh_token = getattr(session_obj, "refresh_token", "") if session_obj else ""
    expires_in = getattr(session_obj, "expires_in", 0) if session_obj else 0
    token_response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )
    
    return AuthResponse(
        user=user_response,
        tokens=token_response,
        referral_code=result["user"].get("referral_code")
    )

@auth_router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_all_users)):
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        logger.info(f"User logged out: {current_user['id']}")
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Logged out successfully")
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Logout completed")
    
@auth_router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    from app.core.user_helper import ensure_user_exists_in_db
    
    # Ensure user exists in database first
    auth_crud = AuthCrud()
    user_exists = await ensure_user_exists_in_db(db, current_user, auth_crud)
    
    if not user_exists:
        logger.warning(f"Could not ensure user {current_user['id']} exists, returning basic user info")
    
    try:
        user_data = await auth_crud.get_by_id(db, current_user["id"])
    except Exception as get_error:
        logger.error(f"Error getting user {current_user['id']}: {get_error}")
        user_data = None
    
    if not user_data:
        # User is authenticated in Supabase but doesn't exist in database - create them
        logger.info(f"User {current_user['id']} authenticated but not in database, creating user record")
        try:
            # Create user using REST API to ensure it persists immediately
            admin_client = auth_crud.admin_client
            
            # Get user info from Supabase Auth if available
            user_email = current_user.get("email", "")
            user_type_str = current_user.get("user_role", "buyer")
            if isinstance(user_type_str, str):
                user_type_str = user_type_str.lower()
            
            # Try to get more info from Supabase Auth
            try:
                auth_user_response = admin_client.auth.admin.get_user_by_id(current_user["id"])
                if auth_user_response and hasattr(auth_user_response, 'user') and auth_user_response.user:
                    auth_user = auth_user_response.user
                    if not user_email:
                        user_email = getattr(auth_user, 'email', '')
                    user_metadata = getattr(auth_user, 'user_metadata', {}) or {}
                    if not user_type_str or user_type_str == 'buyer':
                        user_type_from_meta = user_metadata.get('user_type', user_metadata.get('role', 'buyer'))
                        user_type_str = user_type_from_meta.lower() if isinstance(user_type_from_meta, str) else 'buyer'
            except Exception as auth_err:
                logger.warning(f"Could not get user from Supabase Auth: {auth_err}")
            
            user_rest_data = {
                "id": current_user["id"],
                "email": user_email or f"user-{current_user['id'][:8]}@temp.example.com",
                "phone": current_user.get("phone") or "+10000000000",
                "user_type": user_type_str,
                "first_name": current_user.get("first_name") or "User",
                "last_name": current_user.get("last_name") or "",
                "is_verified": current_user.get("is_verified", False),
                "is_active": True,
                "is_email_verified": current_user.get("is_verified", False),
                "is_phone_verified": False
            }
            
            # Insert via REST API
            try:
                rest_response = admin_client.table("users").insert(user_rest_data).execute()
                if rest_response.data and len(rest_response.data) > 0:
                    logger.info(f"✅ Created user {current_user['id']} via REST API")
                    # Wait a bit for propagation, then fetch
                    import asyncio
                    await asyncio.sleep(0.5)
                    try:
                        user_data = await auth_crud.get_by_id(db, current_user["id"])
                    except Exception as fetch_err:
                        logger.warning(f"Could not fetch user after creation: {fetch_err}, using REST response")
                        # Use REST response data to create UserResponse
                        rest_user_data = rest_response.data[0]
                        from datetime import datetime
                        return UserResponse(
                            id=str(rest_user_data.get("id", current_user["id"])),
                            email=rest_user_data.get("email", user_email),
                            phone=rest_user_data.get("phone", "+10000000000"),
                            user_type=rest_user_data.get("user_type", user_type_str).lower(),
                            first_name=rest_user_data.get("first_name", "User"),
                            last_name=rest_user_data.get("last_name", ""),
                            avatar_url=rest_user_data.get("avatar_url"),
                            is_verified=rest_user_data.get("is_verified", False),
                            is_active=rest_user_data.get("is_active", True),
                            is_email_verified=rest_user_data.get("is_email_verified", False),
                            is_phone_verified=rest_user_data.get("is_phone_verified", False),
                            last_login_at=None,
                            referral_code=rest_user_data.get("referral_code", ""),
                            created_at=datetime.utcnow()
                        )
                else:
                    # REST API failed, try to create via SQLAlchemy
                    logger.warning("REST API insert returned no data, trying SQLAlchemy")
                    user_data = await auth_crud.create(db, user_rest_data)
            except Exception as rest_err:
                logger.error(f"REST API insert failed: {rest_err}")
                import traceback
                logger.error(f"REST API error traceback: {traceback.format_exc()}")
                # Try SQLAlchemy as fallback
                try:
                    user_data = await auth_crud.create(db, user_rest_data)
                    logger.info(f"✅ Created user {current_user['id']} via SQLAlchemy")
                except Exception as sql_err:
                    logger.error(f"SQLAlchemy create also failed: {sql_err}")
                    raise
        except Exception as create_error:
            logger.error(f"Failed to create user record: {create_error}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            # Return basic user info from current_user if creation fails
            from datetime import datetime
            # Ensure user_type is properly formatted
            user_type_str = current_user.get("user_role", "buyer")
            if isinstance(user_type_str, str):
                user_type_str = user_type_str.lower()
            
            return UserResponse(
                id=current_user["id"],
                email=current_user.get("email", "unknown@example.com"),
                phone=current_user.get("phone", "+10000000000"),
                user_type=user_type_str,
                first_name=current_user.get("first_name", "User"),
                last_name=current_user.get("last_name", ""),
                avatar_url=None,
                is_verified=current_user.get("is_verified", True),
                is_active=True,
                is_email_verified=current_user.get("is_verified", True),
                is_phone_verified=False,
                last_login_at=None,
                referral_code="",
                created_at=datetime.utcnow()
            )
    
    # Ensure user_data exists before accessing its attributes
    if not user_data:
        # If we still don't have user_data, return a basic response
        from datetime import datetime
        user_type_str = current_user.get("user_role", "buyer")
        if isinstance(user_type_str, str):
            user_type_str = user_type_str.lower()
        return UserResponse(
            id=current_user.get("id", "unknown"),
            email=current_user.get("email", "unknown@example.com"),
            phone=current_user.get("phone", "+10000000000"),
            user_type=user_type_str,
            first_name=current_user.get("first_name", "User"),
            last_name=current_user.get("last_name", ""),
            avatar_url=None,
            is_verified=current_user.get("is_verified", True),
            is_active=True,
            is_phone_verified=False,
            is_email_verified=current_user.get("is_verified", True),
            last_login_at=None,
            referral_code="",
            created_at=datetime.utcnow()
        )
    
    if not user_data.referral_code:
        issued_referral_code = auth_crud.generate_referral_code(6)
        while await auth_crud.get_by_field(db, "referral_code", issued_referral_code):
            issued_referral_code = auth_crud.generate_referral_code(6)
        
        await auth_crud.update(db, current_user["id"], {"referral_code": issued_referral_code})
        user_data.referral_code = issued_referral_code
    
    # Use _user_to_dict method instead of to_dict() which may not exist
    try:
        user_dict = auth_crud._user_to_dict(user_data)
        return UserResponse(**user_dict)
    except Exception as dict_error:
        logger.error(f"Error converting user to dict: {dict_error}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        # Fallback: create dict manually
        from datetime import datetime
        try:
            # Ensure all required fields are present
            user_type_str = "buyer"
            if hasattr(user_data, 'user_type') and user_data.user_type:
                if hasattr(user_data.user_type, 'value'):
                    user_type_str = user_data.user_type.value
                elif isinstance(user_data.user_type, str):
                    user_type_str = user_data.user_type.lower()
                else:
                    user_type_str = str(user_data.user_type).lower()
            
            # Ensure created_at is a datetime object
            created_at_val = getattr(user_data, 'created_at', None)
            if created_at_val is None:
                created_at_val = datetime.utcnow()
            elif isinstance(created_at_val, str):
                try:
                    created_at_val = datetime.fromisoformat(created_at_val.replace('Z', '+00:00'))
                except:
                    created_at_val = datetime.utcnow()
            elif not isinstance(created_at_val, datetime):
                created_at_val = datetime.utcnow()
            
            return UserResponse(
                id=str(user_data.id),
                email=user_data.email or current_user.get("email", ""),
                phone=user_data.phone or current_user.get("phone", "+10000000000"),
                user_type=user_type_str,
                first_name=getattr(user_data, 'first_name', None) or current_user.get("first_name", "User"),
                last_name=getattr(user_data, 'last_name', None) or current_user.get("last_name", ""),
                avatar_url=getattr(user_data, 'avatar_url', None),
                is_verified=getattr(user_data, 'is_verified', True),
                is_active=getattr(user_data, 'is_active', True),
                is_phone_verified=getattr(user_data, 'is_phone_verified', False),
                is_email_verified=getattr(user_data, 'is_email_verified', getattr(user_data, 'is_verified', True)),
                last_login_at=user_data.last_login_at if hasattr(user_data, 'last_login_at') and user_data.last_login_at else None,
                referral_code=getattr(user_data, 'referral_code', None) or "",
                created_at=created_at_val
            )
        except Exception as fallback_error:
            logger.error(f"Fallback user dict creation also failed: {fallback_error}")
            import traceback
            logger.error(f"Fallback traceback: {traceback.format_exc()}")
            # Last resort: return basic user info from current_user
            from datetime import datetime
            return UserResponse(
                id=current_user.get("id", "unknown"),
                email=current_user.get("email", "unknown@example.com"),
                phone=current_user.get("phone", "+10000000000"),
                user_type=current_user.get("user_role", "buyer").lower(),
                first_name=current_user.get("first_name", "User"),
                last_name=current_user.get("last_name", ""),
                avatar_url=None,
                is_verified=current_user.get("is_verified", True),
                is_active=True,
                is_phone_verified=False,
                is_email_verified=current_user.get("is_verified", True),
                last_login_at=None,
                referral_code="",
                created_at=datetime.utcnow()
            )

@auth_router.post("/refresh")
async def refresh_token(current_user: Dict[str, Any] = Depends(get_all_users)):
    try:
        supabase = get_supabase_client()
        refresh_response = supabase.auth.refresh_session()
        
        if not refresh_response.session:
            raise AuthenticationException("Failed to refresh token")
        
        token_response = TokenResponse(
            access_token=refresh_response.session.access_token,
            refresh_token=refresh_response.session.refresh_token,
            token_type="bearer",
            expires_in=refresh_response.session.expires_in or 3600
        )
        
        return token_response
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise AuthenticationException("Failed to refresh token")

@auth_router.post("/verify-token")
async def verify_token(current_user: Dict[str, Any] = Depends(get_all_users)):
    from app.core.base import SuccessResponse
    return SuccessResponse(message="Token is valid")

@auth_router.post("/change-email")
async def change_email(
    new_email: str,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        auth_crud = AuthCrud()
        
        existing_user = await auth_crud.get_by_field(db, "email", new_email)
        if existing_user:
            from app.core.exceptions import ConflictException
            raise ConflictException("Email already exists")
        
        supabase = get_supabase_client()
        update_response = supabase.auth.admin.update_user_by_id(
            current_user["id"],
            {"email": new_email}
        )
        
        if not update_response.user:
            raise AuthenticationException("Failed to update email")
        
        await auth_crud.update(db, current_user["id"], {"email": new_email, "is_email_verified": False})
        
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Email update initiated. Please verify your new email.")
    except Exception as e:
        logger.error(f"Email change error: {str(e)}")
        raise AuthenticationException("Failed to change email")

@auth_router.post("/resend-verification")
async def resend_email_verification(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        auth_crud = AuthCrud()
        user_data = await auth_crud.get_by_id(db, current_user["id"])
        
        if not user_data:
            raise AuthenticationException("User not found")
        
        if user_data.is_email_verified:
            from app.core.base import SuccessResponse
            return SuccessResponse(message="Email is already verified")
        
        supabase = get_supabase_client()
        try:
            result = supabase.auth.resend({
            "type": "signup",
            "email": user_data.email
        })
            logger.info(f"Verification email sent successfully to: {user_data.email}")
        except Exception as email_err:
            logger.error(f"Supabase email sending failed: {str(email_err)}")
            logger.error("Note: Ensure Supabase email settings are configured in the Supabase dashboard")
            raise
        
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Verification email sent")
    except Exception as e:
        logger.error(f"Resend verification error: {str(e)}")
        from app.core.exceptions import ValidationException
        raise ValidationException(f"Failed to resend verification email: {str(e)}. Please check Supabase email configuration.")

@auth_router.delete("/account")
async def delete_account(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        auth_crud = AuthCrud()
        
        user_data = await auth_crud.get_by_id(db, current_user["id"])
        if user_data and user_data.avatar_url:
            storage_client = SupabaseStorageClient()
            try:
                delete_file_from_url(user_data.avatar_url)
            except:
                pass
        
        from app.features.auth.cruds.profile_crud import ProfileCrud
        profile_crud = ProfileCrud()
        await profile_crud.delete_profile(db, current_user["id"])
        
        try:
            supabase = get_supabase_client()
            supabase.auth.admin.delete_user(current_user["id"])
        except:
            pass
        
        await auth_crud.delete(db, current_user["id"])
        
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Account deleted successfully")
    except Exception as e:
        logger.error(f"Account deletion error: {str(e)}")
        from app.core.exceptions import ValidationException
        raise ValidationException("Failed to delete account")

@auth_router.get("/sessions")
async def get_active_sessions(current_user: Dict[str, Any] = Depends(get_all_users)):
    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.admin.get_user_by_id(current_user["id"])
        
        if not user_response.user:
            raise AuthenticationException("User not found")
        
        sessions = getattr(user_response.user, "sessions", [])
        
        return {
            "active_sessions": len(sessions),
            "sessions": [
                {
                    "id": session.get("id"),
                    "created_at": session.get("created_at"),
                    "updated_at": session.get("updated_at"),
                    "user_agent": session.get("user_agent"),
                    "ip": session.get("ip")
                } for session in sessions
            ] if sessions else []
        }
    except Exception as e:
        logger.error(f"Get sessions error: {str(e)}")
        return {"active_sessions": 0, "sessions": []}

@auth_router.post("/logout-all")
async def logout_all_sessions(current_user: Dict[str, Any] = Depends(get_all_users)):
    try:
        supabase = get_supabase_client()
        supabase.auth.admin.sign_out(current_user["id"], "global")
        
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Logged out from all sessions")
    except Exception as e:
        logger.error(f"Logout all error: {str(e)}")
        from app.core.base import SuccessResponse
        return SuccessResponse(message="Logout completed")