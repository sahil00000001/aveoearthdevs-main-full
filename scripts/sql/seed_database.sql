-- Seed Database with Test Data
-- Run this in Supabase SQL Editor

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Home & Living', 'home-living', 'Sustainable home and living products', true, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Kitchen & Dining', 'kitchen-dining', 'Eco-friendly kitchen essentials', true, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Personal Care', 'personal-care', 'Natural personal care products', true, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Fashion & Accessories', 'fashion-accessories', 'Sustainable fashion items', true, 4, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Office & Stationery', 'office-stationery', 'Eco-friendly office supplies', true, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Brands
INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at)
VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'EcoLife', 'ecolife', 'Leading sustainable living brand', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', 'GreenChoice', 'greenchoice', 'Affordable eco-friendly products', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', 'NaturalEssentials', 'naturalessentials', 'Pure natural products', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', 'SustainableStyle', 'sustainablestyle', 'Fashion that cares', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440005', 'EarthFirst', 'earthfirst', 'Planet-friendly choices', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create a test vendor user (if not exists)
-- Note: This creates a database record only, not a Supabase auth user
-- For full testing, use an actual signed-up vendor account
DO $$
DECLARE
    test_vendor_id UUID := '770e8400-e29b-41d4-a716-446655440001';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = test_vendor_id) THEN
        INSERT INTO users (id, email, user_type, first_name, last_name, is_active, referral_code, created_at, updated_at)
        VALUES (
            test_vendor_id,
            'test_vendor@example.com',
            'supplier',
            'Test',
            'Vendor',
            true,
            'VENDOR1',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- 4. Insert Sample Products
INSERT INTO products (
    id, name, slug, sku, short_description, description,
    category_id, brand_id, supplier_id,
    price, compare_at_price, cost_per_item,
    weight, materials, care_instructions, origin_country,
    status, visibility, track_quantity, low_stock_threshold,
    created_at, updated_at
)
VALUES
    (
        '880e8400-e29b-41d4-a716-446655440001',
        'Bamboo Toothbrush Set',
        'bamboo-toothbrush-set',
        'BTB-001',
        'Eco-friendly bamboo toothbrush 4-pack',
        'Made from 100% sustainable bamboo with charcoal-infused bristles. Perfect for the whole family.',
        '550e8400-e29b-41d4-a716-446655440003',
        '660e8400-e29b-41d4-a716-446655440003',
        '770e8400-e29b-41d4-a716-446655440001',
        19.99, 29.99, 10.00,
        0.2, 'Bamboo, Charcoal bristles', 'Rinse after use, air dry', 'India',
        'active', 'visible', true, 10,
        NOW(), NOW()
    ),
    (
        '880e8400-e29b-41d4-a716-446655440002',
        'Stainless Steel Water Bottle',
        'stainless-steel-water-bottle',
        'SSWB-001',
        'Insulated 750ml water bottle',
        'Double-walled stainless steel keeps drinks cold for 24h or hot for 12h. BPA-free.',
        '550e8400-e29b-41d4-a716-446655440001',
        '660e8400-e29b-41d4-a716-446655440001',
        '770e8400-e29b-41d4-a716-446655440001',
        34.99, 44.99, 18.00,
        0.5, 'Stainless Steel 304', 'Hand wash recommended', 'China',
        'active', 'visible', true, 15,
        NOW(), NOW()
    ),
    (
        '880e8400-e29b-41d4-a716-446655440003',
        'Reusable Beeswax Food Wraps',
        'reusable-beeswax-food-wraps',
        'BFW-001',
        'Set of 3 eco food wraps',
        'Replace plastic wrap with these sustainable beeswax-coated cotton wraps. Reusable for up to a year.',
        '550e8400-e29b-41d4-a716-446655440002',
        '660e8400-e29b-41d4-a716-446655440002',
        '770e8400-e29b-41d4-a716-446655440001',
        24.99, 34.99, 12.00,
        0.1, 'Organic cotton, Beeswax', 'Cold water wash only', 'USA',
        'active', 'visible', true, 20,
        NOW(), NOW()
    ),
    (
        '880e8400-e29b-41d4-a716-446655440004',
        'Organic Cotton Tote Bag',
        'organic-cotton-tote-bag',
        'OCTB-001',
        'Reusable shopping bag',
        'Sturdy organic cotton tote bag perfect for grocery shopping or daily use. Replaces thousands of plastic bags.',
        '550e8400-e29b-41d4-a716-446655440004',
        '660e8400-e29b-41d4-a716-446655440004',
        '770e8400-e29b-41d4-a716-446655440001',
        14.99, 19.99, 7.00,
        0.15, 'Organic Cotton', 'Machine washable', 'India',
        'active', 'visible', true, 30,
        NOW(), NOW()
    ),
    (
        '880e8400-e29b-41d4-a716-446655440005',
        'Recycled Paper Notebook',
        'recycled-paper-notebook',
        'RPN-001',
        'A5 lined notebook',
        '100% recycled paper notebook with 200 pages. Perfect for journaling, notes, or sketching.',
        '550e8400-e29b-41d4-a716-446655440005',
        '660e8400-e29b-41d4-a716-446655440005',
        '770e8400-e29b-41d4-a716-446655440001',
        12.99, 16.99, 6.00,
        0.3, 'Recycled Paper', 'Keep dry', 'Germany',
        'active', 'visible', true, 50,
        NOW(), NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Product Inventory
INSERT INTO product_inventory (product_id, quantity, reserved_quantity, created_at, updated_at)
SELECT id, 100, 0, NOW(), NOW()
FROM products
WHERE id IN (
    '880e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440004',
    '880e8400-e29b-41d4-a716-446655440005'
)
ON CONFLICT (product_id) DO NOTHING;

-- Verify the seeded data
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories WHERE is_active = true
UNION ALL
SELECT 'Brands', COUNT(*) FROM brands WHERE is_active = true
UNION ALL
SELECT 'Products', COUNT(*) FROM products WHERE status = 'active'
UNION ALL
SELECT 'Inventory', COUNT(*) FROM product_inventory;






