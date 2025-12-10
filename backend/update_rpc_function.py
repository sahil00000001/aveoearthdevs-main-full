#!/usr/bin/env python3
"""
Update Supabase RPC function directly via database connection
"""
import asyncio
import asyncpg
from app.core.config import settings
import ssl

async def update_rpc_function():
    """Update the insert_product_bulk function with enum casting fixes"""
    
    if not settings.DATABASE_URL:
        print("❌ DATABASE_URL not set")
        return False
    
    print("🔧 Connecting to Supabase database...")
    
    # Parse DATABASE_URL
    db_url = settings.DATABASE_URL
    # Remove postgresql:// prefix if present
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "")
    elif db_url.startswith("postgresql+psycopg2://"):
        db_url = db_url.replace("postgresql+psycopg2://", "")
    
    # Parse connection details
    # Format: user:password@host:port/database
    if "@" not in db_url:
        print("❌ Invalid DATABASE_URL format")
        return False
    
    auth, rest = db_url.split("@", 1)
    if ":" in auth:
        user, password = auth.split(":", 1)
    else:
        user = auth
        password = ""
    
    if "/" in rest:
        host_port, database = rest.split("/", 1)
        if ":" in host_port:
            host, port = host_port.split(":", 1)
            port = int(port)
        else:
            host = host_port
            port = 5432
    else:
        print("❌ Invalid DATABASE_URL format - missing database")
        return False
    
    # Remove query params
    database = database.split("?")[0]
    
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Database: {database}")
    print(f"   User: {user}")
    
    try:
        # Read SQL function
        import os
        from pathlib import Path
        # Get the project root (two levels up from this script)
        project_root = Path(__file__).parent.parent
        sql_path = project_root / "fix_bulk_upload_sql_function.sql"
        
        if not sql_path.exists():
            print(f"❌ SQL file not found at: {sql_path}")
            return False
        
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_function = f.read()
        
        print("\n🔧 Connecting to database...")
        
        # Create SSL context for Supabase
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Connect to database
        conn = await asyncpg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl=ssl_context,
            statement_cache_size=0  # Disable prepared statements
        )
        
        print("✅ Connected to database")
        print("\n🔧 Updating RPC function...")
        
        # Execute SQL function creation
        await conn.execute(sql_function)
        
        print("✅ RPC function updated successfully!")
        
        # Verify function exists
        result = await conn.fetchval("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'insert_product_bulk'
        """)
        
        if result:
            print(f"✅ Verified: Function '{result}' exists")
        else:
            print("⚠️  Warning: Could not verify function exists")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error updating function: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(update_rpc_function())
    exit(0 if success else 1)

