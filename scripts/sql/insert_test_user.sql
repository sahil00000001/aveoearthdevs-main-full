-- Insert test user directly into public.users table
-- Run this in Supabase SQL Editor
-- User ID: 7a6261c9-bcef-4e3a-b8d1-6e590ce0ceef
-- Email: cart_test_buyer@test.com

INSERT INTO public.users (
    id,
    email,
    phone,
    user_type,
    first_name,
    last_name,
    is_verified,
    is_active,
    is_email_verified,
    is_phone_verified,
    created_at,
    updated_at
) VALUES (
    '7a6261c9-bcef-4e3a-b8d1-6e590ce0ceef'::uuid,
    'cart_test_buyer@test.com',
    '+10000000000',
    'buyer',
    'Test',
    'User',
    true,
    true,
    true,
    false,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    user_type = EXCLUDED.user_type,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active,
    is_email_verified = EXCLUDED.is_email_verified,
    is_phone_verified = EXCLUDED.is_phone_verified,
    updated_at = now();

-- Verify the user was inserted
SELECT id, email, user_type, is_active FROM public.users WHERE id = '7a6261c9-bcef-4e3a-b8d1-6e590ce0ceef';


