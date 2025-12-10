-- Fix orders table to add missing status columns
-- Run this in Supabase SQL Editor

-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_status') THEN
        CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'partially_fulfilled', 'fulfilled');
    END IF;
END $$;

-- Add status columns if they don't exist
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN status order_status DEFAULT 'pending';
    END IF;
    
    -- Add payment_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_status payment_status DEFAULT 'pending';
    END IF;
    
    -- Add fulfillment_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'fulfillment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN fulfillment_status fulfillment_status DEFAULT 'unfulfilled';
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name IN ('status', 'payment_status', 'fulfillment_status')
ORDER BY column_name;


