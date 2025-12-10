# 🧪 Complete Workflow Testing Guide

## Overview
This guide tests the complete vendor workflow: Signup → Login → Product Upload → Bulk CSV Upload → Frontend Visibility

## Prerequisites

1. **Backend must be running**:
   ```bash
   cd backend
   python main.py
   ```

2. **Frontend must be running**:
   ```bash
   cd frontend1
   npm run dev
   ```

3. **Clear browser cache** (important!):
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"
   - Or: `Ctrl+Shift+Delete` → Clear cache

## Running Tests

### Automated Test Script

Run the comprehensive test:
```bash
node test_vendor_workflow.js
```

This will test:
1. ✅ Vendor signup
2. ✅ Vendor login
3. ✅ Single product upload
4. ✅ Bulk CSV upload (3 products)
5. ✅ Products visible in frontend
6. ✅ No mock data present

### Manual Testing Steps

#### 1. Vendor Signup
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Test1234!",
    "first_name": "Test",
    "last_name": "Vendor",
    "phone": "+1234567890",
    "user_type": "supplier"
  }'
```

#### 2. Vendor Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Test1234!"
  }'
```

Save the `access_token` from response.

#### 3. Upload Single Product

```bash
curl -X POST http://localhost:8080/supplier/products/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Product" \
  -F "sku=TEST-001" \
  -F "price=29.99" \
  -F "short_description=Test product description" \
  -F "description=Full description here" \
  -F "status=draft" \
  -F "visibility=visible"
```

#### 4. Bulk CSV Upload

Create `test_products.csv`:
```csv
name,sku,price,short_description,description,visibility
Product 1,PROD-001,19.99,First product,Description 1,visible
Product 2,PROD-002,24.99,Second product,Description 2,visible
Product 3,PROD-003,34.99,Third product,Description 3,visible
```

Upload:
```bash
curl -X POST http://localhost:8080/supplier/products/bulk-import-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_products.csv"
```

#### 5. Verify Products in Frontend

Open browser: `http://localhost:5173`

Check:
- Products page shows uploaded products
- No mock/demo products visible
- Product details are correct
- Images display properly (if uploaded)

## Expected Results

### Backend Response (Single Upload)
```json
{
  "id": "uuid-here",
  "name": "Test Product",
  "sku": "TEST-001",
  "price": 29.99,
  "status": "draft",
  "visibility": "visible"
}
```

### Backend Response (Bulk Upload)
```json
{
  "message": "Bulk import completed: 3 successful, 0 failed",
  "results": {
    "total_rows": 3,
    "successful": 3,
    "failed": 0,
    "errors": [],
    "created_product_ids": ["uuid1", "uuid2", "uuid3"]
  }
}
```

### Frontend Products Endpoint
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Test Product",
      "sku": "TEST-001",
      "price": 29.99
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

## Common Issues & Fixes

### Issue: Products not showing in frontend
**Fix**: 
1. Check backend is running
2. Clear browser cache
3. Check console for CORS errors
4. Verify products have `status=active` and `approval_status=approved`

### Issue: CORS errors
**Fix**: 
1. Restart backend
2. Check `backend/main.py` CORS configuration
3. Verify frontend URL is in allowed origins

### Issue: Mock products showing
**Fix**:
1. Restart frontend dev server
2. Clear browser cache
3. Verify `frontend1/src/services/api.ts` doesn't call `getMockProducts()`

### Issue: Upload fails with 401/403
**Fix**:
1. Check auth token is valid
2. Verify user is logged in as supplier
3. Check token in Authorization header

## Verification Checklist

- [ ] Vendor can signup
- [ ] Vendor can login
- [ ] Single product uploads successfully
- [ ] Bulk CSV upload works
- [ ] Products appear in `/products` endpoint
- [ ] Products visible on frontend
- [ ] No mock/demo products shown
- [ ] Product details are correct
- [ ] Images upload correctly (if tested)

## Files Modified

- `frontend1/src/services/backendApi.ts` - Added upload methods
- `frontend1/src/services/api.ts` - Removed mock data fallbacks
- `backend/app/features/products/routes/products_buyer_routes.py` - Removed demo products

## Next Steps

After successful testing:
1. Products should be visible in frontend
2. No mock data should appear
3. All upload workflows should work
4. Frontend should show real products only



