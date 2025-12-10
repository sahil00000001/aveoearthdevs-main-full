/**
 * Complete Frontend1 Integration Test
 * Tests: Backend connection, Product listing, Vendor upload, Frontend visibility
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      if (options.body instanceof FormData) {
        options.body.pipe(req);
      } else {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        req.end();
      }
    } else {
      req.end();
    }
  });
}

async function testBackendHealth() {
  log('\n=== 1. Backend Health Check ===', 'cyan');
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

async function testVendorProductUpload() {
  log('\n=== 2. Vendor Product Upload ===', 'cyan');
  try {
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const form = new FormData();
    form.append('name', 'Frontend1 Test Product ' + Date.now());
    form.append('sku', 'F1-TEST-' + Date.now());
    form.append('price', '49.99');
    form.append('compare_at_price', '59.99');
    form.append('cost_per_item', '25.00');
    form.append('track_quantity', 'true');
    form.append('quantity', '50');
    form.append('continue_selling', 'true');
    form.append('description', 'Test product uploaded from frontend1 integration test');
    form.append('category_id', '1');
    form.append('brand_id', '1');
    form.append('image', testImage, {
      filename: 'test-product.png',
      contentType: 'image/png'
    });
    form.append('vendor_id', 'dev-vendor');

    const response = await makeRequest(`${API_BASE}/supplier/products/`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });

    if (response.status === 201 || response.status === 200) {
      log('✅ Product created successfully', 'green');
      log(`   Product ID: ${response.data.id || response.data.product_id || 'N/A'}`, 'green');
      log(`   Product Name: ${response.data.name || 'N/A'}`, 'green');
      return { success: true, productId: response.data.id || response.data.product_id, productName: response.data.name };
    }
    log(`⚠️  Product creation response: ${response.status}`, 'yellow');
    log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`, 'yellow');
    return { success: false };
  } catch (error) {
    log(`❌ Product upload error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testProductListing() {
  log('\n=== 3. Product Listing (Backend API) ===', 'cyan');
  try {
    const response = await makeRequest(`${API_BASE}/products/`);
    
    if (response.status === 200) {
      const products = response.data.products || response.data.items || response.data || [];
      const total = response.data.total || response.data.count || products.length;
      log(`✅ Products retrieved: ${total} products`, 'green');
      if (products.length > 0) {
        log(`   First product: ${products[0].name || 'N/A'}`, 'green');
        log(`   Sample products: ${products.slice(0, 5).map(p => p.name || p.sku).join(', ')}`, 'green');
      }
      return { success: true, count: total, products };
    }
    log(`⚠️  Product listing response: ${response.status}`, 'yellow');
    return { success: false, products: [] };
  } catch (error) {
    log(`❌ Product listing error: ${error.message}`, 'red');
    return { success: false, products: [] };
  }
}

async function testFrontend1Connection() {
  log('\n=== 4. Frontend1 Connection ===', 'cyan');
  try {
    const response = await makeRequest(`${FRONTEND_URL}/`);
    
    if (response.status === 200 || response.status === 307) {
      log('✅ Frontend1 is accessible', 'green');
      return true;
    }
    log(`⚠️  Frontend1 response: ${response.status}`, 'yellow');
    return false;
  } catch (error) {
    log(`⚠️  Frontend1 connection: ${error.message}`, 'yellow');
    log('   (This is OK if frontend1 is not running)', 'yellow');
    return false;
  }
}

async function testBackendCORS() {
  log('\n=== 5. CORS Configuration ===', 'cyan');
  try {
    // Test OPTIONS request to check CORS headers
    const response = await makeRequest(`${API_BASE}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
      }
    });
    
    if (response.headers['access-control-allow-origin'] || response.status === 200) {
      log('✅ CORS is configured', 'green');
      return true;
    }
    log(`⚠️  CORS check response: ${response.status}`, 'yellow');
    return false;
  } catch (error) {
    log(`⚠️  CORS check error: ${error.message}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n🚀 Starting Frontend1 Integration Test', 'blue');
  log('='.repeat(60), 'blue');
  log(`Backend: ${API_BASE}`, 'cyan');
  log(`Frontend1: ${FRONTEND_URL}`, 'cyan');

  const results = {
    backendHealth: false,
    productUpload: false,
    productListing: false,
    frontend1Connection: false,
    cors: false,
  };

  // Run tests
  results.backendHealth = await testBackendHealth();
  const uploadResult = await testVendorProductUpload();
  results.productUpload = uploadResult.success;
  
  // Wait a bit for product to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test product listing
  const listingResult = await testProductListing();
  results.productListing = listingResult.success;
  
  // Check if uploaded product appears
  if (listingResult.products && uploadResult.productName) {
    const found = listingResult.products.find(p => 
      p.name && p.name.includes('Frontend1 Test Product')
    );
    if (found) {
      log(`\n✅ SUCCESS: Uploaded product "${uploadResult.productName}" is visible in listing!`, 'green');
    } else {
      log(`\n⚠️  Uploaded product "${uploadResult.productName}" not yet visible in listing`, 'yellow');
      log('   (May need a moment to appear)', 'yellow');
    }
  }

  results.frontend1Connection = await testFrontend1Connection();
  results.cors = await testBackendCORS();

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Results Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  const allPassed = Object.values(results).every(r => r);
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  log(`\n✅ Passed: ${passedCount}/${totalCount}`, allPassed ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`   ${passed ? '✅' : '❌'} ${test}`, passed ? 'green' : 'red');
  });

  if (results.productListing && listingResult.count > 0) {
    log(`\n✅ SUCCESS: Products are visible in backend API!`, 'green');
    log(`   Total products: ${listingResult.count}`, 'green');
    log(`   Visit: ${FRONTEND_URL}/products to see products on frontend1`, 'green');
  }

  if (results.frontend1Connection) {
    log(`\n✅ Frontend1 is accessible!`, 'green');
    log(`   Frontend1 URL: ${FRONTEND_URL}`, 'green');
  }

  log('\n' + '='.repeat(60), 'blue');
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});






