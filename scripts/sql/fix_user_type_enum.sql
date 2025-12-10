-- Fix user_type enum to match what the code is sending
-- The code is sending uppercase values but database expects lowercase

-- First, let's check what values exist in the current enum
-- Then update the enum to accept both cases or fix the code

-- Option 1: Update the enum to accept uppercase values
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'BUYER';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'SUPPLIER'; 
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'ADMIN';

-- Option 2: Or create a new enum with uppercase values
-- DROP TYPE IF EXISTS user_type_new CASCADE;
-- CREATE TYPE user_type_new AS ENUM ('BUYER', 'SUPPLIER', 'ADMIN');
-- ALTER TABLE users ALTER COLUMN user_type TYPE user_type_new USING user_type::text::user_type_new;
-- DROP TYPE user_type CASCADE;
-- ALTER TYPE user_type_new RENAME TO user_type;

-- For now, let's just add the uppercase values to the existing enum
-- This is a temporary fix until we can properly align the code and database
