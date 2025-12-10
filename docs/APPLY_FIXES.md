# Apply Authentication & Profile Fixes

## Steps to Fix All Issues

### 1. Run RLS Policies SQL
Run `fix_rls_policies.sql` in Supabase SQL Editor to enable Row Level Security and create policies that allow users to access their own data.

### 2. Run Profile Auto-Creation SQL  
Run `fix_profile_auto_creation.sql` in Supabase SQL Editor to:
- Create a trigger that automatically creates `user_profiles` when users sign up
- Backfill profiles for existing users without profiles

### 3. Update Frontend Environment
The frontend `.env.local` file cannot be created automatically. You need to create it manually with:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_BACKEND_API_PREFIX=
VITE_SUPABASE_URL=https://ylhvdwizcsoelpreftpy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g
VITE_AI_SERVICE_URL=http://localhost:8002
VITE_PRODUCT_VERIFICATION_URL=http://localhost:8001
```

### 4. Restart Frontend
After creating `.env.local`, restart the frontend dev server for changes to take effect.

### 5. Test
1. Clear browser cache/cookies
2. Sign in with Google OAuth
3. Check that profile loads correctly
4. Verify backend connection in auth debugger

## What Was Fixed

1. **Backend URL**: Updated default backend URL from port 8000 to 8080 in `backendApi.ts`
2. **RLS Policies**: Created policies allowing users to read/update their own data
3. **Profile Auto-Creation**: Added database trigger to auto-create profiles when users sign up
4. **Google OAuth Profile Creation**: Updated backend `google_signin` method to create profiles

## Files Changed
- `backend/app/features/auth/cruds/auth_crud.py` - Added profile creation for Google OAuth
- `frontend1/src/services/backendApi.ts` - Fixed default backend URL to port 8080
- `fix_rls_policies.sql` - New SQL file for RLS policies
- `fix_profile_auto_creation.sql` - New SQL file for auto-profile creation

