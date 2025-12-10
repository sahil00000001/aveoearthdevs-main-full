-- Convert orders table enum columns to VARCHAR to match the model
-- Run this in Supabase SQL Editor

-- Convert status, payment_status, fulfillment_status from enum to VARCHAR
ALTER TABLE public.orders 
ALTER COLUMN status TYPE VARCHAR(50) USING status::text,
ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text,
ALTER COLUMN fulfillment_status TYPE VARCHAR(50) USING fulfillment_status::text;

-- Verify columns were converted
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name IN ('status', 'payment_status', 'fulfillment_status')
ORDER BY column_name;


