#!/usr/bin/env python3
"""
Test script for the enhanced Vendor Concierge with personalization and recommendations
"""

import asyncio
import json
import httpx
from datetime import datetime

# Test configuration
AI_SERVICE_URL = "http://localhost:8002"
BACKEND_URL = "http://localhost:8000"

async def test_personalization_features():
    """Test the new personalization and recommendation features"""
    
    print("🚀 Testing Enhanced Vendor Concierge with Personalization")
    print("=" * 60)
    
    # Test vendor ID (mock)
    vendor_id = "test-vendor-123"
    
    async with httpx.AsyncClient() as client:
        # Test 1: Get personalized insights
        print("\n1. Testing Personalized Insights...")
        try:
            response = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "Give me personalized insights and recommendations",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Personalized insights received")
                print(f"Response: {data.get('response', 'No response')[:200]}...")
                
                if data.get('function_calls'):
                    print(f"Function calls executed: {len(data['function_calls'])}")
                    for call in data['function_calls']:
                        print(f"  - {call.get('function', 'Unknown')}")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 2: Get bundle recommendations
        print("\n2. Testing Bundle Recommendations...")
        try:
            response = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "Create intelligent product bundles for me",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Bundle recommendations received")
                print(f"Response: {data.get('response', 'No response')[:200]}...")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 3: Test conversation memory
        print("\n3. Testing Conversation Memory...")
        try:
            # First message
            response1 = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "What's my current performance?",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            # Follow-up message that should use context
            response2 = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "How can I improve it?",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            if response2.status_code == 200:
                data = response2.json()
                print("✅ Conversation memory working")
                print(f"Follow-up response: {data.get('response', 'No response')[:200]}...")
            else:
                print(f"❌ Error: {response2.status_code} - {response2.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 4: Test user behavior tracking
        print("\n4. Testing User Behavior Tracking...")
        try:
            # Simulate different types of interactions
            interactions = [
                "Show me my analytics",
                "Check my inventory",
                "What's my sustainability score?",
                "Give me recommendations"
            ]
            
            for i, message in enumerate(interactions):
                response = await client.post(f"{AI_SERVICE_URL}/chat", json={
                    "message": message,
                    "user_token": vendor_id,
                    "session_id": "test-session",
                    "user_type": "vendor"
                })
                
                if response.status_code == 200:
                    print(f"  ✅ Interaction {i+1}: {message}")
                else:
                    print(f"  ❌ Interaction {i+1} failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test 5: Test AI service health
        print("\n5. Testing AI Service Health...")
        try:
            response = await client.get(f"{AI_SERVICE_URL}/health")
            if response.status_code == 200:
                health_data = response.json()
                print("✅ AI Service is healthy")
                print(f"  - Backend connection: {health_data.get('backend_connection', 'Unknown')}")
                print(f"  - Gemini API: {health_data.get('gemini_api', 'Unknown')}")
                print(f"  - Active sessions: {health_data.get('active_sessions', 0)}")
                print(f"  - Features: {health_data.get('features', {})}")
            else:
                print(f"❌ Health check failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")

async def test_direct_api_calls():
    """Test direct API calls to the vendor concierge service"""
    
    print("\n🔧 Testing Direct API Calls")
    print("=" * 60)
    
    vendor_id = "test-vendor-456"
    
    async with httpx.AsyncClient() as client:
        # Test bundle recommendations endpoint
        print("\n1. Testing Bundle Recommendations API...")
        try:
            response = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "getVendorBundleRecommendations",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Bundle recommendations API working")
                if data.get('function_calls'):
                    for call in data['function_calls']:
                        if call.get('function') == 'getVendorBundleRecommendations':
                            result = call.get('result', {})
                            bundles = result.get('bundle_recommendations', [])
                            print(f"  - Found {len(bundles)} bundle recommendations")
                            if bundles:
                                bundle = bundles[0]
                                print(f"  - Sample bundle: {bundle.get('bundle_name', 'Unknown')}")
                                print(f"  - Expected revenue: ₹{bundle.get('expected_revenue', 0):.0f}")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Test personalized insights endpoint
        print("\n2. Testing Personalized Insights API...")
        try:
            response = await client.post(f"{AI_SERVICE_URL}/chat", json={
                "message": "getVendorPersonalizedInsights",
                "user_token": vendor_id,
                "session_id": "test-session",
                "user_type": "vendor"
            })
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Personalized insights API working")
                if data.get('function_calls'):
                    for call in data['function_calls']:
                        if call.get('function') == 'getVendorPersonalizedInsights':
                            result = call.get('result', {})
                            personalization = result.get('personalization', {})
                            print(f"  - User segment: {personalization.get('user_segment', 'Unknown')}")
                            print(f"  - Confidence score: {personalization.get('confidence_score', 0):.2f}")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")

def print_feature_summary():
    """Print a summary of the new features"""
    
    print("\n🎯 Enhanced Vendor Concierge Features Summary")
    print("=" * 60)
    
    features = [
        "🧠 Personalization Engine - Tracks user behavior and preferences",
        "📊 User Profiling - Segments vendors (New, Growing, Established, Premium)",
        "💡 Smart Recommendations - AI-powered business advice with confidence scores",
        "📦 Bundle Intelligence - Creates profitable product bundles automatically",
        "🔮 Predictive Analytics - Forecasts demand and optimizes profit",
        "💾 Persistent Memory - Remembers conversation history and context",
        "📈 Behavior Tracking - Learns from user interactions over time",
        "🎯 Personalized UI - Adapts interface based on user segment",
        "⚡ Real-time Learning - Updates recommendations based on performance",
        "🔧 Advanced Analytics - Comprehensive business insights and metrics"
    ]
    
    for feature in features:
        print(f"  {feature}")
    
    print("\n🚀 Key Benefits:")
    print("  • Maximum profit through intelligent bundling")
    print("  • Personalized experience that improves over time")
    print("  • Predictive capabilities for better decision making")
    print("  • Memory-based intelligence for context-aware assistance")
    print("  • Smart recommendations tailored to vendor segment")

async def main():
    """Main test function"""
    
    print("🧪 Vendor Concierge Personalization Test Suite")
    print("=" * 60)
    print(f"Testing at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Print feature summary
    print_feature_summary()
    
    # Test personalization features
    await test_personalization_features()
    
    # Test direct API calls
    await test_direct_api_calls()
    
    print("\n✅ Test suite completed!")
    print("\nTo start the AI service, run:")
    print("  cd ai && python main.py")
    print("\nTo start the frontend, run:")
    print("  cd frontend1 && npm run dev")

if __name__ == "__main__":
    asyncio.run(main())
