-- Fix payments table to add missing columns and fix enum types
-- Run this in Supabase SQL Editor

-- Add gateway_transaction_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN gateway_transaction_id VARCHAR(255);
    END IF;
END $$;

-- Convert status column from enum to VARCHAR if it's an enum type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'status'
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.payments 
        ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
    END IF;
END $$;

-- Add gateway_response column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'gateway_response'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN gateway_response JSONB;
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'payments'
ORDER BY ordinal_position;


