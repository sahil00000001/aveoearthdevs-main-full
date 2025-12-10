-- Minimal Database Setup to Fix Auth and Workflow Errors
-- This file adds essential data to prevent 500 errors and enable workflows

-- 1. Add a test user (buyer)
INSERT INTO users (
    id, email, first_name, last_name, user_type, 
    is_active, is_email_verified, is_phone_verified, created_at, updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test.customer@example.com',
    'Test',
    'Customer',
    'buyer',
    true,
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Add a test vendor (supplier)
INSERT INTO users (
    id, email, first_name, last_name, user_type,
    is_active, is_email_verified, is_phone_verified, created_at, updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'test.vendor@example.com',
    'Test',
    'Vendor',
    'supplier',
    true,
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. Add supplier business profile
INSERT INTO supplier_businesses (
    id, supplier_id, business_name, business_type, tax_id, 
    business_registration_number, is_verified, created_at, updated_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Test Eco Store',
    'retail',
    'TAX123456789',
    'REG987654321',
    true,
    NOW(),
    NOW()
) ON CONFLICT (supplier_id) DO NOTHING;

-- 4. Add a test product
INSERT INTO products (
    id, supplier_id, name, slug, sku, short_description, description,
    category_id, brand_id, price, compare_at_price, cost_per_item,
    track_quantity, weight, materials, care_instructions, origin_country,
    status, visibility, created_at, updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'Eco Bamboo Water Bottle',
    'eco-bamboo-water-bottle',
    'BAMBOO-BOTTLE-001',
    'Sustainable bamboo water bottle for eco-conscious consumers',
    'Keep hydrated with our premium eco-friendly bamboo water bottle. Made from 100% sustainable bamboo, this bottle is perfect for daily use and helps reduce plastic waste.',
    '550e8400-e29b-41d4-a716-446655440001', -- Home & Living
    '660e8400-e29b-41d4-a716-446655440001', -- EcoTech
    29.99,
    39.99,
    15.00,
    true,
    0.5,
    '["bamboo", "stainless steel", "silicone"]',
    'Hand wash with mild soap, air dry completely',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 5. Add product inventory
INSERT INTO product_inventories (
    id, product_id, variant_id, quantity, reserved_quantity,
    low_stock_threshold, created_at, updated_at
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    100,
    0,
    10,
    NOW(),
    NOW()
) ON CONFLICT (product_id, variant_id) DO NOTHING;

-- 6. Add a test cart
INSERT INTO carts (
    id, user_id, session_id, status, created_at, updated_at
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'test-session-123',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO NOTHING;

-- 7. Add a test cart item
INSERT INTO cart_items (
    id, cart_id, product_id, variant_id, quantity, unit_price,
    created_at, updated_at
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    2,
    29.99,
    NOW(),
    NOW()
) ON CONFLICT (cart_id, product_id, variant_id) DO NOTHING;

-- 8. Add a test order
INSERT INTO orders (
    id, user_id, order_number, status, total_amount, currency,
    billing_address, shipping_address, payment_method, created_at, updated_at
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'ORD-2024-001',
    'pending',
    59.98,
    'INR',
    '{"first_name": "Test", "last_name": "Customer", "address_line_1": "123 Test Street", "city": "Test City", "state": "Test State", "postal_code": "12345", "country": "India", "phone": "+91-9876543210"}',
    '{"first_name": "Test", "last_name": "Customer", "address_line_1": "123 Test Street", "city": "Test City", "state": "Test State", "postal_code": "12345", "country": "India", "phone": "+91-9876543210"}',
    'credit_card',
    NOW(),
    NOW()
) ON CONFLICT (order_number) DO NOTHING;

-- 9. Add order items
INSERT INTO order_items (
    id, order_id, product_id, variant_id, supplier_id, quantity,
    unit_price, total_price, fulfillment_status, created_at, updated_at
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    '22222222-2222-2222-2222-222222222222',
    2,
    29.99,
    59.98,
    'pending',
    NOW(),
    NOW()
) ON CONFLICT (order_id, product_id, variant_id) DO NOTHING;

-- 10. Add user activity for analytics
INSERT INTO user_activities (
    id, user_id, session_id, activity_type, activity_data,
    page_url, created_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'test-session-123',
    'page_view',
    '{"page": "products", "category": "home-living"}',
    '/products',
    NOW()
) ON CONFLICT DO NOTHING;

-- 11. Add user behavior profile
INSERT INTO user_behavior_profiles (
    id, user_id, preferred_categories, shopping_frequency,
    average_order_value, preferred_price_range, created_at, updated_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '["home-living", "sustainable-fashion"]',
    'monthly',
    50.00,
    '{"min": 10, "max": 100}',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Update sequences to avoid conflicts
SELECT setval('users_id_seq', 1000);
SELECT setval('products_id_seq', 1000);
SELECT setval('orders_id_seq', 1000);
