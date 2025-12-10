const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

console.log('🔍 DEBUGGING WORKFLOW ISSUES');
console.log('============================\n');

async function testEndpoint(name, url, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const config = { method, url };
    if (data) {
      config.data = data;
    }
    const response = await axios(config);
    console.log(`✅ ${name}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.status || error.code} - ${error.response?.data?.detail || error.message}`);
    return null;
  }
}

async function debugWorkflows() {
  console.log('🔍 TESTING VENDOR WORKFLOW ENDPOINTS');
  console.log('====================================');
  
  // Test vendor orders endpoint
  await testEndpoint('Vendor Orders', `${BASE_URL}/supplier/orders/orders`);
  
  // Test vendor analytics endpoint
  await testEndpoint('Vendor Analytics', `${BASE_URL}/supplier/analytics/`);
  
  // Test dashboard analytics
  await testEndpoint('Dashboard Overview', `${BASE_URL}/dashboard/overview`);
  
  // Test analytics routes
  await testEndpoint('Analytics Track Activity', `${BASE_URL}/analytics/track-activity`);
  
  console.log('\n🔍 TESTING CART WORKFLOW ENDPOINTS');
  console.log('==================================');
  
  // Test cart endpoints
  await testEndpoint('Get Cart', `${BASE_URL}/buyer/orders/cart?session_id=test-session`);
  await testEndpoint('Cart Count', `${BASE_URL}/buyer/orders/cart/count?session_id=test-session`);
  
  console.log('\n🔍 TESTING ORDER WORKFLOW ENDPOINTS');
  console.log('===================================');
  
  // Test order endpoints
  await testEndpoint('Get Orders', `${BASE_URL}/buyer/orders/`);
  await testEndpoint('Order Tracking', `${BASE_URL}/buyer/orders/test-order-123/track`);
  
  console.log('\n🔍 TESTING AUTHENTICATION ENDPOINTS');
  console.log('===================================');
  
  // Test auth endpoints
  await testEndpoint('Auth Signup', `${BASE_URL}/auth/signup`, 'POST', {
    email: 'test@example.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    user_type: 'buyer'
  });
  
  console.log('\n🔍 TESTING PRODUCT ENDPOINTS');
  console.log('============================');
  
  // Test product endpoints
  await testEndpoint('Products List', `${BASE_URL}/products/`);
  await testEndpoint('Categories Tree', `${BASE_URL}/products/categories/tree`);
  await testEndpoint('Brands Active', `${BASE_URL}/products/brands/active`);
  
  console.log('\n🔍 TESTING SUPPLIER PRODUCT ENDPOINTS');
  console.log('=====================================');
  
  // Test supplier product endpoints
  await testEndpoint('Supplier Products', `${BASE_URL}/supplier/products/`);
  await testEndpoint('Supplier Categories', `${BASE_URL}/supplier/products/categories`);
  await testEndpoint('Supplier Brands', `${BASE_URL}/supplier/products/brands`);
  
  console.log('\n📊 DEBUGGING COMPLETE');
  console.log('=====================');
}

debugWorkflows().catch(console.error);
