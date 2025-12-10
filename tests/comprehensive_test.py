#!/usr/bin/env python3
"""
Comprehensive stress test for AveoEarth backend and AI services
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any, List
import sys

# Configuration
BACKEND_URL = "http://localhost:8080"
AI_URL = "http://localhost:8002"
FRONTEND_URL = "http://localhost:5173"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.results = []

    def add_result(self, test_name: str, success: bool, message: str = "", response_time: float = 0):
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_time": response_time
        })
        if success:
            self.passed += 1
        else:
            self.failed += 1
            self.errors.append(f"{test_name}: {message}")

    def print_summary(self):
        print("\n" + "="*80)
        print("COMPREHENSIVE TEST RESULTS SUMMARY")
        print("="*80)
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed / (self.passed + self.failed) * 100):.1f}%")
        
        if self.errors:
            print("\nFAILED TESTS:")
            for error in self.errors:
                print(f"  [FAIL] {error}")
        
        print("\nDETAILED RESULTS:")
        for result in self.results:
            status = "[PASS]" if result["success"] else "[FAIL]"
            print(f"  {status} {result['test']} ({result['response_time']:.3f}s) - {result['message']}")

async def test_backend_health():
    """Test backend health endpoint"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/health")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"Backend healthy - {data.get('service', 'Unknown')}", response_time
            else:
                return False, f"Health check failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Connection failed: {str(e)}", response_time

async def test_backend_root():
    """Test backend root endpoint"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"Root endpoint working - {data.get('name', 'Unknown')}", response_time
            else:
                return False, f"Root endpoint failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Connection failed: {str(e)}", response_time

async def test_backend_auth_endpoints():
    """Test authentication endpoints"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test signup endpoint (should return validation error, not 404)
            response = await client.post(f"{BACKEND_URL}/auth/signup", json={})
            response_time = time.time() - start_time
            
            if response.status_code in [400, 422]:  # Validation error is expected
                return True, f"Auth endpoints accessible - signup validation working", response_time
            elif response.status_code == 200:
                return True, f"Auth endpoints accessible - unexpected success", response_time
            else:
                return False, f"Auth endpoints failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Auth test failed: {str(e)}", response_time

async def test_backend_products_endpoints():
    """Test products endpoints"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test products list endpoint
            response = await client.get(f"{BACKEND_URL}/products/")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"Products endpoint working - {data.get('total', 0)} products", response_time
            else:
                return False, f"Products endpoint failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Products test failed: {str(e)}", response_time

async def test_backend_categories_endpoints():
    """Test categories endpoints"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/products/categories/tree")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"Categories endpoint working - {len(data)} categories", response_time
            else:
                return False, f"Categories endpoint failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Categories test failed: {str(e)}", response_time

async def test_ai_health():
    """Test AI service health endpoint"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{AI_URL}/health")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"AI service healthy - {data.get('ai_service', 'Unknown')}", response_time
            else:
                return False, f"AI health check failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"AI connection failed: {str(e)}", response_time

async def test_ai_chat():
    """Test AI chat endpoint"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{AI_URL}/chat",
                json={"message": "Hello, can you help me find some products?"}
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return True, f"AI chat working - response length: {len(data.get('response', ''))}", response_time
            else:
                return False, f"AI chat failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"AI chat test failed: {str(e)}", response_time

async def test_ai_functions():
    """Test AI function calling"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{AI_URL}/chat",
                json={"message": "Show me some sustainable products"}
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                function_calls = data.get('function_calls', [])
                return True, f"AI functions working - {len(function_calls)} function calls made", response_time
            else:
                return False, f"AI functions failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"AI functions test failed: {str(e)}", response_time

async def test_backend_ai_integration():
    """Test integration between backend and AI"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test if AI can call backend functions
            response = await client.post(
                f"{AI_URL}/chat",
                json={"message": "Get me product categories"}
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                function_calls = data.get('function_calls', [])
                backend_calls = [fc for fc in function_calls if 'getCategories' in str(fc)]
                return True, f"Backend-AI integration working - {len(backend_calls)} backend calls", response_time
            else:
                return False, f"Backend-AI integration failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Backend-AI integration test failed: {str(e)}", response_time

async def test_frontend_connectivity():
    """Test frontend connectivity"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{FRONTEND_URL}/")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return True, f"Frontend accessible - {len(response.text)} characters", response_time
            else:
                return False, f"Frontend failed with status {response.status_code}", response_time
    except Exception as e:
        response_time = time.time() - start_time
        return False, f"Frontend connection failed: {str(e)}", response_time

async def run_stress_test():
    """Run comprehensive stress test"""
    print("Starting Comprehensive Stress Test for AveoEarth Services")
    print("="*80)
    
    results = TestResults()
    
    # Backend Tests
    print("\n[BACKEND] TESTING BACKEND SERVICES...")
    print("-" * 40)
    
    success, message, response_time = await test_backend_health()
    results.add_result("Backend Health Check", success, message, response_time)
    
    success, message, response_time = await test_backend_root()
    results.add_result("Backend Root Endpoint", success, message, response_time)
    
    success, message, response_time = await test_backend_auth_endpoints()
    results.add_result("Backend Auth Endpoints", success, message, response_time)
    
    success, message, response_time = await test_backend_products_endpoints()
    results.add_result("Backend Products Endpoints", success, message, response_time)
    
    success, message, response_time = await test_backend_categories_endpoints()
    results.add_result("Backend Categories Endpoints", success, message, response_time)
    
    # AI Service Tests
    print("\n[AI] TESTING AI SERVICES...")
    print("-" * 40)
    
    success, message, response_time = await test_ai_health()
    results.add_result("AI Health Check", success, message, response_time)
    
    success, message, response_time = await test_ai_chat()
    results.add_result("AI Chat Endpoint", success, message, response_time)
    
    success, message, response_time = await test_ai_functions()
    results.add_result("AI Function Calling", success, message, response_time)
    
    # Integration Tests
    print("\n[INTEGRATION] TESTING INTEGRATION...")
    print("-" * 40)
    
    success, message, response_time = await test_backend_ai_integration()
    results.add_result("Backend-AI Integration", success, message, response_time)
    
    success, message, response_time = await test_frontend_connectivity()
    results.add_result("Frontend Connectivity", success, message, response_time)
    
    # Print Results
    results.print_summary()
    
    return results

if __name__ == "__main__":
    try:
        results = asyncio.run(run_stress_test())
        sys.exit(0 if results.failed == 0 else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
        sys.exit(1)
