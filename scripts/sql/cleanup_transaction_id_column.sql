-- Optional cleanup: Remove duplicate transaction_id column from payments table
-- This is optional since gateway_transaction_id is the one being used
-- Run this in Supabase SQL Editor if you want to clean up

-- Check if transaction_id column exists and has no data
DO $$
BEGIN
    -- Only drop if it exists and gateway_transaction_id also exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'transaction_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'gateway_transaction_id'
    ) THEN
        -- Copy any data from transaction_id to gateway_transaction_id if gateway_transaction_id is NULL
        UPDATE public.payments 
        SET gateway_transaction_id = transaction_id 
        WHERE transaction_id IS NOT NULL 
        AND gateway_transaction_id IS NULL;
        
        -- Drop the old column
        ALTER TABLE public.payments DROP COLUMN transaction_id;
        
        RAISE NOTICE 'Dropped duplicate transaction_id column from payments table';
    ELSE
        RAISE NOTICE 'transaction_id column does not exist or gateway_transaction_id is missing';
    END IF;
END $$;

