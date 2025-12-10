# Fixing Supabase Rate Limits and RLS Issues

## Problem Summary

1. **Rate Limiting**: Supabase rate limits signup/authentication endpoints
2. **RLS Permission Denied**: Even with service role key, getting 403 when accessing `users` table

## Solutions

### Solution 1: Use Admin API Script (Bypasses Rate Limits)

Run this script to create test users via Admin API:

```bash
python scripts/create_test_user_via_admin.py --email cart_test_buyer@test.com --password Test123!@# --type buyer
```

Or reset password for existing user:
```bash
python scripts/create_test_user_via_admin.py --email cart_test_buyer@test.com --password Test123!@# --reset-password
```

### Solution 2: Fix RLS Policies (CRITICAL)

The service role key is getting 403 permission denied errors. You need to run the RLS fix SQL script in Supabase Dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Run `scripts/sql/fix_all_rls_and_schema.sql`
3. This will:
   - Enable RLS on tables
   - Create policies for service_role to bypass RLS
   - Grant necessary permissions

**Key SQL Commands**:
```sql
-- Allow service_role to manage all users (bypasses RLS)
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

### Solution 3: Temporarily Disable RLS (Development Only)

**⚠️ Only for development/testing!**

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable after testing!**

### Solution 4: Check Service Role Key Permissions

Verify your service role key has proper permissions:
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (not `anon` key)
3. Ensure it's set in `backend/.env` as `SUPABASE_SERVICE_ROLE_KEY`

## Current Status

- ✅ Rate limit bypass: Admin API script created
- ⚠️ RLS issue: Service role getting 403 - need to run SQL fix script
- ✅ User authentication: Working (users exist in auth.users)
- ❌ User creation in public.users: Blocked by RLS (403 error)

## Next Steps

1. **Run RLS fix SQL script** in Supabase Dashboard
2. **Create test user** via Admin API script
3. **Test cart functionality** - should work after RLS fix

## Testing After Fix

```bash
# Create test user
python scripts/create_test_user_via_admin.py --email test@test.com --password Test123!@# --type buyer

# Test cart
node tests/test_cart_with_existing_user.js
```


