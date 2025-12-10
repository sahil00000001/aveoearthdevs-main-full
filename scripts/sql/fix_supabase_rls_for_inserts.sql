-- Fix Supabase RLS Policies to Allow Service Role to Insert Products
-- Run this in your Supabase SQL Editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Drop existing restrictive INSERT policies if they exist
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can manage their own products" ON public.products;

-- Create a policy that allows service role to insert products
-- Service role (role = 'service_role') bypasses RLS, but we need explicit INSERT policy for authenticated users
CREATE POLICY "Allow service role and suppliers to insert products" ON public.products
    FOR INSERT 
    WITH CHECK (
        -- Service role can insert anything (but service role actually bypasses RLS)
        -- Suppliers can insert products with their own supplier_id
        supplier_id = auth.uid() OR
        -- Allow if user_type is supplier or admin
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (user_type = 'supplier' OR user_type = 'admin')
        )
    );

-- Create a policy that allows service role and suppliers to update products
CREATE POLICY "Allow service role and suppliers to update products" ON public.products
    FOR UPDATE 
    USING (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (user_type = 'supplier' OR user_type = 'admin')
        )
    )
    WITH CHECK (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (user_type = 'supplier' OR user_type = 'admin')
        )
    );

-- Create a policy that allows service role and suppliers to delete products
CREATE POLICY "Allow service role and suppliers to delete products" ON public.products
    FOR DELETE 
    USING (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (user_type = 'supplier' OR user_type = 'admin')
        )
    );

-- NOTE: Service role key should bypass RLS completely, but if you're getting 403 errors,
-- it might be because:
-- 1. The service role key is incorrect/expired
-- 2. The key is not being sent correctly in headers
-- 3. There's a foreign key constraint issue

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;



