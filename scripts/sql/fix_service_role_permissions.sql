-- =====================================================
-- FIX SERVICE ROLE PERMISSIONS FOR USERS TABLE
-- Run this in Supabase SQL Editor to fix 403 errors
-- =====================================================

-- Step 1: Grant explicit permissions to service_role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.carts TO service_role;
GRANT ALL ON public.cart_items TO service_role;
GRANT ALL ON public.wishlists TO service_role;

-- Step 2: Ensure service_role can bypass RLS (should be automatic, but explicit policy helps)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create policy for service_role to manage all users
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 3: Verify RLS is enabled but service_role can bypass
-- (service_role should bypass RLS automatically, but we add explicit policy for clarity)

-- Step 4: If still having issues, you can temporarily disable RLS (development only)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 5: Verify permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND grantee = 'service_role';

-- Step 6: Check if service_role can access users table
-- You can test this by running a SELECT query with service_role key


