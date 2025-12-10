#!/usr/bin/env python3
"""
Test script for the AI assistant API
"""

import asyncio
import httpx
import json

AI_SERVICE_URL = "http://localhost:8002"

async def test_chat_endpoint():
    """Test the chat endpoint with various queries"""
    
    test_queries = [
        "Hello, can you help me find some products?",
        "Show me sustainable products",
        "I'm looking for eco-friendly office supplies",
        "What's in my cart?",
        "Can you recommend some products?",
        "Help me with my account settings"
    ]
    
    async with httpx.AsyncClient() as client:
        print("Testing AI Assistant Chat Endpoint")
        print("=" * 50)
        
        # First, check if the service is running
        try:
            health_response = await client.get(f"{AI_SERVICE_URL}/health")
            health_data = health_response.json()
            print(f"Service Health: {health_data}")
            print()
        except Exception as e:
            print(f"Error connecting to AI service: {e}")
            print("Make sure the AI service is running on port 8002")
            return
        
        # Test each query
        for i, query in enumerate(test_queries, 1):
            print(f"Test {i}: {query}")
            print("-" * 40)
            
            try:
                chat_response = await client.post(
                    f"{AI_SERVICE_URL}/chat",
                    json={"message": query, "user_token": None},
                    timeout=30.0
                )
                
                if chat_response.status_code == 200:
                    response_data = chat_response.json()
                    print(f"Response: {response_data['response']}")
                    
                    if response_data.get('function_calls'):
                        print("Function calls made:")
                        for func_call in response_data['function_calls']:
                            print(f"  - {func_call}")
                else:
                    print(f"Error: {chat_response.status_code} - {chat_response.text}")
                    
            except Exception as e:
                print(f"Error: {e}")
            
            print()

async def test_backend_connectivity():
    """Test connectivity to the backend API"""
    
    backend_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("Testing Backend Connectivity")
        print("=" * 50)
        
        try:
            # Test health endpoint
            health_response = await client.get(f"{backend_url}/health")
            if health_response.status_code == 200:
                print("✅ Backend health check passed")
                print(f"Response: {health_response.json()}")
            else:
                print(f"❌ Backend health check failed: {health_response.status_code}")
        except Exception as e:
            print(f"❌ Backend not accessible: {e}")
            return False
        
        print()
        
        # Test products endpoint
        try:
            products_response = await client.get(f"{backend_url}/products/")
            if products_response.status_code == 200:
                print("✅ Products endpoint accessible")
                data = products_response.json()
                print(f"Total products: {data.get('total', 'Unknown')}")
            else:
                print(f"❌ Products endpoint failed: {products_response.status_code}")
        except Exception as e:
            print(f"❌ Products endpoint error: {e}")
        
        print()
        return True

if __name__ == "__main__":
    print("AveoEarth AI Assistant Test Suite")
    print("=" * 60)
    print()
    
    # Test backend first
    backend_ok = asyncio.run(test_backend_connectivity())
    
    if backend_ok:
        print()
        # Test AI assistant
        asyncio.run(test_chat_endpoint())
    else:
        print("Skipping AI assistant tests due to backend connectivity issues")
        print("\nTo run the backend:")
        print("1. cd backend")
        print("2. uv run main.py")
        print("\nTo run the AI service:")
        print("1. cd ai")
        print("2. uv run main.py")
