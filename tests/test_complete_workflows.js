/**
 * Complete End-to-End Workflow Testing Script
 * Tests: User Signup, Vendor Signup, Authentication, Product Creation,
 * Bulk Upload, Cart, Orders, Frontend-Backend Integration
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5176';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': options.contentType || 'application/json',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData || data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      if (options.body instanceof FormData || options.body.constructor?.name === 'FormData') {
        // FormData will set its own Content-Type with boundary
        options.body.pipe ? options.body.pipe(req) : req.end(JSON.stringify(options.body));
      } else if (Buffer.isBuffer(options.body)) {
        req.write(options.body);
        req.end();
        } else {
        req.write(JSON.stringify(options.body));
        req.end();
      }
            } else {
      req.end();
    }
  });
}

async function testHealthCheck() {
  log('\n=== 1. Health Check ===', 'cyan');
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.status === 200) {
      log('✅ Backend is running', 'green');
      return true;
    }
    log(`❌ Health check failed: ${response.status}`, 'red');
    return false;
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
    return false;
  }
}

async function testUserSignup() {
  log('\n=== 2. User Signup (Buyer) ===', 'cyan');
  try {
    const email = `test_buyer_${Date.now()}@example.com`;
    const response = await makeRequest(`${API_BASE}/auth/signup`, {
            method: 'POST',
      body: {
        email,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'Buyer',
        phone: '+1234567890',
        user_type: 'buyer',
      },
    });
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ User signup successful: ${email}`, 'green');
      return { success: true, email, token: response.data?.access_token, user: response.data?.user };
    }
    log(`⚠️  Signup response: ${response.status} - ${JSON.stringify(response.data)}`, 'yellow');
    return { success: false, email };
    } catch (error) {
    log(`❌ User signup error: ${error.message}`, 'red');
    return { success: false };
    }
}

async function testVendorSignup() {
  log('\n=== 3. Vendor Signup (Supplier) ===', 'cyan');
  try {
    const email = `test_vendor_${Date.now()}@example.com`;
    const response = await makeRequest(`${API_BASE}/auth/signup`, {
      method: 'POST',
      body: {
        email,
        password: 'TestPassword123!',
            first_name: 'Test',
            last_name: 'Vendor',
        phone: '+1234567891',
        user_type: 'supplier',
      },
    });
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ Vendor signup successful: ${email}`, 'green');
      return { success: true, email, token: response.data?.access_token, user: response.data?.user };
    }
    log(`⚠️  Vendor signup response: ${response.status} - ${JSON.stringify(response.data)}`, 'yellow');
    return { success: false, email };
  } catch (error) {
    log(`❌ Vendor signup error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testUserLogin(email, password = 'TestPassword123!') {
  log('\n=== 4. User Login ===', 'cyan');
  try {
    const response = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email, password },
    });
    
    if (response.status === 200 && response.data?.access_token) {
      log(`✅ Login successful: ${email}`, 'green');
      return { success: true, token: response.data.access_token, user: response.data.user };
    }
    log(`⚠️  Login response: ${response.status}`, 'yellow');
    return { success: false };
  } catch (error) {
    log(`❌ Login error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testProductCreation(token = null) {
  log('\n挑战=== 5. Product Creation (Individual) ===', 'cyan');
  try {
    // Create a simple image buffer for testing
    const imageBuffer = Buffer.from('fake-image-data-for-testing');
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('name', 'Test Product');
    form.append('description', 'This is a test product');
    form.append('price', '29.99');
    form.append('sku', `TEST-${Date.now()}`);
    form.append('category_id', '1');
    form.append('track_quantity', 'true');
    form.append('quantity', '100');
    form.append('continue_selling', 'true');
    form.append('image', imageBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    const headers = { ...form.getHeaders() };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Use form-data package's submit method
    const url = new URL(`${API_BASE}/supplier/products/`);
    const response = await new Promise((resolve, reject) => {
      form.submit({
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers,
      }, (err, res) => {
        if (err) return reject(err);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
    });
    
    if (response.status === 201) {
      log(`✅ Product created successfully`, 'green');
      return { success: true, product: response.data };
    }
    log(`⚠️  Product creation response: ${response.status} - ${JSON.stringify(response.data)}`, 'yellow');
    return { success: false, data: response.data };
    } catch (error) {
    log(`❌ Product creation error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testBulkUpload(token = null) {
  log('\n=== tỳ 6. Bulk Product Upload (CSV) ===', 'cyan');
  try {
    // Create a test CSV
    const csvContent = `name,description,sku,price,category_id,quantity,track_quantity
Bulk Product 1,Description 1, BULK-${Date.now()}-1,19.99,1,50,true
Bulk Product 2,Description 2,BULK-${Date.now()}-2,29.99,1,50,true
Bulk Product 3,Description 3,BULK-${Date.now()}-3,39.99,1,50,true`;
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(csvContent), { filename: 'products.csv', contentType: 'text/csv' });
    
    const headers = { ...form.getHeaders() };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = new URL(`${API_BASE}/supplier/products/bulk-import-csv`);
    const response = await new Promise((resolve, reject) => {
      form.submit({
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers,
      }, (err, res) => {
        if (err) return reject(err);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
    });
    
    if (response.status === 200) {
      log(`✅ Bulk upload successful: ${JSON.stringify(response.data)}`, 'green');
      return { success: true, data: response.data };
    }
    log(`⚠️  Bulk upload response: ${response.status} - ${JSON.stringify(response.data)}`, 'yellow');
    return { success: false, data: response.data };
    } catch (error) {
    log(`❌ Bulk upload error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testProductListing() {
  log('\n=== 7. Product Listing (Frontend View) ===', 'cyan');
  try {
    const response = await makeRequest(`${API_BASE}/products/`);
    
    if (response.status === 200) {
      const products = response.data?.products || response.data || [];
      const count = Array.isArray(products) ? products.length : (response.data?.total || 0);
      log(`✅ Products retrieved: ${count} products`, 'green');
      return { success: true, count, products };
    }
    log(`⚠️  Product listing response: ${response.status}`, 'yellow');
    return { success: false };
    } catch (error) {
    log(`❌ Product listing error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testCartOperations(token) {
  log('\n=== 8. Cart Operations ===', 'cyan');
  try {
    // First, get a product ID from the listing
    const productsResponse = await makeRequest(`${API_BASE}/products/`);
    let productId = '1';
    if (productsResponse.status === 200) {
      const products = productsResponse.data?.products || productsResponse.data || [];
      if (Array.isArray(products) && products.length > 0) {
        productId = products[0].id || products[0].product_id || '1';
      }
    }
    
    // Add to cart
    const addResponse = await makeRequest(`${API_BASE}/buyer/orders/cart/items`, {
            method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: {
        product_id: productId,
        quantity: 2,
      },
    });
    
    if (addResponse.status === 200 || addResponse.status === 201) {
      log('✅ Item added to cart', 'green');
      
      // Get cart
      const cartResponse = await makeRequest(`${API_BASE}/buyer/orders/cart`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      
      if (cartResponse.status === 200) {
        log('✅ Cart retrieved successfully', 'green');
        return { success: true, cart: cartResponse.data };
      }
    }
    log(`⚠️  Cart operations response: ${addResponse.status} - ${JSON.stringify(addResponse.data)}`, 'yellow');
    return { success: false };
  } catch (error) {
    log(`❌ Cart error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testOrderPlacement(token) {
  log('\n=== 9. Order Placement ===', 'cyan');
  try {
    // First ensure cart has items
    const cartResponse = await makeRequest(`${API_BASE}/buyer/orders/cart`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (cartResponse.status !== 200) {
      log('⚠️  No cart found, skipping order placement', 'yellow');
      return { success: false, reason: 'no_cart' };
    }
    
    const response = await makeRequest(`${API_BASE}/buyer/orders/`, {
            method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: {
        shipping_address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zip: '12345',
          country: 'Test Country',
        },
        payment_method_id: 'test_payment',
        payment_method_type: 'test',
      },
    });
    
    if (response.status === 201 || response.status === 200) {
      log('✅ Order placed successfully', 'green');
      return { success: true, order: response.data };
    }
    log(`⚠️  Order placement response: ${response.status} - ${JSON.stringify(response.data)}`, 'yellow');
    return { success: false };
    } catch (error) {
    log(`❌ Order placement error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testFrontendConnection() {
  log('\n=== 10. Frontend Connection Test ===', 'cyan');
  try {
    const response = await makeRequest(`${FRONTEND_URL}/`);
    
    if (response.status === 200 || response.status === 307) {
      log('✅ Frontend is accessible', 'green');
      return true;
    }
    log(`⚠️  Frontend response: ${response.status}`, 'yellow');
    return false;
  } catch (error) {
    log(`⚠️  Frontend not accessible: ${error.message} (This is OK if frontend is not running)`, 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Starting Complete End-to-End Workflow Tests', 'blue');
  log('=' .repeat(60), 'blue');
  
  const results = {
    health: false,
    userSignup: false,
    vendorSignup: false,
    login: false,
    productCreation: false,
    bulkUpload: false,
    productListing: false,
    cart: false,
    order: false,
    frontend: false,
  };
  
  // 1. Health Check
  results.health = await testHealthCheck();
  if (!results.health) {
    log('\n❌ Backend is not running. Please start the backend server first.', 'red');
    return;
  }
  
  // 2. User Signup
  const userSignupResult = await testUserSignup();
  results.userSignup = userSignupResult.success;
  
  // 3. Vendor Signup
  const vendorSignupResult = await testVendorSignup();
  results.vendorSignup = vendorSignupResult.success;
  
  // 4. Login
  let userToken = null;
  if (userSignupResult.email) {
    const loginResult = await testUserLogin(userSignupResult.email);
    results.login = loginResult.success;
    userToken = loginResult.token;
  }
  
  // 5. Product Creation
  results.productCreation = (await testProductCreation(userToken || vendorSignupResult.token)).success;
  
  // 6. Bulk Upload
  results.bulkUpload = (await testBulkUpload(userToken || vendorSignupResult.token)).success;
  
  // 7. Product Listing
  const listingResult = await testProductListing();
  results.productListing = listingResult.success;
  
  // 8. Cart Operations
  results.cart = (await testCartOperations(userToken)).success;
  
  // 9. Order Placement
  results.order = (await testOrderPlacement(userToken)).success;
  
  // 10. Frontend Connection
  results.frontend = await testFrontendConnection();
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  const testNames = {
    health: 'Health Check',
    userSignup: 'User Signup',
    vendorSignup: 'Vendor Signup',
    login: 'User Login',
    productCreation: 'Product Creation',
    bulkUpload: 'Bulk Upload',
    productListing: 'Product Listing',
    cart: 'Cart Operations',
    order: 'Order Placement',
    frontend: 'Frontend Connection',
  };
  
  let passed = 0;
  let total = Object.keys(results).length;
  
  for (const [key, value] of Object.entries(results)) {
    const status = value ? '✅' : '❌';
    const color = value ? 'green' : 'red';
    log(`${status} ${testNames[key]}: ${value ? 'PASS' : 'FAIL'}`, color);
    if (value) passed++;
  }
  
  log(`\n📈 Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! System is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  return results;
}

// Run tests
if (require.main === module) {
runAllTests().catch(console.error);
}

module.exports = { runAllTests };

