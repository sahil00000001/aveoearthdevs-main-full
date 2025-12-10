const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const AI_URL = 'http://localhost:8002';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🔍 Testing Working Endpoints...\n');

// Test 1: Backend Health
async function testBackendHealth() {
  try {
    console.log('✅ Backend Health Check');
    const response = await axios.get(`${BASE_URL}/supplier/products/categories`);
    console.log(`   Found ${response.data.length} categories`);
    return true;
  } catch (error) {
    console.log(`❌ Backend Health: ${error.message}`);
    return false;
  }
}

// Test 2: AI Service
async function testAIService() {
  try {
    console.log('✅ AI Service Health');
    const response = await axios.get(`${AI_URL}/health`);
    console.log(`   AI Status: ${response.data.ai_service}`);
    console.log(`   Backend Connection: ${response.data.backend_connection}`);
    return true;
  } catch (error) {
    console.log(`❌ AI Service: ${error.message}`);
    return false;
  }
}

// Test 3: Frontend
async function testFrontend() {
  try {
    console.log('✅ Frontend Access');
    const response = await axios.get(FRONTEND_URL);
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
    return false;
  }
}

// Test 4: Product Verification
async function testProductVerification() {
  try {
    console.log('✅ Product Verification Service');
    const response = await axios.get('http://localhost:8001/');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Product Verification: ${error.message}`);
    return false;
  }
}

// Test 5: Customer Product Browsing
async function testCustomerBrowsing() {
  try {
    console.log('✅ Customer Product Browsing');
    const response = await axios.get(`${BASE_URL}/products/`);
    console.log(`   Found ${response.data.total} products`);
    console.log(`   Page: ${response.data.page}/${response.data.pages}`);
    return true;
  } catch (error) {
    console.log(`❌ Customer Browsing: ${error.message}`);
    return false;
  }
}

// Test 6: Categories and Brands
async function testCategoriesAndBrands() {
  try {
    console.log('✅ Categories and Brands');
    
    const categoriesResponse = await axios.get(`${BASE_URL}/supplier/products/categories`);
    console.log(`   Categories: ${categoriesResponse.data.length}`);
    
    const brandsResponse = await axios.get(`${BASE_URL}/supplier/products/brands`);
    console.log(`   Brands: ${brandsResponse.data.length}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Categories and Brands: ${error.message}`);
    return false;
  }
}

// Test 7: AI Chat Functionality
async function testAIChat() {
  try {
    console.log('✅ AI Chat Functionality');
    
    const chatResponse = await axios.post(`${AI_URL}/chat`, {
      message: "What are the main product categories available?",
      user_type: "customer",
      session_id: "test-session-123"
    });
    
    console.log(`   Chat Response: ${chatResponse.data.response ? 'Received' : 'No response'}`);
    return true;
  } catch (error) {
    console.log(`❌ AI Chat: ${error.message}`);
    return false;
  }
}

// Test 8: Search Functionality
async function testSearch() {
  try {
    console.log('✅ Search Functionality');
    
    const searchResponse = await axios.get(`${BASE_URL}/products/?search=eco`);
    console.log(`   Search Results: ${searchResponse.data.total} products found`);
    return true;
  } catch (error) {
    console.log(`❌ Search: ${error.message}`);
    return false;
  }
}

// Test 9: Track Order Page
async function testTrackOrder() {
  try {
    console.log('✅ Track Order Page');
    
    const response = await axios.get(`${FRONTEND_URL}/track-order`);
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Track Order: ${error.message}`);
    return false;
  }
}

// Test 10: Vendor Dashboard Access
async function testVendorDashboard() {
  try {
    console.log('✅ Vendor Dashboard Access');
    
    const response = await axios.get(`${FRONTEND_URL}/vendor/dashboard`);
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Vendor Dashboard: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const tests = [
    testBackendHealth,
    testAIService,
    testFrontend,
    testProductVerification,
    testCustomerBrowsing,
    testCategoriesAndBrands,
    testAIChat,
    testSearch,
    testTrackOrder,
    testVendorDashboard
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All endpoints are working perfectly!');
  } else {
    console.log('\n⚠️ Some endpoints need attention.');
  }
  
  return { passed, total };
}

runTests().catch(console.error);
