-- Complete fix for payments table
-- This script ensures the payments table exists with all required columns
-- Run this in Supabase SQL Editor

-- First, create the payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add gateway_transaction_id column (rename transaction_id if it exists)
DO $$
BEGIN
    -- Check if transaction_id exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'transaction_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.payments RENAME COLUMN transaction_id TO gateway_transaction_id;
    -- If gateway_transaction_id doesn't exist, add it
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN gateway_transaction_id VARCHAR(255);
    END IF;
END $$;

-- Add status column if it doesn't exist, or convert enum to VARCHAR
DO $$
BEGIN
    -- If status column doesn't exist, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    -- If status is an enum type, convert it to VARCHAR
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'status'
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.payments 
        ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
        ALTER TABLE public.payments 
        ALTER COLUMN status SET DEFAULT 'pending';
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

-- Add failure_reason column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'failure_reason'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN failure_reason TEXT;
    END IF;
END $$;

-- Add refund_amount column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'refund_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN refund_amount DECIMAL(12, 2) DEFAULT 0;
    END IF;
END $$;

-- Add processed_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'payments'
ORDER BY ordinal_position;

