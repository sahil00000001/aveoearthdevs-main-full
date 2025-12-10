-- Fix Supabase RLS Policies to Allow Public Read Access to Products
-- Run this in your Supabase SQL Editor to fix the permission issues

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;

-- Create a new policy that allows public SELECT access to active and approved products
CREATE POLICY "Allow public read access to active products" ON public.products
    FOR SELECT 
    USING (
        (status = 'active' OR status IS NULL) 
        AND (approval_status = 'approved' OR approval_status IS NULL)
    );

-- Alternative: If you want to allow ALL products to be readable (even pending ones)
-- Uncomment this instead of the above:
/*
CREATE POLICY "Allow public read access to all products" ON public.products
    FOR SELECT 
    USING (true);
*/

-- Also fix categories if needed
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT 
    USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;



