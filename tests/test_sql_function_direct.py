"""Test the SQL function directly"""
import asyncio
import asyncpg
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from app.core.config import settings
from uuid import uuid4
from datetime import datetime
import json

async def test_insert():
    # Get connection string from DATABASE_URL
    db_url = settings.DATABASE_URL
    if not db_url:
        print("❌ DATABASE_URL not set")
        return
    
    # Replace with asyncpg format
    db_url = db_url.replace("postgresql://", "").replace("postgresql+asyncpg://", "").replace("postgresql+psycopg2://", "")
    
    # Parse connection string
    parts = db_url.split("@")
    if len(parts) != 2:
        print(f"❌ Invalid DATABASE_URL format: {db_url[:50]}...")
        return
    
    auth_part = parts[0]
    host_part = parts[1]
    
    user_pass = auth_part.split(":")
    username = user_pass[0] if len(user_pass) > 0 else "postgres"
    password = ":".join(user_pass[1:]) if len(user_pass) > 1 else ""
    
    host_db = host_part.split("/")
    host_port = host_db[0].split(":")
    host = host_port[0]
    port = int(host_port[1]) if len(host_port) > 1 else 5432
    database = host_db[1].split("?")[0] if len(host_db) > 1 else "postgres"
    
    print(f"🔗 Connecting to {host}:{port}/{database}...")
    
    try:
        # Connect with statement_cache_size=0
        conn = await asyncpg.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database=database,
            ssl="require",
            statement_cache_size=0  # Critical for pgbouncer
        )
        
        print("✅ Connected!")
        
        # Test the function
        product_id = str(uuid4())
        result = await conn.fetchval("""
            SELECT insert_product_bulk(
                $1::uuid, $2::varchar, $3::varchar, $4::varchar, $5::decimal,
                $6::text, $7::text, $8::uuid, $9::uuid, $10::uuid,
                $11::varchar, $12::varchar, $13::varchar, $14::jsonb,
                $15::timestamp, $16::timestamp
            )
        """, 
            product_id, "Test Product", "TEST-001", "test-product", 29.99,
            "Test description", "Full test description", None, None, "00000000-0000-0000-0000-000000000001",
            "active", "approved", "visible", json.dumps(["test"]), datetime.utcnow(), datetime.utcnow()
        )
        
        print(f"✅ Product inserted! ID: {result}")
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_insert())

