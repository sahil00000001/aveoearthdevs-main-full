-- =====================================================
-- COMPREHENSIVE RLS AND SCHEMA FIX FOR SUPABASE
-- This script fixes RLS policies for wishlists, carts, and users
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure wishlists table has correct structure (composite primary key)
-- Check if wishlists table exists and has correct structure
DO $$
BEGIN
    -- Create wishlists table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'wishlists'
    ) THEN
        CREATE TABLE public.wishlists (
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (user_id, product_id)
        );
    END IF;
    
    -- Ensure it has the correct columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists' 
        AND column_name = 'added_at'
    ) THEN
        ALTER TABLE public.wishlists 
        ADD COLUMN added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 2: Enable RLS on all relevant tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing wishlist policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'wishlists'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.wishlists';
    END LOOP;
END $$;

-- Step 4: Drop existing cart policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'carts'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.carts';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'cart_items'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.cart_items';
    END LOOP;
END $$;

-- Step 5: Create wishlist policies
-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist" ON public.wishlists
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to their own wishlist" ON public.wishlists
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own wishlist
CREATE POLICY "Users can delete from their own wishlist" ON public.wishlists
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow public/anonymous users to view products (for browsing)
-- This is handled by products table policies, but ensure it exists
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active' AND approval_status = 'approved' AND visibility = 'visible');

-- Step 6: Create cart policies
-- Users can view their own cart
CREATE POLICY "Users can view their own cart" ON public.carts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create their own cart
CREATE POLICY "Users can create their own cart" ON public.carts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update their own cart" ON public.carts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart
CREATE POLICY "Users can delete their own cart" ON public.carts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Step 7: Create cart_items policies
-- Users can view items in their own cart
CREATE POLICY "Users can view their cart items" ON public.cart_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_items.cart_id AND user_id = auth.uid()
        )
    );

-- Users can add items to their own cart
CREATE POLICY "Users can add items to their cart" ON public.cart_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_items.cart_id AND user_id = auth.uid()
        )
    );

-- Users can update items in their own cart
CREATE POLICY "Users can update their cart items" ON public.cart_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_items.cart_id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_items.cart_id AND user_id = auth.uid()
        )
    );

-- Users can delete items from their own cart
CREATE POLICY "Users can delete their cart items" ON public.cart_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_items.cart_id AND user_id = auth.uid()
        )
    );

-- Step 8: Ensure users table allows inserts (for user creation)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
        AND cmd = 'INSERT'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Allow users to insert their own data (when they sign up via backend)
CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow service_role to do anything (bypasses RLS automatically, but explicit policy helps)
-- Note: service_role should bypass RLS automatically, but we add this for clarity
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage all wishlists" ON public.wishlists;
CREATE POLICY "Service role can manage all wishlists" ON public.wishlists
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage all carts" ON public.carts;
CREATE POLICY "Service role can manage all carts" ON public.carts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage all cart_items" ON public.cart_items;
CREATE POLICY "Service role can manage all cart_items" ON public.cart_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT ON public.products TO authenticated;

-- Step 10: Verify policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('wishlists', 'carts', 'cart_items', 'users')
ORDER BY tablename, policyname;

-- Step 11: Create indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wishlists_user_id') THEN
        CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wishlists_product_id') THEN
        CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_carts_user_id') THEN
        CREATE INDEX idx_carts_user_id ON public.carts(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cart_items_cart_id') THEN
        CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
    END IF;
END $$;

-- Step 12: Verify table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'wishlists'
ORDER BY ordinal_position;

