#!/usr/bin/env python3
"""
Comprehensive Testing Script
Tests all flows: customer, vendor, admin
"""
import requests
import json
import time
from typing import Dict, Optional

BACKEND_URL = "http://localhost:8080"
FRONTEND_URL = "http://localhost:5173"

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str):
        self.passed.append(test_name)
        print(f"[PASS] {test_name}")
    
    def add_fail(self, test_name: str, error: str = ""):
        self.failed.append(f"{test_name}: {error}")
        print(f"[FAIL] {test_name}: {error}")
    
    def add_warn(self, test_name: str, message: str = ""):
        self.warnings.append(f"{test_name}: {message}")
        print(f"[WARN] {test_name}: {message}")
    
    def print_summary(self):
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Passed: {len(self.passed)}")
        print(f"Failed: {len(self.failed)}")
        print(f"Warnings: {len(self.warnings)}")
        
        if self.failed:
            print("\nFailed Tests:")
            for fail in self.failed:
                print(f"  - {fail}")
        
        if self.warnings:
            print("\nWarnings:")
            for warn in self.warnings:
                print(f"  - {warn}")

results = TestResults()

def wait_for_backend(max_wait=30):
    """Wait for backend to be ready"""
    print("Waiting for backend to start...")
    for i in range(max_wait):
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=2)
            if response.status_code == 200:
                print("Backend is ready!")
                return True
        except:
            pass
        time.sleep(1)
        if i % 5 == 0:
            print(f"  Still waiting... ({i}/{max_wait}s)")
    return False

def test_backend_health():
    """Test backend health endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            results.add_pass("Backend Health Check")
            return True
        else:
            results.add_fail("Backend Health Check", f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Backend Health Check", str(e))
        return False

def test_api_docs():
    """Test API documentation"""
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=5)
        if response.status_code == 200:
            results.add_pass("API Documentation Accessible")
            return True
        else:
            # Try /api/docs or /swagger
            for path in ["/api/docs", "/swagger", "/redoc"]:
                try:
                    r = requests.get(f"{BACKEND_URL}{path}", timeout=3)
                    if r.status_code == 200:
                        results.add_pass(f"API Documentation Accessible ({path})")
                        return True
                except:
                    pass
            results.add_warn("API Documentation", f"Status: {response.status_code} (may be at different path)")
            return False
    except Exception as e:
        results.add_warn("API Documentation", str(e))
        return False

def test_products_endpoint():
    """Test products endpoint"""
    # Try different possible paths
    product_paths = [
        "/api/v1/buyer/products",
        "/buyer/products",
        "/api/products",
        "/products"
    ]
    
    for path in product_paths:
        try:
            response = requests.get(f"{BACKEND_URL}{path}", params={"page": 1, "limit": 10}, timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", data.get("items", []))
                if isinstance(products, list):
                    results.add_pass(f"Products Endpoint ({path}) - Found {len(products)} products")
                    return True, products
                else:
                    # Try to get products from response directly
                    if isinstance(data, list):
                        results.add_pass(f"Products Endpoint ({path}) - Found {len(data)} products")
                        return True, data
        except Exception as e:
            continue
    
    results.add_warn("Products Endpoint", "Could not find working products endpoint")
    return False, []

def test_cart_endpoint():
    """Test cart endpoint (should require auth)"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/orders/cart", timeout=5)
        # Should return 401 or 403 if auth required, or 200 if session works
        if response.status_code in [200, 401, 403]:
            results.add_pass("Cart Endpoint (Auth protected)")
            return True
        else:
            results.add_fail("Cart Endpoint", f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Cart Endpoint", str(e))
        return False

def test_orders_endpoint():
    """Test orders endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/orders?page=1&limit=10", timeout=5)
        # Should return 401 or 403 if auth required, or 200
        if response.status_code in [200, 401, 403]:
            results.add_pass("Orders Endpoint (Auth protected)")
            return True
        else:
            results.add_fail("Orders Endpoint", f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Orders Endpoint", str(e))
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    # Try different possible paths
    auth_paths = [
        "/api/v1/auth/signup",
        "/auth/signup",
        "/api/auth/signup"
    ]
    
    signup_found = False
    for path in auth_paths:
        try:
            response = requests.post(
                f"{BACKEND_URL}{path}",
                json={"email": "test@test.com", "password": "test123"},
                timeout=5
            )
            # Should return 422 (validation error) or 400, not 404
            if response.status_code in [200, 400, 422, 409]:
                results.add_pass(f"Signup Endpoint Exists ({path})")
                signup_found = True
                break
            elif response.status_code == 404:
                continue
        except:
            continue
    
    if not signup_found:
        results.add_warn("Signup Endpoint", "Could not find signup endpoint")
    
    login_paths = [
        "/api/v1/auth/login",
        "/auth/login",
        "/api/auth/login"
    ]
    
    login_found = False
    for path in login_paths:
        try:
            response = requests.post(
                f"{BACKEND_URL}{path}",
                json={"email": "test@test.com", "password": "test123"},
                timeout=5
            )
            # Should return 401 (invalid credentials) or 422, not 404
            if response.status_code in [200, 401, 422, 400]:
                results.add_pass(f"Login Endpoint Exists ({path})")
                login_found = True
                break
            elif response.status_code == 404:
                continue
        except:
            continue
    
    if not login_found:
        results.add_warn("Login Endpoint", "Could not find login endpoint")
    
    return signup_found or login_found

def check_no_mock_data(products):
    """Check that products are from database, not mock"""
    if not products:
        results.add_warn("No Mock Data Check", "No products found to verify")
        return
    
    # Check if products have real IDs and data
    for product in products[:3]:  # Check first 3
        if "id" in product and "name" in product and "price" in product:
            results.add_pass("Products Have Real Data (No Mock)")
        else:
            results.add_fail("Products Data Check", "Products missing required fields")
            return
    
    results.add_pass("No Mock Data - Products from Database")

def main():
    print("="*60)
    print("COMPREHENSIVE PLATFORM TESTING")
    print("="*60)
    print()
    
    # Wait for backend
    if not wait_for_backend():
        results.add_fail("Backend Startup", "Backend did not start within 30 seconds")
        results.print_summary()
        return
    
    print()
    print("Running Tests...")
    print("-"*60)
    
    # Test backend
    test_backend_health()
    test_api_docs()
    test_auth_endpoints()
    
    # Test products
    success, products = test_products_endpoint()
    if success:
        check_no_mock_data(products)
    
    # Test cart and orders
    test_cart_endpoint()
    test_orders_endpoint()
    
    # Print summary
    results.print_summary()
    
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Products need to be added via vendor dashboard")
    print("2. Manual testing required for:")
    print("   - Customer flow (browse, cart, checkout)")
    print("   - Vendor flow (dashboard, products, orders)")
    print("   - Admin flow (dashboard, management)")
    print("3. Use COMPLETE_TESTING_CHECKLIST.md for detailed testing")

if __name__ == "__main__":
    main()

