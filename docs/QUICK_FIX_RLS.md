# 🚨 QUICK FIX: RLS Permission Denied (403 Error)

## Problem
Getting 403 "permission denied for table users" even with service role key.

## IMMEDIATE FIX (Run in Supabase SQL Editor)

1. **Go to**: Supabase Dashboard → SQL Editor
2. **Copy and paste** this SQL:

```sql
-- Grant explicit permissions to service_role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.carts TO service_role;
GRANT ALL ON public.cart_items TO service_role;
GRANT ALL ON public.wishlists TO service_role;

-- Create explicit policy for service_role
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

3. **Click "Run"**

## Alternative: Temporarily Disable RLS (Development Only)

**⚠️ Only for development/testing!**

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable after testing:**
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

## After Running Fix

1. **Create test user**:
   ```bash
   python scripts/create_test_user_via_admin.py --email cart_test_buyer@test.com --password Test123!@# --reset-password
   ```

2. **Test cart**:
   ```bash
   node tests/test_cart_with_existing_user.js
   ```

## Why This Happens

Supabase RLS (Row Level Security) can block even service_role if:
- Policies aren't configured correctly
- Grants aren't set up
- Service role key isn't recognized

The fix above ensures service_role has full access to the users table.


