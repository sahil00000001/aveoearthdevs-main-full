#!/usr/bin/env python3
"""
Add products via API (works once backend is running)
This ensures all validations and relationships are properly handled
"""
import requests
import json
from typing import Dict, List

BACKEND_URL = "http://localhost:8000"

# Product data: 4 products per vendor (2 vendors = 8 products)
VENDOR1_PRODUCTS = [
    {
        "name": "Eco-Friendly Bamboo Toothbrush Set",
        "sku": "ECO-BAMBOO-001",
        "description": "Sustainable bamboo toothbrush set with soft bristles. 100% biodegradable handle made from organic bamboo. Soft nylon bristles for gentle cleaning. Comes in a set of 4 with travel case.",
        "short_description": "Sustainable bamboo toothbrush set - 100% biodegradable",
        "price": 24.99,
        "compare_at_price": 34.99,
        "cost_per_item": 12.00,
        "weight": 0.15,
        "materials": ["Bamboo", "Nylon"],
        "origin_country": "India",
        "sustainability_score": 95,
        "stock": 100
    },
    {
        "name": "Organic Cotton Tote Bag Collection",
        "sku": "ECO-COTTON-002",
        "description": "Reusable organic cotton tote bag collection. Made from 100% organic cotton, fair trade certified. Durable and washable. Perfect for grocery shopping and daily use. Set of 3 bags in different sizes.",
        "short_description": "Reusable organic cotton tote bags - fair trade certified",
        "price": 18.99,
        "compare_at_price": 29.99,
        "cost_per_item": 8.00,
        "weight": 0.3,
        "materials": ["Organic Cotton"],
        "origin_country": "India",
        "sustainability_score": 98,
        "stock": 150
    },
    {
        "name": "Solar-Powered LED Garden Light",
        "sku": "ECO-SOLAR-003",
        "description": "Energy-efficient solar-powered LED garden light. Automatic dusk-to-dawn operation. Weather-resistant design. 6 LED bulbs with 10-hour battery life. No wiring required.",
        "short_description": "Solar-powered LED garden light - automatic operation",
        "price": 34.99,
        "compare_at_price": 49.99,
        "cost_per_item": 18.00,
        "weight": 0.5,
        "materials": ["Plastic", "Solar Panel", "LED"],
        "origin_country": "China",
        "sustainability_score": 88,
        "stock": 75
    },
    {
        "name": "Reusable Stainless Steel Water Bottle",
        "sku": "ECO-STEEL-004",
        "description": "BPA-free stainless steel water bottle. Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof cap. 500ml capacity. Dishwasher safe.",
        "short_description": "BPA-free stainless steel water bottle - 24hr cold, 12hr hot",
        "price": 29.99,
        "compare_at_price": 39.99,
        "cost_per_item": 15.00,
        "weight": 0.4,
        "materials": ["Stainless Steel", "Silicone"],
        "origin_country": "India",
        "sustainability_score": 92,
        "stock": 120
    }
]

VENDOR2_PRODUCTS = [
    {
        "name": "Organic Hemp Clothing Collection",
        "sku": "GREEN-HEMP-001",
        "description": "Sustainable organic hemp clothing collection. Soft, breathable, and durable. Includes t-shirt, hoodie, and pants. Machine washable. Carbon-neutral production.",
        "short_description": "Organic hemp clothing - carbon-neutral production",
        "price": 89.99,
        "compare_at_price": 129.99,
        "cost_per_item": 45.00,
        "weight": 0.8,
        "materials": ["Organic Hemp"],
        "origin_country": "India",
        "sustainability_score": 96,
        "stock": 60
    },
    {
        "name": "Biodegradable Phone Case",
        "sku": "GREEN-PHONE-002",
        "description": "Eco-friendly biodegradable phone case made from plant-based materials. Shock-absorbing protection. Compostable after use. Compatible with most smartphones.",
        "short_description": "Biodegradable phone case - compostable protection",
        "price": 19.99,
        "compare_at_price": 29.99,
        "cost_per_item": 9.00,
        "weight": 0.05,
        "materials": ["Plant-based Polymer"],
        "origin_country": "USA",
        "sustainability_score": 94,
        "stock": 200
    },
    {
        "name": "Wooden Kitchen Utensil Set",
        "sku": "GREEN-WOOD-003",
        "description": "Handcrafted wooden kitchen utensil set. Made from sustainably sourced bamboo and teak wood. Non-stick friendly. Dishwasher safe. Set includes spatula, spoon, fork, and tongs.",
        "short_description": "Handcrafted wooden kitchen utensils - sustainably sourced",
        "price": 39.99,
        "compare_at_price": 59.99,
        "cost_per_item": 20.00,
        "weight": 0.6,
        "materials": ["Bamboo", "Teak Wood"],
        "origin_country": "India",
        "sustainability_score": 97,
        "stock": 90
    },
    {
        "name": "Natural Beeswax Food Wraps",
        "sku": "GREEN-BEESWAX-004",
        "description": "Reusable beeswax food wraps. Natural alternative to plastic wrap. Made from organic cotton, beeswax, tree resin, and jojoba oil. Washable and reusable for up to 1 year.",
        "short_description": "Reusable beeswax food wraps - natural plastic alternative",
        "price": 24.99,
        "compare_at_price": 34.99,
        "cost_per_item": 12.00,
        "weight": 0.1,
        "materials": ["Organic Cotton", "Beeswax", "Tree Resin", "Jojoba Oil"],
        "origin_country": "USA",
        "sustainability_score": 99,
        "stock": 180
    }
]

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_vendors_and_categories(token: str):
    """Get vendors and categories from API"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get categories
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/buyer/products/categories", headers=headers, timeout=10)
        if response.status_code == 200:
            categories = response.json()
            return categories
    except Exception as e:
        print(f"Error getting categories: {e}")
    
    return None

def add_product(product_data: Dict, category_id: str, token: str):
    """Add a product via API"""
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
        "materials": json.dumps(product_data["materials"]),
        "origin_country": product_data["origin_country"],
        "track_quantity": True,
        "continue_selling": True,
        "visibility": "visible"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/v1/supplier/products",
            headers=headers,
            json=payload,
            timeout=30
        )
        return response
    except Exception as e:
        print(f"Error adding product {product_data['sku']}: {e}")
        return None

def main():
    print("=" * 60)
    print("ADD PRODUCTS VIA API")
    print("=" * 60)
    print()
    
    # Check backend
    if not check_backend():
        print("ERROR: Backend is not running!")
        print(f"Please start the backend server first: cd backend && python main.py")
        return
    
    print("[OK] Backend is running")
    print()
    print("NOTE: This script requires:")
    print("1. Backend server running on http://localhost:8000")
    print("2. Vendor authentication tokens")
    print("3. Categories and brands already created in database")
    print()
    print("To add products manually:")
    print("1. Login as vendor 1 and vendor 2")
    print("2. Use the vendor dashboard to add products")
    print("3. Or use the API endpoints with proper authentication")
    print()
    print("Product data is ready in this script - use it as reference")
    print(f"Vendor 1: {len(VENDOR1_PRODUCTS)} products")
    print(f"Vendor 2: {len(VENDOR2_PRODUCTS)} products")

if __name__ == "__main__":
    main()

