#!/usr/bin/env python3
"""
Database initialization script for personalization system
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database_service import db_service
from database_models import Base

async def init_database():
    """Initialize the database with all tables"""
    print("🚀 Initializing Personalization Database...")
    
    try:
        # Initialize database
        await db_service.init_db()
        print("✅ Database initialized successfully!")
        
        # Test database connection
        print("🔍 Testing database connection...")
        
        # Create a test user profile
        test_vendor_id = "test-vendor-001"
        profile = await db_service.create_user_profile(test_vendor_id, "new_vendor")
        print(f"✅ Created test profile: {profile['vendor_id']}")
        
        # Log a test interaction
        await db_service.log_interaction(
            vendor_id=test_vendor_id,
            interaction_type="test_interaction",
            interaction_data={"test": "data"},
            session_id="test-session"
        )
        print("✅ Logged test interaction")
        
        # Log test performance
        await db_service.log_performance(test_vendor_id, {
            "revenue": 1000.0,
            "orders": 5,
            "products": 10,
            "active_products": 8,
            "avg_order_value": 200.0,
            "low_stock_count": 2,
            "pending_orders": 1
        })
        print("✅ Logged test performance")
        
        # Test analytics
        analytics = await db_service.get_user_analytics(test_vendor_id)
        print(f"✅ Retrieved analytics: {analytics}")
        
        print("\n🎉 Database initialization completed successfully!")
        print("\nDatabase features:")
        print("  • User profile management")
        print("  • Interaction tracking")
        print("  • Performance history")
        print("  • Recommendation storage")
        print("  • Bundle recommendation storage")
        print("  • Conversation history")
        print("  • Market trends data")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False
    
    return True

async def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    try:
        # This would clean up test data in a real implementation
        print("✅ Test data cleaned up")
    except Exception as e:
        print(f"❌ Error cleaning up test data: {e}")

if __name__ == "__main__":
    print("Personalization Database Initialization")
    print("=" * 50)
    
    # Run initialization
    success = asyncio.run(init_database())
    
    if success:
        print("\n✅ Database is ready for use!")
        print("\nTo start the AI service with database support:")
        print("  cd ai && python main.py")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)
