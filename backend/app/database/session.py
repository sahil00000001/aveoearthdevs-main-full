from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text, inspect
from sqlalchemy.exc import OperationalError, TimeoutError as SQLTimeoutError
from app.core.config import settings
from typing import AsyncGenerator
from app.core.logging import get_logger
from app.core.base import Base
from app.core.exceptions import ServiceUnavailableException

logger = get_logger("session")

async_engine = None
AsyncSessionLocal = None

async def init_database():
    global async_engine, AsyncSessionLocal
    
    if not settings.DATABASE_URL:
        logger.error("No DATABASE_URL provided in environment variables. Please set DATABASE_URL to connect to PostgreSQL.")
        return False
    
    # Validate DATABASE_URL format
    if not (settings.DATABASE_URL.startswith("postgresql://") or 
            settings.DATABASE_URL.startswith("postgresql+psycopg2://") or
            settings.DATABASE_URL.startswith("postgresql+asyncpg://")):
        logger.error(f"Invalid DATABASE_URL format. Expected postgresql:// or postgresql+psycopg2:// format. Got: {settings.DATABASE_URL[:20]}...")
        return False
    
    try:
        # Parse and convert DATABASE_URL to asyncpg format
        if settings.DATABASE_URL.startswith("postgresql://"):
            async_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        elif settings.DATABASE_URL.startswith("postgresql+psycopg2://"):
            async_url = settings.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
        else:
            async_url = settings.DATABASE_URL
        
        # Remove sslmode query parameter as asyncpg handles SSL differently
        # asyncpg requires ssl in connect_args, not in URL query string
        if "?sslmode=require" in async_url:
            async_url = async_url.replace("?sslmode=require", "")
        if "&sslmode=require" in async_url:
            async_url = async_url.replace("&sslmode=require", "")
        if "sslmode=require" in async_url and "?" in async_url:
            # Handle case where sslmode is in query params with other params
            parts = async_url.split("?")
            base_url = parts[0]
            query_params = parts[1] if len(parts) > 1 else ""
            params = [p for p in query_params.split("&") if not p.startswith("sslmode")]
            if params:
                async_url = base_url + "?" + "&".join(params)
            else:
                async_url = base_url
        
        if settings.SUPABASE_SERVICE_ROLE_KEY and settings.SUPABASE_ANON_KEY in async_url:
            async_url = async_url.replace(settings.SUPABASE_ANON_KEY, settings.SUPABASE_SERVICE_ROLE_KEY)
            logger.info("Using service role for database operations to bypass RLS")
        
        # For Supabase, SSL is required - pass it via connect_args
        connect_args = {}
        if "supabase.co" in async_url:
            # Supabase requires SSL - but allow self-signed certs in development
            import ssl
            ssl_context = ssl.create_default_context()
            # In development, disable certificate verification to allow self-signed certs
            if settings.DEBUG:
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                logger.warning("SSL certificate verification disabled for development mode")
            
            # Supabase uses pgbouncer which doesn't support prepared statements properly
            # For asyncpg, we need to set statement_cache_size=0 in connect_args
            # AND add ?prepared_statement_cache_size=0 to URL for SQLAlchemy
            # AND set server_settings to disable prepared statements
            connect_args = {
                "ssl": ssl_context,
                "command_timeout": 60,
                "statement_cache_size": 0,  # Disable prepared statement cache for pgbouncer
                "server_settings": {
                    "jit": "off"  # Disable JIT to avoid prepared statement issues
                }
            }
            
            # Remove any existing prepared_statement_cache_size from URL first
            if "prepared_statement_cache_size" in async_url:
                import re
                async_url = re.sub(r'[&?]prepared_statement_cache_size=\d+', '', async_url)
            
            # Add to URL for SQLAlchemy asyncpg dialect
            if "?" in async_url:
                async_url += "&prepared_statement_cache_size=0"
            else:
                async_url += "?prepared_statement_cache_size=0"
            
            logger.info("Configured connection args for Supabase/pgbouncer compatibility (statement_cache_size=0, disabled prepared statements)")
        
        # For Supabase/pgbouncer, disable statement caching
        engine_kwargs = {
            "pool_size": 5,
            "max_overflow": 10,
            "pool_pre_ping": True,  # Enable connection health checks
            "pool_recycle": 300,
            "pool_timeout": 10,
            "echo": False,
            "future": True,
            "connect_args": connect_args,
            "execution_options": {
                "isolation_level": "READ_COMMITTED",
            },
        }
        
        # For pgbouncer compatibility, also disable prepared statements at engine level
        if "supabase.co" in async_url:
            # Use text() execution for all queries to avoid prepared statements
            # This is handled by ensuring statement_cache_size=0 in connect_args
            # But we also need to ensure the engine doesn't cache statements
            # Reset connection on return to clear any cached statements
            engine_kwargs["pool_reset_on_return"] = "commit"
        
        async_engine = create_async_engine(
            async_url,
            **engine_kwargs
        )
        
        AsyncSessionLocal = async_sessionmaker(
            bind=async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
        
        await ensure_tables_created()
        logger.info("Database initialized successfully with async support")
        return True
        
    except Exception as e:
        async_engine = None
        AsyncSessionLocal = None
        error_msg = str(e)
        if "getaddrinfo failed" in error_msg or "could not translate host name" in error_msg:
            logger.error(f"Database connection failed: Cannot resolve database host. Please check DATABASE_URL is correct.")
            logger.error(f"DATABASE_URL format: postgresql://username:password@host:port/database")
        elif "password authentication failed" in error_msg.lower():
            logger.error(f"Database connection failed: Authentication failed. Please check DATABASE_URL credentials.")
        elif "does not exist" in error_msg.lower():
            logger.error(f"Database connection failed: Database does not exist. Please create the database first.")
        else:
            logger.error(f"Failed to initialize database: {str(e)}")
        logger.error("Please verify your DATABASE_URL environment variable is set correctly.")
        return False

async def ensure_tables_created():
    try:
        if not async_engine or not Base.metadata:
            logger.warning("Database engine or metadata not available")
            return
            
        async with async_engine.begin() as conn:
            def check_and_create_tables(sync_conn):
                inspector = inspect(sync_conn)
                all_tables = set(inspector.get_table_names())
                system_tables = {'geography_columns', 'geometry_columns', 'spatial_ref_sys'}
                existing_tables = all_tables - system_tables
                
                if existing_tables:
                    logger.info(f"Tables already exist in database: {sorted(list(existing_tables))}")
                    return
                
                Base.metadata.create_all(bind=sync_conn)
                logger.info("Created all model tables")
            
            await conn.run_sync(check_and_create_tables)
    except Exception as e:
        logger.error(f"Failed to create tables via async engine: {e}")
        logger.warning("Continuing without table creation - tables may need to be created manually")

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    if AsyncSessionLocal is None:
        logger.warning("Database session requested but database not initialized")
        yield None
        return
    session = None
    try:
        session = AsyncSessionLocal()
        yield session
    except Exception as e:
        if session:
            await session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        if session:
            await session.close()

def get_async_engine():
    return async_engine

async def check_database_health() -> dict:
    try:
        if async_engine:
            pool = async_engine.pool
            return {
                "status": "healthy",
                "pool_size": pool.size(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "checked_in": pool.checkedin(),
            }
        else:
            return {"status": "not_initialized"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}

async def close_database_connections():
    try:
        if async_engine:
            await async_engine.dispose()
            logger.info("Database connections closed gracefully")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")