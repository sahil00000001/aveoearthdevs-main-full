#!/usr/bin/env python3
"""
Complete testing - Add products and test all flows
"""
import requests
import json
import time

BACKEND_URL = "http://localhost:8080"

print("="*70)
print("COMPREHENSIVE TESTING - ADD PRODUCTS & TEST ALL FLOWS")
print("="*70)

# Step 1: Check backend
print("\n[STEP 1] Checking Backend...")
try:
    r = requests.get(f"{BACKEND_URL}/health", timeout=5)
    if r.status_code == 200:
        print("  [OK] Backend is running")
    else:
        print(f"  [FAIL] Backend not healthy: {r.status_code}")
        exit(1)
except Exception as e:
    print(f"  [FAIL] Backend not accessible: {e}")
    exit(1)

# Step 2: Get or create categories
print("\n[STEP 2] Getting Categories...")
try:
    r = requests.get(f"{BACKEND_URL}/products/categories/tree", timeout=10)
    if r.status_code == 200:
        categories = r.json()
        if categories:
            category_id = categories[0]["id"]
            print(f"  [OK] Found category: {categories[0]['name']} (ID: {category_id})")
        else:
            print("  [WARN] No categories found - will need to create one")
            category_id = None
    else:
        print(f"  [WARN] Could not get categories: {r.status_code}")
        category_id = None
except Exception as e:
    print(f"  [WARN] Error getting categories: {e}")
    category_id = None

# Step 3: Create vendor accounts
print("\n[STEP 3] Creating Vendor Accounts...")

VENDOR1 = {"email": "vendor1@test.com", "password": "Vendor123!@#", "name": "Eco Supplies"}
VENDOR2 = {"email": "vendor2@test.com", "password": "Vendor123!@#", "name": "Green Products"}

tokens = {}

for vendor in [("VENDOR1", VENDOR1), ("VENDOR2", VENDOR2)]:
    name, data = vendor
    print(f"\n  Creating {name}...")
    
    # Signup
    try:
        signup_data = {
            "email": data["email"],
            "password": data["password"],
            "phone": "+919876543210",
            "user_type": "supplier",
            "first_name": data["name"].split()[0],
            "last_name": " ".join(data["name"].split()[1:]) if len(data["name"].split()) > 1 else "Vendor"
        }
        r = requests.post(f"{BACKEND_URL}/auth/signup", json=signup_data, timeout=10)
        if r.status_code in [200, 201]:
            print(f"    [OK] {name} signed up")
            resp_data = r.json()
            token = resp_data.get("tokens", {}).get("access_token") or resp_data.get("access_token") or resp_data.get("token")
            if token:
                tokens[name] = token
                print(f"    [OK] Got token for {name}")
        elif r.status_code == 409:
            print(f"    [OK] {name} already exists")
        else:
            print(f"    [WARN] Signup failed: {r.status_code}")
    except Exception as e:
        print(f"    [WARN] Signup error: {e}")
    
    # Login
    try:
        r = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": data["email"],
            "password": data["password"]
        }, timeout=10)
        if r.status_code == 200:
            resp_data = r.json()
            token = resp_data.get("tokens", {}).get("access_token") or resp_data.get("access_token") or resp_data.get("token") or resp_data.get("data", {}).get("access_token")
            if token:
                tokens[name] = token
                print(f"    [OK] {name} logged in - got token")
            else:
                print(f"    [WARN] No token found in response keys: {list(resp_data.keys())}")
        else:
            print(f"    [WARN] Login failed: {r.status_code}")
    except Exception as e:
        print(f"    [WARN] Login error: {e}")

# Step 4: Add products
print("\n[STEP 4] Adding Products...")

if not category_id:
    print("  [SKIP] Cannot add products - no category available")
    print("  Note: Products need to be added manually via vendor dashboard")
else:
    products_data = {
        "VENDOR1": [
            {"name": "Eco-Friendly Bamboo Toothbrush Set", "sku": "ECO-BAMBOO-001", "price": "24.99", "description": "Sustainable bamboo toothbrush set"},
            {"name": "Organic Cotton Tote Bag Collection", "sku": "ECO-COTTON-002", "price": "18.99", "description": "Reusable organic cotton tote bags"},
            {"name": "Solar-Powered LED Garden Light", "sku": "ECO-SOLAR-003", "price": "34.99", "description": "Solar-powered LED garden light"},
            {"name": "Reusable Stainless Steel Water Bottle", "sku": "ECO-STEEL-004", "price": "29.99", "description": "BPA-free stainless steel water bottle"}
        ],
        "VENDOR2": [
            {"name": "Organic Hemp Clothing Collection", "sku": "GREEN-HEMP-001", "price": "89.99", "description": "Organic hemp clothing"},
            {"name": "Biodegradable Phone Case", "sku": "GREEN-PHONE-002", "price": "19.99", "description": "Biodegradable phone case"},
            {"name": "Wooden Kitchen Utensil Set", "sku": "GREEN-WOOD-003", "price": "39.99", "description": "Wooden kitchen utensils"},
            {"name": "Natural Beeswax Food Wraps", "sku": "GREEN-BEESWAX-004", "price": "24.99", "description": "Beeswax food wraps"}
        ]
    }
    
    products_added = 0
    if not tokens:
        print("  [SKIP] No vendor tokens available")
    else:
        for vendor_name, token in tokens.items():
            if vendor_name not in products_data:
                continue
            print(f"\n  Adding products for {vendor_name}...")
            for product in products_data[vendor_name]:
                try:
                    headers = {"Authorization": f"Bearer {token}"}
                    payload = {
                        "name": product["name"],
                        "sku": product["sku"],
                        "category_id": category_id,
                        "description": product["description"],
                        "short_description": product["description"],
                        "price": product["price"],
                        "track_quantity": True,
                        "continue_selling": True,
                        "visibility": "visible"
                    }
                    r = requests.post(f"{BACKEND_URL}/supplier/products", headers=headers, json=payload, timeout=30)
                    if r.status_code in [200, 201]:
                        print(f"    [OK] Added: {product['name']}")
                        products_added += 1
                    else:
                        print(f"    [FAIL] {product['name']}: {r.status_code} - {r.text[:100]}")
                except Exception as e:
                    print(f"    [FAIL] {product['name']}: {e}")

