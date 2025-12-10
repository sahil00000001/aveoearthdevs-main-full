#!/usr/bin/env python3
"""
Add test products to database
4 products per vendor, 2 vendors = 8 products total
"""
import asyncio
import sys
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path
sys.path.insert(0, '.')

from app.database.session import get_async_session, init_database
from app.features.products.models.product import Product, ProductStatusEnum, ProductApprovalEnum, ProductVisibilityEnum
from app.features.products.models.product_inventory import ProductInventory
from app.features.products.models.product_image import ProductImage
from app.features.products.models.product_sustainability_score import ProductSustainabilityScore
from app.features.auth.models.user import User, UserTypeEnum
from app.features.products.models.category import Category
from app.features.products.models.brand import Brand
from app.core.logging import get_logger

logger = get_logger("add_test_products")

async def get_or_create_vendors(db: AsyncSession):
    """Get or create 2 vendors"""
    vendors = []
    
    # Check for existing suppliers
    result = await db.execute(
        select(User).where(User.user_type == UserTypeEnum.SUPPLIER).limit(2)
    )
    existing_vendors = result.scalars().all()
    
    if len(existing_vendors) >= 2:
        vendors = existing_vendors[:2]
        logger.info(f"Found {len(vendors)} existing vendors")
        return vendors
    
    # Create vendors if needed
    vendor_emails = ["vendor1@test.com", "vendor2@test.com"]
    vendor_names = [
        {"first_name": "Eco", "last_name": "Supplies Co"},
        {"first_name": "Green", "last_name": "Products Ltd"}
    ]
    
    for i, email in enumerate(vendor_emails):
        if i < len(existing_vendors):
            vendors.append(existing_vendors[i])
            continue
            
        # Check if vendor exists by email
        result = await db.execute(select(User).where(User.email == email))
        vendor = result.scalar_one_or_none()
        
        if not vendor:
            vendor = User(
                email=email,
                phone=f"+9198765432{i+1}",
                user_type=UserTypeEnum.SUPPLIER,
                first_name=vendor_names[i]["first_name"],
                last_name=vendor_names[i]["last_name"],
                is_active=True,
                is_verified=True
            )
            db.add(vendor)
            await db.flush()
            logger.info(f"Created vendor: {email}")
        vendors.append(vendor)
    
    await db.commit()
    return vendors

async def get_categories(db: AsyncSession):
    """Get categories"""
    result = await db.execute(select(Category).limit(10))
    categories = result.scalars().all()
    if not categories:
        logger.error("No categories found! Please create categories first.")
        return []
    return categories

async def get_or_create_brands(db: AsyncSession):
    """Get or create brands"""
    result = await db.execute(select(Brand).limit(5))
    brands = result.scalars().all()
    
    if len(brands) < 2:
        brand_names = ["EcoBrand", "GreenTech"]
        for name in brand_names:
            existing = next((b for b in brands if b.name == name), None)
            if not existing:
                brand = Brand(name=name, is_active=True)
                db.add(brand)
                await db.flush()
                brands.append(brand)
                logger.info(f"Created brand: {name}")
    
    await db.commit()
    return brands[:2]

