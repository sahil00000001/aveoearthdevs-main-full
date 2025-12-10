-- =====================================================
-- AVEOTEARTH COMPLETE SAMPLE DATA
-- Run this in Supabase SQL Editor to populate your database
-- =====================================================

-- First, let's create a test admin user (you can replace this UUID with your actual user ID)
-- For now, we'll use a placeholder UUID that we'll update later
INSERT INTO public.users (
    id, 
    email, 
    user_type, 
    first_name, 
    last_name, 
    is_verified, 
    is_active,
    is_email_verified,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Placeholder UUID - replace with your actual user ID
    'admin@aveoearth.com',
    'admin',
    'Admin',
    'User',
    true,
    true,
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, is_active, created_at) VALUES
('Zero Waste', 'zero-waste', 'Products that help reduce waste and promote sustainable living', true, NOW()),
('Eco-Friendly', 'eco-friendly', 'Environmentally conscious products made from sustainable materials', true, NOW()),
('Organic', 'organic', 'Natural and organic products for a healthier lifestyle', true, NOW()),
('Recycled', 'recycled', 'Products made from recycled materials', true, NOW()),
('Renewable Energy', 'renewable-energy', 'Products that harness renewable energy sources', true, NOW()),
('Sustainable Fashion', 'sustainable-fashion', 'Ethically made wardrobe staples and organic clothing', true, NOW()),
('Clean Beauty', 'clean-beauty', 'Cruelty-free, natural skincare and beauty products', true, NOW()),
('Home & Living', 'home-living', 'Eco-friendly home essentials and kitchenware', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO public.brands (name, slug, description, is_active, created_at) VALUES
('EcoLife', 'ecolife', 'Leading sustainable lifestyle brand', true, NOW()),
('GreenTech', 'greentech', 'Innovative eco-friendly technology', true, NOW()),
('PureNature', 'purenature', '100% natural and organic products', true, NOW()),
('RecyclePro', 'recyclepro', 'Products made from recycled materials', true, NOW()),
('SolarMax', 'solarmax', 'Renewable energy solutions', true, NOW()),
('EarthWear', 'earthwear', 'Sustainable fashion for conscious consumers', true, NOW()),
('NaturalGlow', 'naturalglow', 'Clean beauty and skincare products', true, NOW()),
('HomeGreen', 'homegreen', 'Eco-friendly home and living products', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (
    supplier_id, 
    category_id, 
    brand_id, 
    sku, 
    name, 
    slug, 
    short_description, 
    description, 
    price, 
    compare_at_price, 
    status, 
    approval_status, 
    visibility, 
    published_at,
    materials,
    tags,
    created_at
) VALUES
-- Zero Waste Products
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'zero-waste'),
    (SELECT id FROM public.brands WHERE slug = 'ecolife'),
    'BAMBOO-BOTTLE-001',
    'Bamboo Water Bottle',
    'bamboo-water-bottle',
    'Eco-friendly bamboo water bottle with stainless steel interior',
    'This beautiful bamboo water bottle combines sustainability with functionality. Made from natural bamboo and featuring a stainless steel interior, it keeps your drinks cold for up to 24 hours and hot for up to 12 hours. Perfect for reducing single-use plastic consumption.',
    24.99,
    29.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Bamboo", "Stainless Steel"]',
    '["zero-waste", "bamboo", "water-bottle", "sustainable"]',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'zero-waste'),
    (SELECT id FROM public.brands WHERE slug = 'ecolife'),
    'BEESWAX-WRAPS-001',
    'Beeswax Food Wraps Set',
    'beeswax-food-wraps-set',
    'Natural alternative to plastic wrap made from organic cotton and beeswax',
    'Replace single-use plastic wrap with these beautiful, reusable beeswax wraps. Made from organic cotton infused with beeswax, jojoba oil, and tree resin. Perfect for wrapping sandwiches, covering bowls, and storing cheese.',
    18.99,
    24.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Cotton", "Beeswax", "Jojoba Oil"]',
    '["zero-waste", "beeswax", "food-wrap", "reusable"]',
    NOW()
),
-- Eco-Friendly Products
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'eco-friendly'),
    (SELECT id FROM public.brands WHERE slug = 'greentech'),
    'SOLAR-CHARGER-001',
    'Solar Phone Charger',
    'solar-phone-charger',
    'Portable solar charger for phones and small devices',
    'Harness the power of the sun with this compact solar charger. Features high-efficiency solar panels and built-in battery storage. Perfect for camping, hiking, or emergency situations. Charges most smartphones and small devices.',
    45.99,
    59.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Solar Panels", "Lithium Battery", "Recycled Plastic"]',
    '["solar", "renewable-energy", "portable", "eco-friendly"]',
    NOW()
),
-- Organic Products
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'organic'),
    (SELECT id FROM public.brands WHERE slug = 'purenature'),
    'ORGANIC-SOAP-001',
    'Organic Lavender Soap',
    'organic-lavender-soap',
    'Handcrafted organic soap with lavender essential oils',
    'Made with organic olive oil, coconut oil, and pure lavender essential oil. This gentle soap is perfect for sensitive skin and provides a calming, relaxing experience. No synthetic fragrances or harsh chemicals.',
    12.99,
    16.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Olive Oil", "Coconut Oil", "Lavender Essential Oil"]',
    '["organic", "lavender", "handmade", "natural"]',
    NOW()
),
-- Sustainable Fashion
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'sustainable-fashion'),
    (SELECT id FROM public.brands WHERE slug = 'earthwear'),
    'ORGANIC-COTTON-TEE-001',
    'Organic Cotton T-Shirt',
    'organic-cotton-t-shirt',
    '100% organic cotton t-shirt made from sustainable materials',
    'Soft, comfortable, and sustainably made. This t-shirt is crafted from 100% organic cotton grown without harmful pesticides. Fair trade certified and ethically produced.',
    29.99,
    39.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Cotton"]',
    '["organic", "cotton", "sustainable", "fair-trade"]',
    NOW()
),
-- Clean Beauty
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'clean-beauty'),
    (SELECT id FROM public.brands WHERE slug = 'naturalglow'),
    'VITAMIN-C-SERUM-001',
    'Vitamin C Brightening Serum',
    'vitamin-c-brightening-serum',
    'Natural vitamin C serum for glowing skin',
    'Formulated with 20% vitamin C, hyaluronic acid, and natural antioxidants. This serum helps brighten skin, reduce dark spots, and promote collagen production. Cruelty-free and vegan.',
    34.99,
    44.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Vitamin C", "Hyaluronic Acid", "Natural Antioxidants"]',
    '["vitamin-c", "serum", "natural", "cruelty-free"]',
    NOW()
),
-- Home & Living
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'home-living'),
    (SELECT id FROM public.brands WHERE slug = 'homegreen'),
    'BAMBOO-CUTLERY-001',
    'Bamboo Cutlery Set',
    'bamboo-cutlery-set',
    'Eco-friendly bamboo cutlery set for on-the-go dining',
    'Complete set of bamboo cutlery including fork, knife, spoon, and chopsticks. Comes in a convenient carrying case. Perfect for picnics, camping, or daily use to reduce plastic waste.',
    15.99,
    19.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Bamboo", "Natural Finish"]',
    '["bamboo", "cutlery", "eco-friendly", "portable"]',
    NOW()
),
-- Recycled Products
(
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'recycled'),
    (SELECT id FROM public.brands WHERE slug = 'recyclepro'),
    'RECYCLED-BAG-001',
    'Recycled Plastic Tote Bag',
    'recycled-plastic-tote-bag',
    'Durable tote bag made from recycled plastic bottles',
    'This sturdy tote bag is made from 100% recycled plastic bottles. Water-resistant, machine washable, and perfect for shopping, beach trips, or daily use. Each bag saves 6 plastic bottles from landfills.',
    19.99,
    24.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Recycled Plastic Bottles"]',
    '["recycled", "plastic", "tote-bag", "eco-friendly"]',
    NOW()
)
ON CONFLICT (sku) DO NOTHING;

