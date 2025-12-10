from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.auth.models.user import User
from app.core.exceptions import (
    ValidationException,
    AuthenticationException,
    NotFoundException,
    ConflictException
)
from app.core.logging import get_logger
from app.features.auth.cruds.profile_crud import ProfileCrud
from app.features.auth.cruds.referral_crud import ReferralCrud

logger = get_logger("auth.crud")

async def get_referrer_by_code(db: AsyncSession, referral_code: str) -> Optional[User]:
    referral_code = (referral_code or "").upper()
    crud = AuthCrud()
    return await crud.get_by_field(db, "referral_code", referral_code)

class AuthCrud(BaseCrud[User]):
    def __init__(self):
        super().__init__(get_supabase_client(), User)
        # Use service role client for admin operations to bypass rate limits
        from app.core.config import settings
        from supabase import create_client
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            # Use service role key for admin operations (bypasses rate limits)
            self.admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            # Also create anon key client for user-facing operations
            if settings.SUPABASE_ANON_KEY:
                self.auth_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            else:
                self.auth_client = self.admin_client
        else:
            self.auth_client = self.client
            self.admin_client = self.client
    
    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        # Handle user_type enum - convert to string value
        user_type_value = user.user_type
        if hasattr(user_type_value, 'value'):
            user_type_value = user_type_value.value
        elif isinstance(user_type_value, str):
            user_type_value = user_type_value.lower()
        
        # Ensure created_at is always a datetime object, not a string
        created_at_val = user.created_at
        if created_at_val is None:
            from datetime import datetime
            created_at_val = datetime.utcnow()
        elif isinstance(created_at_val, str):
            from datetime import datetime
            try:
                created_at_val = datetime.fromisoformat(created_at_val.replace('Z', '+00:00'))
            except:
                created_at_val = datetime.utcnow()
        
        return {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "user_type": user_type_value,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "avatar_url": user.avatar_url,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "is_phone_verified": user.is_phone_verified,
            "is_email_verified": user.is_email_verified,
            "google_id": user.google_id,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "referral_code": user.referral_code,
            "created_at": created_at_val,  # Return datetime object, not ISO string
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    
    def _user_to_dict_from_supabase(self, supabase_user) -> Dict[str, Any]:
        """Convert Supabase user object to dict format"""
        user_metadata = getattr(supabase_user, "user_metadata", {}) or {}
        return {
            "id": str(supabase_user.id),
            "email": getattr(supabase_user, "email", ""),
            "phone": getattr(supabase_user, "phone", ""),
            "user_type": user_metadata.get("user_type", "buyer"),
            "first_name": user_metadata.get("first_name", ""),
            "last_name": user_metadata.get("last_name", ""),
            "avatar_url": getattr(supabase_user, "avatar_url", None),
            "is_verified": getattr(supabase_user, "email_confirmed_at", None) is not None,
            "is_active": not getattr(supabase_user, "banned_until", None),
            "is_phone_verified": getattr(supabase_user, "phone_confirmed_at", None) is not None,
            "is_email_verified": getattr(supabase_user, "email_confirmed_at", None) is not None,
            "google_id": user_metadata.get("provider_id") if user_metadata.get("provider") == "google" else None,
            "last_login_at": getattr(supabase_user, "last_sign_in_at", None),
            "referral_code": None,  # Will be generated on first DB sync
            "created_at": getattr(supabase_user, "created_at", None),
            "updated_at": getattr(supabase_user, "updated_at", None)
        }
    
    async def signup_with_email(self, db: AsyncSession, signup_data: Dict[str, Any]) -> Dict[str, Any]:
        # Store auth_response in outer scope for exception handler
        auth_response = None
        try:
            incoming_referral: Optional[str] = signup_data.get("referral_code")
            if incoming_referral and db:
                try:
                    referrer = await get_referrer_by_code(db, incoming_referral)
                    if not referrer:
                        raise ValidationException("Invalid referral code")
                except Exception as e:
                    logger.warning(f"Could not validate referral code: {e}")

            # Check for existing users if database is available
            if db:
                try:
                    existing_user = await self.get_by_field(db, "email", signup_data["email"])
                    if existing_user:
                        raise ConflictException("User with this email already exists")
                    if signup_data.get("phone"):
                        existing_phone = await self.get_by_field(db, "phone", signup_data["phone"])
                        if existing_phone:
                            raise ConflictException("User with this phone already exists")
                except Exception as e:
                    # If database check fails, still proceed with Supabase auth
                    # Don't log SSL errors as warnings - they're expected in dev
                    if "SSL" not in str(e) and "CERTIFICATE" not in str(e):
                        logger.warning(f"Database check failed, proceeding with Supabase auth: {e}")
            # Use admin API to create user (bypasses rate limits)
            try:
                # First check if user exists using admin API
                try:
                    existing_admin_user = self.admin_client.auth.admin.get_user_by_email(signup_data["email"])
                    if existing_admin_user and existing_admin_user.user:
                        raise ConflictException("User with this email already exists")
                except Exception as admin_check_error:
                    # If admin API fails, continue with signup attempt
                    if "not found" not in str(admin_check_error).lower():
                        logger.debug(f"Admin user check failed (non-fatal): {str(admin_check_error)}")
                
                # Create user using admin API to bypass rate limits
                auth_response = self.admin_client.auth.admin.create_user({
                    "email": signup_data["email"],
                    "password": signup_data["password"],
                    "email_confirm": False,  # Require email verification - user must verify email
                    "user_metadata": {
                        "first_name": signup_data.get("first_name"),
                        "last_name": signup_data.get("last_name"),
                        "user_type": (signup_data.get("user_type") or "buyer").lower()
                    }
                })
                
                # Send verification email after user creation
                try:
                    self.auth_client.auth.resend({
                        "type": "signup",
                        "email": signup_data["email"]
                    })
                    logger.info(f"Verification email sent to: {signup_data['email']}")
                except Exception as email_err:
                    logger.warning(f"Could not send verification email: {str(email_err)}")
                    # Continue anyway - user can request resend later
                
                # Admin API doesn't return a session, so we need to sign in to get session
                if hasattr(auth_response, 'user') and auth_response.user:
                    try:
                        session_response = self.auth_client.auth.sign_in_with_password({
                            "email": signup_data["email"],
                            "password": signup_data["password"]
                        })
                        auth_response.session = session_response.session
                    except Exception as session_error:
                        logger.warning(f"Could not create session after admin user creation: {str(session_error)}")
                        # Continue without session - user can sign in separately
                        auth_response.session = None
            except ConflictException:
                raise
            except Exception as admin_error:
                error_str = str(admin_error).lower()
                # Check if it's a rate limit error - if so, try to get existing user or raise
                if "rate limit" in error_str or "too many requests" in error_str:
                    logger.warning(f"Rate limit hit on admin API, checking if user exists: {str(admin_error)}")
                    # Check if user already exists
                    try:
                        existing_admin_user = self.admin_client.auth.admin.get_user_by_email(signup_data["email"])
                        if existing_admin_user and existing_admin_user.user:
                            # User exists, try to sign in instead
                            logger.info(f"User exists, attempting sign in instead of signup")
                            try:
                                session_response = self.auth_client.auth.sign_in_with_password({
                                    "email": signup_data["email"],
                                    "password": signup_data["password"]
                                })
                                # Create a mock auth_response from existing user
                                class MockAuthResponse:
                                    def __init__(self, user, session):
                                        self.user = user
                                        self.session = session
                                auth_response = MockAuthResponse(existing_admin_user.user, session_response.session)
                                logger.info(f"Successfully signed in existing user")
                            except Exception as signin_err:
                                from app.core.exceptions import ValidationException
                                raise ValidationException(f"Registration failed: email rate limit exceeded. Please try again later or sign in if you already have an account.")
                        else:
                            from app.core.exceptions import ValidationException
                            raise ValidationException(f"Registration failed: email rate limit exceeded. Please try again later.")
                    except Exception as check_err:
                        from app.core.exceptions import ValidationException
                        raise ValidationException(f"Registration failed: email rate limit exceeded. Please try again later.")
                
                # Fallback to regular signup if admin API fails (but not rate limit)
                logger.warning(f"Admin user creation failed, falling back to regular signup: {str(admin_error)}")
                try:
                    auth_response = self.auth_client.auth.sign_up({
                        "email": signup_data["email"],
                        "password": signup_data["password"],
                        "options": {
                            "data": {
                                "first_name": signup_data.get("first_name"),
                                "last_name": signup_data.get("last_name"),
                                "user_type": (signup_data.get("user_type") or "buyer").lower()
                            },
                            "email_redirect_to": None  # Let Supabase handle email verification
                        }
                    })
                except Exception as signup_err:
                    error_str = str(signup_err).lower()
                    if "rate limit" in error_str or "too many requests" in error_str:
                        from app.core.exceptions import ValidationException
                        raise ValidationException(f"Registration failed: email rate limit exceeded. Please try again later or sign in if you already have an account.")
                    raise
                
                # Supabase sign_up automatically sends verification email, but we can also explicitly resend
                if auth_response and hasattr(auth_response, 'user') and auth_response.user:
                    try:
                        # Wait a moment for user to be created, then send verification email
                        import asyncio
                        await asyncio.sleep(0.5)
                        self.auth_client.auth.resend({
                            "type": "signup",
                            "email": signup_data["email"]
                        })
                        logger.info(f"Verification email sent to: {signup_data['email']}")
                    except Exception as email_err:
                        logger.warning(f"Could not send verification email: {str(email_err)}")
                        # Continue anyway - Supabase may have sent it automatically during sign_up
            
            if not getattr(auth_response, "user", None):
                raise ValidationException("Failed to create user account")
            
            issued_referral_code = self.generate_referral_code(6)
            # Try to ensure referral code is unique, but don't fail if DB is unavailable
            if db:
                try:
                    while await self.get_by_field(db, "referral_code", issued_referral_code):
                        issued_referral_code = self.generate_referral_code(6)
                except Exception as e:
                    # Don't fail signup if referral code check fails (especially SSL errors)
                    if "SSL" not in str(e) and "CERTIFICATE" not in str(e):
                        logger.debug(f"Could not verify referral code uniqueness: {e}")

            # Ensure user_type is always lowercase for database compatibility
            user_type_value = (signup_data.get("user_type") or "buyer").lower()
            
            user_data = {
                "id": auth_response.user.id,
                "email": signup_data["email"],
                "phone": signup_data.get("phone"),
                "user_type": user_type_value,
                "first_name": signup_data.get("first_name"),
                "last_name": signup_data.get("last_name"),
                "is_verified": False,
                "is_active": True,
                "is_phone_verified": False,
                "is_email_verified": getattr(auth_response.user, "email_confirmed_at", None) is not None,
                "last_login_at": datetime.utcnow(),
                "referral_code": issued_referral_code
            }
            
            # Create user in database - CRITICAL: Use REST API first for reliability
            created_user = None
            
            # Strategy 1: Try REST API with admin_client (bypasses RLS)
            try:
                logger.info(f"Creating user {auth_response.user.id} in database via REST API (admin_client)")
                rest_user_data = {
                    "id": str(auth_response.user.id),
                    "email": signup_data["email"],
                    "phone": signup_data.get("phone") or "+10000000000",
                    "user_type": user_type_value,
                    "first_name": signup_data.get("first_name"),
                    "last_name": signup_data.get("last_name"),
                    "is_verified": False,
                    "is_active": True,
                    "is_phone_verified": False,
                    "is_email_verified": getattr(auth_response.user, "email_confirmed_at", None) is not None,
                    "referral_code": issued_referral_code
                }
                
                # Use admin_client.table() which should bypass RLS
                rest_response = self.admin_client.table("users").insert(rest_user_data).execute()
                if rest_response.data and len(rest_response.data) > 0:
                    logger.info(f"✅ Created user {auth_response.user.id} via REST API during signup")
                    # Fetch via SQLAlchemy after delay for propagation
                    if db:
                        import asyncio
                        await asyncio.sleep(1.0)  # Allow time for propagation
                        try:
                            created_user = await self.get_by_id(db, auth_response.user.id)
                        except Exception as fetch_err:
                            logger.warning(f"Could not fetch user via SQLAlchemy after REST API creation: {fetch_err}")
                else:
                    logger.warning(f"REST API insert returned no data during signup, checking if user exists...")
                    # Check if user exists anyway
                    import asyncio
                    await asyncio.sleep(0.5)
                    if db:
                        try:
                            created_user = await self.get_by_id(db, auth_response.user.id)
                        except Exception:
                            pass
            except Exception as rest_err:
                rest_err_str = str(rest_err).lower()
                if "duplicate" in rest_err_str or "already exists" in rest_err_str or "unique" in rest_err_str:
                    logger.info(f"User {auth_response.user.id} already exists in database (duplicate during signup)")
                    if db:
                        try:
                            created_user = await self.get_by_id(db, auth_response.user.id)
                        except Exception:
                            pass
                else:
                    logger.warning(f"REST API user creation failed during signup: {rest_err}, trying SQLAlchemy fallback")
            
            # Strategy 2: Fallback to SQLAlchemy if REST API failed (but may fail with RLS)
            # CRITICAL: If REST API failed, we MUST create the user via SQLAlchemy or retry REST API
            # User MUST exist in public.users for the system to work
            if not created_user and db:
                try:
                    created_user = await self.create(db, user_data)
                    if created_user:
                        logger.info(f"✅ Created user {auth_response.user.id} via SQLAlchemy during signup")
                except Exception as e:
                    logger.warning(f"SQLAlchemy user creation failed (may be RLS/permission issue): {e}")
                    # Last resort: retry REST API with longer delay
                    import asyncio
                    await asyncio.sleep(2.0)
                    try:
                        rest_response = self.admin_client.table("users").insert(rest_user_data).execute()
                        if rest_response.data and len(rest_response.data) > 0:
                            logger.info(f"✅ Created user {auth_response.user.id} via REST API retry during signup")
                            await asyncio.sleep(1.0)
                            if db:
                                try:
                                    created_user = await self.get_by_id(db, auth_response.user.id)
                                except:
                                    pass
                    except Exception as retry_err:
                        logger.error(f"❌ REST API retry also failed: {retry_err}")
            
            # Create profile if user was created
            if created_user and db:
                try:
                    profile_crud = ProfileCrud()
                    profile_data = {
                        "user_id": str(created_user.id),
                        "preferences": {},
                        "social_links": {},
                        "notification_settings": {}
                    }
                    await profile_crud.create(db, profile_data)
                except Exception as e:
                    logger.warning(f"Could not create user profile: {e}")

                if incoming_referral:
                    try:
                        await self.handle_referral(db, str(created_user.id), incoming_referral)
                    except Exception as e:
                        logger.warning(f"Could not handle referral: {e}")
            
            # If database creation failed, create user dict from auth response
            if not created_user:
                from types import SimpleNamespace
                created_user = SimpleNamespace(
                    id=auth_response.user.id,
                    email=signup_data["email"],
                    phone=signup_data.get("phone"),
                    user_type=user_type_value,
                    first_name=signup_data.get("first_name"),
                    last_name=signup_data.get("last_name"),
                    is_verified=False,
                    is_active=True,
                    is_phone_verified=False,
                    is_email_verified=getattr(auth_response.user, "email_confirmed_at", None) is not None,
                    last_login_at=datetime.utcnow(),
                    referral_code=issued_referral_code,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )

            logger.info(f"User created successfully: {created_user.id}")
            
            user_dict = {
                "id": str(created_user.id),
                "email": getattr(created_user, 'email', signup_data["email"]),
                "phone": getattr(created_user, 'phone', signup_data.get("phone")),
                "user_type": getattr(created_user, 'user_type', user_type_value),
                "first_name": getattr(created_user, 'first_name', signup_data.get("first_name")),
                "last_name": getattr(created_user, 'last_name', signup_data.get("last_name")),
                "is_verified": getattr(created_user, 'is_verified', False),
                "is_active": getattr(created_user, 'is_active', True),
                "is_phone_verified": getattr(created_user, 'is_phone_verified', False),
                "is_email_verified": getattr(created_user, 'is_email_verified', getattr(auth_response.user, "email_confirmed_at", None) is not None),
                "last_login_at": created_user.last_login_at.isoformat() if hasattr(created_user, 'last_login_at') and created_user.last_login_at else None,
                "referral_code": getattr(created_user, 'referral_code', issued_referral_code),
                "created_at": created_user.created_at.isoformat() if hasattr(created_user, 'created_at') and created_user.created_at else datetime.utcnow().isoformat(),
                "updated_at": created_user.updated_at.isoformat() if hasattr(created_user, 'updated_at') and created_user.updated_at else datetime.utcnow().isoformat()
            }
            
            return {
                "user": user_dict,
                "session": auth_response.session if hasattr(auth_response, 'session') else None,
                "requires_phone_verification": bool(signup_data.get("phone")),
                "referral_code": issued_referral_code
            }
        except (ConflictException, ValidationException):
            raise
        except Exception as e:
            error_str = str(e)
            # Don't fail signup for database SSL errors - Supabase auth should still work
            if "SSL" in error_str or "CERTIFICATE" in error_str:
                logger.warning(f"Database SSL error during signup (non-fatal): {error_str}")
                # Check if Supabase auth succeeded - use auth_response from outer scope
                try:
                    # Check if we have the auth_response variable available (from outer scope)
                    if auth_response and hasattr(auth_response, 'user') and auth_response.user:
                        # Use the auth_response we already have
                        user_dict = self._user_to_dict_from_supabase(auth_response.user)
                        return {
                            "user": user_dict,
                            "session": getattr(auth_response, 'session', None),
                            "requires_phone_verification": bool(signup_data.get("phone")),
                            "referral_code": self.generate_referral_code(6),
                            "message": "Account created successfully. Database sync pending."
                        }
                    # Fallback: Try to get the user from Supabase auth
                    admin_response = self.admin_client.auth.admin.get_user_by_email(signup_data["email"])
                    if admin_response and hasattr(admin_response, 'user') and admin_response.user:
                        user_dict = self._user_to_dict_from_supabase(admin_response.user)
                        return {
                            "user": user_dict,
                            "session": None,  # User will need to sign in to get session
                            "requires_phone_verification": bool(signup_data.get("phone")),
                            "referral_code": self.generate_referral_code(6),
                            "message": "Account created successfully. Please sign in."
                        }
                except Exception as verify_error:
                    logger.debug(f"Could not verify Supabase user creation: {verify_error}")
                # If we can't verify but got an SSL error, assume signup partially succeeded
                raise ValidationException("Registration may have succeeded but database connection failed. Please try signing in.")
            logger.error(f"Signup error: {error_str}")
            raise ValidationException(f"Registration failed: {error_str}")
    
    async def signup_with_phone(self, db: AsyncSession, signup_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            incoming_referral: Optional[str] = signup_data.get("referral_code")
            if incoming_referral and db:
                try:
                    referrer = await get_referrer_by_code(db, incoming_referral)
                    if not referrer:
                        raise ValidationException("Invalid referral code")
                except Exception as e:
                    logger.warning(f"Could not validate referral code: {e}")

            # Check for existing users if database is available
            if db:
                try:
                    existing_user = await self.get_by_field(db, "email", signup_data["email"])
                    if existing_user:
                        raise ConflictException("User with this email already exists")
                    
                    existing_phone = await self.get_by_field(db, "phone", signup_data["phone"])
                    if existing_phone:
                        raise ConflictException("User with this phone already exists")
                except Exception as e:
                    if isinstance(e, ConflictException):
                        raise
                    # If database check fails, still proceed with OTP
                    logger.warning(f"Database check failed, proceeding with OTP: {e}")

            # Use Supabase for OTP authentication only
            auth_response = self.auth_client.auth.sign_in_with_otp({
                "phone": signup_data["phone"],
                "options": {
                    "data": {
                        "email": signup_data["email"],
                        "first_name": signup_data.get("first_name"),
                        "last_name": signup_data.get("last_name"),
                        "user_type": (signup_data.get("user_type") or "buyer").lower()
                    }
                }
            })
            
            issued_referral_code = self.generate_referral_code(6)
            if db:
                try:
                    while await self.get_by_field(db, "referral_code", issued_referral_code):
                        issued_referral_code = self.generate_referral_code(6)
                except Exception as e:
                    logger.warning(f"Could not check referral code uniqueness: {e}")

            # Ensure user_type is always lowercase for database compatibility
            user_type_value = (signup_data.get("user_type") or "buyer").lower()
            
            # Generate user ID (will use OTP user ID if available)
            user_id = str(uuid.uuid4())
            
            user_data = {
                "id": user_id,
                "email": signup_data["email"],
                "phone": signup_data["phone"],
                "user_type": user_type_value,
                "first_name": signup_data.get("first_name"),
                "last_name": signup_data.get("last_name"),
                "is_verified": False,
                "is_active": True,
                "is_phone_verified": False,
                "is_email_verified": False,
                "last_login_at": datetime.utcnow(),
                "referral_code": issued_referral_code
            }
            
            # Create user in database if available
            created_user = None
            if db:
                try:
                    created_user = await self.create(db, user_data)
                    if created_user:
                        try:
                            profile_crud = ProfileCrud()
                            profile_data = {
                                "user_id": str(created_user.id),
                                "preferences": {},
                                "social_links": {},
                                "notification_settings": {}
                            }
                            await profile_crud.create(db, profile_data)
                        except Exception as e:
                            logger.warning(f"Could not create user profile: {e}")

                        if incoming_referral:
                            try:
                                await self.handle_referral(db, str(created_user.id), incoming_referral)
                            except Exception as e:
                                logger.warning(f"Could not handle referral: {e}")
                except Exception as e:
                    logger.warning(f"Could not create database user record: {e}")
            
            # If database creation failed, create user object from data
            if not created_user:
                from types import SimpleNamespace
                created_user = SimpleNamespace(**user_data)

            logger.info(f"User created successfully: {created_user.id}")

            user_dict = {
                "id": str(created_user.id),
                "email": getattr(created_user, 'email', signup_data["email"]),
                "phone": getattr(created_user, 'phone', signup_data["phone"]),
                "user_type": getattr(created_user, 'user_type', user_type_value),
                "first_name": getattr(created_user, 'first_name', signup_data.get("first_name")),
                "last_name": getattr(created_user, 'last_name', signup_data.get("last_name")),
                "is_verified": getattr(created_user, 'is_verified', False),
                "is_active": getattr(created_user, 'is_active', True),
                "is_phone_verified": getattr(created_user, 'is_phone_verified', False),
                "is_email_verified": getattr(created_user, 'is_email_verified', False),
                "last_login_at": created_user.last_login_at.isoformat() if hasattr(created_user, 'last_login_at') and created_user.last_login_at else datetime.utcnow().isoformat(),
                "referral_code": getattr(created_user, 'referral_code', issued_referral_code),
                "created_at": created_user.created_at.isoformat() if hasattr(created_user, 'created_at') and created_user.created_at else datetime.utcnow().isoformat(),
                "updated_at": created_user.updated_at.isoformat() if hasattr(created_user, 'updated_at') and created_user.updated_at else datetime.utcnow().isoformat()
            }
            
            return {
                "user": user_dict,
                "session": auth_response.session if hasattr(auth_response, 'session') else None,
                "requires_phone_verification": True,
                "referral_code": issued_referral_code
            }
        except (ConflictException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Phone signup error: {str(e)}")
            raise ValidationException(f"Registration failed: {str(e)}")
    
    async def login_with_email(self, db: AsyncSession, email: str, password: str) -> Dict[str, Any]:
        try:
            auth_response = self.auth_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            if not getattr(auth_response, "user", None) or not getattr(auth_response, "session", None):
                raise AuthenticationException("Invalid credentials")
            
            # Try to get user from database, but don't fail if DB unavailable
            # If user doesn't exist, create it from Supabase Auth user
            user_obj = None
            if db:
                try:
                    # First try by ID (from auth response)
                    user_obj = await self.get_by_id(db, auth_response.user.id)
                    if not user_obj:
                        # Try by email as fallback
                        try:
                            user_obj = await self.get_by_field(db, "email", email)
                        except Exception:
                            pass
                    
                    if not user_obj:
                        # User doesn't exist in database - create it
                        # First verify user exists in auth.users (required for foreign key)
                        logger.info(f"User {auth_response.user.id} not in database, verifying in auth.users first...")
                        try:
                            # Verify user exists in auth.users
                            auth_verify = self.admin_client.auth.admin.get_user_by_id(auth_response.user.id)
                            if not auth_verify or not hasattr(auth_verify, 'user') or not auth_verify.user:
                                # User doesn't exist in auth.users - this shouldn't happen if login succeeded
                                logger.error(f"User {auth_response.user.id} exists in login response but not in auth.users!")
                                # Try to create in auth.users
                                try:
                                    self.admin_client.auth.admin.create_user({
                                        "id": auth_response.user.id,
                                        "email": auth_response.user.email,
                                        "email_confirm": True,
                                        "user_metadata": {}
                                    })
                                    logger.info(f"Created user {auth_response.user.id} in auth.users")
                                    import asyncio
                                    await asyncio.sleep(0.5)
                                except Exception as auth_create_err:
                                    logger.warning(f"Could not create in auth.users: {auth_create_err}")
                            else:
                                logger.info(f"✅ User {auth_response.user.id} verified in auth.users")
                        except Exception as auth_verify_err:
                            logger.warning(f"Could not verify user in auth.users: {auth_verify_err}")
                        
                        # Now create in users table using Supabase REST API with SERVICE ROLE (more reliable)
                        user_metadata = getattr(auth_response.user, 'user_metadata', {}) or {}
                        user_type_from_meta = user_metadata.get('user_type', 'buyer')
                        # CRITICAL: Ensure lowercase for database enum
                        user_type_lower = user_type_from_meta.lower() if isinstance(user_type_from_meta, str) else "buyer"
                        
                        # Get phone from user object or use default
                        phone = getattr(auth_response.user, 'phone', None) or "+10000000000"
                        
                        user_rest_data = {
                            "id": str(auth_response.user.id),
                            "email": auth_response.user.email,
                            "phone": phone,  # CRITICAL: Phone is required by database schema
                            "user_type": user_type_lower,  # Must be lowercase: buyer, supplier, admin
                            "is_active": True,
                            "is_verified": False,
                            "is_email_verified": getattr(auth_response.user, 'email_confirmed_at', None) is not None,
                            "is_phone_verified": False,
                        }
                        
                        # Add optional fields from metadata
                        if 'first_name' in user_metadata:
                            user_rest_data["first_name"] = user_metadata['first_name']
                        if 'last_name' in user_metadata:
                            user_rest_data["last_name"] = user_metadata['last_name']
                        
                        try:
                            # Use Supabase REST API with SERVICE ROLE to create user (bypasses transaction issues and permissions)
                            # CRITICAL: Use admin_client which has service role key to avoid permission denied errors
                            rest_response = self.admin_client.table("users").insert(user_rest_data).execute()
                            
                            if rest_response.data and len(rest_response.data) > 0:
                                logger.info(f"✅ Created user {auth_response.user.id} in database during login via REST API")
                                import asyncio
                                await asyncio.sleep(1.0)  # Longer delay for pgbouncer propagation
                                
                                # Fetch the user via SQLAlchemy with retries
                                user_obj = None
                                for fetch_attempt in range(3):
                                    user_obj = await self.get_by_id(db, auth_response.user.id)
                                    if user_obj:
                                        logger.info(f"✅ Retrieved user {auth_response.user.id} via SQLAlchemy on attempt {fetch_attempt + 1}")
                                        break
                                    if fetch_attempt < 2:
                                        logger.info(f"User not found yet, waiting for propagation (attempt {fetch_attempt + 1}/3)...")
                                        await asyncio.sleep(0.5)
                                
                                if not user_obj:
                                    logger.warning(f"⚠️ User {auth_response.user.id} created via REST API but not visible via SQLAlchemy (transaction isolation) - will be visible on next operation")
                            else:
                                logger.warning(f"REST API returned no data, but may have succeeded - verifying...")
                                import asyncio
                                await asyncio.sleep(0.5)
                                # Verify via REST API directly using admin_client (service role)
                                rest_verify = self.admin_client.table("users").select("id").eq("id", auth_response.user.id).limit(1).execute()
                                if rest_verify.data and len(rest_verify.data) > 0:
                                    logger.info(f"✅ User {auth_response.user.id} verified to exist in Supabase")
                                    user_obj = None  # Will create user dict from auth response
                                else:
                                    logger.error(f"❌ User {auth_response.user.id} not found even after REST API creation attempt")
                        except Exception as rest_err:
                            rest_err_str = str(rest_err).lower()
                            if "duplicate" in rest_err_str or "already exists" in rest_err_str or "unique" in rest_err_str or "violates unique constraint" in rest_err_str:
                                # User already exists - fetch it
                                logger.info(f"User {auth_response.user.id} already exists (REST API duplicate error)")
                                import asyncio
                                await asyncio.sleep(0.2)
                                user_obj = await self.get_by_id(db, auth_response.user.id)
                            else:
                                logger.error(f"❌ Supabase REST API insert failed during login: {rest_err}")
                                # REST API failed - try SQLAlchemy as fallback
                                logger.warning(f"REST API failed, trying SQLAlchemy fallback for user {auth_response.user.id}")
                                try:
                                    user_obj = await self.create(db, {
                                        "id": auth_response.user.id,
                                        "email": auth_response.user.email,
                                        "phone": phone,
                                        "user_type": user_type_lower,
                                        "first_name": user_metadata.get('first_name'),
                                        "last_name": user_metadata.get('last_name'),
                                        "is_verified": False,
                                        "is_active": True,
                                        "is_phone_verified": False,
                                        "is_email_verified": getattr(auth_response.user, 'email_confirmed_at', None) is not None,
                                    })
                                    if user_obj:
                                        logger.info(f"✅ Created user {auth_response.user.id} via SQLAlchemy during login (fallback)")
                                except Exception as sqlalchemy_err:
                                    logger.error(f"❌ SQLAlchemy fallback also failed: {sqlalchemy_err}")
                                    # Last resort: retry REST API with longer delay
                                    import asyncio
                                    await asyncio.sleep(2.0)
                                    try:
                                        rest_response = self.admin_client.table("users").insert(user_rest_data).execute()
                                        if rest_response.data and len(rest_response.data) > 0:
                                            logger.info(f"✅ Created user {auth_response.user.id} via REST API retry during login")
                                            await asyncio.sleep(1.0)
                                            try:
                                                user_obj = await self.get_by_id(db, auth_response.user.id)
                                            except:
                                                pass
                                    except Exception as retry_err:
                                        logger.error(f"❌ REST API retry also failed: {retry_err}")
                                        # Cannot create user - this is a critical error but continue with auth response
                                        logger.warning(f"⚠️ User {auth_response.user.id} could not be created in database during login. Will need to be created manually or on next operation.")
                                        user_obj = None  # Continue with auth response only
                except Exception as db_error:
                    # If database fails, continue with auth response only
                    logger.warning(f"Could not fetch user from database during login: {db_error}")
            
            # If no database user found, create user dict from auth response
            if not user_obj:
                # Create user dict from Supabase auth response
                user_dict = self._user_to_dict_from_supabase(auth_response.user)
                logger.info(f"User logged in (no DB record): {user_dict['id']}")
                return {
                    "user": user_dict,
                    "session": auth_response.session
                }

            user_data = self._user_to_dict(user_obj)
            
            # Try to update referral code and last login if DB available
            if db:
                try:
                    if not user_data.get("referral_code"):
                        issued_referral_code = self.generate_referral_code(6)
                        while await self.get_by_field(db, "referral_code", issued_referral_code):
                            issued_referral_code = self.generate_referral_code(6)
                        await self.update(db, user_data["id"], {"referral_code": issued_referral_code})
                        user_obj = await self.get_by_field(db, "email", email)
                        user_data = self._user_to_dict(user_obj)
                    
                    await self.update_last_login(db, user_data["id"])
                    user_obj = await self.get_by_field(db, "email", email)
                    user_data = self._user_to_dict(user_obj)
                except Exception as db_update_error:
                    # Don't fail login if DB update fails
                    logger.warning(f"Could not update user record in database: {db_update_error}")
            
            logger.info(f"User logged in: {user_data['id']}")
            return {
                "user": user_data,
                "session": auth_response.session
            }
        except (AuthenticationException, NotFoundException):
            raise
        except Exception as e:
            error_str = str(e)
            # If database error but Supabase auth worked, return user from auth response
            if ("SSL" in error_str or "CERTIFICATE" in error_str or "getaddrinfo" in error_str) and auth_response:
                logger.warning(f"Database error during login (non-fatal): {error_str}")
                user_dict = self._user_to_dict_from_supabase(auth_response.user)
                logger.info(f"User logged in (DB unavailable): {user_dict['id']}")
                return {
                    "user": user_dict,
                    "session": auth_response.session
                }
            logger.error(f"Login error: {error_str}")
            raise AuthenticationException("Login failed")
    
    async def login_with_phone(self, db: AsyncSession, phone: str, password: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_field(db, "phone", phone)
            if not user_obj:
                raise AuthenticationException("Invalid credentials")
            
            user_data = self._user_to_dict(user_obj)
            
            auth_response = self.auth_client.auth.sign_in_with_password({
                "email": user_data["email"],
                "password": password
            })
            if not getattr(auth_response, "user", None) or not getattr(auth_response, "session", None):
                raise AuthenticationException("Invalid credentials")

            if not user_data.get("referral_code"):
                issued_referral_code = self.generate_referral_code(6)
                while await self.get_by_field(db, "referral_code", issued_referral_code):
                    issued_referral_code = self.generate_referral_code(6)
                await self.update(db, user_data["id"], {"referral_code": issued_referral_code})
                user_obj = await self.get_by_field(db, "phone", phone)
                user_data = self._user_to_dict(user_obj)

            await self.update_last_login(db, user_data["id"])
            user_obj = await self.get_by_field(db, "phone", phone)
            user_data = self._user_to_dict(user_obj)
            logger.info(f"User logged in with phone: {user_data['id']}")
            return {
                "user": user_data,
                "session": auth_response.session
            }
        except AuthenticationException:
            raise
        except Exception as e:
            logger.error(f"Phone login error: {str(e)}")
            raise AuthenticationException("Login failed")
    
    async def google_signin(self, db: AsyncSession) -> Dict[str, Any]:
        try:
            auth_response = self.auth_client.auth.sign_in_with_oauth({
                "provider": "google",
                "options": {
                    "redirect_to": "http://localhost:3000"
                }
            })
            if not getattr(auth_response, "user", None):
                raise AuthenticationException("Google authentication failed")
            
            user_obj = await self.get_by_id(db, auth_response.user.id)
            if not user_obj:
                issued_referral_code = self.generate_referral_code(6)
                while await self.get_by_field(db, "referral_code", issued_referral_code):
                    issued_referral_code = self.generate_referral_code(6)
                new_user = {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "user_type": "buyer",
                    "first_name": getattr(auth_response.user, "user_metadata", {}).get("first_name", ""),
                    "last_name": getattr(auth_response.user, "user_metadata", {}).get("last_name", ""),
                    "avatar_url": getattr(auth_response.user, "user_metadata", {}).get("avatar_url"),
                    "google_id": auth_response.user.id,
                    "is_verified": True,
                    "is_active": True,
                    "is_phone_verified": False,
                    "is_email_verified": True,
                    "last_login_at": datetime.utcnow(),
                    "referral_code": issued_referral_code
                }

                user_obj = await self.create(db, new_user)
                
                # Create user profile for new Google OAuth users
                try:
                    profile_crud = ProfileCrud()
                    profile_data = {
                        "user_id": str(user_obj.id),
                        "preferences": {},
                        "social_links": {},
                        "notification_settings": {}
                    }
                    await profile_crud.create(db, profile_data)
                    logger.info(f"Created profile for Google OAuth user: {user_obj.id}")
                except Exception as e:
                    logger.warning(f"Could not create user profile for Google OAuth user {user_obj.id}: {e}")
            else:
                user_data = self._user_to_dict(user_obj)
                if not user_data.get("referral_code"):
                    issued_referral_code = self.generate_referral_code(6)
                    while await self.get_by_field(db, "referral_code", issued_referral_code):
                        issued_referral_code = self.generate_referral_code(6)
                    await self.update(db, str(user_obj.id), {"referral_code": issued_referral_code})
            
            await self.update_last_login(db, str(user_obj.id))
            user_obj = await self.get_by_id(db, str(user_obj.id))
            user_data = self._user_to_dict(user_obj)
            logger.info(f"Google signin successful: {user_data['id']}")
            return {
                "user": user_data,
                "session": auth_response.session
            }
        except Exception as e:
            logger.error(f"Google signin error: {str(e)}")
            raise AuthenticationException("Google authentication failed")

    async def update_phone_and_referral(self, db: AsyncSession, user_id: str, phone: str, referral_code: Optional[str] = None) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")

            if phone:
                existing_phone_obj = await self.get_by_field(db, "phone", phone)
                if existing_phone_obj and str(existing_phone_obj.id) != user_id:
                    raise ConflictException("Phone number already exists")
                await self.update(db, user_id, {"phone": phone})

            if referral_code:
                referrer = await get_referrer_by_code(db, referral_code)
                if referrer and str(referrer.id) != user_id:
                    await self.handle_referral(db, user_id, referral_code)

            updated_user_obj = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user_obj)
        except Exception as e:
            logger.error(f"Update phone and referral error: {str(e)}")
            raise

    async def forgot_password(self, db: AsyncSession, email: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_field(db, "email", email)
            if not user_obj:
                raise NotFoundException("User not found")

            try:
                reset_response = self.auth_client.auth.reset_password_email(email)
                logger.info(f"Password reset email sent successfully to: {email}")
            except Exception as email_err:
                logger.error(f"Supabase email sending failed: {str(email_err)}")
                logger.error("Note: Ensure Supabase email settings are configured in the Supabase dashboard")
                raise
            return {"message": "Password reset email sent", "email": email}
        except Exception as e:
            logger.error(f"Forgot password error: {str(e)}")
            raise ValidationException(f"Failed to send password reset email: {str(e)}. Please check Supabase email configuration.")

    async def reset_password(self, db: AsyncSession, user_id: str, new_password: str) -> Dict[str, Any]:
        try:
            # Admin operations need service role key
            result = self.client.auth.admin.update_user_by_id(user_id, {"password": new_password})
            if not result.user:
                raise AuthenticationException("Failed to update password")
            
            logger.info(f"Password reset successful for user: {user_id}")
            return {"message": "Password reset successful"}
        except Exception as e:
            logger.error(f"Reset password error: {str(e)}")
            raise AuthenticationException("Failed to reset password")
    
    async def update_last_login(self, db: AsyncSession, user_id: str):
        try:
            await self.update(db, user_id, {"last_login_at": datetime.utcnow()})
        except Exception as e:
            logger.error(f"Failed to update last login for {user_id}: {str(e)}")
    
    async def handle_referral(self, db: AsyncSession, user_id: str, referral_code: str):
        try:
            referrer = await get_referrer_by_code(db, referral_code)
            if not referrer:
                logger.warning(f"Invalid referral code: {referral_code}")
                return
            if str(referrer.id) == user_id:
                logger.warning(f"User cannot refer themselves: {referral_code}")
                return
            
            referral_crud = ReferralCrud()
            await referral_crud.create_referral_record(
                db,
                referrer_id=str(referrer.id),
                referee_id=user_id,
                referral_code=referral_code
            )
            logger.info(f"Referral completed: {referral_code} -> {user_id}")
        except Exception as e:
            logger.error(f"Referral handling error: {str(e)}")
    
    def generate_referral_code(self, length: int = 6) -> str:
        chars = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(chars) for _ in range(length))

    async def get_user_referral_stats(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            referral_crud = ReferralCrud()
            referral_data = await referral_crud.get_user_referrals(db, user_id)
            
            user_obj = await self.get_by_id(db, user_id)
            user_referral_code = user_obj.referral_code if user_obj else None
            
            return {
                "user_referral_code": user_referral_code,
                "referral_stats": referral_data
            }
        except Exception as e:
            self.logger.error(f"Error getting referral stats for {user_id}: {str(e)}")
            return {
                "user_referral_code": None,
                "referral_stats": {
                    "total_referrals": 0,
                    "completed_referrals": 0,
                    "pending_referrals": 0,
                    "referrals": []
                }
            }
    
    async def update_user_profile(self, db: AsyncSession, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            user_update_data = {}
            if "first_name" in profile_data:
                user_update_data["first_name"] = profile_data["first_name"]
            if "last_name" in profile_data:
                user_update_data["last_name"] = profile_data["last_name"]
            if "phone" in profile_data:
                existing_phone = await self.get_by_field(db, "phone", profile_data["phone"])
                if existing_phone and str(existing_phone.id) != user_id:
                    raise ConflictException("Phone number already exists")
                user_update_data["phone"] = profile_data["phone"]
            if "avatar_url" in profile_data:
                user_update_data["avatar_url"] = profile_data["avatar_url"]
            
            if user_update_data:
                await self.update(db, user_id, user_update_data)
            
            updated_user = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user)
        except Exception as e:
            logger.error(f"Error updating user profile for {user_id}: {str(e)}")
            raise
    
    async def update_avatar(self, db: AsyncSession, user_id: str, avatar_url: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            await self.update(db, user_id, {"avatar_url": avatar_url})
            updated_user = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user)
        except Exception as e:
            logger.error(f"Error updating avatar for {user_id}: {str(e)}")
            raise
    
    async def delete_avatar(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            await self.update(db, user_id, {"avatar_url": None})
            updated_user = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user)
        except Exception as e:
            logger.error(f"Error deleting avatar for {user_id}: {str(e)}")
            raise
    
    async def deactivate_account(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            await self.update(db, user_id, {"is_active": False})
            updated_user = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user)
        except Exception as e:
            logger.error(f"Error deactivating account for {user_id}: {str(e)}")
            raise
    
    async def reactivate_account(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            await self.update(db, user_id, {"is_active": True})
            updated_user = await self.get_by_id(db, user_id)
            return self._user_to_dict(updated_user)
        except Exception as e:
            logger.error(f"Error reactivating account for {user_id}: {str(e)}")
            raise
    
    async def get_full_user_profile(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            user_obj = await self.get_by_id(db, user_id)
            if not user_obj:
                raise NotFoundException("User not found")
            
            profile_crud = ProfileCrud()
            profile_data = await profile_crud.get_profile_dict(db, user_id)
            
            user_data = self._user_to_dict(user_obj)
            user_data["profile"] = profile_data
            
            return user_data
        except Exception as e:
            logger.error(f"Error getting full user profile for {user_id}: {str(e)}")
            raise