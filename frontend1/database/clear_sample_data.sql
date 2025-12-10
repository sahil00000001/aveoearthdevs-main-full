-- =====================================================
-- CLEAR ALL SAMPLE DATA FROM SUPABASE
-- =====================================================
-- This script removes all sample data and resets the database
-- to a clean state for production use

-- Disable RLS temporarily for cleanup
ALTER TABLE public.product_sustainability_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Clear all sample data (in correct order due to foreign key constraints)
DELETE FROM public.product_sustainability_scores;
DELETE FROM public.product_inventory;
DELETE FROM public.product_images;
DELETE FROM public.products;
DELETE FROM public.brands;
DELETE FROM public.categories;

-- Keep users table but clear any sample admin users
-- (Only clear if they have sample emails - keep real users)
DELETE FROM public.users 
WHERE email IN (
  'admin@aveoearth.com',
  'sample@example.com',
  'test@test.com'
);

-- Re-enable RLS
ALTER TABLE public.product_sustainability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Reset sequences to start from 1 (only if they exist)
DO $$
BEGIN
    -- Try to reset sequences if they exist
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'categories_id_seq') THEN
        ALTER SEQUENCE public.categories_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'brands_id_seq') THEN
        ALTER SEQUENCE public.brands_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE public.products_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'product_images_id_seq') THEN
        ALTER SEQUENCE public.product_images_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'product_inventory_id_seq') THEN
        ALTER SEQUENCE public.product_inventory_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'product_sustainability_scores_id_seq') THEN
        ALTER SEQUENCE public.product_sustainability_scores_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Verify cleanup
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
SELECT 'Users', COUNT(*) FROM public.users;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- All sample data has been removed
-- Database is now ready for production use
-- Users can sign up as vendors and add their own products
