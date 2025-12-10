#!/usr/bin/env python3
"""
Quick test for backend endpoints
"""

import asyncio
import httpx

async def test_endpoints():
    """Test key endpoints"""
    base_url = "http://localhost:8080"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        print("Testing Backend Endpoints...")
        print("=" * 50)
        
        # Test health
        try:
            response = await client.get(f"{base_url}/health")
            print(f"Health: {response.status_code} - {response.json()}")
        except Exception as e:
            print(f"Health failed: {e}")
        
        # Test products
        try:
            response = await client.get(f"{base_url}/products/")
            print(f"Products: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Total: {data.get('total', 0)}")
            else:
                print(f"  Error: {response.text}")
        except Exception as e:
            print(f"Products failed: {e}")
        
        # Test categories
        try:
            response = await client.get(f"{base_url}/products/categories/tree")
            print(f"Categories: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Count: {len(data)}")
            else:
                print(f"  Error: {response.text}")
        except Exception as e:
            print(f"Categories failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
