"""
Cloud database service for personalization system
Supports multiple cloud providers
"""

import os
from database_service import DatabaseService

class CloudDatabaseService(DatabaseService):
    def __init__(self, provider: str = "supabase"):
        self.provider = provider
        database_url = self._get_database_url()
        super().__init__(database_url)
    
    def _get_database_url(self) -> str:
        """Get database URL based on provider"""
        
        if self.provider == "supabase":
            # Supabase PostgreSQL
            return os.getenv(
                "SUPABASE_DATABASE_URL",
                "postgresql+asyncpg://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"
            )
        
        elif self.provider == "planetscale":
            # PlanetScale MySQL
            return os.getenv(
                "PLANETSCALE_DATABASE_URL",
                "mysql+aiomysql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?ssl-mode=REQUIRED"
            )
        
        elif self.provider == "neon":
            # Neon PostgreSQL
            return os.getenv(
                "NEON_DATABASE_URL",
                "postgresql+asyncpg://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]"
            )
        
        elif self.provider == "railway":
            # Railway PostgreSQL
            return os.getenv(
                "RAILWAY_DATABASE_URL",
                "postgresql+asyncpg://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
            )
        
        else:
            # Fallback to local SQLite
            return "sqlite+aiosqlite:///./personalization.db"
    
    async def setup_cloud_database(self):
        """Setup cloud database with proper configuration"""
        try:
            # Initialize database
            await self.init_db()
            
            # Create indexes for better performance
            await self._create_indexes()
            
            print(f"✅ {self.provider.title()} database initialized successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error setting up {self.provider} database: {e}")
            return False
    
    async def _create_indexes(self):
        """Create database indexes for better performance"""
        # This would create indexes for frequently queried columns
        # Implementation depends on the specific database provider
        pass

# Cloud database service instances
def get_cloud_database_service(provider: str = "supabase"):
    """Get cloud database service for specified provider"""
    return CloudDatabaseService(provider)

# Default to Supabase
cloud_db_service = get_cloud_database_service("supabase")
