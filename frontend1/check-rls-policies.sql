-- Check if RLS is enabled and what policies exist
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled on products table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- Check existing policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- If no policies exist, create a policy to allow public read access to products
-- (Only run this if the above query shows no policies)
/*
CREATE POLICY "Allow public read access to products" ON public.products
FOR SELECT USING (true);
*/

-- Also check categories table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'categories';

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'categories';

-- If no policies exist for categories, create one too
/*
CREATE POLICY "Allow public read access to categories" ON public.categories
FOR SELECT USING (true);
*/
