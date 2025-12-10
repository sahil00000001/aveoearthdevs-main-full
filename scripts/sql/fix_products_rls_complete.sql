-- Complete RLS fix for products table to allow service_role and bulk inserts
-- Run this in Supabase SQL Editor

-- 1. Ensure service_role can bypass RLS for all operations
-- Note: service_role should already bypass RLS, but we'll create explicit policies

-- Drop existing restrictive policies that might block inserts
DROP POLICY IF EXISTS "Enable insert for service_role" ON products;
DROP POLICY IF EXISTS "Enable all for service_role" ON products;
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Service role full access" ON products;

-- Create policy to allow service_role to do everything (shouldn't be needed but ensures it works)
CREATE POLICY "Service role full access" 
ON products 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to read visible products
CREATE POLICY "Public read visible products"
ON products
FOR SELECT
TO authenticated, anon
USING (visibility = 'visible' AND status = 'active' AND approval_status = 'approved');

-- Allow suppliers to insert their own products
CREATE POLICY "Suppliers can insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = supplier_id::text);

-- Allow suppliers to update their own products
CREATE POLICY "Suppliers can update own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid()::text = supplier_id::text)
WITH CHECK (auth.uid()::text = supplier_id::text);

-- Verify RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON products TO service_role;
GRANT SELECT, INSERT, UPDATE ON products TO authenticated;

-- Verify policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;



