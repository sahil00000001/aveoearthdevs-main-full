/**
 * Comprehensive Vendor Workflow Test
 * Tests: Signup → Login → Product Upload → Bulk CSV Upload → Verify Products in Frontend
 */

const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';

// Test data
const testVendor = {
  email: `testvendor_${Date.now()}@test.com`,
  password: 'TestVendor123!',
  first_name: 'Test',
  last_name: 'Vendor',
  phone: '+1234567890',
  user_type: 'supplier'
};

const testProduct = {
  name: `Test Product ${Date.now()}`,
  sku: `TEST-${Date.now()}`,
  price: 29.99,
  short_description: 'A test product for workflow testing',
  description: 'This is a comprehensive test product description',
  status: 'draft',
  visibility: 'visible'
};

const csvContent = `name,sku,price,short_description,description,visibility
Bulk Product 1,BULK-001,19.99,First bulk product,Detailed description for bulk product 1,visible
Bulk Product 2,BULK-002,24.99,Second bulk product,Detailed description for bulk product 2,visible
Bulk Product 3,BULK-003,34.99,Third bulk product,Detailed description for bulk product 3,visible`;

let authToken = null;
let createdProductIds = [];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testStep(stepName, fn) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${stepName}`);
  console.log('='.repeat(60));
  try {
    const result = await fn();
    console.log(`✅ ${stepName}: PASSED`);
    return result;
  } catch (error) {
    console.error(`❌ ${stepName}: FAILED`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function testVendorSignup() {
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testVendor)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Signup failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  authToken = data.tokens?.access_token || data.access_token;
  console.log(`   Created vendor: ${testVendor.email}`);
  console.log(`   Token received: ${authToken ? 'Yes' : 'No'}`);
  
  return data;
}

async function testVendorLogin() {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testVendor.email,
      password: testVendor.password
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  authToken = data.tokens?.access_token || data.access_token;
  console.log(`   Logged in as: ${testVendor.email}`);
  
  return data;
}

async function testSingleProductUpload() {
  const formData = new FormData();
  formData.append('name', testProduct.name);
  formData.append('sku', testProduct.sku);
  formData.append('price', testProduct.price.toString());
  formData.append('short_description', testProduct.short_description);
  formData.append('description', testProduct.description);
  formData.append('status', testProduct.status);
  formData.append('visibility', testProduct.visibility);

  const response = await fetch(`${BACKEND_URL}/supplier/products/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Product upload failed: ${error}`);
  }

  const data = await response.json();
  createdProductIds.push(data.id);
  console.log(`   Product created: ${data.name} (ID: ${data.id})`);
  console.log(`   SKU: ${data.sku}`);
  console.log(`   Price: $${data.price}`);
  
  return data;
}

async function testBulkCSVUpload() {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const file = new File([blob], 'test_products.csv', { type: 'text/csv' });
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bulk upload failed: ${error}`);
  }

  const data = await response.json();
  console.log(`   Bulk upload results:`);
  console.log(`   - Total rows: ${data.results.total_rows}`);
  console.log(`   - Successful: ${data.results.successful}`);
  console.log(`   - Failed: ${data.results.failed}`);
  console.log(`   - Created IDs: ${data.results.created_product_ids.length}`);
  
  if (data.results.errors.length > 0) {
    console.log(`   - Errors:`, data.results.errors);
  }
  
  createdProductIds.push(...data.results.created_product_ids);
  
  return data;
}

async function testProductsVisibleInFrontend() {
  // Wait a bit for products to be indexed/available
  await sleep(2000);

  const response = await fetch(`${BACKEND_URL}/products?limit=100`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data = await response.json();
  const products = data.items || data.data || [];
  
  console.log(`   Total products in system: ${data.total || products.length}`);
  
  // Check if our test products are visible
  const testProducts = products.filter(p => 
    createdProductIds.includes(p.id) || 
    p.name.includes('Test Product') || 
    p.name.includes('Bulk Product')
  );
  
  console.log(`   Test products found: ${testProducts.length}/${createdProductIds.length}`);
  
  testProducts.forEach(p => {
    console.log(`   ✓ ${p.name} (${p.sku}) - Status: ${p.status}, Approval: ${p.approval_status}`);
  });
  
  if (testProducts.length === 0) {
    throw new Error('No test products found in frontend listing');
  }
  
  return { total: products.length, testProducts: testProducts.length };
}

async function testNoMockData() {
  const response = await fetch(`${BACKEND_URL}/products?limit=100`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  const products = data.items || data.data || [];
  
  // Check for mock/demo products
  const mockProducts = products.filter(p => 
    p.id?.startsWith('demo-') || 
    p.sku?.startsWith('DEMO-') ||
    p.name?.includes('Demo Product') ||
    p.name?.includes('Mock Product')
  );
  
  if (mockProducts.length > 0) {
    console.warn(`   ⚠️ Found ${mockProducts.length} mock/demo products:`);
    mockProducts.forEach(p => {
      console.warn(`      - ${p.name} (${p.id})`);
    });
    throw new Error('Mock/demo products found in product listing');
  }
  
  console.log(`   ✅ No mock/demo products found`);
  return true;
}

async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive Vendor Workflow Test\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  
  try {
    // Test 1: Vendor Signup
    await testStep('Vendor Signup', testVendorSignup);
    await sleep(1000);
    
    // Test 2: Vendor Login
    await testStep('Vendor Login', testVendorLogin);
    await sleep(1000);
    
    // Test 3: Single Product Upload
    const uploadedProduct = await testStep('Single Product Upload', testSingleProductUpload);
    await sleep(2000);
    
    // Test 4: Bulk CSV Upload
    const bulkResult = await testStep('Bulk CSV Upload', testBulkCSVUpload);
    await sleep(2000);
    
    // Test 5: Verify Products Visible
    const visibility = await testStep('Products Visible in Frontend', testProductsVisibleInFrontend);
    
    // Test 6: Verify No Mock Data
    await testStep('No Mock Data Present', testNoMockData);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(`  - Vendor: ${testVendor.email}`);
    console.log(`  - Products Created: ${createdProductIds.length}`);
    console.log(`  - Bulk Upload Success: ${bulkResult.results.successful}/${bulkResult.results.total_rows}`);
    console.log(`  - Products Visible: ${visibility.testProducts}`);
    console.log(`  - No Mock Data: ✅\n`);
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST SUITE FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runAllTests();
