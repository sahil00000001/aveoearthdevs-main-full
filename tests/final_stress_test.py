#!/usr/bin/env python3
"""
Final comprehensive stress test for AveoEarth services
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any, List

# Configuration
BACKEND_URL = "http://localhost:8080"
AI_URL = "http://localhost:8002"
FRONTEND_URL = "http://localhost:5173"

class TestSuite:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0

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

    async def test_backend_health(self):
        """Test backend health"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{BACKEND_URL}/health")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.add_result("Backend Health", True, f"Service: {data.get('service')}", response_time)
                    return True
                else:
                    self.add_result("Backend Health", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("Backend Health", False, f"Error: {str(e)}", response_time)
            return False

    async def test_backend_products(self):
        """Test backend products endpoint"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{BACKEND_URL}/products/")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.add_result("Backend Products", True, f"Total: {data.get('total', 0)}", response_time)
                    return True
                else:
                    self.add_result("Backend Products", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("Backend Products", False, f"Error: {str(e)}", response_time)
            return False

    async def test_backend_categories(self):
        """Test backend categories endpoint"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{BACKEND_URL}/products/categories/tree")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.add_result("Backend Categories", True, f"Count: {len(data)}", response_time)
                    return True
                else:
                    self.add_result("Backend Categories", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("Backend Categories", False, f"Error: {str(e)}", response_time)
            return False

    async def test_ai_health(self):
        """Test AI service health"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{AI_URL}/health")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.add_result("AI Health", True, f"Service: {data.get('ai_service')}", response_time)
                    return True
                else:
                    self.add_result("AI Health", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("AI Health", False, f"Error: {str(e)}", response_time)
            return False

    async def test_ai_chat(self):
        """Test AI chat functionality"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{AI_URL}/chat",
                    json={"message": "Hello, can you help me find products?"}
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.add_result("AI Chat", True, f"Response length: {len(data.get('response', ''))}", response_time)
                    return True
                else:
                    self.add_result("AI Chat", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("AI Chat", False, f"Error: {str(e)}", response_time)
            return False

    async def test_ai_functions(self):
        """Test AI function calling"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{AI_URL}/chat",
                    json={"message": "Show me some sustainable products"}
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    function_calls = data.get('function_calls', [])
                    self.add_result("AI Functions", True, f"Function calls: {len(function_calls)}", response_time)
                    return True
                else:
                    self.add_result("AI Functions", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("AI Functions", False, f"Error: {str(e)}", response_time)
            return False

    async def test_integration(self):
        """Test backend-AI integration"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{AI_URL}/chat",
                    json={"message": "Get me product categories from the backend"}
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    function_calls = data.get('function_calls', [])
                    backend_calls = [fc for fc in function_calls if 'getCategories' in str(fc)]
                    self.add_result("Backend-AI Integration", True, f"Backend calls: {len(backend_calls)}", response_time)
                    return True
                else:
                    self.add_result("Backend-AI Integration", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("Backend-AI Integration", False, f"Error: {str(e)}", response_time)
            return False

    async def test_frontend(self):
        """Test frontend connectivity"""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{FRONTEND_URL}/")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.add_result("Frontend", True, f"Content length: {len(response.text)}", response_time)
                    return True
                else:
                    self.add_result("Frontend", False, f"Status: {response.status_code}", response_time)
                    return False
        except Exception as e:
            response_time = time.time() - start_time
            self.add_result("Frontend", False, f"Error: {str(e)}", response_time)
            return False

    async def run_all_tests(self):
        """Run all tests"""
        print("AveoEarth Comprehensive Stress Test")
        print("=" * 50)
        
        # Backend tests
        print("\n[BACKEND] Testing Backend Services...")
        await self.test_backend_health()
        await self.test_backend_products()
        await self.test_backend_categories()
        
        # AI tests
        print("\n[AI] Testing AI Services...")
        await self.test_ai_health()
        await self.test_ai_chat()
        await self.test_ai_functions()
        
        # Integration tests
        print("\n[INTEGRATION] Testing Integration...")
        await self.test_integration()
        await self.test_frontend()
        
        # Print results
        self.print_results()

    def print_results(self):
        """Print test results"""
        print("\n" + "=" * 50)
        print("FINAL TEST RESULTS")
        print("=" * 50)
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed / (self.passed + self.failed) * 100):.1f}%")
        
        print("\nDETAILED RESULTS:")
        for result in self.results:
            status = "[PASS]" if result["success"] else "[FAIL]"
            print(f"  {status} {result['test']} ({result['response_time']:.3f}s) - {result['message']}")
        
        # Summary
        print("\nSUMMARY:")
        if self.failed == 0:
            print("  [SUCCESS] All tests passed! System is fully functional.")
        elif self.passed > self.failed:
            print("  [WARNING] Most tests passed. Some issues need attention.")
        else:
            print("  [FAILURE] Multiple failures detected. System needs debugging.")

async def main():
    """Main test function"""
    test_suite = TestSuite()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
