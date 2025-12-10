# Backend Environment Configuration Guide

## 📋 **What is API Prefix?**

**API Prefix** (`VITE_BACKEND_API_PREFIX`) is an optional configuration that adds a path prefix to all API routes.

- **If empty**: Routes are accessed directly at the backend URL
  - Example: `http://localhost:8080/health`, `http://localhost:8080/products`
  
- **If set to `/api/v1`**: All routes are prefixed
  - Example: `http://localhost:8080/api/v1/health`, `http://localhost:8080/api/v1/products`

**Current Setup**: Leave it empty (`VITE_BACKEND_API_PREFIX=`) - this is correct for your setup.

---

## 🔧 **Backend `.env` File Configuration**

Your backend needs a `.env` file in the `backend/` directory with the following variables:

### **Required Configuration**

```env
# ===========================================
# DATABASE CONFIGURATION (REQUIRED)
# ===========================================
# Format: postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
# Get the password from Supabase Dashboard -> Settings -> Database -> Database password
# Get PROJECT_REF from your Supabase URL (the part before .supabase.co)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@ylhvdwizcsoelpreftpy.supabase.co:5432/postgres?sslmode=require

# ===========================================
# SUPABASE CONFIGURATION (REQUIRED)
# ===========================================
# Get these from Supabase Dashboard -> Settings -> API
SUPABASE_URL=https://ylhvdwizcsoelpreftpy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE  # Get from Supabase Dashboard -> Settings -> API
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET_HERE  # Get from Supabase Dashboard -> Settings -> API -> JWT Secret
SUPABASE_JWKS_URL=https://ylhvdwizcsoelpreftpy.supabase.co/auth/v1/jwks
SUPABASE_AUDIENCE=authenticated
SUPABASE_ISSUER=https://ylhvdwizcsoelpreftpy.supabase.co/auth/v1

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=INFO
DEBUG=true
CORS_ORIGINS=["http://localhost:5176","http://localhost:8080"]

# ===========================================
# PAGINATION
# ===========================================
PAGINATION_LIMIT=20
PAGINATION_MAX_LIMIT=100

# ===========================================
# JWT CONFIGURATION
# ===========================================
JWT_CACHE_TTL=3600
```

---

## 📝 **Step-by-Step Setup**

### **1. Verify Your Supabase URL**

Check which Supabase URL is correct:
- First image showed: `ylhvdwizcsoelpreftpy.supabase.co`
- Second image showed: `vlbydwizccoolpreftpy.supabase.co`

**Verify in Supabase Dashboard**: Go to Settings -> API -> Project URL

---

### **2. Get Database Password**

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Copy your **Database password**
4. If you forgot it, you can reset it from the same page

---

### **3. Get Service Role Key**

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Under **Project API keys**, find **`service_role`** (not `anon`)
4. Copy the **service_role** key (⚠️ **Keep this secret!**)

---

### **4. Get JWT Secret**

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **JWT Settings**
4. Copy the **JWT Secret**

---

### **5. Create/Update `backend/.env` File**

1. Create a file named `.env` in the `backend/` directory
2. Copy the template above
3. Replace all placeholders:
   - `YOUR_DB_PASSWORD` → Your database password
   - `YOUR_SERVICE_ROLE_KEY_HERE` → Your service role key
  -urls → Your correct Supabase project URL
   - Verify the Supabase URL matches your project

---

### **6. Verify Supabase URL Consistency**

Make sure all these match across all `.env` files:

- **Frontend** (`frontend1/.env.local`):
  ```
  VITE_SUPABASE_URL=https://[YOUR_CORRECT_PROJECT].supabase.co
  VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
  ```

- **Backend** (`backend/.env`):
  ```
  SUPABASE_URL=https://[YOUR_CORRECT_PROJECT].supabase.co".
  SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
  DATABASE_URL=postgresql://postgres:[PASSWORD]@[YOUR_CORRECT_PROJECT].supabase.co:5432/postgres?sslmode=require
  ```

**Important**: The PROJECT_REF (the part before `.supabase.co`) must be the same everywhere!

---

## ✅ **Verification Checklist**

After setting up the `.env` file:

- [ ] `DATABASE_URL` format is correct (includes `?sslmode=require`)
- [ ] `SUPABASE_URL` matches your project URL
- [ ] `SUPABASE_ANON_KEY` matches the frontend `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (not empty)
- [ ] `SUPABASE_JWT_SECRET` is set (not empty)
- [ ] All Supabase URLs use the same PROJECT_REF

---

## 🔍 **Troubleshooting**

### **Error: `[Errno 10061] Connect call failed`**
- **Cause**: Backend trying to connect to localhost:5432 (local PostgreSQL)
- **Fix**: Set `DATABASE_URL` to point to Supabase (see above)

### **Error: `Tenant or user not found`**
- **Cause**: Wrong database password or incorrect PROJECT_REF in DATABASE_URL
- **Fix**: Verify password in Supabase Dashboard and update `DATABASE_URL`

### **Error: `signature verification failed` (Supabase Storage)**
- **Cause**: Wrong `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
- **Fix**: Get the correct keys from Supabase Dashboard -> Settings -> API

### **Error: `permission denied for table users`**
- **Cause**: RLS policies not set up (already fixed with SQL scripts)
- **Fix**: Verify RLS policies are applied (run `fix_rls_policies.sql`)

---

## 🚀 **Next Steps**

1. Create/update `backend/.env` with correct values
2. Restart the backend server
3. Test the connection: `http://localhost:8080/health` should return 200 OK
4. Check backend logs for any remaining errors
5. Test Google OAuth signup again

---

## 📌 **Quick Reference**

**Supabase Dashboard Locations:**
- **Database Password**: Settings → Database → Database password
- **API Keys**: Settings → API → Project API keys
- **JWT Secret**: Settings → API → JWT Settings → JWT Secret
- **Project URL**: Settings → API → Project URL

