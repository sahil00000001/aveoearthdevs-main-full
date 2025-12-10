from fastapi import APIRouter
from app.features.auth.requests.password_request import RefreshTokenRequest
from app.features.auth.responses.auth_response import TokenResponse
from app.core.exceptions import AuthenticationException, ValidationException
from app.core.logging import get_logger
from app.database.base import get_supabase_client
from app.features.auth.routes.auth_routes import auth_router

logger = get_logger("auth.routes")

@auth_router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    try:
        supabase = get_supabase_client()
        result = supabase.auth.refresh_session(request.refresh_token)
        
        if not result.session:
            raise AuthenticationException("Invalid refresh token")
        
        return TokenResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            token_type="bearer",
            expires_in=result.session.expires_in or 3600
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise AuthenticationException("Failed to refresh token")
