/**
 * Complete Vendor Product Upload and Frontend Visibility Test
 * Tests: Vendor upload → Product creation → Frontend visibility
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const FormData = require('form-data');
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

async function testVendorProductUpload() {
  log('\n=== 2. Vendor Product Upload (Individual) ===', 'cyan');
  try {
    // Create a test image file (1x1 pixel PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const form = new FormData();
    form.append('name', 'Test Product ' + Date.now());
    form.append('sku', 'TEST-' + Date.now());
    form.append('price', '29.99');
    form.append('compare_at_price', '39.99');
    form.append('cost_per_item', '15.00');
    form.append('track_quantity', 'true');
    form.append('quantity', '100');
    form.append('continue_selling', 'true');
    form.append('description', 'Test product for workflow verification');
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
      return { success: true, productId: response.data.id || response.data.product_id };
    }
    log(`⚠️  Product creation response: ${response.status}`, 'yellow');
    log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`, 'yellow');
    return { success: false };
  } catch (error) {
    log(`❌ Product upload error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testImageUpload() {
  log('\n=== 3. Image Upload (Optimized) ===', 'cyan');
  try {
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const form = new FormData();
    form.append('file', testImage, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    form.append('vendor_id', 'dev-vendor');
    form.append('product_id', 'test-product');
    form.append('compression_level', 'auto');

    const response = await makeRequest(`${API_BASE}/optimized-upload/vendor/image`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });

    if (response.status === 200) {
      log('✅ Image uploaded successfully', 'green');
      return { success: true };
    }
    log(`⚠️  Image upload response: ${response.status}`, 'yellow');
    if (response.data && response.data.detail) {
      log(`   Error: ${response.data.detail}`, 'yellow');
    }
    return { success: false };
  } catch (error) {
    log(`❌ Image upload error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testBulkUpload() {
  log('\n=== 4. Bulk Product Upload (CSV) ===', 'cyan');
  try {
    // Create a simple CSV for testing
    const csvContent = `name,sku,price,description,category_id,brand_id,quantity,track_quantity
Bulk Product 1,BLK-001,19.99,Test bulk product 1,1,1,50,true
Bulk Product 2,BLK-002,24.99,Test bulk product 2,1,1,75,true`;

    const form = new FormData();
    form.append('file', Buffer.from(csvContent), {
      filename: 'products.csv',
      contentType: 'text/csv'
    });
    form.append('vendor_id', 'dev-vendor');

    const response = await makeRequest(`${API_BASE}/supplier/products/bulk-import-csv`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });

    if (response.status === 200) {
      log('✅ Bulk upload completed', 'green');
      log(`   Successful: ${response.data.successful || response.data.total_successful || 0}`, 'green');
      log(`   Failed: ${response.data.failed || response.data.total_failed || 0}`, 'green');
      return { success: true };
    }
    log(`⚠️  Bulk upload response: ${response.status}`, 'yellow');
    return { success: false };
  } catch (error) {
    log(`❌ Bulk upload error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testProductListing() {
  log('\n=== 5. Product Listing (Backend) ===', 'cyan');
  try {
    const response = await makeRequest(`${API_BASE}/products/`);
    
    if (response.status === 200) {
      const products = response.data.products || response.data.items || response.data || [];
      const total = response.data.total || response.data.count || products.length;
      log(`✅ Products retrieved: ${total} products`, 'green');
      if (products.length > 0) {
        log(`   First product: ${products[0].name || 'N/A'}`, 'green');
        log(`   Sample products: ${products.slice(0, 3).map(p => p.name || p.sku).join(', ')}`, 'green');
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

async function testFrontendConnection() {
  log('\n=== 6. Frontend Connection ===', 'cyan');
  try {
    const response = await makeRequest(`${FRONTEND_URL}/`);
    
    if (response.status === 307 || response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      return true;
    }
    log(`⚠️  Frontend response: ${response.status}`, 'yellow');
    return false;
  } catch (error) {
    log(`⚠️  Frontend connection: ${error.message}`, 'yellow');
    log('   (This is OK if frontend is not running)', 'yellow');
    return false;
  }
}

async function testFrontendProducts() {
  log('\n depths=== 7. Frontend Products Page ===', 'cyan');
  try {
    const response = await makeRequest(`${FRONTEND_URL}/products`);
    
    if (response.status === 200 || response.status === 307) {
      log('✅ Frontend products page accessible', 'green');
      return true;
    }
    log(`⚠️  Frontend products page response: ${response.status}`, 'yellow');
    return false;
  } catch (error) {
    log(`⚠️  Frontend products page: ${error.message}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n🚀 Starting Complete Vendor Product Workflow Test', 'blue');
  log('=' .repeat(60), 'blue');

  const results = {
    health: false,
    productUpload: false,
    imageUpload: false,
    bulkUpload: false,
    productListing: false,
    frontendConnection: false,
    frontendProducts: false,
  };

  // Run tests
  results.health = await testHealthCheck();
  results.productUpload = (await testVendorProductUpload()).success;
  results.imageUpload = (await testImageUpload()).success;
  results.bulkUpload = (await testBulkUpload()).success;
  
  // Test product listing multiple times to ensure visibility
  const listingResult = await testProductListing();
  results.productListing = listingResult.success;
  
  // Wait a bit for any async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test listing again
  const listingResult2 = await testProductListing();
  if (listingResult2.success && listingResult2.count > 0) {
    results.productListing = true;
  }

  results.frontendConnection = await testFrontendConnection();
  results.frontendProducts = await testFrontendProducts();

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
    log(`\n✅ SUCCESS: Products are visible in backend!`, 'green');
    log(`   Total products: ${listingResult.count}`, 'green');
  } else {
    log(`\n⚠️  Products may not be visible yet. Check database connection.`, 'yellow');
  }

  if (results.frontendConnection || results.frontendProducts) {
    log(`\n✅ Frontend is accessible!`, 'green');
    log(`   Visit: ${FRONTEND_URL}/products to see products`, 'green');
  }

  log('\n' + '='.repeat(60), 'blue');
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

