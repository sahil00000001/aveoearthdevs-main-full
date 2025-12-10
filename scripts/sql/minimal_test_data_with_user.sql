-- =====================================================
-- MINIMAL TEST DATA - WITH USER CREATION
-- =====================================================
-- This version creates a user through Supabase Auth and then uses it

-- =====================================================
-- STEP 1: CREATE USER THROUGH SUPABASE AUTH
-- =====================================================
-- Go to Supabase Dashboard > Authentication > Users
-- Click "Add user" and create a user with:
-- Email: test@example.com
-- Password: testpassword123
-- Copy the user ID that gets generated

-- =====================================================
-- STEP 2: INSERT INTO USERS TABLE
-- =====================================================
-- Replace 'YOUR-USER-ID-HERE' with the actual user ID from step 1
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
    'YOUR-USER-ID-HERE',  -- Replace with actual user ID from Supabase Auth
    'test@example.com',
    'supplier',
    'Test',
    'Supplier',
    true,
    true,
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: INSERT SUPPLIER BUSINESS
-- =====================================================
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
    '00000000-0000-0000-0000-000000000001',
    'YOUR-USER-ID-HERE',  -- Replace with actual user ID
    'EcoTest Solutions',
    'Retailer',
    'contact@ecotest.com',
    '+919876543210',
    'https://ecotest.com',
    'Testing sustainable products for the future.',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 4: INSERT CATEGORY
-- =====================================================
INSERT INTO public.categories (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Eco-Friendly',
    'eco-friendly',
    'Environmentally conscious products',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: INSERT BRAND
-- =====================================================
INSERT INTO public.brands (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'GreenTest',
    'greentest',
    'Sustainable testing brand',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 6: INSERT PRODUCT
-- =====================================================
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
    '00000000-0000-0000-0000-000000000004',
    'YOUR-USER-ID-HERE',  -- Replace with actual user ID
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
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

-- =====================================================
-- STEP 7: INSERT PRODUCT IMAGE
-- =====================================================
INSERT INTO public.product_images (
    id,
    product_id,
    image_url,
    alt_text,
    is_primary,
    sort_order,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
    'Test Eco Product Image',
    true,
    1,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: INSERT PRODUCT INVENTORY
-- =====================================================
INSERT INTO public.product_inventory (
    id,
    product_id,
    quantity,
    reserved_quantity,
    low_stock_threshold,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000004',
    100,
    0,
    10,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 9: INSERT PRODUCT SUSTAINABILITY SCORE
-- =====================================================
INSERT INTO public.product_sustainability_scores (
    id,
    product_id,
    overall_score,
    carbon_footprint,
    water_usage,
    recyclability_score,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000004',
    85,
    2.5,
    1.2,
    90,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
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
-- INSTRUCTIONS
-- =====================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" and create a user with email: test@example.com
-- 3. Copy the user ID that gets generated
-- 4. Replace 'YOUR-USER-ID-HERE' with the actual user ID in this SQL
-- 5. Run this SQL in Supabase SQL Editor
-- 6. Verify all records were inserted correctly
