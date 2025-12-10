from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv
import json
from pathlib import Path

# Load .env file from backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
if not env_path.exists():
    # Try .env.new as fallback
    env_new_path = Path(__file__).parent.parent.parent / ".env.new"
    if env_new_path.exists():
        env_path = env_new_path

# Load .env with encoding handling for Budapest-BOM files
if env_path.exists():
    try:
        # Try UTF-8 first, then try with BOM removal
        load_dotenv(dotenv_path=env_path, encoding='utf-8-sig')  # utf-8-sig handles BOM automatically
    except Exception:
        # Fallback: read file manually and remove BOM
        try:
            with open(env_path, 'rb') as f:
                content = f.read()
                if content.startswith(b'\xef\xbb\xbf'):
                    content = content[3:]  # Remove BOM
                with open(env_path, 'wb') as f2:
                    f2.write(content)
                load_dotenv(dotenv_path=env_path, encoding='utf-8')
        except Exception as e:
            # Last resort: try without specifying path (uses current dir)
            load_dotenv()
else:
    load_dotenv()  # Try default location

class Settings(BaseSettings):
    PROJECT_NAME: str = "AveoEarth"
    PROJECT_VERSION: str = "1.0.0"
    PORT: int = Field(default=8080, env="PORT")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    SUPABASE_ANON_KEY: str = Field(default="", env="SUPABASE_ANON_KEY")
    SUPABASE_URL: str = Field(default="", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(default="", env="SUPABASE_KEY") 
    SUPABASE_JWT_SECRET: str = Field(default="", env="SUPABASE_JWT_SECRET")
    SUPABASE_JWKS_URL: str = Field(default="", env="SUPABASE_JWKS_URL")
    SUPABASE_AUDIENCE: str = Field(default="authenticated", env="SUPABASE_AUDIENCE")
    SUPABASE_ISSUER: str = Field(default="", env="SUPABASE_ISSUER")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")
    WHATSAPP_API_URL: str = Field(default="", env="WHATSAPP_API_URL")
    WHATSAPP_API_TOKEN: str = Field(default="", env="WHATSAPP_API_TOKEN")
    WHATSAPP_PHONE_NUMBER_ID: str = Field(default="", env="WHATSAPP_PHONE_NUMBER_ID")
    
    DATABASE_URL: str = Field(default="", env="DATABASE_URL")
    
    GCP_PROJECT_ID: str = Field(default="", env="GCP_PROJECT_ID")
    GCP_CREDENTIALS_JSON: str = Field(default="", env="GCP_CREDENTIALS_JSON")
    GCP_BUCKET_SUPPLIER_ASSETS: str = Field(default="", env="GCP_BUCKET_SUPPLIER_ASSETS")
    GCP_BUCKET_PRODUCT_ASSETS: str = Field(default="", env="GCP_BUCKET_PRODUCT_ASSETS")
    GCP_BUCKET_CATEGORY_ASSETS: str = Field(default="", env="GCP_BUCKET_CATEGORY_ASSETS")
    GCP_BUCKET_USER_UPLOADS: str = Field(default="", env="GCP_BUCKET_USER_UPLOADS")
    GCP_CDN_BASE_URL: str = Field(default="https://storage.cloud.google.com", env="GCP_CDN_BASE_URL")
    
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    CORS_ORIGINS: List[str] = Field(default=["*"], env="CORS_ORIGINS")
    
    PAGINATION_LIMIT: int = Field(default=20, env="PAGINATION_LIMIT")
    PAGINATION_MAX_LIMIT: int = Field(default=100, env="PAGINATION_MAX_LIMIT")
    
    JWT_CACHE_TTL: int = Field(default=3600, env="JWT_CACHE_TTL")
    OTP_EXPIRY_MINUTES: int = Field(default=10, env="OTP_EXPIRY_MINUTES")
    OTP_MAX_ATTEMPTS: int = Field(default=3, env="OTP_MAX_ATTEMPTS")
    DB_SYNC_MODE: str = Field(default="compare", env="DB_SYNC_MODE")
    
    @property
    def gcp_credentials_dict(self):
        try:
            return json.loads(self.GCP_CREDENTIALS_JSON) if self.GCP_CREDENTIALS_JSON else {}
        except json.JSONDecodeError:
            return {}
    
    model_config = {
        "env_file": str(env_path) if env_path.exists() else ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()
