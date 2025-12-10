#!/usr/bin/env python3
"""
Final comprehensive test for AveoEarth services
"""

import asyncio
import httpx
import subprocess
import time
import os
import sys

async def test_backend():
    """Test backend service"""
    print("Testing Backend Service...")
    print("-" * 30)
    
    results = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test health
            response = await client.get("http://localhost:8080/health")
            if response.status_code == 200:
                print("✓ Backend health check: PASSED")
                results.append(("Backend Health", True))
            else:
                print(f"✗ Backend health check: FAILED ({response.status_code})")
                results.append(("Backend Health", False))
    except Exception as e:
        print(f"✗ Backend health check: ERROR ({e})")
        results.append(("Backend Health", False))
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test products
            response = await client.get("http://localhost:8080/products/")
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Backend products: PASSED ({data.get('total', 0)} items)")
                results.append(("Backend Products", True))
            else:
                print(f"✗ Backend products: FAILED ({response.status_code})")
                results.append(("Backend Products", False))
    except Exception as e:
        print(f"✗ Backend products: ERROR ({e})")
        results.append(("Backend Products", False))
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test categories
            response = await client.get("http://localhost:8080/products/categories/tree")
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Backend categories: PASSED ({len(data)} items)")
                results.append(("Backend Categories", True))
            else:
                print(f"✗ Backend categories: FAILED ({response.status_code})")
                results.append(("Backend Categories", False))
    except Exception as e:
        print(f"✗ Backend categories: ERROR ({e})")
        results.append(("Backend Categories", False))
    
    return results

async def test_ai():
    """Test AI service"""
    print("\nTesting AI Service...")
    print("-" * 30)
    
    results = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test health
            response = await client.get("http://localhost:8002/health")
            if response.status_code == 200:
                print("✓ AI health check: PASSED")
                results.append(("AI Health", True))
            else:
                print(f"✗ AI health check: FAILED ({response.status_code})")
                results.append(("AI Health", False))
    except Exception as e:
        print(f"✗ AI health check: ERROR ({e})")
        results.append(("AI Health", False))
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test chat
            response = await client.post(
                "http://localhost:8002/chat",
                json={"message": "Hello, can you help me?"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"✓ AI chat: PASSED ({len(data.get('response', ''))} chars)")
                results.append(("AI Chat", True))
            else:
                print(f"✗ AI chat: FAILED ({response.status_code})")
                results.append(("AI Chat", False))
    except Exception as e:
        print(f"✗ AI chat: ERROR ({e})")
        results.append(("AI Chat", False))
    
    return results

async def test_frontend():
    """Test frontend service"""
    print("\nTesting Frontend Service...")
    print("-" * 30)
    
    results = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:5173/")
            if response.status_code == 200:
                print("✓ Frontend: PASSED")
                results.append(("Frontend", True))
            else:
                print(f"✗ Frontend: FAILED ({response.status_code})")
                results.append(("Frontend", False))
    except Exception as e:
        print(f"✗ Frontend: ERROR ({e})")
        results.append(("Frontend", False))
    
    return results

async def test_integration():
    """Test integration between services"""
    print("\nTesting Integration...")
    print("-" * 30)
    
    results = []
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "http://localhost:8002/chat",
                json={"message": "Show me some products from the backend"}
            )
            if response.status_code == 200:
                data = response.json()
                function_calls = data.get('function_calls', [])
                print(f"✓ AI-Backend integration: PASSED ({len(function_calls)} function calls)")
                results.append(("AI-Backend Integration", True))
            else:
                print(f"✗ AI-Backend integration: FAILED ({response.status_code})")
                results.append(("AI-Backend Integration", False))
    except Exception as e:
        print(f"✗ AI-Backend integration: ERROR ({e})")
        results.append(("AI-Backend Integration", False))
    
    return results

def start_services():
    """Start all services"""
    print("Starting AveoEarth Services...")
    print("=" * 50)
    
    # Kill existing processes
    try:
        subprocess.run(['taskkill', '/f', '/im', 'python.exe'], 
                     capture_output=True, check=False)
        subprocess.run(['taskkill', '/f', '/im', 'node.exe'], 
                     capture_output=True, check=False)
        print("Killed existing processes")
    except:
        pass
    
    # Start backend
    try:
        os.chdir('backend')
        subprocess.Popen([sys.executable, 'main.py'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("Started backend service on port 8080")
    except Exception as e:
        print(f"Failed to start backend: {e}")
    
    # Start AI
    try:
        os.chdir('../ai')
        subprocess.Popen([sys.executable, 'main.py'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("Started AI service on port 8002")
    except Exception as e:
        print(f"Failed to start AI: {e}")
    
    # Start frontend
    try:
        os.chdir('../frontend1')
        subprocess.Popen(['npm', 'run', 'dev'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE)
        print("Started frontend service on port 5173")
    except Exception as e:
        print(f"Failed to start frontend: {e}")
    
    os.chdir('..')

async def main():
    """Main test function"""
    print("AveoEarth Comprehensive Service Test")
    print("=" * 50)
    
    # Start services
    start_services()
    
    # Wait for services to start
    print("\nWaiting for services to initialize...")
    await asyncio.sleep(10)
    
    # Run tests
    all_results = []
    
    backend_results = await test_backend()
    all_results.extend(backend_results)
    
    ai_results = await test_ai()
    all_results.extend(ai_results)
    
    frontend_results = await test_frontend()
    all_results.extend(frontend_results)
    
    integration_results = await test_integration()
    all_results.extend(integration_results)
    
    # Print summary
    print("\n" + "=" * 50)
    print("FINAL TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, success in all_results if success)
    total = len(all_results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    print("\nDetailed Results:")
    for test_name, success in all_results:
        status = "PASS" if success else "FAIL"
        print(f"  {test_name}: {status}")
    
    if passed == total:
        print("\n[SUCCESS] All services are working perfectly!")
    elif passed > total - passed:
        print("\n[WARNING] Most services working, some issues need attention")
    else:
        print("\n[FAILURE] Multiple services need debugging")
    
    print("\nService URLs:")
    print("  Backend: http://localhost:8080")
    print("  AI Service: http://localhost:8002")
    print("  Frontend: http://localhost:5173")
    print("  Backend Docs: http://localhost:8080/docs")
    print("  AI Docs: http://localhost:8002/docs")

if __name__ == "__main__":
    asyncio.run(main())
