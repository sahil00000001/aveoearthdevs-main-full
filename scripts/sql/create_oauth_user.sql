-- Create user in public.users from auth.users
-- Run this in Supabase SQL Editor
-- Replace the user_id and email with your actual values

-- For user: 40b6897a-fef0-4394-b2dd-e92a7cacfd04 (bhavikmalik100706@gmail.com)
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
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.phone, '+10000000000') as phone,
    COALESCE(
        LOWER(au.raw_user_meta_data->>'user_type'),
        LOWER(au.raw_user_meta_data->>'role'),
        'buyer'
    ) as user_type,
    COALESCE(
        au.raw_user_meta_data->>'first_name',
        SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'), ' ', 1)
    ) as first_name,
    COALESCE(
        au.raw_user_meta_data->>'last_name',
        CASE 
            WHEN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') LIKE '% %' 
            THEN SUBSTRING(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') FROM POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')) + 1)
            ELSE ''
        END
    ) as last_name,
    COALESCE(au.email_confirmed_at IS NOT NULL, false) as is_verified,
    true as is_active,
    COALESCE(au.email_confirmed_at IS NOT NULL, false) as is_email_verified,
    false as is_phone_verified,
    COALESCE(au.created_at, NOW()) as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id = '40b6897a-fef0-4394-b2dd-e92a7cacfd04'
AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, first_name, last_name, user_type, is_active
FROM public.users
WHERE id = '40b6897a-fef0-4394-b2dd-e92a7cacfd04';