async def add_products():
    """Add 8 products (4 per vendor)"""
    # Initialize database first
    await init_database()
    
    async for db in get_async_session():
        try:
            # Get vendors
            vendors = await get_or_create_vendors(db)
            if len(vendors) < 2:
                logger.error("Could not get/create 2 vendors")
                return
            
            # Get categories
            categories = await get_categories(db)
            if not categories:
                logger.error("No categories available")
                return
            
            # Get brands
            brands = await get_or_create_brands(db)
            if len(brands) < 2:
                logger.error("Could not get/create 2 brands")
                return
            
            # Product data: 4 products per vendor
            products_data = [
                # Vendor 1 products
                {
                    "name": "Eco-Friendly Bamboo Toothbrush Set",
                    "sku": "ECO-BAMBOO-001",
                    "description": "Sustainable bamboo toothbrush set with soft bristles. 100% biodegradable handle made from organic bamboo. Soft nylon bristles for gentle cleaning. Comes in a set of 4 with travel case.",
                    "short_description": "Sustainable bamboo toothbrush set - 100% biodegradable",
                    "price": Decimal("24.99"),
                    "compare_at_price": Decimal("34.99"),
                    "cost_per_item": Decimal("12.00"),
                    "weight": Decimal("0.15"),
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
                    "price": Decimal("18.99"),
                    "compare_at_price": Decimal("29.99"),
                    "cost_per_item": Decimal("8.00"),
                    "weight": Decimal("0.3"),
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
                    "price": Decimal("34.99"),
                    "compare_at_price": Decimal("49.99"),
                    "cost_per_item": Decimal("18.00"),
                    "weight": Decimal("0.5"),
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
                    "price": Decimal("29.99"),
                    "compare_at_price": Decimal("39.99"),
                    "cost_per_item": Decimal("15.00"),
                    "weight": Decimal("0.4"),
                    "materials": ["Stainless Steel", "Silicone"],
                    "origin_country": "India",
                    "sustainability_score": 92,
                    "stock": 120
                },
                # Vendor 2 products
                {
                    "name": "Organic Hemp Clothing Collection",
                    "sku": "GREEN-HEMP-001",
                    "description": "Sustainable organic hemp clothing collection. Soft, breathable, and durable. Includes t-shirt, hoodie, and pants. Machine washable. Carbon-neutral production.",
                    "short_description": "Organic hemp clothing - carbon-neutral production",
                    "price": Decimal("89.99"),
                    "compare_at_price": Decimal("129.99"),
                    "cost_per_item": Decimal("45.00"),
                    "weight": Decimal("0.8"),
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
                    "price": Decimal("19.99"),
                    "compare_at_price": Decimal("29.99"),
                    "cost_per_item": Decimal("9.00"),
                    "weight": Decimal("0.05"),
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
                    "price": Decimal("39.99"),
                    "compare_at_price": Decimal("59.99"),
                    "cost_per_item": Decimal("20.00"),
                    "weight": Decimal("0.6"),
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
                    "price": Decimal("24.99"),
                    "compare_at_price": Decimal("34.99"),
                    "cost_per_item": Decimal("12.00"),
                    "weight": Decimal("0.1"),
                    "materials": ["Organic Cotton", "Beeswax", "Tree Resin", "Jojoba Oil"],
                    "origin_country": "USA",
                    "sustainability_score": 99,
                    "stock": 180
                }
            ]
            
            # Add products
            for i, product_data in enumerate(products_data):
                vendor = vendors[0] if i < 4 else vendors[1]
                category = categories[i % len(categories)]
                brand = brands[0] if i < 4 else brands[1]
                
                # Check if product already exists
                result = await db.execute(
                    select(Product).where(Product.sku == product_data["sku"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    logger.info(f"Product {product_data['sku']} already exists, skipping")
                    continue
                
                # Create product
                slug = product_data["name"].lower().replace(" ", "-").replace("_", "-").replace(",", "")
                product = Product(
                    supplier_id=vendor.id,
                    category_id=category.id,
                    brand_id=brand.id,
                    sku=product_data["sku"],
                    name=product_data["name"],
                    slug=slug,
                    short_description=product_data["short_description"],
                    description=product_data["description"],
                    price=product_data["price"],
                    compare_at_price=product_data["compare_at_price"],
                    cost_per_item=product_data["cost_per_item"],
                    weight=product_data["weight"],
                    materials=product_data["materials"],
                    origin_country=product_data["origin_country"],
                    status=ProductStatusEnum.ACTIVE,
                    approval_status=ProductApprovalEnum.APPROVED,
                    visibility=ProductVisibilityEnum.VISIBLE,
                    published_at=datetime.utcnow(),
                    track_quantity=True,
                    continue_selling=True
                )
                db.add(product)
                await db.flush()
                
                # Add inventory
                inventory = ProductInventory(
                    product_id=product.id,
                    quantity=product_data["stock"],
                    reserved_quantity=0,
                    low_stock_threshold=10,
                    location="Main Warehouse"
                )
                db.add(inventory)
                
                # Add sustainability score
                sustainability = ProductSustainabilityScore(
                    product_id=product.id,
                    environmental_score=product_data["sustainability_score"],
                    social_score=85,
                    governance_score=90,
                    overall_score=product_data["sustainability_score"],
                    certification_details={"organic": True, "fair_trade": True}
                )
                db.add(sustainability)
                
                # Add placeholder image
                image = ProductImage(
                    product_id=product.id,
                    image_url=f"https://via.placeholder.com/600x600?text={product_data['name'].replace(' ', '+')}",
                    alt_text=product_data["name"],
                    display_order=1,
                    is_primary=True
                )
                db.add(image)
                
                logger.info(f"Added product: {product_data['name']} (SKU: {product_data['sku']})")
            
            await db.commit()
            logger.info("Successfully added 8 products to database!")
            
        except Exception as e:
            logger.error(f"Error adding products: {str(e)}")
            import traceback
            traceback.print_exc()
            await db.rollback()
        finally:
            break

if __name__ == "__main__":
    asyncio.run(add_products())

