-- Create a PostgreSQL function that can insert products and bypass RLS
-- This function runs with SECURITY DEFINER, so it executes with the privileges of the function creator
-- Run this in Supabase SQL Editor

-- First, create the function
CREATE OR REPLACE FUNCTION insert_product_bulk(
    p_id UUID,
    p_name VARCHAR,
    p_sku VARCHAR,
    p_slug VARCHAR,
    p_price DECIMAL(12, 2),
    p_short_description TEXT,
    p_description TEXT,
    p_category_id UUID,
    p_brand_id UUID,
    p_supplier_id UUID,
    p_status VARCHAR,
    p_approval_status VARCHAR,
    p_visibility VARCHAR,
    p_tags JSONB,
    p_created_at TIMESTAMP,
    p_updated_at TIMESTAMP
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product_id UUID;
    v_default_category_id UUID;
    v_supplier_exists BOOLEAN;
BEGIN
    -- Verify supplier exists - must exist in auth.users (foreign key constraint)
    -- No auto-creation - supplier must be created via Supabase Auth first
    -- For DEBUG mode, ensure the supplier exists in Supabase Auth before calling RPC
    SELECT EXISTS(SELECT 1 FROM users WHERE id = p_supplier_id) INTO v_supplier_exists;
    IF NOT v_supplier_exists THEN
        RAISE EXCEPTION 'Supplier with id % does not exist. Please ensure the supplier exists in Supabase Auth and has a profile in the users table.', p_supplier_id;
    END IF;
    
    -- category_id is required - users must choose from existing categories
    -- No auto-creation or fallback to "Uncategorized"
    IF p_category_id IS NULL THEN
        RAISE EXCEPTION 'category_id is required. Please provide a valid category_id from existing categories.';
    END IF;
    
    INSERT INTO products (
        id, name, sku, slug, price, short_description, description,
        category_id, brand_id, supplier_id, status, approval_status, visibility,
        tags, created_at, updated_at
    ) VALUES (
        p_id, p_name, p_sku, p_slug, p_price, p_short_description, p_description,
        p_category_id, p_brand_id, p_supplier_id, 
        p_status::product_status, 
        p_approval_status::product_approval, 
        p_visibility::product_visibility,
        p_tags, p_created_at, p_updated_at
    ) RETURNING id INTO v_product_id;
    
    RETURN v_product_id;
END;
$$;

-- Grant execute permission to service_role and authenticated users
GRANT EXECUTE ON FUNCTION insert_product_bulk TO service_role;
GRANT EXECUTE ON FUNCTION insert_product_bulk TO authenticated;
GRANT EXECUTE ON FUNCTION insert_product_bulk TO anon;

-- Verify the function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'insert_product_bulk';

