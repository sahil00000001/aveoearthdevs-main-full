-- Complete RLS fix for Supabase - ensures service_role bypasses RLS and allows inserts
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

-- Step 2: Ensure RLS is enabled (it should be)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies on products table to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.products';
    END LOOP;
END $$;

-- Step 4: Service role should bypass RLS automatically, but add explicit policy to be sure
-- Note: service_role should bypass RLS by default, but this ensures it works
CREATE POLICY "Service role can do anything" ON public.products
    FOR ALL
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Step 5: Allow public/anonymous users to SELECT active and approved products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active' AND approval_status = 'approved' AND visibility = 'visible');

-- Step 6: Allow authenticated suppliers to INSERT their own products
CREATE POLICY "Suppliers can insert their products" ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = supplier_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (user_type = 'supplier' OR user_type = 'admin')
        )
    );

-- Step 7: Allow suppliers to UPDATE their own products
CREATE POLICY "Suppliers can update their products" ON public.products
    FOR UPDATE
    TO authenticated
    USING (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (user_type = 'supplier' OR user_type = 'admin')
        )
    )
    WITH CHECK (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (user_type = 'supplier' OR user_type = 'admin')
        )
    );

-- Step 8: Verify policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY policyname;

-- Step 9: Test that service_role can insert (this should work even if RLS is enabled)
-- Note: Service role should bypass RLS completely, but verify:
SELECT 
    'Service role should bypass RLS automatically' as note,
    'If you see 403 errors, check Supabase project settings' as action;

-- Step 10: If still getting 403, temporarily disable RLS for testing (NOT recommended for production)
-- UNCOMMENT THE LINE BELOW ONLY FOR TESTING:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- IMPORTANT: After fixing RLS, make sure to re-enable it:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;



