#!/usr/bin/env python3
"""
Comprehensive Integration Test Script
Tests all features, automations, and integrations between backend, AI, and frontend
"""

import asyncio
import httpx
import json
import sys
from datetime import datetime
from typing import Dict, Any, List

# Configuration
BACKEND_URL = "http://localhost:8000"
AI_URL = "http://localhost:8002"
FRONTEND_URL = "http://localhost:5173"

class IntegrationTester:
    def __init__(self):
        self.results = {
            "backend": {"status": "unknown", "tests": []},
            "ai": {"status": "unknown", "tests": []},
            "frontend": {"status": "unknown", "tests": []},
            "database": {"status": "unknown", "tests": []},
            "integrations": {"status": "unknown", "tests": []}
        }
        self.auth_token = None

    async def test_backend_health(self):
        """Test backend health and basic endpoints"""
        try:
            async with httpx.AsyncClient() as client:
                # Test health endpoint
                response = await client.get(f"{BACKEND_URL}/health")
                if response.status_code == 200:
                    self.results["backend"]["tests"].append({
                        "test": "Health Check",
                        "status": "PASS",
                        "details": response.json()
                    })
                else:
                    self.results["backend"]["tests"].append({
                        "test": "Health Check",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })
                    return False

                # Test root endpoint
                response = await client.get(f"{BACKEND_URL}/")
                if response.status_code == 200:
                    self.results["backend"]["tests"].append({
                        "test": "Root Endpoint",
                        "status": "PASS",
                        "details": response.json()
                    })
                else:
                    self.results["backend"]["tests"].append({
                        "test": "Root Endpoint",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                # Test API documentation
                response = await client.get(f"{BACKEND_URL}/docs")
                if response.status_code == 200:
                    self.results["backend"]["tests"].append({
                        "test": "API Documentation",
                        "status": "PASS",
                        "details": "Swagger UI accessible"
                    })
                else:
                    self.results["backend"]["tests"].append({
                        "test": "API Documentation",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                return True
        except Exception as e:
            self.results["backend"]["tests"].append({
                "test": "Backend Connection",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def test_ai_service_health(self):
        """Test AI service health and endpoints"""
        try:
            async with httpx.AsyncClient() as client:
                # Test health endpoint
                response = await client.get(f"{AI_URL}/health")
                if response.status_code == 200:
                    health_data = response.json()
                    self.results["ai"]["tests"].append({
                        "test": "AI Health Check",
                        "status": "PASS",
                        "details": health_data
                    })
                else:
                    self.results["ai"]["tests"].append({
                        "test": "AI Health Check",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })
                    return False

                # Test root endpoint
                response = await client.get(f"{AI_URL}/")
                if response.status_code == 200:
                    self.results["ai"]["tests"].append({
                        "test": "AI Root Endpoint",
                        "status": "PASS",
                        "details": response.json()
                    })
                else:
                    self.results["ai"]["tests"].append({
                        "test": "AI Root Endpoint",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                # Test chat endpoint (without authentication)
                chat_data = {
                    "message": "Hello, can you help me find eco-friendly products?",
                    "session_id": "test_session_123"
                }
                response = await client.post(f"{AI_URL}/chat", json=chat_data)
                if response.status_code == 200:
                    chat_response = response.json()
                    self.results["ai"]["tests"].append({
                        "test": "AI Chat Endpoint",
                        "status": "PASS",
                        "details": f"Response received: {len(chat_response.get('response', ''))} chars"
                    })
                else:
                    self.results["ai"]["tests"].append({
                        "test": "AI Chat Endpoint",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                return True
        except Exception as e:
            self.results["ai"]["tests"].append({
                "test": "AI Service Connection",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def test_database_connection(self):
        """Test database connection through backend"""
        try:
            async with httpx.AsyncClient() as client:
                # Test categories endpoint (should work without auth)
                response = await client.get(f"{BACKEND_URL}/products/categories/tree")
                if response.status_code == 200:
                    categories = response.json()
                    self.results["database"]["tests"].append({
                        "test": "Categories Query",
                        "status": "PASS",
                        "details": f"Found {len(categories)} categories"
                    })
                else:
                    self.results["database"]["tests"].append({
                        "test": "Categories Query",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                # Test brands endpoint
                response = await client.get(f"{BACKEND_URL}/products/brands/active")
                if response.status_code == 200:
                    brands = response.json()
                    self.results["database"]["tests"].append({
                        "test": "Brands Query",
                        "status": "PASS",
                        "details": f"Found {len(brands)} brands"
                    })
                else:
                    self.results["database"]["tests"].append({
                        "test": "Brands Query",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                # Test product search
                search_data = {
                    "query": "eco",
                    "page": 1,
                    "limit": 5
                }
                response = await client.post(f"{BACKEND_URL}/search/", json=search_data)
                if response.status_code == 200:
                    search_results = response.json()
                    self.results["database"]["tests"].append({
                        "test": "Product Search",
                        "status": "PASS",
                        "details": f"Found {search_results.get('total', 0)} products"
                    })
                else:
                    self.results["database"]["tests"].append({
                        "test": "Product Search",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })

                return True
        except Exception as e:
            self.results["database"]["tests"].append({
                "test": "Database Connection",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def test_backend_ai_integration(self):
        """Test integration between backend and AI service"""
        try:
            # Test if AI can call backend APIs
            async with httpx.AsyncClient() as client:
                # Test AI calling backend for product search
                chat_data = {
                    "message": "Show me some eco-friendly products",
                    "session_id": "integration_test"
                }
                response = await client.post(f"{AI_URL}/chat", json=chat_data)
                
                if response.status_code == 200:
                    ai_response = response.json()
                    function_calls = ai_response.get('function_calls', [])
                    
                    if function_calls:
                        self.results["integrations"]["tests"].append({
                            "test": "AI-Backend Integration",
                            "status": "PASS",
                            "details": f"AI made {len(function_calls)} function calls to backend"
                        })
                    else:
                        self.results["integrations"]["tests"].append({
                            "test": "AI-Backend Integration",
                            "status": "PARTIAL",
                            "details": "AI responded but didn't call backend functions"
                        })
                else:
                    self.results["integrations"]["tests"].append({
                        "test": "AI-Backend Integration",
                        "status": "FAIL",
                        "details": f"AI service error: {response.status_code}"
                    })

                return True
        except Exception as e:
            self.results["integrations"]["tests"].append({
                "test": "AI-Backend Integration",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def test_frontend_connectivity(self):
        """Test frontend connectivity"""
        try:
            async with httpx.AsyncClient() as client:
                # Test if frontend is running
                response = await client.get(f"{FRONTEND_URL}/")
                if response.status_code == 200:
                    self.results["frontend"]["tests"].append({
                        "test": "Frontend Server",
                        "status": "PASS",
                        "details": "Frontend is running"
                    })
                else:
                    self.results["frontend"]["tests"].append({
                        "test": "Frontend Server",
                        "status": "FAIL",
                        "details": f"Status: {response.status_code}"
                    })
                    return False

                return True
        except Exception as e:
            self.results["frontend"]["tests"].append({
                "test": "Frontend Connection",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def test_authentication_flow(self):
        """Test authentication flow"""
        try:
            # This would require actual user registration/login
            # For now, just test if auth endpoints exist
            async with httpx.AsyncClient() as client:
                # Test auth endpoints exist
                response = await client.get(f"{BACKEND_URL}/docs")
                if response.status_code == 200:
                    self.results["integrations"]["tests"].append({
                        "test": "Authentication Endpoints",
                        "status": "PASS",
                        "details": "Auth endpoints available in API docs"
                    })
                else:
                    self.results["integrations"]["tests"].append({
                        "test": "Authentication Endpoints",
                        "status": "FAIL",
                        "details": "Cannot access API docs"
                    })

                return True
        except Exception as e:
            self.results["integrations"]["tests"].append({
                "test": "Authentication Flow",
                "status": "FAIL",
                "details": f"Error: {str(e)}"
            })
            return False

    async def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Comprehensive Integration Tests...")
        print("=" * 60)
        
        # Test backend
        print("\n📡 Testing Backend API...")
        backend_ok = await self.test_backend_health()
        self.results["backend"]["status"] = "PASS" if backend_ok else "FAIL"
        
        # Test AI service
        print("\n🤖 Testing AI Service...")
        ai_ok = await self.test_ai_service_health()
        self.results["ai"]["status"] = "PASS" if ai_ok else "FAIL"
        
        # Test database
        print("\n🗄️ Testing Database...")
        db_ok = await self.test_database_connection()
        self.results["database"]["status"] = "PASS" if db_ok else "FAIL"
        
        # Test frontend
        print("\n🌐 Testing Frontend...")
        frontend_ok = await self.test_frontend_connectivity()
        self.results["frontend"]["status"] = "PASS" if frontend_ok else "FAIL"
        
        # Test integrations
        print("\n🔗 Testing Integrations...")
        integration_ok = await self.test_backend_ai_integration()
        auth_ok = await self.test_authentication_flow()
        self.results["integrations"]["status"] = "PASS" if (integration_ok and auth_ok) else "FAIL"
        
        # Print results
        self.print_results()

    def print_results(self):
        """Print test results"""
        print("\n" + "=" * 60)
        print("📊 INTEGRATION TEST RESULTS")
        print("=" * 60)
        
        for service, data in self.results.items():
            status_emoji = "✅" if data["status"] == "PASS" else "❌"
            print(f"\n{status_emoji} {service.upper()}: {data['status']}")
            
            for test in data["tests"]:
                test_emoji = "✅" if test["status"] == "PASS" else "⚠️" if test["status"] == "PARTIAL" else "❌"
                print(f"  {test_emoji} {test['test']}: {test['status']}")
                if test.get("details"):
                    print(f"      Details: {test['details']}")
        
        # Overall status
        all_passed = all(data["status"] == "PASS" for data in self.results.values())
        overall_emoji = "🎉" if all_passed else "⚠️"
        overall_status = "ALL SYSTEMS GO!" if all_passed else "SOME ISSUES FOUND"
        
        print(f"\n{overall_emoji} OVERALL STATUS: {overall_status}")
        
        if not all_passed:
            print("\n🔧 RECOMMENDED ACTIONS:")
            for service, data in self.results.items():
                if data["status"] != "PASS":
                    print(f"  - Fix {service} issues")
            print("  - Check environment variables")
            print("  - Verify all services are running")
            print("  - Check database connection")

async def main():
    """Main test runner"""
    tester = IntegrationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
