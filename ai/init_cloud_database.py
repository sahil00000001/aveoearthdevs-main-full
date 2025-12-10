#!/usr/bin/env python3
"""
Cloud database initialization script
Supports multiple cloud providers
"""

import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("env.cloud.example")

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from cloud_database_service import get_cloud_database_service

async def init_cloud_database():
    """Initialize cloud database"""
    provider = os.getenv("DATABASE_PROVIDER", "supabase")
    
    print(f"☁️  Initializing {provider.upper()} Cloud Database...")
    print("=" * 50)
    
    try:
        # Get cloud database service
        db_service = get_cloud_database_service(provider)
        
        # Setup cloud database
        success = await db_service.setup_cloud_database()
        
        if success:
            print(f"✅ {provider.title()} database ready!")
            
            # Test database connection
            print("🔍 Testing cloud database connection...")
            
            # Create a test user profile
            test_vendor_id = "cloud-test-vendor-001"
            profile = await db_service.create_user_profile(test_vendor_id, "new_vendor")
            print(f"✅ Created test profile: {profile['vendor_id']}")
            
            # Log a test interaction
            await db_service.log_interaction(
                vendor_id=test_vendor_id,
                interaction_type="cloud_test_interaction",
                interaction_data={"test": "cloud_data", "provider": provider},
                session_id="cloud-test-session"
            )
            print("✅ Logged test interaction to cloud")
            
            # Log test performance
            await db_service.log_performance(test_vendor_id, {
                "revenue": 5000.0,
                "orders": 25,
                "products": 50,
                "active_products": 45,
                "avg_order_value": 200.0,
                "low_stock_count": 3,
                "pending_orders": 2
            })
            print("✅ Logged test performance to cloud")
            
            # Test analytics
            analytics = await db_service.get_user_analytics(test_vendor_id)
            print(f"✅ Retrieved cloud analytics: {analytics}")
            
            print(f"\n🎉 {provider.title()} cloud database initialized successfully!")
            print(f"\nCloud database features:")
            print(f"  • Provider: {provider.upper()}")
            print(f"  • User profile management")
            print(f"  • Interaction tracking")
            print(f"  • Performance history")
            print(f"  • Recommendation storage")
            print(f"  • Bundle recommendation storage")
            print(f"  • Conversation history")
            print(f"  • Real-time capabilities")
            
            return True
        else:
            print(f"❌ Failed to initialize {provider} database")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing {provider} database: {e}")
        print(f"\nTroubleshooting:")
        print(f"  1. Check your database URL in env.cloud.example")
        print(f"  2. Ensure your cloud provider credentials are correct")
        print(f"  3. Verify network connectivity")
        print(f"  4. Check if the database exists on your cloud provider")
        return False

async def show_provider_info():
    """Show information about different cloud providers"""
    print("\n🌐 Available Cloud Database Providers:")
    print("=" * 50)
    
    providers = {
        "supabase": {
            "name": "Supabase",
            "type": "PostgreSQL",
            "free_tier": "500MB database, 2GB bandwidth",
            "pros": "Already integrated, real-time, free tier",
            "setup": "Use existing Supabase project"
        },
        "planetscale": {
            "name": "PlanetScale",
            "type": "MySQL",
            "free_tier": "1B reads, 10M writes",
            "pros": "Database branching, serverless scaling",
            "setup": "Create account at planetscale.com"
        },
        "neon": {
            "name": "Neon",
            "type": "PostgreSQL",
            "free_tier": "3GB storage, 10GB transfer",
            "pros": "Serverless, branching, point-in-time recovery",
            "setup": "Create account at neon.tech"
        },
        "railway": {
            "name": "Railway",
            "type": "PostgreSQL",
            "free_tier": "$5 credit monthly",
            "pros": "One-click deployment, monitoring",
            "setup": "Create account at railway.app"
        }
    }
    
    for provider, info in providers.items():
        print(f"\n{info['name']} ({provider}):")
        print(f"  Type: {info['type']}")
        print(f"  Free Tier: {info['free_tier']}")
        print(f"  Pros: {info['pros']}")
        print(f"  Setup: {info['setup']}")

if __name__ == "__main__":
    print("☁️  Cloud Database Initialization")
    print("=" * 50)
    
    # Show provider information
    asyncio.run(show_provider_info())
    
    # Run initialization
    success = asyncio.run(init_cloud_database())
    
    if success:
        print(f"\n✅ Cloud database is ready!")
        print(f"\nTo start the AI service with cloud database:")
        print(f"  cd ai && python main.py")
        print(f"\nTo switch providers, update DATABASE_PROVIDER in env.cloud.example")
    else:
        print(f"\n❌ Cloud database initialization failed!")
        print(f"\nTry using local SQLite first:")
        print(f"  python init_database.py")
        sys.exit(1)
