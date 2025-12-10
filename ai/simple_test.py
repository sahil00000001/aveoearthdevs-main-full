#!/usr/bin/env python3
"""
Simple test for the AI assistant
"""

import asyncio
import httpx
import json

async def test_simple_chat():
    """Test the chat endpoint with a simple query"""
    
    url = "http://localhost:8002/chat"
    
    test_messages = [
        "Hello, how can you help me?",
        "Show me some products",
        "I need help with my account"
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Testing AI Assistant...")
        print("=" * 50)
        
        for i, message in enumerate(test_messages, 1):
            print(f"\nTest {i}: '{message}'")
            print("-" * 40)
            
            try:
                response = await client.post(
                    url,
                    json={"message": message}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Success!")
                    print(f"Response: {data['response']}")
                    if data.get('function_calls'):
                        print(f"Function calls made: {len(data['function_calls'])}")
                        for fc in data['function_calls']:
                            print(f"  - {fc.get('function', 'Unknown')}")
                else:
                    print(f"❌ Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_simple_chat())
