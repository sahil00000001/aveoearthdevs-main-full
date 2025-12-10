#!/usr/bin/env python3
"""
Complete Platform Testing Script
Tests all features before launch
"""
import requests
import json
import sys
from typing import Dict, List, Optional

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# Test results
results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def test(name: str, func):
    """Run a test and record results"""
    try:
        result = func()
        if result:
            results["passed"].append(name)
            print(f"[PASS] {name}")
            return True
        else:
            results["failed"].append(name)
            print(f"[FAIL] {name}")
            return False
    except Exception as e:
        results["failed"].append(f"{name} (Error: {str(e)})")
        print(f"[FAIL] {name} - Error: {str(e)}")
        return False

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_backend_docs():
    """Test if API docs are accessible"""
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    try:
        # Test signup endpoint exists
        response = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", 
                               json={}, timeout=5)
        # Should return 422 (validation error) not 404
        return response.status_code in [422, 400]
    except:
        return False

def test_products_endpoints():
    """Test products endpoints"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/products", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_cart_endpoints():
    """Test cart endpoints"""
    try:
        # Should require auth, but endpoint should exist
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/orders/cart", timeout=5)
        return response.status_code in [200, 401, 403]
    except:
        return False

def test_orders_endpoints():
    """Test orders endpoints"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/orders", timeout=5)
        return response.status_code in [200, 401, 403]
    except:
        return False

def test_file_structure():
    """Test critical file structure"""
    import os
    critical_files = [
        "backend/main.py",
        "backend/app/core/config.py",
        "frontend1/src/App.tsx",
        "frontend1/src/pages/CheckoutPage.tsx",
        "frontend1/src/hooks/useCart.ts",
        "frontend1/src/services/backendApi.ts"
    ]
    
    for file in critical_files:
        if not os.path.exists(file):
            print(f"[WARN] Missing file: {file}")
            results["warnings"].append(f"Missing file: {file}")
            return False
    return True

def test_env_files():
    """Check if environment files exist"""
    import os
    env_files = [
        "backend/.env",
        "frontend1/.env.local"
    ]
    
    all_exist = True
    for env_file in env_files:
        if not os.path.exists(env_file):
            print(f"[WARN] Missing env file: {env_file} (check env.example)")
            results["warnings"].append(f"Missing env file: {env_file}")
            all_exist = False
    return all_exist

def main():
    print("=" * 60)
    print("PLATFORM TESTING CHECKLIST")
    print("=" * 60)
    print()
    
    print("1. BACKEND TESTS")
    print("-" * 60)
    test("Backend Health Check", test_backend_health)
    test("API Documentation Accessible", test_backend_docs)
    test("Authentication Endpoints", test_auth_endpoints)
    test("Products Endpoints", test_products_endpoints)
    test("Cart Endpoints", test_cart_endpoints)
    test("Orders Endpoints", test_orders_endpoints)
    print()
    
    print("2. FILE STRUCTURE TESTS")
    print("-" * 60)
    test("Critical Files Exist", test_file_structure)
    test("Environment Files", test_env_files)
    print()
    
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"[PASS] Passed: {len(results['passed'])}")
    print(f"[FAIL] Failed: {len(results['failed'])}")
    print(f"[WARN] Warnings: {len(results['warnings'])}")
    print()
    
    if results['failed']:
        print("FAILED TESTS:")
        for test_name in results['failed']:
            print(f"  - {test_name}")
        print()
    
    if results['warnings']:
        print("WARNINGS:")
        for warning in results['warnings']:
            print(f"  - {warning}")
        print()
    
    if len(results['failed']) == 0:
        print("[SUCCESS] All critical tests passed!")
        return 0
    else:
        print("[WARNING] Some tests failed. Please review before launch.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

