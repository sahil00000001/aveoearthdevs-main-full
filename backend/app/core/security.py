import time
from typing import Dict, Any, Optional
from datetime import datetime
import httpx
from jose import jwt, jwk
from jose.utils import base64url_decode
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.exceptions import AuthenticationException, AuthorizationException, ExternalServiceException
from app.core.logging import get_logger
from enum import Enum
from app.features.auth.cruds.auth_crud import AuthCrud

logger = get_logger("security")
security = HTTPBearer(auto_error=False)

class UserRole(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier" 
    ADMIN = "admin"

_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_cache_ts: float = 0
JWKS_CACHE_TTL = settings.JWT_CACHE_TTL

async def fetch_jwks() -> Dict[str, Any]:
    global _jwks_cache, _jwks_cache_ts
    
    current_time = time.time()
    if _jwks_cache and (current_time - _jwks_cache_ts) < JWKS_CACHE_TTL:
        return _jwks_cache
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.SUPABASE_JWKS_URL, timeout=10)
            response.raise_for_status()
            jwks = response.json()
            
        _jwks_cache = jwks
        _jwks_cache_ts = current_time
        logger.debug("JWKS cache updated")
        return jwks
    except httpx.TimeoutException:
        logger.error("JWKS fetch timeout")
        raise ExternalServiceException("JWKS service timeout", "Supabase")
    except httpx.HTTPStatusError as e:
        logger.error(f"JWKS fetch HTTP error: {e.response.status_code}")
        raise ExternalServiceException(f"JWKS service error: {e.response.status_code}", "Supabase")
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {str(e)}")
        raise ExternalServiceException("JWKS service unavailable", "Supabase")

def _decode_with_secret(token: str) -> Dict[str, Any]:
    if not settings.SUPABASE_JWT_SECRET:
        raise AuthenticationException("Server JWT secret not configured")
    try:
        claims: Dict[str, Any] = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.SUPABASE_AUDIENCE or None,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": bool(settings.SUPABASE_AUDIENCE),
            },
        )
        if settings.SUPABASE_ISSUER and claims.get("iss") != settings.SUPABASE_ISSUER:
            raise AuthenticationException("Invalid token issuer")
        return claims
    except Exception as e:
        raise AuthenticationException(f"JWT (secret) verification failed: {e}")


async def _decode_with_jwks(token: str) -> Dict[str, Any]:
    jwks = await fetch_jwks()
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    if not kid:
        raise AuthenticationException("Token missing key ID")
    key = None
    for jwk_item in jwks.get("keys", []):
        if jwk_item.get("kid") == kid:
            key = jwk_item
            break
    if not key:
        raise AuthenticationException("Invalid token key ID")
    public_key = jwk.construct(key)
    message, encoded_sig = token.rsplit(".", 1)
    decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))
    if not public_key.verify(message.encode("utf-8"), decoded_sig):
        raise AuthenticationException("Invalid token signature")
    claims = jwt.get_unverified_claims(token)
    current_time = int(time.time())
    if "exp" in claims and int(claims["exp"]) < current_time:
        raise AuthenticationException("Token expired")
    if settings.SUPABASE_ISSUER and claims.get("iss") != settings.SUPABASE_ISSUER:
        raise AuthenticationException("Invalid token issuer")
    audience = claims.get("aud")
    if settings.SUPABASE_AUDIENCE:
        if isinstance(audience, list):
            if settings.SUPABASE_AUDIENCE not in audience:
                raise AuthenticationException("Invalid token audience")
        elif audience != settings.SUPABASE_AUDIENCE:
            raise AuthenticationException("Invalid token audience")
    return claims


async def verify_supabase_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    # TEMPORARILY DISABLED FOR REVIEW - Return mock claims
    return {
        "sub": "temp-vendor-123",
        "email": "review@example.com",
        "user_role": "supplier",
        "app_metadata": {"role": "supplier"},
        "user_metadata": {},
        "phone": "+1234567890"
    }
    
    # Original authentication code (commented out):
    # if not credentials or credentials.scheme.lower() != "bearer":
    #     raise AuthenticationException("Missing or invalid authorization header")
    # token = credentials.credentials
    # try:
    #     claims = _decode_with_secret(token)
    #     logger.debug(f"Token verified with secret for user: {claims.get('sub')}")
    #     return claims
    # except AuthenticationException as secret_err:
    #     logger.warning(f"HS256 verification failed, trying JWKS: {secret_err}")
    #     try:
    #         claims = await _decode_with_jwks(token)
    #         logger.debug(f"Token verified with JWKS for user: {claims.get('sub')}")
    #         return claims
    #     except Exception as e:
    #         logger.error(f"JWT verification failed: {e}")
    #         raise AuthenticationException("Token verification failed")

def require_roles(allowed_roles: list[UserRole]):
    async def role_checker(claims: Dict[str, Any] = Depends(verify_supabase_jwt)) -> Dict[str, Any]:
        user_role = claims.get("user_role") or claims.get("app_metadata", {}).get("role") or "buyer"
        
        if user_role not in [role.value for role in allowed_roles]:
            logger.warning(f"Access denied for user {claims.get('sub')} with role {user_role}")
            raise AuthorizationException(f"Access denied. Required roles: {[r.value for r in allowed_roles]}")
        
        return claims
    
    return role_checker

async def get_current_user(claims: Dict[str, Any] = Depends(verify_supabase_jwt)) -> Dict[str, Any]:
    
    user_id = claims.get("sub")
    if not user_id:
        raise AuthenticationException("Invalid token: missing user ID")
    
    # Try to get user from database using the Supabase Auth ID
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_by_id(user_id)
    
    if not user_data:
        logger.warning(f"User not found in database for auth ID: {user_id}")
        # Return basic user info from JWT claims if user not found in database
        return {
            "id": user_id,
            "email": claims.get("email"),
            "user_role": claims.get("user_role") or claims.get("app_metadata", {}).get("role") or "buyer",
            "phone": claims.get("phone"),
            "user_metadata": claims.get("user_metadata", {}),
        }
    
    # Update last_login_at if we have auth metadata with login info
    try:
        # Check if the token has authentication method info indicating a recent login
        auth_methods = claims.get("amr", [])
        if auth_methods and len(auth_methods) > 0:
            # Get the most recent auth method timestamp
            latest_auth = max(auth_methods, key=lambda x: x.get("timestamp", 0))
            auth_timestamp = latest_auth.get("timestamp")
            
            if auth_timestamp:
                # Convert timestamp to datetime and update if it's newer than stored last_login_at
                auth_time = datetime.fromtimestamp(auth_timestamp)
                stored_last_login = user_data.get("last_login_at")
                
                if not stored_last_login or datetime.fromisoformat(stored_last_login.replace('Z', '+00:00')) < auth_time:
                    await auth_crud.update_last_login(user_id)
                    user_data["last_login_at"] = auth_time.isoformat()
    except Exception as e:
        logger.warning(f"Could not update last_login_at for user {user_id}: {e}")

    return {
        "id": user_data["id"],
        "email": user_data.get("email") or claims.get("email"),
        "user_role": user_data.get("user_type") or claims.get("user_role") or claims.get("app_metadata", {}).get("role") or "buyer",
        "phone": user_data.get("phone") or claims.get("phone"),
        "first_name": user_data.get("first_name"),
        "last_name": user_data.get("last_name"),
        "is_verified": user_data.get("is_verified", False),
        "is_active": user_data.get("is_active", True),
        "last_login_at": user_data.get("last_login_at"),
        "user_metadata": claims.get("user_metadata", {}),
    }
