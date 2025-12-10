# 🚀 AveoEarth Production Setup Guide

This guide will help you set up AveoEarth for production use with no sample data.

## 📋 **Prerequisites**

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Supabase account
- Google Gemini API key

## 🗄️ **Step 1: Clear Sample Data from Supabase**

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Cleanup Script**
   ```sql
   -- Copy and paste the contents of frontend1/database/clear_sample_data.sql
   -- This will remove all sample data and reset sequences
   ```

3. **Verify Cleanup**
   - Check that all tables are empty (except users)
   - Verify sequences are reset to 1

## 🔑 **Step 2: Set Up Environment Variables**

### **Backend Service** (`backend/.env`)
```env
# Database (use Supabase's built-in PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
LOG_LEVEL=INFO
DEBUG=false
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:8080"]
```

### **AI Service** (`ai/.env`)
```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Database (same as backend)
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
DATABASE_PROVIDER=supabase
```

### **Frontend** (`frontend1/.env.local`)
```env
# Service URLs
VITE_BACKEND_URL=http://localhost:8000
VITE_AI_SERVICE_URL=http://localhost:8002
VITE_PRODUCT_VERIFICATION_URL=http://localhost:8001

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=AveoEarth
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=B2B Sustainable Products Marketplace

# Feature Flags
VITE_ENABLE_AI_CHATBOT=true
VITE_ENABLE_PRODUCT_VERIFICATION=true
VITE_ENABLE_BACKEND_API=true
VITE_ENABLE_SUPABASE_FALLBACK=true
```

## 🚀 **Step 3: Start All Services**

### **Option 1: Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up --build

# Services will be available at:
# - Backend API: http://localhost:8000
# - Product Verification: http://localhost:8001
# - Frontend: http://localhost:5173
```

### **Option 2: Manual Setup**

**Terminal 1 - Backend Service:**
```bash
cd backend
uv run main.py
```

**Terminal 2 - AI Service:**
```bash
cd ai
uv run main.py
```

**Terminal 3 - Product Verification:**
```bash
cd product_verification
python main.py
```

**Terminal 4 - Frontend:**
```bash
cd frontend1
npm install
npm run dev
```

## 👤 **Step 4: Create Your First Vendor Account**

1. **Open the Frontend**
   - Go to `http://localhost:5173`
   - Click "Sign Up" or "Become a Vendor"

2. **Complete Vendor Registration**
   - Fill in your business details
   - Verify your email address
   - Complete the vendor onboarding process

3. **Add Your First Product**
   - Go to the Vendor Dashboard
   - Click "Add Product"
   - Fill in product details:
     - Name, description, price
     - Category and brand
     - Upload product images
     - Set sustainability information
   - Submit for approval

## ✅ **Step 5: Verify Everything Works**

### **Test All Features:**
1. **Search Functionality**
   - Search for products (should return empty initially)
   - Add products and search again

2. **AI Chatbot**
   - Click the chat icon in bottom right
   - Test the close button (X in top right)
   - Ask questions about products

3. **Vendor Dashboard**
   - Add multiple products
   - Check product management
   - Test analytics (will be empty initially)

4. **Admin Dashboard**
   - Approve vendor products
   - Check user management
   - Monitor analytics

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"No products found"**
   - This is expected initially
   - Add products through vendor dashboard

2. **AI Chatbot not responding**
   - Check `GEMINI_API_KEY` in `ai/.env`
   - Verify AI service is running on port 8002

3. **Database connection errors**
   - Verify `DATABASE_URL` in backend and AI services
   - Check Supabase project is active

4. **Frontend not loading**
   - Check all environment variables in `frontend1/.env.local`
   - Verify all services are running

## 📊 **Data Flow**

1. **Vendors** sign up and add products
2. **Products** are stored in Supabase
3. **Search** fetches from Supabase (no mock data)
4. **AI Chatbot** uses Gemini API for responses
5. **Analytics** shows real data from Supabase

## 🎯 **Next Steps**

1. **Add Real Categories and Brands**
   - Go to Admin Dashboard
   - Add categories (Eco-Friendly, Organic, etc.)
   - Add brands (your business partners)

2. **Configure Product Verification**
   - Test image verification service
   - Set up verification rules

3. **Set Up Analytics**
   - Configure tracking
   - Monitor real user data

4. **Deploy to Production**
   - Set up production Supabase
   - Configure production environment variables
   - Deploy services to cloud

---

**🎉 Congratulations!** You now have a clean, production-ready AveoEarth platform with no sample data. All data will come from real users and vendors.