# Step 5: Verify products
print("\n[STEP 5] Verifying Products...")
try:
    r = requests.get(f"{BACKEND_URL}/products", params={"page": 1, "limit": 20}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        products = data.get("data", data.get("items", []))
        if isinstance(data, list):
            products = data
        print(f"  [OK] Found {len(products)} products in database")
        if products:
            print("  Products:")
            for p in products[:8]:
                print(f"    - {p.get('name', 'N/A')} - ${p.get('price', 0)}")
    else:
        print(f"  [WARN] Could not get products: {r.status_code}")
except Exception as e:
    print(f"  [WARN] Error getting products: {e}")

# Step 6: Test Customer Flow
print("\n[STEP 6] Testing Customer Flow...")

# Create customer account
print("  Creating customer account...")
customer_token = None
try:
    r = requests.post(f"{BACKEND_URL}/auth/signup", json={
        "email": "customer@test.com",
        "password": "Customer123!@#",
        "phone": "+919876543211",
        "user_type": "buyer",
        "first_name": "Test",
        "last_name": "Customer"
    }, timeout=10)
    if r.status_code in [200, 201, 409]:
        print("    [OK] Customer account created/exists")
        # Login
        r = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "customer@test.com",
            "password": "Customer123!@#"
        }, timeout=10)
        if r.status_code == 200:
            resp_data = r.json()
            customer_token = resp_data.get("tokens", {}).get("access_token") or resp_data.get("access_token") or resp_data.get("token") or resp_data.get("data", {}).get("access_token")
            if customer_token:
                print("    [OK] Customer logged in - got token")
            else:
                print(f"    [WARN] No token - response keys: {list(resp_data.keys())}")
except Exception as e:
    print(f"    [WARN] Customer setup error: {e}")

# Test cart
if customer_token:
    print("  Testing cart operations...")
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        # Get cart
        r = requests.get(f"{BACKEND_URL}/buyer/orders/cart", headers=headers, timeout=10)
        if r.status_code == 200:
            cart = r.json()
            print(f"    [OK] Cart retrieved - {len(cart.get('items', []))} items")
        else:
            print(f"    [WARN] Cart GET: {r.status_code}")
    except Exception as e:
        print(f"    [WARN] Cart test error: {e}")

# Test orders
if customer_token:
    print("  Testing orders...")
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        r = requests.get(f"{BACKEND_URL}/buyer/orders", params={"page": 1, "limit": 10}, headers=headers, timeout=10)
        if r.status_code == 200:
            orders = r.json()
            order_list = orders.get("data", orders.get("items", []))
            if isinstance(orders, list):
                order_list = orders
            print(f"    [OK] Orders retrieved - {len(order_list)} orders")
        else:
            print(f"    [WARN] Orders GET: {r.status_code}")
    except Exception as e:
        print(f"    [WARN] Orders test error: {e}")

# Step 7: Test Vendor Flow
print("\n[STEP 7] Testing Vendor Flow...")
for vendor_name, token in tokens.items():
    print(f"  Testing {vendor_name}...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        # Get vendor products
        r = requests.get(f"{BACKEND_URL}/supplier/products", headers=headers, params={"page": 1, "limit": 10}, timeout=10)
        if r.status_code == 200:
            products = r.json()
            product_list = products.get("data", products.get("items", []))
            if isinstance(products, list):
                product_list = products
            print(f"    [OK] {vendor_name} products: {len(product_list)}")
        else:
            print(f"    [WARN] {vendor_name} products: {r.status_code}")
    except Exception as e:
        print(f"    [WARN] {vendor_name} test error: {e}")

# Final Summary
print("\n" + "="*70)
print("TESTING SUMMARY")
print("="*70)
print(f"Backend: [OK] Running")
print(f"Vendors: [OK] {len(tokens)} vendors logged in")
if 'products_added' in locals():
    print(f"Products: [OK] {products_added} products added")
else:
    print(f"Products: [WARN] Could not add products (need categories/vendors)")
if customer_token:
    print(f"Customer: [OK] Account created and logged in")
else:
    print(f"Customer: [WARN] Could not create/login customer")
print("\nAll automated tests completed!")
print("Frontend: http://localhost:5173")
print("Backend API: http://localhost:8080")

