-- =====================================================
-- AVEOTEARTH DATABASE TEST SCRIPT
-- Run this to verify your database setup is working correctly
-- =====================================================

-- =====================================================
-- TEST 1: CHECK TABLE CREATION
-- =====================================================

SELECT 'TEST 1: Table Creation Check' as test_name;

-- Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'user_profiles', 'addresses', 'categories', 'brands',
            'products', 'product_variants', 'product_images', 'product_inventory',
            'product_sustainability_scores', 'product_price_history', 'product_views',
            'product_reviews', 'wishlists', 'carts', 'cart_items', 'orders',
            'order_items', 'payments', 'shipments', 'returns', 'referrals',
            'supplier_businesses', 'product_verifications', 'ai_chat_sessions',
            'ai_chat_messages'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'user_profiles', 'addresses', 'categories', 'brands',
    'products', 'product_variants', 'product_images', 'product_inventory',
    'product_sustainability_scores', 'product_price_history', 'product_views',
    'product_reviews', 'wishlists', 'carts', 'cart_items', 'orders',
    'order_items', 'payments', 'shipments', 'returns', 'referrals',
    'supplier_businesses', 'product_verifications', 'ai_chat_sessions',
    'ai_chat_messages'
)
ORDER BY table_name;

-- =====================================================
-- TEST 2: CHECK ROW LEVEL SECURITY
-- =====================================================

SELECT 'TEST 2: Row Level Security Check' as test_name;

-- Check if RLS is enabled on all tables
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'user_profiles', 'addresses', 'categories', 'brands',
    'products', 'product_variants', 'product_images', 'product_inventory',
    'product_sustainability_scores', 'product_price_history', 'product_views',
    'product_reviews', 'wishlists', 'carts', 'cart_items', 'orders',
    'order_items', 'payments', 'shipments', 'returns', 'referrals',
    'supplier_businesses', 'product_verifications', 'ai_chat_sessions',
    'ai_chat_messages'
)
ORDER BY tablename;

-- =====================================================
-- TEST 3: CHECK INDEXES
-- =====================================================

SELECT 'TEST 3: Index Check' as test_name;

-- Check if important indexes exist
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_users_email', 'idx_users_user_type', 'idx_products_sku',
    'idx_products_status', 'idx_orders_user_id', 'idx_categories_slug'
)
ORDER BY tablename, indexname;

-- =====================================================
-- TEST 4: CHECK CUSTOM TYPES
-- =====================================================

SELECT 'TEST 4: Custom Types Check' as test_name;

-- Check if custom types exist
SELECT 
    typname as type_name,
    CASE 
        WHEN typname IN ('user_type', 'order_status', 'payment_status', 
                        'fulfillment_status', 'product_status', 'product_approval',
                        'product_visibility', 'address_type') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typname IN ('user_type', 'order_status', 'payment_status', 
                'fulfillment_status', 'product_status', 'product_approval',
                'product_visibility', 'address_type')
ORDER BY typname;

-- =====================================================
-- TEST 5: CHECK SAMPLE DATA
-- =====================================================

SELECT 'TEST 5: Sample Data Check' as test_name;

-- Check if sample data exists
SELECT 
    'Categories' as table_name, 
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END as status
FROM public.categories
UNION ALL
SELECT 
    'Brands', 
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END
FROM public.brands
UNION ALL
SELECT 
    'Users', 
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END
FROM public.users
UNION ALL
SELECT 
    'Products', 
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END
FROM public.products;

-- =====================================================
-- TEST 6: CHECK TRIGGERS
-- =====================================================

SELECT 'TEST 6: Triggers Check' as test_name;

-- Check if updated_at triggers exist
SELECT 
    trigger_name,
    event_object_table as table_name,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- =====================================================
-- TEST 7: CHECK RLS POLICIES
-- =====================================================

SELECT 'TEST 7: RLS Policies Check' as test_name;

-- Check if RLS policies exist
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'products', 'orders', 'categories')
ORDER BY tablename, policyname;

-- =====================================================
-- TEST 8: CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================

SELECT 'TEST 8: Foreign Key Constraints Check' as test_name;

-- Check if foreign key constraints exist
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN tc.constraint_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('products', 'orders', 'order_items', 'product_variants')
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- TEST 9: CHECK EXTENSIONS
-- =====================================================

SELECT 'TEST 9: Extensions Check' as test_name;

-- Check if required extensions are installed
SELECT 
    extname as extension_name,
    CASE 
        WHEN extname IN ('uuid-ossp', 'postgis') THEN '✅ INSTALLED'
        ELSE '❌ MISSING'
    END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'postgis')
ORDER BY extname;

-- =====================================================
-- TEST 10: PERFORMANCE TEST
-- =====================================================

SELECT 'TEST 10: Performance Test' as test_name;

-- Test basic queries performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM public.categories WHERE is_active = true;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM public.products WHERE status = 'active';

-- =====================================================
-- SUMMARY
-- =====================================================

SELECT 'SUMMARY: Database Setup Status' as test_name;

-- Overall health check
WITH health_check AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_enabled_tables,
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
        (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as custom_types,
        (SELECT COUNT(*) FROM public.categories) as categories_count,
        (SELECT COUNT(*) FROM public.brands) as brands_count,
        (SELECT COUNT(*) FROM public.users) as users_count
)
SELECT 
    'Total Tables: ' || total_tables as metric,
    CASE 
        WHEN total_tables >= 25 THEN '✅ GOOD'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM health_check
UNION ALL
SELECT 
    'RLS Enabled Tables: ' || rls_enabled_tables,
    CASE 
        WHEN rls_enabled_tables >= 25 THEN '✅ GOOD'
        ELSE '❌ NEEDS ATTENTION'
    END
FROM health_check
UNION ALL
SELECT 
    'Total Indexes: ' || total_indexes,
    CASE 
        WHEN total_indexes >= 50 THEN '✅ GOOD'
        ELSE '❌ NEEDS ATTENTION'
    END
FROM health_check
UNION ALL
SELECT 
    'Custom Types: ' || custom_types,
    CASE 
        WHEN custom_types >= 8 THEN '✅ GOOD'
        ELSE '❌ NEEDS ATTENTION'
    END
FROM health_check
UNION ALL
SELECT 
    'Sample Data: ' || (categories_count + brands_count + users_count),
    CASE 
        WHEN (categories_count + brands_count + users_count) > 0 THEN '✅ GOOD'
        ELSE '❌ NEEDS ATTENTION'
    END
FROM health_check;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'DATABASE TEST COMPLETED' as message;

-- If you see this message and most tests show ✅, your database is ready!
-- If you see ❌ for any tests, please check the setup guide and fix the issues.
