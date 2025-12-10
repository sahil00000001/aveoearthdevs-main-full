-- =====================================================
-- MINIMAL TEST DATA - 1 RECORD PER TABLE
-- Run this in Supabase SQL Editor to enable product upload testing
-- =====================================================

-- 1. Insert one test user (supplier)
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
    '00000000-0000-0000-0000-000000000001',
    'supplier@test.com',
    'supplier',
    'Test',
    'Supplier',
    true,
    true,
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert one test supplier business
INSERT INTO public.supplier_businesses (
    id,
    supplier_id,
    business_name,
    business_type,
    email,
    phone,
    website,
    description,
    is_verified,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'EcoTest Solutions',
    'Retailer',
    'contact@ecotest.com',
    '+919876543210',
    'https://ecotest.com',
    'Testing sustainable products for the future.',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert one test category
INSERT INTO public.categories (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Eco-Friendly',
    'eco-friendly',
    'Environmentally conscious products',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert one test brand
INSERT INTO public.brands (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'GreenTest',
    'greentest',
    'Sustainable testing brand',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert one test product (to verify the system works)
INSERT INTO public.products (
    id,
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
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    'TEST-PRODUCT-001',
    'Test Eco Product',
    'test-eco-product',
    'A test product for upload testing',
    'This is a test product to verify that the product upload system is working correctly.',
    29.99,
    39.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Test Material", "Eco-Friendly"]',
    '["test", "eco-friendly", "sustainable"]',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert one test product image
INSERT INTO public.product_images (
    id,
    product_id,
    image_url,
    alt_text,
    is_primary,
    sort_order,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000005',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    'Test Eco Product Image',
    true,
    1,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert one test product inventory
INSERT INTO public.product_inventory (
    id,
    product_id,
    quantity,
    reserved_quantity,
    low_stock_threshold,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000005',
    100,
    0,
    10,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert one test product sustainability score
INSERT INTO public.product_sustainability_scores (
    id,
    product_id,
    overall_score,
    carbon_footprint,
    water_usage,
    recyclability_score,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000005',
    85,
    2.5,
    1.2,
    90,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verification query - Check that all records were inserted
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Supplier Businesses', COUNT(*) FROM public.supplier_businesses
UNION ALL
SELECT 'Categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM public.brands
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM public.product_images
UNION ALL
SELECT 'Product Inventory', COUNT(*) FROM public.product_inventory
UNION ALL
SELECT 'Product Sustainability Scores', COUNT(*) FROM public.product_sustainability_scores;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- ✅ 1 User (supplier)
-- ✅ 1 Supplier Business
-- ✅ 1 Category (Eco-Friendly)
-- ✅ 1 Brand (GreenTest)
-- ✅ 1 Product (Test Eco Product)
-- ✅ 1 Product Image
-- ✅ 1 Product Inventory
-- ✅ 1 Product Sustainability Score
-- 
-- Now you can test product uploading!