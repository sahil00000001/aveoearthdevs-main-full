#!/usr/bin/env python3
"""
Simple test for all services
"""

import asyncio
import httpx
import subprocess
import time
import os
import sys

async def test_services():
    """Test all services"""
    print("Testing AveoEarth Services")
    print("=" * 40)
    
    # Test backend
    print("\n[BACKEND] Testing...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8080/health")
            if response.status_code == 200:
                print("  [PASS] Backend health check")
            else:
                print(f"  [FAIL] Backend health: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] Backend not running: {e}")
    
    # Test products endpoint
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8080/products/")
            if response.status_code == 200:
                data = response.json()
                print(f"  [PASS] Products endpoint: {data.get('total', 0)} items")
            else:
                print(f"  [FAIL] Products endpoint: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] Products error: {e}")
    
    # Test categories endpoint
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8080/products/categories/tree")
            if response.status_code == 200:
                data = response.json()
                print(f"  [PASS] Categories endpoint: {len(data)} items")
            else:
                print(f"  [FAIL] Categories endpoint: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] Categories error: {e}")
    
    # Test AI service
    print("\n[AI] Testing...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8002/health")
            if response.status_code == 200:
                print("  [PASS] AI health check")
            else:
                print(f"  [FAIL] AI health: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] AI not running: {e}")
    
    # Test AI chat
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://localhost:8002/chat",
                json={"message": "Hello"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  [PASS] AI chat: {len(data.get('response', ''))} chars")
            else:
                print(f"  [FAIL] AI chat: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] AI chat error: {e}")
    
    # Test frontend
    print("\n[FRONTEND] Testing...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:5173/")
            if response.status_code == 200:
                print("  [PASS] Frontend accessible")
            else:
                print(f"  [FAIL] Frontend: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] Frontend not running: {e}")
    
    # Test integration
    print("\n[INTEGRATION] Testing...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "http://localhost:8002/chat",
                json={"message": "Show me products from backend"}
            )
            if response.status_code == 200:
                data = response.json()
                function_calls = data.get('function_calls', [])
                print(f"  [PASS] AI-Backend integration: {len(function_calls)} calls")
            else:
                print(f"  [FAIL] Integration: {response.status_code}")
    except Exception as e:
        print(f"  [FAIL] Integration error: {e}")

def start_services():
    """Start all services"""
    print("Starting services...")
    
    # Kill existing processes
    try:
        subprocess.run(['taskkill', '/f', '/im', 'python.exe'], 
                     capture_output=True, check=False)
        subprocess.run(['taskkill', '/f', '/im', 'node.exe'], 
                     capture_output=True, check=False)
    except:
        pass
    
    # Start backend
    try:
        os.chdir('backend')
        subprocess.Popen([sys.executable, 'main.py'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("  [STARTED] Backend service")
    except Exception as e:
        print(f"  [FAILED] Backend: {e}")
    
    # Start AI
    try:
        os.chdir('../ai')
        subprocess.Popen([sys.executable, 'main.py'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("  [STARTED] AI service")
    except Exception as e:
        print(f"  [FAILED] AI: {e}")
    
    # Start frontend
    try:
        os.chdir('../frontend1')
        subprocess.Popen(['npm', 'run', 'dev'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("  [STARTED] Frontend service")
    except Exception as e:
        print(f"  [FAILED] Frontend: {e}")
    
    os.chdir('..')

async def main():
    """Main function"""
    start_services()
    print("\nWaiting for services to start...")
    await asyncio.sleep(8)
    await test_services()
    
    print("\n" + "=" * 40)
    print("Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
