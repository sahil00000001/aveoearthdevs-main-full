-- Fix addresses.type column to be NOT NULL with default value
-- Run this in Supabase SQL Editor

-- Make type column NOT NULL with default value
ALTER TABLE public.addresses 
ALTER COLUMN type SET DEFAULT 'billing',
ALTER COLUMN type SET NOT NULL;

-- Update any existing NULL values to 'billing'
UPDATE public.addresses 
SET type = 'billing' 
WHERE type IS NULL;

-- Verify the column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'addresses'
AND column_name = 'type';


