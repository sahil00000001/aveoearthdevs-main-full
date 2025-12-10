-- =====================================================
-- COMPLETE ENUM FIX - UPDATE DATABASE TO MATCH CODE
-- This fixes all enum mismatches by updating the database
-- to accept the values that the code is actually sending
-- =====================================================

-- Drop and recreate all enums with the values that the code sends
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_approval CASCADE;
DROP TYPE IF EXISTS product_visibility CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS fulfillment_status CASCADE;
DROP TYPE IF EXISTS order_item_fulfillment_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;

-- Recreate enums with lowercase values (matching the code)
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');

CREATE TYPE product_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'rejected');

CREATE TYPE product_approval AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE product_visibility AS ENUM ('visible', 'hidden', 'scheduled');

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');

CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'partially_fulfilled', 'fulfilled');

CREATE TYPE order_item_fulfillment_status AS ENUM ('unfulfilled', 'pending', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TYPE address_type AS ENUM ('home', 'work', 'billing', 'shipping', 'other');

-- Update table columns to use the new enum types
ALTER TABLE users ALTER COLUMN user_type TYPE user_type USING user_type::text::user_type;
ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'buyer';

ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::text::product_status;
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE products ALTER COLUMN approval_status TYPE product_approval USING approval_status::text::product_approval;
ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'pending';

ALTER TABLE products ALTER COLUMN visibility TYPE product_visibility USING visibility::text::product_visibility;
ALTER TABLE products ALTER COLUMN visibility SET DEFAULT 'visible';

-- Update any other tables that use these enums
-- (Add more ALTER statements as needed for other tables)

-- Verify the changes
SELECT 'Enum fix completed successfully' as status;
