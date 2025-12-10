/**
 * Comprehensive Vendor Workflow Test
 * Tests vendor account creation, bulk upload, image compression, and product visibility
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  frontend_url: 'http://localhost:5176',
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
};

// Test results storage
let testResults = {
  total_tests: 0,
  passed_tests: 0,
  failed_tests: 0,
  results: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function addTestResult(testName, success, details = '') {
  testResults.total_tests++;
  if (success) {
    testResults.passed_tests++;
    log(`✅ ${testName}`, 'success');
  } else {
    testResults.failed_tests++;
    log(`❌ ${testName}: ${details}`, 'error');
  }
  
  testResults.results.push({
    test: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
}

// Test functions
async function testServiceHealth() {
  log('🔍 Testing service health...');
  
  // Test frontend
  try {
    const response = await fetch(`${TEST_CONFIG.frontend_url}/`);
    if (response.ok) {
      addTestResult('Frontend Health', true);
    } else {
      addTestResult('Frontend Health', false, `Status: ${response.status}`);
    }
  } catch (error) {
    addTestResult('Frontend Health', false, error.message);
  }
  
  // Test backend
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/`);
    if (response.ok) {
      addTestResult('Backend Health', true);
    } else {
      addTestResult('Backend Health', false, `Status: ${response.status}`);
    }
  } catch (error) {
    addTestResult('Backend Health', false, error.message);
  }
  
  // Test Supabase
  try {
    const response = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/`, {
      headers: { 'apikey': TEST_CONFIG.supabase_key }
    });
    if (response.ok) {
      addTestResult('Supabase Health', true);
    } else {
      addTestResult('Supabase Health', false, `Status: ${response.status}`);
    }
  } catch (error) {
    addTestResult('Supabase Health', false, error.message);
  }
}

async function testVendorAccountCreation() {
  log('👤 Testing vendor account creation...');
  
  const vendorData = {
    email: `vendor-test-${Date.now()}@example.com`,
    password: 'VendorTest123!',
    first_name: 'Test',
    last_name: 'Vendor',
    phone: '+1234567890',
    role: 'supplier'
  };
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('Vendor Account Creation', true, `User ID: ${data.user?.id}`);
      return data.user?.id;
    } else {
      const error = await response.text();
      addTestResult('Vendor Account Creation', false, `Status: ${response.status}, Error: ${error}`);
      return null;
    }
  } catch (error) {
    addTestResult('Vendor Account Creation', false, error.message);
    return null;
  }
}

async function testVendorLogin(email, password) {
  log('🔐 Testing vendor login...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('Vendor Login', true, `Token received`);
      return data.access_token;
    } else {
      const error = await response.text();
      addTestResult('Vendor Login', false, `Status: ${response.status}, Error: ${error}`);
      return null;
    }
  } catch (error) {
    addTestResult('Vendor Login', false, error.message);
    return null;
  }
}

async function testBulkCSVUpload(token, csvFile) {
  log(`📁 Testing bulk CSV upload: ${csvFile}...`);
  
  try {
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), csvFile);
    formData.append('vendor_id', 'test-vendor-123');
    formData.append('product_id', 'bulk-upload-test');
    
    const response = await fetch(`${TEST_CONFIG.backend_url}/supplier/products/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult(`CSV Upload ${csvFile}`, true, `Uploaded ${data.products_created || 0} products`);
      return data;
    } else {
      const error = await response.text();
      addTestResult(`CSV Upload ${csvFile}`, false, `Status: ${response.status}, Error: ${error}`);
      return null;
    }
  } catch (error) {
    addTestResult(`CSV Upload ${csvFile}`, false, error.message);
    return null;
  }
}

async function testImageCompression(token) {
  log('🖼️ Testing image compression system...');
  
  try {
    // Create a test image (1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append('file', new Blob([testImageData], { type: 'image/png' }), 'test-image.png');
    formData.append('vendor_id', 'test-vendor-123');
    formData.append('product_id', 'image-compression-test');
    formData.append('compression_level', 'auto');
    formData.append('verify_image', 'true');
    
    const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/vendor/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('Image Compression', true, `Compression ratio: ${data.data?.compression_ratio || 'N/A'}%`);
      return data;
    } else {
      const error = await response.text();
      addTestResult('Image Compression', false, `Status: ${response.status}, Error: ${error}`);
      return null;
    }
  } catch (error) {
    addTestResult('Image Compression', false, error.message);
    return null;
  }
}

async function testSupabaseDatabaseUpdates() {
  log('🗄️ Testing Supabase database updates...');
  
  try {
    // Check products table
    const productsResponse = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/products?select=*&limit=10`, {
      headers: {
        'apikey': TEST_CONFIG.supabase_key,
        'Authorization': `Bearer ${TEST_CONFIG.supabase_key}`
      }
    });
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      addTestResult('Supabase Products Query', true, `Found ${products.length} products`);
      
      if (products.length > 0) {
        const latestProduct = products[0];
        addTestResult('Latest Product Data', true, `Product: ${latestProduct.name}, Price: $${latestProduct.price}`);
      }
    } else {
      addTestResult('Supabase Products Query', false, `Status: ${productsResponse.status}`);
    }
    
    // Check categories table
    const categoriesResponse = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/categories?select=*&limit=10`, {
      headers: {
        'apikey': TEST_CONFIG.supabase_key,
        'Authorization': `Bearer ${TEST_CONFIG.supabase_key}`
      }
    });
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      addTestResult('Supabase Categories Query', true, `Found ${categories.length} categories`);
    } else {
      addTestResult('Supabase Categories Query', false, `Status: ${categoriesResponse.status}`);
    }
    
  } catch (error) {
    addTestResult('Supabase Database Updates', false, error.message);
  }
}

async function testProductVisibility() {
  log('👁️ Testing product visibility on main website...');
  
  try {
    // Test products endpoint
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('Product Visibility API', true, `Found ${data.products?.length || 0} products`);
      
      if (data.products && data.products.length > 0) {
        const visibleProducts = data.products.filter(p => p.status === 'active' && p.visibility === 'visible');
        addTestResult('Visible Products Count', true, `${visibleProducts.length} visible products`);
      }
    } else {
      addTestResult('Product Visibility API', false, `Status: ${response.status}`);
    }
    
    // Test frontend product page
    const frontendResponse = await fetch(`${TEST_CONFIG.frontend_url}/products`);
    if (frontendResponse.ok) {
      addTestResult('Frontend Products Page', true);
    } else {
      addTestResult('Frontend Products Page', false, `Status: ${frontendResponse.status}`);
    }
    
  } catch (error) {
    addTestResult('Product Visibility', false, error.message);
  }
}

async function stressTestImageCompression(token) {
  log('💪 Stress testing image compression...');
  
  const compressionLevels = ['auto', 'high', 'medium', 'low'];
  let successCount = 0;
  
  for (const level of compressionLevels) {
    try {
      const testImageData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      
      const formData = new FormData();
      formData.append('file', new Blob([testImageData], { type: 'image/png' }), `stress-test-${level}.png`);
      formData.append('vendor_id', 'test-vendor-123');
      formData.append('product_id', `stress-test-${level}`);
      formData.append('compression_level', level);
      
      const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/vendor/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        successCount++;
        log(`   ✅ Compression level ${level} working`);
      } else {
        log(`   ❌ Compression level ${level} failed: ${response.status}`);
      }
    } catch (error) {
      log(`   ❌ Compression level ${level} error: ${error.message}`);
    }
  }
  
  addTestResult('Stress Test Image Compression', successCount === compressionLevels.length, 
    `${successCount}/${compressionLevels.length} compression levels working`);
}

async function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_tests: testResults.total_tests,
      passed: testResults.passed_tests,
      failed: testResults.failed_tests,
      success_rate: ((testResults.passed_tests / testResults.total_tests) * 100).toFixed(1)
    },
    results: testResults.results,
    recommendations: []
  };
  
  // Add recommendations
  if (testResults.failed_tests > 0) {
    report.recommendations.push('Review failed tests and fix issues');
  }
  
  if (testResults.passed_tests / testResults.total_tests < 0.8) {
    report.recommendations.push('Consider improving system reliability');
  }
  
  // Save report
  const reportPath = './vendor_workflow_test_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Test report saved to: ${reportPath}`);
  return report;
}

// Main test execution
async function runVendorWorkflowTests() {
  log('🚀 Starting Comprehensive Vendor Workflow Tests');
  log('===============================================');
  
  try {
    // Test 1: Service Health
    await testServiceHealth();
    
    // Test 2: Vendor Account Creation
    const vendorEmail = `vendor-test-${Date.now()}@example.com`;
    const vendorId = await testVendorAccountCreation();
    
    // Test 3: Vendor Login
    const token = await testVendorLogin(vendorEmail, 'VendorTest123!');
    
    if (token) {
      // Test 4: Bulk CSV Upload Tests
      const csvFiles = [
        'test_products_valid.csv',
        'test_products_edge_cases.csv',
        'test_products_invalid.csv'
      ];
      
      for (const csvFile of csvFiles) {
        if (fs.existsSync(csvFile)) {
          await testBulkCSVUpload(token, csvFile);
        } else {
          addTestResult(`CSV File ${csvFile}`, false, 'File not found');
        }
      }
      
      // Test 5: Image Compression
      await testImageCompression(token);
      
      // Test 6: Stress Test Image Compression
      await stressTestImageCompression(token);
    }
    
    // Test 7: Database Updates
    await testSupabaseDatabaseUpdates();
    
    // Test 8: Product Visibility
    await testProductVisibility();
    
    // Generate report
    const report = await generateTestReport();
    
    // Print summary
    log('===============================================');
    log('📊 Vendor Workflow Test Summary:');
    log(`Total Tests: ${report.summary.total_tests}`);
    log(`Passed: ${report.summary.passed} ✅`);
    log(`Failed: ${report.summary.failed} ❌`);
    log(`Success Rate: ${report.summary.success_rate}%`);
    
    if (report.recommendations.length > 0) {
      log('💡 Recommendations:');
      report.recommendations.forEach(rec => log(`  - ${rec}`));
    }
    
    log('===============================================');
    
    if (report.summary.failed === 0) {
      log('🎉 All vendor workflow tests passed!', 'success');
    } else {
      log(`⚠️  ${report.summary.failed} tests failed. Please review the report.`, 'error');
    }
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  }
}

// Run tests
if (require.main === module) {
  runVendorWorkflowTests();
}

module.exports = {
  runVendorWorkflowTests,
  testResults
};
