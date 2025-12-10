-- =====================================================
-- MINIMAL TEST DATA - FIXED VERSION
-- =====================================================
-- This version works around the users table foreign key constraint
-- by only inserting data that doesn't require a user reference

-- =====================================================
-- 1. CATEGORIES TABLE (No dependencies)
-- =====================================================
INSERT INTO public.categories (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Eco-Friendly',
    'eco-friendly',
    'Environmentally conscious products',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. BRANDS TABLE (No dependencies)
-- =====================================================
INSERT INTO public.brands (
    id,
    name,
    slug,
    description,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'GreenTest',
    'greentest',
    'Sustainable testing brand',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. PRODUCTS TABLE (Requires existing user)
-- =====================================================
-- Note: This will only work if you have an existing user in auth.users
-- You'll need to replace the supplier_id with an actual user ID

-- First, let's check if there are any existing users
-- SELECT id, email FROM auth.users LIMIT 1;

-- If you have a user, uncomment and modify this section:
-- INSERT INTO public.products (
--     id,
--     supplier_id,
--     category_id,
--     brand_id,
--     sku,
--     name,
--     slug,
--     short_description,
--     description,
--     price,
--     compare_at_price,
--     status,
--     approval_status,
--     visibility,
--     published_at,
--     materials,
--     tags,
--     created_at
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000003',
--     'YOUR-EXISTING-USER-ID-HERE',  -- Replace with actual user ID
--     '00000000-0000-0000-0000-000000000001',
--     '00000000-0000-0000-0000-000000000002',
--     'TEST-PRODUCT-001',
--     'Test Eco Product',
--     'test-eco-product',
--     'A test product for upload testing',
--     'This is a test product to verify that the product upload system is working correctly.',
--     29.99,
--     39.99,
--     'active',
--     'approved',
--     'visible',
--     NOW(),
--     '["Test Material", "Eco-Friendly"]',
--     '["test", "eco-friendly", "sustainable"]',
--     NOW()
-- ) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Check what we have so far
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM public.brands
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Run this SQL first to create categories and brands
-- 2. Check if you have any users in auth.users: SELECT id, email FROM auth.users LIMIT 1;
-- 3. If you have a user, uncomment the products section and replace the user ID
-- 4. If you don't have a user, create one through Supabase Auth first
-- 5. Then run the products section with the correct user ID

-- =====================================================
-- ALTERNATIVE: CREATE USER THROUGH SUPABASE AUTH
-- =====================================================
-- If you don't have any users, you can create one through:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" 
-- 3. Create a user with email/password
-- 4. Copy the user ID and use it in the products section above
