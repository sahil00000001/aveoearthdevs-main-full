-- Fix wishlists table to add missing created_at and updated_at columns
-- Run this in Supabase SQL Editor

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.wishlists ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.wishlists ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add id column if it doesn't exist (for BaseUUID)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists' 
        AND column_name = 'id'
    ) THEN
        ALTER TABLE public.wishlists ADD COLUMN id UUID DEFAULT uuid_generate_v4();
        -- Make it a primary key if the table doesn't have a composite primary key
        -- Note: wishlists has composite PK (user_id, product_id), so id is just for BaseUUID compatibility
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'wishlists'
ORDER BY ordinal_position;

