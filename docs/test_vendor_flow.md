# 🧪 Vendor Signup & Product Addition Test Flow

## **Test Steps**

### **1. Clear Database First**
```sql
-- Run this in Supabase SQL Editor
-- (Contents of frontend1/database/clear_sample_data.sql)
```

### **2. Start All Services**
```bash
# Terminal 1 - Backend
cd backend && uv run main.py

# Terminal 2 - AI Service  
cd ai && uv run main.py

# Terminal 3 - Product Verification
cd product_verification && python main.py

# Terminal 4 - Frontend
cd frontend1 && npm run dev
```

### **3. Test Vendor Signup**

1. **Open Frontend**
   - Go to `http://localhost:5173`
   - Should show empty product catalog

2. **Sign Up as Vendor**
   - Click "Sign Up" or "Become a Vendor"
   - Fill in vendor details:
     - Business Name: "EcoTest Solutions"
     - Email: "vendor@ecotest.com"
     - Password: "testpass123"
     - Business Type: "Manufacturer"
     - Website: "https://ecotest.com"
     - Description: "Sustainable product manufacturer"

3. **Verify Email** (if required)
   - Check email for verification link
   - Click verification link

4. **Complete Vendor Profile**
   - Add business address
   - Upload business logo
   - Set up payment information
   - Complete verification process

### **4. Test Product Addition**

1. **Access Vendor Dashboard**
   - Login with vendor credentials
   - Navigate to "Products" section

2. **Add First Product**
   - Click "Add Product"
   - Fill in product details:
     - **Name**: "Bamboo Water Bottle"
     - **Description**: "Eco-friendly bamboo water bottle with stainless steel interior"
     - **Price**: $24.99
     - **Category**: "Zero Waste" (create if needed)
     - **Brand**: "EcoTest" (create if needed)
     - **Materials**: ["Bamboo", "Stainless Steel"]
     - **Tags**: ["zero-waste", "bamboo", "water-bottle"]
     - **Sustainability Score**: 95
     - **Images**: Upload 2-3 product images

3. **Submit for Approval**
   - Click "Save & Submit"
   - Product should show as "Pending Approval"

### **5. Test Admin Approval**

1. **Login as Admin**
   - Go to admin login page
   - Use admin credentials

2. **Approve Product**
   - Navigate to "Products" section
   - Find the pending product
   - Click "Approve"
   - Product should now be "Approved" and "Visible"

### **6. Test Customer Experience**

1. **View Product Catalog**
   - Go to main frontend page
   - Should now show the approved product
   - No mock/sample data should be visible

2. **Test Search**
   - Use search bar to find "bamboo"
   - Should return the approved product
   - No mock results should appear

3. **Test AI Chatbot**
   - Click chat icon (bottom right)
   - Ask: "What products do you have?"
   - Should mention the approved product
   - Test close button (X in top right)

### **7. Test Analytics**

1. **Vendor Analytics**
   - Go to vendor dashboard
   - Check analytics section
   - Should show real data (1 product, 0 sales initially)

2. **Admin Analytics**
   - Go to admin dashboard
   - Check analytics section
   - Should show real data (1 vendor, 1 product)

## **Expected Results**

✅ **No Sample Data**: All mock data removed  
✅ **Real Data Only**: Everything fetched from Supabase  
✅ **AI Chatbot Closes**: X button works properly  
✅ **Vendor Flow Works**: Signup → Add Product → Approval  
✅ **Search Works**: Returns real products only  
✅ **Analytics Show Real Data**: No mock numbers  

## **Troubleshooting**

### **If Search Returns No Results**
- Check if product is approved and visible
- Verify Supabase connection
- Check browser console for errors

### **If AI Chatbot Doesn't Close**
- Check if close button is visible
- Try clicking the X in top right corner
- Check browser console for errors

### **If Vendor Can't Add Products**
- Check if vendor is verified
- Verify backend service is running
- Check Supabase RLS policies

### **If Admin Can't Approve Products**
- Check admin permissions
- Verify product is in pending status
- Check backend API logs

---

**🎯 Success Criteria**: All features work with real data only, no sample/mock data visible anywhere in the application.
