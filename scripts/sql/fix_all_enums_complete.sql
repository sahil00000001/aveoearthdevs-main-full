-- =====================================================
-- COMPLETE ENUM FIX - UPDATE DATABASE TO MATCH CODE
-- This fixes all enum mismatches by updating the database
-- to accept the uppercase values that the code is sending
-- =====================================================

-- Drop and recreate all enums with uppercase values to match the code
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_approval CASCADE;
DROP TYPE IF EXISTS product_visibility CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS fulfillment_status CASCADE;
DROP TYPE IF EXISTS order_item_fulfillment_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;

-- Recreate enums with uppercase values to match what the code sends
CREATE TYPE user_type AS ENUM ('BUYER', 'SUPPLIER', 'ADMIN');

CREATE TYPE product_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

CREATE TYPE product_approval AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE product_visibility AS ENUM ('VISIBLE', 'HIDDEN', 'SCHEDULED');

CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

CREATE TYPE fulfillment_status AS ENUM ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED');

CREATE TYPE order_item_fulfillment_status AS ENUM ('UNFULFILLED', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TYPE address_type AS ENUM ('HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER');

-- Update table columns to use the new enum types
ALTER TABLE users ALTER COLUMN user_type TYPE user_type USING user_type::text::user_type;
ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'BUYER';

ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::text::product_status;
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'DRAFT';

ALTER TABLE products ALTER COLUMN approval_status TYPE product_approval USING approval_status::text::product_approval;
ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'PENDING';

ALTER TABLE products ALTER COLUMN visibility TYPE product_visibility USING visibility::text::product_visibility;
ALTER TABLE products ALTER COLUMN visibility SET DEFAULT 'VISIBLE';

-- Update any other tables that use these enums
-- (Add more ALTER statements as needed for other tables)

-- Verify the changes
SELECT 'Enum fix completed successfully' as status;
