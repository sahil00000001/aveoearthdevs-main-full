-- Insert vendor test user directly into public.users table
-- Run this in Supabase SQL Editor
-- User ID: deb1b9a0-5f8f-446b-ba82-0dc8bd096a04
-- Email: vendor_test@test.com

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
    'deb1b9a0-5f8f-446b-ba82-0dc8bd096a04'::uuid,
    'vendor_test@test.com',
    '+1234567890',
    'supplier',
    'Test',
    'Vendor',
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
SELECT id, email, user_type, is_active FROM public.users WHERE id = 'deb1b9a0-5f8f-446b-ba82-0dc8bd096a04';


