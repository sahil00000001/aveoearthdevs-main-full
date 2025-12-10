# 🔐 Google OAuth Configuration Guide

## Current Status
- ✅ Environment variables are set
- ✅ Supabase connection is working
- ❌ Google OAuth is not configured in Supabase
- ❌ Frontend and Backend servers need to be started

## Step 1: Configure Google OAuth in Supabase

### 1.1 Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `ylhvdwizcsoelpreftpy`
3. Go to **Authentication** → **Providers**

### 1.2 Enable Google Provider
1. Find **Google** in the providers list
2. Click **Enable**
3. You'll need Google OAuth credentials

### 1.3 Get Google OAuth Credentials

#### Option A: Use Existing Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://ylhvdwizcsoelpreftpy.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)

#### Option B: Quick Setup (Recommended for Testing)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "AveoEarth Auth"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs as above

### 1.4 Configure Supabase
1. Copy **Client ID** and **Client Secret** from Google Cloud Console
2. Paste them into Supabase Google provider settings
3. Save the configuration

## Step 2: Update Frontend Configuration

### 2.1 Environment Variables
The `.env.local` file should contain:
```env
VITE_SUPABASE_URL=https://ylhvdwizcsoelpreftpy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g
```

### 2.2 OAuth Redirect Configuration
Update the Supabase client configuration to handle OAuth redirects properly.

## Step 3: Test Authentication

### 3.1 Start Services
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend1
npm run dev
```

### 3.2 Test Authentication
1. Go to: http://localhost:5173/auth-test
2. Run comprehensive tests
3. Test Google sign-in
4. Check console for errors

## Step 4: Fix Common Issues

### 4.1 CORS Issues
If you get CORS errors, ensure:
- Supabase redirect URIs are correctly configured
- Frontend URL is added to allowed origins

### 4.2 Redirect Issues
If redirects don't work:
- Check redirect URIs in Google Cloud Console
- Ensure Supabase callback URL is correct
- Verify frontend URL in Supabase settings

### 4.3 Session Issues
If sessions don't persist:
- Check Supabase auth settings
- Verify cookie settings
- Ensure HTTPS in production

## Step 5: Production Configuration

### 5.1 Update Redirect URIs
For production, add:
- `https://yourdomain.com/auth/callback`
- `https://yourdomain.com/`

### 5.2 Environment Variables
Update production environment variables:
```env
VITE_SUPABASE_URL=https://ylhvdwizcsoelpreftpy.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
```

## Testing Checklist

- [ ] Google OAuth enabled in Supabase
- [ ] Google Cloud Console credentials configured
- [ ] Redirect URIs added
- [ ] Frontend server running
- [ ] Backend server running
- [ ] Auth test page accessible
- [ ] Google sign-in working
- [ ] User profile creation working
- [ ] Session persistence working

## Debugging

### Check Supabase Auth Settings
```sql
-- Check if users table exists
SELECT * FROM auth.users LIMIT 1;

-- Check user profiles
SELECT * FROM public.users LIMIT 1;
```

### Check Frontend Console
1. Open browser dev tools
2. Go to Console tab
3. Look for authentication errors
4. Check Network tab for failed requests

### Check Backend Logs
Look for authentication-related errors in backend console output.

## Quick Fix Commands

```bash
# Start all services
cd backend && python main.py &
cd frontend1 && npm run dev &

# Test authentication
curl http://localhost:5173/auth-test

# Check Supabase connection
curl -H "apikey: YOUR_SUPABASE_KEY" https://ylhvdwizcsoelpreftpy.supabase.co/rest/v1/
```

## Support

If you encounter issues:
1. Check the auth test page: http://localhost:5173/auth-test
2. Review the test results
3. Check browser console for errors
4. Verify Supabase dashboard settings
5. Ensure all services are running

---

**Next Steps:**
1. Configure Google OAuth in Supabase dashboard
2. Start frontend and backend services
3. Test authentication at http://localhost:5173/auth-test
4. Verify Google sign-in works
5. Check all authentication flows
