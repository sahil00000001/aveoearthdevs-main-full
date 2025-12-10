# Fixing Supabase Rate Limiting

## Problem
Supabase has rate limiting on signup/authentication endpoints to prevent abuse. When too many signups occur in a short time, you'll see errors like:
```
"Registration failed: email rate limit exceeded. Please try again later"
```

## Solutions

### Solution 1: Use Admin API to Create Test Users (Recommended)
The Admin API with service role key bypasses rate limits. Use the provided script:

```bash
# Create a test buyer user
python scripts/create_test_user_via_admin.py --email cart_test_buyer@test.com --password Test123!@# --type buyer

# Create a test supplier user
python scripts/create_test_user_via_admin.py --email test_supplier@test.com --password Test123!@# --type supplier
```

This script:
- ✅ Bypasses rate limits (uses service role key)
- ✅ Creates user in `auth.users` table
- ✅ Creates user in `public.users` table
- ✅ Auto-confirms email (no verification needed)

### Solution 2: Wait for Rate Limit to Reset
Rate limits typically reset after:
- **1-4 hours** for normal rate limits
- **24 hours** for severe rate limits

You can check if rate limit is still active by trying to signup and seeing the error.

### Solution 3: Disable Rate Limiting Temporarily (Supabase Dashboard)
**⚠️ Only for development/testing!**

1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Rate Limiting" section
3. Temporarily disable or increase limits
4. **Remember to re-enable for production!**

### Solution 4: Use Existing Test Users
Instead of creating new users, use existing ones:

```bash
# Test with existing user
export TEST_USER_EMAIL="existing_user@test.com"
export TEST_USER_PASSWORD="password123"
node tests/test_cart_iterative.js
```

## Testing After Creating User

Once you've created a test user via Admin API:

```bash
# Test cart functionality
node tests/test_cart_iterative.js

# Test 10-step workflow
node tests/test_10_workflows.js
```

## Backend Code
The backend already uses Admin API for signup (in `auth_crud.py`), but rate limits can still occur if:
1. Too many requests hit the Admin API
2. Supabase has additional rate limits on Admin API
3. Network issues cause retries

## Best Practices
1. **Use Admin API script** for creating test users
2. **Reuse test users** instead of creating new ones
3. **Wait between tests** to avoid hitting limits
4. **Monitor rate limits** in Supabase dashboard

## Checking Rate Limit Status
```bash
# Try signup and check response
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#","user_type":"buyer"}'
```

If you see rate limit error, use Solution 1 (Admin API script) to create users.


