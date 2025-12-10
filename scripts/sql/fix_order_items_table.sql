-- Fix order_items table to add missing fulfillment_status column
-- Run this in Supabase SQL Editor

-- Add fulfillment_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items' 
        AND column_name = 'fulfillment_status'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled';
    END IF;
END $$;

-- Verify column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'order_items'
AND column_name = 'fulfillment_status';


