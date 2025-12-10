-- =====================================================
-- COMPLETE DATABASE SETUP AND ENUM FIX
-- This script sets up the database properly and fixes enum issues
-- =====================================================

-- Step 1: Check current database state
SELECT 'STEP 1: Checking current database state' as step;

-- Check if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'Users table exists';
    ELSE
        RAISE NOTICE 'Users table does NOT exist - will need to create it';
    END IF;
END $$;

-- Check if products table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        RAISE NOTICE 'Products table exists';
    ELSE
        RAISE NOTICE 'Products table does NOT exist - will need to create it';
    END IF;
END $$;

-- Step 2: Create enums (safe to do regardless of table state)
SELECT 'STEP 2: Creating enums' as step;

DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_approval CASCADE;
DROP TYPE IF EXISTS product_visibility CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS fulfillment_status CASCADE;
DROP TYPE IF EXISTS order_item_fulfillment_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;

-- Create enums with lowercase values (matching the code)
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'rejected');
CREATE TYPE product_approval AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE product_visibility AS ENUM ('visible', 'hidden', 'scheduled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'partially_fulfilled', 'fulfilled');
CREATE TYPE order_item_fulfillment_status AS ENUM ('unfulfilled', 'pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE address_type AS ENUM ('home', 'work', 'billing', 'shipping', 'other');

-- Step 3: Create users table if it doesn't exist
SELECT 'STEP 3: Creating users table if needed' as step;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(25) UNIQUE,
    user_type user_type DEFAULT 'buyer' NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    referral_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create products table if it doesn't exist
SELECT 'STEP 4: Creating products table if needed' as step;

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2),
    cost_per_item DECIMAL(12, 2),
    track_quantity BOOLEAN DEFAULT TRUE,
    continue_selling BOOLEAN DEFAULT FALSE,
    weight DECIMAL(8, 2),
    dimensions JSONB,
    materials JSONB DEFAULT '[]',
    care_instructions TEXT,
    origin_country VARCHAR(100),
    manufacturing_details JSONB,
    status product_status DEFAULT 'draft',
    approval_status product_approval DEFAULT 'pending',
    approval_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visibility product_visibility DEFAULT 'visible',
    published_at TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]',
    seo_meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Update existing columns if they exist
SELECT 'STEP 5: Updating existing columns' as step;

DO $$
BEGIN
    -- Update users.user_type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type' AND table_schema = 'public') THEN
        ALTER TABLE users ALTER COLUMN user_type TYPE user_type USING user_type::text::user_type;
        ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'buyer';
        RAISE NOTICE 'Updated users.user_type column';
    ELSE
        RAISE NOTICE 'users.user_type column does not exist - table may be new';
    END IF;
    
    -- Update products.status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::text::product_status;
        ALTER TABLE products ALTER COLUMN status SET DEFAULT 'draft';
        RAISE NOTICE 'Updated products.status column';
    ELSE
        RAISE NOTICE 'products.status column does not exist - table may be new';
    END IF;
    
    -- Update products.approval_status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'approval_status' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN approval_status TYPE product_approval USING approval_status::text::product_approval;
        ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'pending';
        RAISE NOTICE 'Updated products.approval_status column';
    ELSE
        RAISE NOTICE 'products.approval_status column does not exist - table may be new';
    END IF;
    
    -- Update products.visibility if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'visibility' AND table_schema = 'public') THEN
        ALTER TABLE products ALTER COLUMN visibility TYPE product_visibility USING visibility::text::product_visibility;
        ALTER TABLE products ALTER COLUMN visibility SET DEFAULT 'visible';
        RAISE NOTICE 'Updated products.visibility column';
    ELSE
        RAISE NOTICE 'products.visibility column does not exist - table may be new';
    END IF;
END $$;

-- Step 6: Verify the setup
SELECT 'STEP 6: Verification' as step;

-- Check if enums were created
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_type', 'product_status', 'product_approval', 'product_visibility')
GROUP BY typname
ORDER BY typname;

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'products') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products')
ORDER BY table_name;

SELECT 'Database setup and enum fix completed successfully!' as final_status;
