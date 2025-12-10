-- =====================================================
-- FIX PRODUCTS TABLE SCHEMA
-- Add missing columns that the application expects
-- =====================================================

-- First, let's see what columns actually exist in the products table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Create missing enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'rejected');
        RAISE NOTICE 'Created product_status enum';
    ELSE
        RAISE NOTICE 'product_status enum already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_approval') THEN
        CREATE TYPE product_approval AS ENUM ('pending', 'approved', 'rejected');
        RAISE NOTICE 'Created product_approval enum';
    ELSE
        RAISE NOTICE 'product_approval enum already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_visibility') THEN
        CREATE TYPE product_visibility AS ENUM ('visible', 'hidden', 'scheduled');
        RAISE NOTICE 'Created product_visibility enum';
    ELSE
        RAISE NOTICE 'product_visibility enum already exists';
    END IF;
END $$;

-- Add missing columns to products table
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'status' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN status product_status DEFAULT 'draft' NOT NULL;
        RAISE NOTICE 'Added status column to products table';
    ELSE
        RAISE NOTICE 'status column already exists in products table';
    END IF;
    
    -- Add approval_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'approval_status' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN approval_status product_approval DEFAULT 'pending' NOT NULL;
        RAISE NOTICE 'Added approval_status column to products table';
    ELSE
        RAISE NOTICE 'approval_status column already exists in products table';
    END IF;
    
    -- Add visibility column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'visibility' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN visibility product_visibility DEFAULT 'hidden' NOT NULL;
        RAISE NOTICE 'Added visibility column to products table';
    ELSE
        RAISE NOTICE 'visibility column already exists in products table';
    END IF;
    
    -- Add supplier_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'supplier_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN supplier_id UUID REFERENCES users(id);
        RAISE NOTICE 'Added supplier_id column to products table';
    ELSE
        RAISE NOTICE 'supplier_id column already exists in products table';
    END IF;
    
    -- Add other missing columns that might be needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'slug' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN slug VARCHAR(255);
        RAISE NOTICE 'Added slug column to products table';
    ELSE
        RAISE NOTICE 'slug column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'short_description' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN short_description TEXT;
        RAISE NOTICE 'Added short_description column to products table';
    ELSE
        RAISE NOTICE 'short_description column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'compare_at_price' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN compare_at_price DECIMAL(10,2);
        RAISE NOTICE 'Added compare_at_price column to products table';
    ELSE
        RAISE NOTICE 'compare_at_price column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'cost_per_item' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN cost_per_item DECIMAL(10,2);
        RAISE NOTICE 'Added cost_per_item column to products table';
    ELSE
        RAISE NOTICE 'cost_per_item column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'track_quantity' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN track_quantity BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added track_quantity column to products table';
    ELSE
        RAISE NOTICE 'track_quantity column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'continue_selling' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN continue_selling BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added continue_selling column to products table';
    ELSE
        RAISE NOTICE 'continue_selling column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'materials' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN materials TEXT;
        RAISE NOTICE 'Added materials column to products table';
    ELSE
        RAISE NOTICE 'materials column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'care_instructions' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN care_instructions TEXT;
        RAISE NOTICE 'Added care_instructions column to products table';
    ELSE
        RAISE NOTICE 'care_instructions column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'origin_country' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN origin_country VARCHAR(100);
        RAISE NOTICE 'Added origin_country column to products table';
    ELSE
        RAISE NOTICE 'origin_country column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'manufacturing_details' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN manufacturing_details TEXT;
        RAISE NOTICE 'Added manufacturing_details column to products table';
    ELSE
        RAISE NOTICE 'manufacturing_details column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'approval_notes' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN approval_notes TEXT;
        RAISE NOTICE 'Added approval_notes column to products table';
    ELSE
        RAISE NOTICE 'approval_notes column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'approved_at' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN approved_at TIMESTAMP;
        RAISE NOTICE 'Added approved_at column to products table';
    ELSE
        RAISE NOTICE 'approved_at column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'approved_by' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN approved_by UUID REFERENCES users(id);
        RAISE NOTICE 'Added approved_by column to products table';
    ELSE
        RAISE NOTICE 'approved_by column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'published_at' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN published_at TIMESTAMP;
        RAISE NOTICE 'Added published_at column to products table';
    ELSE
        RAISE NOTICE 'published_at column already exists in products table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'seo_meta' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN seo_meta JSONB;
        RAISE NOTICE 'Added seo_meta column to products table';
    ELSE
        RAISE NOTICE 'seo_meta column already exists in products table';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test inserting a product to make sure it works
DO $$
DECLARE
    test_product_id UUID;
BEGIN
    RAISE NOTICE 'Testing product insertion...';
    
    -- Try to insert a test product
    INSERT INTO products (
        name, description, price, status, approval_status, visibility,
        created_at, updated_at
    ) VALUES (
        'Test Product', 'Test Description', 19.99, 'draft', 'pending', 'hidden',
        NOW(), NOW()
    ) RETURNING id INTO test_product_id;
    
    RAISE NOTICE 'Test product inserted successfully with ID: %', test_product_id;
    
    -- Clean up the test product
    DELETE FROM products WHERE id = test_product_id;
    RAISE NOTICE 'Test product cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Product insertion test failed: %', SQLERRM;
END $$;

SELECT 'Products table schema fix completed successfully!' as status;
