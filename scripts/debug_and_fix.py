#!/usr/bin/env python3
"""
Debug and fix all AveoEarth services
"""

import asyncio
import httpx
import subprocess
import time
import os
import sys
from typing import Dict, Any

class ServiceManager:
    def __init__(self):
        self.services = {
            'backend': {'port': 8080, 'url': 'http://localhost:8080', 'process': None},
            'ai': {'port': 8002, 'url': 'http://localhost:8002', 'process': None},
            'frontend': {'port': 5173, 'url': 'http://localhost:5173', 'process': None}
        }
        self.results = []

    def kill_existing_processes(self):
        """Kill any existing Python processes"""
        try:
            subprocess.run(['taskkill', '/f', '/im', 'python.exe'], 
                         capture_output=True, check=False)
            subprocess.run(['taskkill', '/f', '/im', 'node.exe'], 
                         capture_output=True, check=False)
            print("Killed existing processes")
        except:
            pass

    def start_backend(self):
        """Start backend service"""
        try:
            os.chdir('backend')
            process = subprocess.Popen([sys.executable, 'main.py'], 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE)
            self.services['backend']['process'] = process
            print("Backend service started")
            return True
        except Exception as e:
            print(f"Failed to start backend: {e}")
            return False

    def start_ai(self):
        """Start AI service"""
        try:
            os.chdir('../ai')
            process = subprocess.Popen([sys.executable, 'main.py'], 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE)
            self.services['ai']['process'] = process
            print("AI service started")
            return True
        except Exception as e:
            print(f"Failed to start AI: {e}")
            return False

    def start_frontend(self):
        """Start frontend service"""
        try:
            os.chdir('../frontend1')
            process = subprocess.Popen(['npm', 'run', 'dev'], 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE)
            self.services['frontend']['process'] = process
            print("Frontend service started")
            return True
        except Exception as e:
            print(f"Failed to start frontend: {e}")
            return False

    async def test_service(self, service_name: str) -> bool:
        """Test if a service is responding"""
        service = self.services[service_name]
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service['url']}/health")
                if response.status_code == 200:
                    print(f"✅ {service_name.upper()} service is running")
                    return True
                else:
                    print(f"❌ {service_name.upper()} service returned {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ {service_name.upper()} service not responding: {e}")
            return False

    async def test_backend_endpoints(self):
        """Test backend endpoints"""
        print("\n🔧 Testing Backend Endpoints...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test health
            try:
                response = await client.get("http://localhost:8080/health")
                if response.status_code == 200:
                    print("✅ Backend health check passed")
                else:
                    print(f"❌ Backend health failed: {response.status_code}")
            except Exception as e:
                print(f"❌ Backend health error: {e}")

            # Test products
            try:
                response = await client.get("http://localhost:8080/products/")
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Backend products: {data.get('total', 0)} items")
                else:
                    print(f"❌ Backend products failed: {response.status_code}")
            except Exception as e:
                print(f"❌ Backend products error: {e}")

            # Test categories
            try:
                response = await client.get("http://localhost:8080/products/categories/tree")
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Backend categories: {len(data)} items")
                else:
                    print(f"❌ Backend categories failed: {response.status_code}")
            except Exception as e:
                print(f"❌ Backend categories error: {e}")

    async def test_ai_endpoints(self):
        """Test AI endpoints"""
        print("\n🤖 Testing AI Endpoints...")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Test health
            try:
                response = await client.get("http://localhost:8002/health")
                if response.status_code == 200:
                    print("✅ AI health check passed")
                else:
                    print(f"❌ AI health failed: {response.status_code}")
            except Exception as e:
                print(f"❌ AI health error: {e}")

            # Test chat
            try:
                response = await client.post(
                    "http://localhost:8002/chat",
                    json={"message": "Hello, can you help me?"}
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ AI chat working: {len(data.get('response', ''))} chars")
                else:
                    print(f"❌ AI chat failed: {response.status_code}")
            except Exception as e:
                print(f"❌ AI chat error: {e}")

    async def test_frontend(self):
        """Test frontend"""
        print("\n🌐 Testing Frontend...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get("http://localhost:5173/")
                if response.status_code == 200:
                    print("✅ Frontend is accessible")
                else:
                    print(f"❌ Frontend failed: {response.status_code}")
            except Exception as e:
                print(f"❌ Frontend error: {e}")

    async def test_integration(self):
        """Test integration between services"""
        print("\n🔗 Testing Integration...")
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(
                    "http://localhost:8002/chat",
                    json={"message": "Show me some products from the backend"}
                )
                if response.status_code == 200:
                    data = response.json()
                    function_calls = data.get('function_calls', [])
                    print(f"✅ AI-Backend integration: {len(function_calls)} function calls")
                else:
                    print(f"❌ AI-Backend integration failed: {response.status_code}")
            except Exception as e:
                print(f"❌ AI-Backend integration error: {e}")

    async def run_comprehensive_test(self):
        """Run comprehensive test and fix"""
        print("🚀 Starting AveoEarth Service Debug and Fix")
        print("=" * 60)
        
        # Kill existing processes
        self.kill_existing_processes()
        await asyncio.sleep(2)
        
        # Start services
        print("\n📦 Starting Services...")
        os.chdir('..')  # Go to project root
        
        backend_ok = self.start_backend()
        ai_ok = self.start_ai()
        frontend_ok = self.start_frontend()
        
        # Wait for services to start
        print("\n⏳ Waiting for services to start...")
        await asyncio.sleep(10)
        
        # Test services
        print("\n🧪 Testing Services...")
        await self.test_backend_endpoints()
        await self.test_ai_endpoints()
        await self.test_frontend()
        await self.test_integration()
        
        # Final summary
        print("\n" + "=" * 60)
        print("🎯 FINAL SUMMARY")
        print("=" * 60)
        
        if backend_ok and ai_ok and frontend_ok:
            print("✅ All services started successfully!")
        else:
            print("⚠️  Some services failed to start")
        
        print("\nServices Status:")
        for service_name, service in self.services.items():
            status = "Running" if service['process'] else "Not Started"
            print(f"  {service_name.upper()}: {status}")

async def main():
    manager = ServiceManager()
    await manager.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())
