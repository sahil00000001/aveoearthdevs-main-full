-- =====================================================
-- SIMPLE USER_TYPE COLUMN FIX
-- This script just adds the missing user_type column
-- =====================================================

-- First, let's see what columns actually exist in the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Create the user_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
        RAISE NOTICE 'Created user_type enum';
    ELSE
        RAISE NOTICE 'user_type enum already exists';
    END IF;
END $$;

-- Add the user_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN user_type user_type DEFAULT 'buyer' NOT NULL;
        RAISE NOTICE 'Added user_type column to users table';
    ELSE
        RAISE NOTICE 'user_type column already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test inserting a user with user_type
DO $$
BEGIN
    RAISE NOTICE 'Testing user_type column...';
    -- This will fail if the column doesn't exist
    PERFORM user_type FROM users LIMIT 1;
    RAISE NOTICE 'user_type column is working!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'user_type column test failed: %', SQLERRM;
END $$;

SELECT 'Simple user_type column fix completed' as status;
