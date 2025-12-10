from supabase import create_client, Client
from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import ValidationException
from typing import Optional

logger = get_logger("database")

def create_supabase_client() -> Client:
    if not settings.SUPABASE_URL:
        raise ValidationException("SUPABASE_URL must be set")
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not key:
        raise ValidationException("SUPABASE_SERVICE_ROLE_KEY must be set")
    client = create_client(settings.SUPABASE_URL, key)
    return client

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_supabase_client()
    return _supabase_client

def get_authenticated_supabase_client(user_token: str) -> Client:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    client.options.headers["Authorization"] = f"Bearer {user_token}"
    logger.info("Authenticated Supabase client created")
    return client
