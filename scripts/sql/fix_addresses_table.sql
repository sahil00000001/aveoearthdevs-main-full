-- Fix addresses table schema to match the model
-- Run this in Supabase SQL Editor

-- Check if addresses table exists, if not create it
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,  -- Use VARCHAR instead of enum to avoid issues
    is_default BOOLEAN DEFAULT FALSE,
    label VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    location GEOMETRY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If type column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'addresses' 
        AND column_name = 'type'
    ) THEN
        -- Check if address_type exists instead
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'addresses' 
            AND column_name = 'address_type'
        ) THEN
            -- Rename address_type to type
            ALTER TABLE public.addresses RENAME COLUMN address_type TO type;
        ELSE
            -- Add type column
            ALTER TABLE public.addresses ADD COLUMN type VARCHAR(50);
        END IF;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON public.addresses(type);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;

-- Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'addresses'
ORDER BY ordinal_position;


