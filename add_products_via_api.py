#!/usr/bin/env python3
"""
Add products via API - Create vendor, login, add products
"""
import requests
import json

BACKEND_URL = "http://localhost:8080"

# Vendor credentials
VENDOR1 = {
    "email": "vendor1@test.com",
    "password": "Vendor123!@#",
    "name": "Eco Supplies Co"
}

VENDOR2 = {
    "email": "vendor2@test.com", 
    "password": "Vendor123!@#",
    "name": "Green Products Ltd"
}

# Products data
VENDOR1_PRODUCTS = [
    {
        "name": "Eco-Friendly Bamboo Toothbrush Set",
        "sku": "ECO-BAMBOO-001",
        "description": "Sustainable bamboo toothbrush set with soft bristles. 100% biodegradable handle.",
        "short_description": "Sustainable bamboo toothbrush set - 100% biodegradable",
        "price": "24.99",
        "compare_at_price": "34.99",
        "cost_per_item": "12.00",
        "weight": "0.15",
        "origin_country": "India"
    },
    {
        "name": "Organic Cotton Tote Bag Collection",
        "sku": "ECO-COTTON-002",
        "description": "Reusable organic cotton tote bag collection. Made from 100% organic cotton.",
        "short_description": "Reusable organic cotton tote bags - fair trade certified",
        "price": "18.99",
        "compare_at_price": "29.99",
        "cost_per_item": "8.00",
        "weight": "0.3",
        "origin_country": "India"
    },
    {
        "name": "Solar-Powered LED Garden Light",
        "sku": "ECO-SOLAR-003",
        "description": "Energy-efficient solar-powered LED garden light. Automatic dusk-to-dawn operation.",
        "short_description": "Solar-powered LED garden light - automatic operation",
        "price": "34.99",
        "compare_at_price": "49.99",
        "cost_per_item": "18.00",
        "weight": "0.5",
        "origin_country": "China"
    },
    {
        "name": "Reusable Stainless Steel Water Bottle",
        "sku": "ECO-STEEL-004",
        "description": "BPA-free stainless steel water bottle. Double-wall vacuum insulation.",
        "short_description": "BPA-free stainless steel water bottle - 24hr cold, 12hr hot",
        "price": "29.99",
        "compare_at_price": "39.99",
        "cost_per_item": "15.00",
        "weight": "0.4",
        "origin_country": "India"
    }
]

VENDOR2_PRODUCTS = [
    {
        "name": "Organic Hemp Clothing Collection",
        "sku": "GREEN-HEMP-001",
        "description": "Sustainable organic hemp clothing collection. Soft, breathable, and durable.",
        "short_description": "Organic hemp clothing - carbon-neutral production",
        "price": "89.99",
        "compare_at_price": "129.99",
        "cost_per_item": "45.00",
        "weight": "0.8",
        "origin_country": "India"
    },
    {
        "name": "Biodegradable Phone Case",
        "sku": "GREEN-PHONE-002",
        "description": "Eco-friendly biodegradable phone case made from plant-based materials.",
        "short_description": "Biodegradable phone case - compostable protection",
        "price": "19.99",
        "compare_at_price": "29.99",
        "cost_per_item": "9.00",
        "weight": "0.05",
        "origin_country": "USA"
    },
    {
        "name": "Wooden Kitchen Utensil Set",
        "sku": "GREEN-WOOD-003",
        "description": "Handcrafted wooden kitchen utensil set. Made from sustainably sourced bamboo.",
        "short_description": "Handcrafted wooden kitchen utensils - sustainably sourced",
        "price": "39.99",
        "compare_at_price": "59.99",
        "cost_per_item": "20.00",
        "weight": "0.6",
        "origin_country": "India"
    },
    {
        "name": "Natural Beeswax Food Wraps",
        "sku": "GREEN-BEESWAX-004",
        "description": "Reusable beeswax food wraps. Natural alternative to plastic wrap.",
        "short_description": "Reusable beeswax food wraps - natural plastic alternative",
        "price": "24.99",
        "compare_at_price": "34.99",
        "cost_per_item": "12.00",
        "weight": "0.1",
        "origin_country": "USA"
    }
]