-- Insert product images
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order, created_at) VALUES
-- Bamboo Water Bottle Images
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'Bamboo Water Bottle - Front View', true, 1, NOW()),
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 'Bamboo Water Bottle - Side View', false, 2, NOW()),
-- Beeswax Wraps Images
((SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'), 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', 'Beeswax Food Wraps Set', true, 1, NOW()),
-- Solar Charger Images
((SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'), 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500', 'Solar Phone Charger', true, 1, NOW()),
-- Organic Soap Images
((SELECT id FROM public.products WHERE sku = 'ORGANIC-SOAP-001'), 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 'Organic Lavender Soap', true, 1, NOW()),
-- Organic Cotton T-Shirt Images
((SELECT id FROM public.products WHERE sku = 'ORGANIC-COTTON-TEE-001'), 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Organic Cotton T-Shirt', true, 1, NOW()),
-- Vitamin C Serum Images
((SELECT id FROM public.products WHERE sku = 'VITAMIN-C-SERUM-001'), 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 'Vitamin C Brightening Serum', true, 1, NOW()),
-- Bamboo Cutlery Images
((SELECT id FROM public.products WHERE sku = 'BAMBOO-CUTLERY-001'), 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', 'Bamboo Cutlery Set', true, 1, NOW()),
-- Recycled Tote Bag Images
((SELECT id FROM public.products WHERE sku = 'RECYCLED-BAG-001'), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Recycled Plastic Tote Bag', true, 1, NOW());

-- Insert product inventory
INSERT INTO public.product_inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold, created_at) VALUES
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), 'BAMBOO-BOTTLE-001', 50, 0, 10, NOW()),
((SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'), 'BEESWAX-WRAPS-001', 30, 0, 5, NOW()),
((SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'), 'SOLAR-CHARGER-001', 25, 0, 5, NOW()),
((SELECT id FROM public.products WHERE sku = 'ORGANIC-SOAP-001'), 'ORGANIC-SOAP-001', 100, 0, 20, NOW()),
((SELECT id FROM public.products WHERE sku = 'ORGANIC-COTTON-TEE-001'), 'ORGANIC-COTTON-TEE-001', 75, 0, 15, NOW()),
((SELECT id FROM public.products WHERE sku = 'VITAMIN-C-SERUM-001'), 'VITAMIN-C-SERUM-001', 40, 0, 8, NOW()),
((SELECT id FROM public.products WHERE sku = 'BAMBOO-CUTLERY-001'), 'BAMBOO-CUTLERY-001', 60, 0, 12, NOW()),
((SELECT id FROM public.products WHERE sku = 'RECYCLED-BAG-001'), 'RECYCLED-BAG-001', 35, 0, 7, NOW());

-- Insert product sustainability scores
INSERT INTO public.product_sustainability_scores (product_id, carbon_footprint, water_usage, recyclability_score, ethical_sourcing_score, overall_sustainability_score, created_at) VALUES
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), 2.5, 1.2, 9.0, 8.5, 8.2, NOW()),
((SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'), 1.8, 0.8, 9.5, 9.0, 8.8, NOW()),
((SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'), 3.2, 2.1, 7.5, 7.0, 7.4, NOW()),
((SELECT id FROM public.products WHERE sku = 'ORGANIC-SOAP-001'), 1.5, 0.9, 8.5, 9.5, 8.6, NOW()),
((SELECT id FROM public.products WHERE sku = 'ORGANIC-COTTON-TEE-001'), 4.1, 3.2, 6.0, 9.0, 7.5, NOW()),
((SELECT id FROM public.products WHERE sku = 'VITAMIN-C-SERUM-001'), 2.8, 1.5, 7.0, 8.0, 7.8, NOW()),
((SELECT id FROM public.products WHERE sku = 'BAMBOO-CUTLERY-001'), 1.2, 0.5, 9.5, 8.5, 8.9, NOW()),
((SELECT id FROM public.products WHERE sku = 'RECYCLED-BAG-001'), 2.0, 1.0, 9.0, 7.5, 8.1, NOW());

-- Insert some sample orders (optional - for testing order functionality)
INSERT INTO public.orders (
    buyer_id,
    order_number,
    status,
    payment_status,
    fulfillment_status,
    subtotal,
    tax_amount,
    shipping_amount,
    total_amount,
    currency,
    created_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'ORD-001',
    'confirmed',
    'paid',
    'fulfilled',
    44.98,
    3.60,
    5.99,
    54.57,
    'USD',
    NOW()
);

-- Insert order items
INSERT INTO public.order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    total_price,
    fulfillment_status,
    created_at
) VALUES
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-001'),
    (SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'),
    1,
    24.99,
    24.99,
    'delivered',
    NOW()
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-001'),
    (SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'),
    1,
    18.99,
    18.99,
    'delivered',
    NOW()
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that data was inserted successfully
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM public.brands
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM public.product_images
UNION ALL
SELECT 'Product Inventory', COUNT(*) FROM public.product_inventory
UNION ALL
SELECT 'Product Sustainability Scores', COUNT(*) FROM public.product_sustainability_scores
UNION ALL
SELECT 'Orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM public.order_items;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Sample data setup completed!
-- Your database now has:
-- ✅ 8 Categories
-- ✅ 8 Brands  
-- ✅ 8 Sample products with images, inventory, and sustainability scores
-- ✅ Sample orders and order items
-- ✅ All necessary data for backend API testing

-- Next steps:
-- 1. Test the backend API endpoints
-- 2. Verify frontend integration
-- 3. Test AI service functionality
