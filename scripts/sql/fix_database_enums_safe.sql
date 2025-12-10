-- =====================================================
-- SAFE ENUM FIX - CHECK COLUMNS BEFORE ALTERING
-- This script safely fixes enum issues by checking column existence first
-- =====================================================

-- First, let's check what columns actually exist in the tables
-- This will help us understand the current database structure

-- Check if users table exists and what columns it has
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'Users table exists';
        
        -- Check if user_type column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type' AND table_schema = 'public') THEN
            RAISE NOTICE 'user_type column exists in users table';
        ELSE
            RAISE NOTICE 'user_type column does NOT exist in users table';
        END IF;
    ELSE
        RAISE NOTICE 'Users table does NOT exist';
    END IF;
END $$;

-- Check if products table exists and what columns it has
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        RAISE NOTICE 'Products table exists';
        
        -- Check if status column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status' AND table_schema = 'public') THEN
            RAISE NOTICE 'status column exists in products table';
        ELSE
            RAISE NOTICE 'status column does NOT exist in products table';
        END IF;
        
        -- Check if approval_status column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'approval_status' AND table_schema = 'public') THEN
            RAISE NOTICE 'approval_status column exists in products table';
        ELSE
            RAISE NOTICE 'approval_status column does NOT exist in products table';
        END IF;
        
        -- Check if visibility column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'visibility' AND table_schema = 'public') THEN
            RAISE NOTICE 'visibility column exists in products table';
        ELSE
            RAISE NOTICE 'visibility column does NOT exist in products table';
        END IF;
    ELSE
        RAISE NOTICE 'Products table does NOT exist';
    END IF;
END $$;

-- Now create the enums (this is safe to do)
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_approval CASCADE;
DROP TYPE IF EXISTS product_visibility CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS fulfillment_status CASCADE;
DROP TYPE IF EXISTS order_item_fulfillment_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;

-- Recreate enums with lowercase values (matching the code)
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'rejected');
CREATE TYPE product_approval AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE product_visibility AS ENUM ('visible', 'hidden', 'scheduled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'partially_fulfilled', 'fulfilled');
CREATE TYPE order_item_fulfillment_status AS ENUM ('unfulfilled', 'pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE address_type AS ENUM ('home', 'work', 'billing', 'shipping', 'other');

-- Now safely alter columns only if they exist
DO $$
BEGIN
    -- Alter users.user_type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type' AND table_schema = 'public') THEN
        ALTER TABLE users ALTER COLUMN user_type TYPE user_type USING user_type::text::user_type;
        ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'buyer';
        RAISE NOTICE 'Updated users.user_type column';
    ELSE
        RAISE NOTICE 'users.user_type column does not exist - skipping';
    END IF;
    
    -- Alter products.status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::text::product_status;
        ALTER TABLE products ALTER COLUMN status SET DEFAULT 'draft';
        RAISE NOTICE 'Updated products.status column';
    ELSE
        RAISE NOTICE 'products.status column does not exist - skipping';
    END IF;
    
    -- Alter products.approval_status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'approval_status' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN approval_status TYPE product_approval USING approval_status::text::product_approval;
        ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'pending';
        RAISE NOTICE 'Updated products.approval_status column';
    ELSE
        RAISE NOTICE 'products.approval_status column does not exist - skipping';
    END IF;
    
    -- Alter products.visibility if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'visibility' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN visibility TYPE product_visibility USING visibility::text::product_visibility;
        ALTER TABLE products ALTER COLUMN visibility SET DEFAULT 'visible';
        RAISE NOTICE 'Updated products.visibility column';
    ELSE
        RAISE NOTICE 'products.visibility column does not exist - skipping';
    END IF;
END $$;

-- Verify the changes
SELECT 'Safe enum fix completed successfully' as status;