def signup_vendor(vendor_data):
    """Signup vendor"""
    try:
        response = requests.post(f"{BACKEND_URL}/auth/signup", json={
            "email": vendor_data["email"],
            "password": vendor_data["password"],
            "user_type": "supplier",
            "first_name": vendor_data["name"].split()[0],
            "last_name": " ".join(vendor_data["name"].split()[1:]) if len(vendor_data["name"].split()) > 1 else "Vendor"
        }, timeout=10)
        return response
    except Exception as e:
        print(f"Signup error: {e}")
        return None

def login_vendor(vendor_data):
    """Login vendor and get token"""
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": vendor_data["email"],
            "password": vendor_data["password"]
        }, timeout=10)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            return token
        return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def get_categories(token):
    """Get categories"""
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.get(f"{BACKEND_URL}/products/categories", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            categories = data.get("data", data.get("items", []))
            if isinstance(data, list):
                categories = data
            return categories[0]["id"] if categories else None
        return None
    except:
        return None

def add_product(product_data, category_id, token):
    """Add product via API"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": product_data["name"],
            "sku": product_data["sku"],
            "category_id": category_id,
            "description": product_data["description"],
            "short_description": product_data["short_description"],
            "price": product_data["price"],
            "compare_at_price": product_data["compare_at_price"],
            "cost_per_item": product_data["cost_per_item"],
            "weight": product_data["weight"],
            "origin_country": product_data["origin_country"],
            "track_quantity": True,
            "continue_selling": True,
            "visibility": "visible"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/supplier/products",
            headers=headers,
            json=payload,
            timeout=30
        )
        return response
    except Exception as e:
        print(f"Add product error: {e}")
        return None

def main():
    print("="*60)
    print("ADDING PRODUCTS VIA API")
    print("="*60)
    
    # Try to add products for vendor 1
    print("\n[VENDOR 1] Setting up...")
    
    # Try signup (might already exist)
    signup_resp = signup_vendor(VENDOR1)
    if signup_resp and signup_resp.status_code in [200, 201]:
        print("  [OK] Vendor 1 signed up")
    elif signup_resp and signup_resp.status_code == 409:
        print("  [OK] Vendor 1 already exists")
    
    # Login
    token1 = login_vendor(VENDOR1)
    if not token1:
        print("  [FAIL] Could not login vendor 1")
        print("  Note: Products need to be added manually via vendor dashboard")
        return
    print("  [OK] Vendor 1 logged in")
    
    # Get category
    category_id = get_categories(token1)
    if not category_id:
        print("  [WARN] No categories found - need categories first")
        print("  Note: Products need to be added manually via vendor dashboard")
        return
    
    # Add products
    print(f"\n  Adding {len(VENDOR1_PRODUCTS)} products...")
    for product in VENDOR1_PRODUCTS:
        resp = add_product(product, category_id, token1)
        if resp and resp.status_code in [200, 201]:
            print(f"    [OK] Added: {product['name']}")
        else:
            print(f"    [FAIL] Failed to add: {product['name']} - Status: {resp.status_code if resp else 'No response'}")
    
    # Vendor 2
    print("\n[VENDOR 2] Setting up...")
    signup_resp = signup_vendor(VENDOR2)
    if signup_resp and signup_resp.status_code in [200, 201]:
        print("  [OK] Vendor 2 signed up")
    elif signup_resp and signup_resp.status_code == 409:
        print("  [OK] Vendor 2 already exists")
    
    token2 = login_vendor(VENDOR2)
    if token2:
        print("  [OK] Vendor 2 logged in")
        print(f"\n  Adding {len(VENDOR2_PRODUCTS)} products...")
        for product in VENDOR2_PRODUCTS:
            resp = add_product(product, category_id, token2)
            if resp and resp.status_code in [200, 201]:
                print(f"    [OK] Added: {product['name']}")
            else:
                print(f"    [FAIL] Failed to add: {product['name']}")
    else:
        print("  [FAIL] Could not login vendor 2")
    
    print("\n" + "="*60)
    print("Check products at: http://localhost:5173/products")
    print("Or verify via: GET /products endpoint")

if __name__ == "__main__":
    main()

