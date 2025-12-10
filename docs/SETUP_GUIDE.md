# 🚀 AveoEarth Setup Guide

This guide will help you set up all the environment files and API keys needed to run the complete AveoEarth platform.

## 📁 **Environment Files Created**

I've created `.env.example` files in each service directory. You need to copy these to `.env` and add your actual API keys.

## 🔧 **Setup Steps**

### **1. Backend Service** (`backend/`)

```bash
# Copy the example file
cd backend
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

**Required API Keys for Backend:**
- `DATABASE_URL` - Your PostgreSQL database connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_KEY` - Your Supabase service role key
- `SUPABASE_JWT_SECRET` - Your Supabase JWT secret

**Optional API Keys:**
- `WHATSAPP_API_TOKEN` - For WhatsApp notifications
- `GCP_PROJECT_ID` - For Google Cloud Storage
- `GCP_CREDENTIALS_JSON` - For Google Cloud Storage

### **2. AI Service** (`ai/`)

```bash
# Copy the example file
cd ai
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

**Required API Keys for AI Service:**
- `GEMINI_API_KEY` - Your Google Gemini API key (get from Google AI Studio)

### **3. Product Verification Service** (`product_verification/`)

```bash
# Copy the example file
cd product_verification
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

**Note:** This service doesn't require API keys as it uses CLIP model locally.

### **4. Frontend** (`frontend1/`)

```bash
# Copy the example file
cd frontend1
cp env.local.example .env.local

# Edit the .env.local file with your actual values
nano .env.local
```

**Required Configuration for Frontend:**
- `VITE_BACKEND_URL` - Backend API URL (usually http://localhost:8000)
- `VITE_AI_SERVICE_URL` - AI service URL (usually http://localhost:8002)
- `VITE_PRODUCT_VERIFICATION_URL` - Verification service URL (usually http://localhost:8001)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 🔑 **Where to Get API Keys**

### **Google Gemini API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key to `ai/.env`

### **Supabase Keys**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → `SUPABASE_URL`
   - Anon public key → `SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`

### **PostgreSQL Database**
1. Set up a PostgreSQL database (local or cloud)
2. Create a database named `aveoearth`
3. Get the connection string: `postgresql://username:password@host:port/database`

## 🚀 **Starting the Services**

### **1. Start Backend Service**
```bash
cd backend
uv run main.py
```
Backend will run on `http://localhost:8000`

### **2. Start AI Service**
```bash
cd ai
uv run main.py
```
AI service will run on `http://localhost:8002`

### **3. Start Product Verification Service**
```bash
cd product_verification
python main.py
```
Verification service will run on `http://localhost:8001`

### **4. Start Frontend**
```bash
cd frontend1
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## ✅ **Verification**

1. **Check Backend**: Visit `http://localhost:8000/health`
2. **Check AI Service**: Visit `http://localhost:8002/health`
3. **Check Verification**: Visit `http://localhost:8001/`
4. **Check Frontend**: Visit `http://localhost:5173`

## 🔧 **Environment File Locations**

```
aveoearthdevs/
├── backend/
│   ├── env.example          # ← Copy to .env
│   └── .env                 # ← Add your API keys here
├── ai/
│   ├── env.example          # ← Copy to .env
│   └── .env                 # ← Add GEMINI_API_KEY here
├── product_verification/
│   ├── env.example          # ← Copy to .env
│   └── .env                 # ← No API keys needed
└── frontend1/
    ├── env.local.example    # ← Copy to .env.local
    └── .env.local           # ← Add service URLs here
```

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Service not found" errors**
   - Check if all services are running
   - Verify the URLs in `frontend1/.env.local`

2. **"API key not found" errors**
   - Check if `.env` files exist in each service directory
   - Verify API keys are correctly set

3. **Database connection errors**
   - Check `DATABASE_URL` in `backend/.env`
   - Ensure PostgreSQL is running

4. **AI service not responding**
   - Check `GEMINI_API_KEY` in `ai/.env`
   - Verify the key is valid and has quota

## 📞 **Need Help?**

If you encounter any issues:
1. Check the service logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running on the correct ports
4. Check the ServiceStatus component in the frontend for connection status

---

**Ready to go! 🎉** Once you've added all the API keys, you'll have a fully integrated e-commerce platform with AI capabilities!
