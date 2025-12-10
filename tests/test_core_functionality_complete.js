/**
 * Complete Workflow Test - Bypass Authentication
 * Tests all core functionality without authentication barriers
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080',
  frontend_url: 'http://localhost:5176'
};

async function testCoreFunctionality() {
  console.log('🚀 Complete Core Functionality Test');
  console.log('===================================');
  
  const results = {
    systemHealth: false,
    productEndpoints: {},
    authEndpoints: {},
    adminEndpoints: {},
    supplierEndpoints: {},
    cartEndpoints: {},
    orderEndpoints: {}
  };
  
  // Test 1: System Health
  console.log('\n🏥 Testing System Health');
  console.log('========================');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend healthy: ${data.status}`);
      results.systemHealth = true;
    } else {
      console.log(`❌ Backend unhealthy: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Backend error: ${error.message}`);
  }
  
  // Test 2: Product Endpoints
  console.log('\n📦 Testing Product Endpoints');
  console.log('============================');
  
  const productEndpoints = [
    { name: 'Products List', url: '/products/', method: 'GET' },
    { name: 'Product Details', url: '/products/1', method: 'GET' },
    { name: 'Categories', url: '/products/categories/', method: 'GET' },
    { name: 'Brands', url: '/products/brands/', method: 'GET' },
    { name: 'Search Products', url: '/products/search?q=bamboo', method: 'GET' }
  ];
  
  for (const endpoint of productEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method
      });
      
      results.productEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      console.log(`   ${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
      if (response.ok && endpoint.name === 'Products List') {
        const data = await response.json();
        console.log(`      📊 Found ${data.total || 0} products`);
      }
      
    } catch (error) {
      results.productEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Test 3: Authentication Endpoints
  console.log('\n🔐 Testing Authentication Endpoints');
  console.log('===================================');
  
  const authEndpoints = [
    { name: 'Signup', url: '/auth/signup', method: 'POST' },
    { name: 'Login', url: '/auth/login', method: 'POST' },
    { name: 'Phone Signup', url: '/auth/signup-phone', method: 'POST' },
    { name: 'Refresh Token', url: '/auth/refresh', method: 'POST' }
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      results.authEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      // For auth endpoints, we expect 422 (validation error) or 400 (bad request) as "working"
      const isWorking = response.status === 422 || response.status === 400 || response.ok;
      console.log(`   ${isWorking ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      results.authEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Test 4: Supplier Endpoints
  console.log('\n🏪 Testing Supplier Endpoints');
  console.log('==============================');
  
  const supplierEndpoints = [
    { name: 'Supplier Products', url: '/supplier/products/', method: 'GET' },
    { name: 'Create Product', url: '/supplier/products/', method: 'POST' },
    { name: 'Update Product', url: '/supplier/products/1', method: 'PUT' },
    { name: 'Delete Product', url: '/supplier/products/1', method: 'DELETE' }
  ];
  
  for (const endpoint of supplierEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          { 'Content-Type': 'application/json' } : {},
        body: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          JSON.stringify({}) : undefined
      });
      
      results.supplierEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      // For supplier endpoints, we expect 403 (forbidden) or 401 (unauthorized) as "working"
      const isWorking = response.status === 403 || response.status === 401 || response.ok;
      console.log(`   ${isWorking ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      results.supplierEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Test 5: Admin Endpoints
  console.log('\n👑 Testing Admin Endpoints');
  console.log('===========================');
  
  const adminEndpoints = [
    { name: 'Admin Products', url: '/admin/products/', method: 'GET' },
    { name: 'Admin Users', url: '/admin/users/', method: 'GET' },
    { name: 'Admin Orders', url: '/admin/orders/', method: 'GET' },
    { name: 'Admin Analytics', url: '/admin/analytics/', method: 'GET' }
  ];
  
  for (const endpoint of adminEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method
      });
      
      results.adminEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      // For admin endpoints, we expect 403 (forbidden) or 401 (unauthorized) as "working"
      const isWorking = response.status === 403 || response.status === 401 || response.ok;
      console.log(`   ${isWorking ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      results.adminEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Test 6: Cart Endpoints
  console.log('\n🛒 Testing Cart Endpoints');
  console.log('=========================');
  
  const cartEndpoints = [
    { name: 'Get Cart', url: '/cart/', method: 'GET' },
    { name: 'Add to Cart', url: '/cart/add', method: 'POST' },
    { name: 'Update Cart', url: '/cart/update', method: 'PUT' },
    { name: 'Remove from Cart', url: '/cart/remove', method: 'DELETE' }
  ];
  
  for (const endpoint of cartEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          { 'Content-Type': 'application/json' } : {},
        body: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          JSON.stringify({}) : undefined
      });
      
      results.cartEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      // For cart endpoints, we expect 403 (forbidden) or 401 (unauthorized) as "working"
      const isWorking = response.status === 403 || response.status === 401 || response.ok;
      console.log(`   ${isWorking ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      results.cartEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Test 7: Order Endpoints
  console.log('\n📋 Testing Order Endpoints');
  console.log('===========================');
  
  const orderEndpoints = [
    { name: 'Get Orders', url: '/orders/', method: 'GET' },
    { name: 'Create Order', url: '/orders/', method: 'POST' },
    { name: 'Order Details', url: '/orders/1', method: 'GET' },
    { name: 'Update Order', url: '/orders/1', method: 'PUT' }
  ];
  
  for (const endpoint of orderEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint.url}`, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          { 'Content-Type': 'application/json' } : {},
        body: endpoint.method === 'POST' || endpoint.method === 'PUT' ? 
          JSON.stringify({}) : undefined
      });
      
      results.orderEndpoints[endpoint.name] = {
        status: response.status,
        success: response.ok,
        accessible: true
      };
      
      // For order endpoints, we expect 403 (forbidden) or 401 (unauthorized) as "working"
      const isWorking = response.status === 403 || response.status === 401 || response.ok;
      console.log(`   ${isWorking ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      results.orderEndpoints[endpoint.name] = {
        success: false,
        accessible: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Results summary
  console.log('\n===================================');
  console.log('🎯 COMPLETE CORE FUNCTIONALITY TEST');
  console.log('===================================');
  
  console.log(`🏥 System Health: ${results.systemHealth ? '✅ WORKING' : '❌ ISSUES'}`);
  
  console.log('\n📦 Product Endpoints:');
  Object.entries(results.productEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  console.log('\n🔐 Authentication Endpoints:');
  Object.entries(results.authEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  console.log('\n🏪 Supplier Endpoints:');
  Object.entries(results.supplierEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  console.log('\n👑 Admin Endpoints:');
  Object.entries(results.adminEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  console.log('\n🛒 Cart Endpoints:');
  Object.entries(results.cartEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  console.log('\n📋 Order Endpoints:');
  Object.entries(results.orderEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'WORKING' : 'ISSUES'}`);
  });
  
  // Overall assessment
  const productWorking = Object.values(results.productEndpoints).some(r => r.success);
  const authWorking = Object.values(results.authEndpoints).some(r => r.success);
  const supplierWorking = Object.values(results.supplierEndpoints).some(r => r.success);
  const adminWorking = Object.values(results.adminEndpoints).some(r => r.success);
  const cartWorking = Object.values(results.cartEndpoints).some(r => r.success);
  const orderWorking = Object.values(results.orderEndpoints).some(r => r.success);
  
  console.log('\n🎯 OVERALL ASSESSMENT:');
  console.log(`   ${results.systemHealth ? '✅' : '❌'} Core System: ${results.systemHealth ? 'OPERATIONAL' : 'ISSUES'}`);
  console.log(`   ${productWorking ? '✅' : '❌'} Product Management: ${productWorking ? 'WORKING' : 'ISSUES'}`);
  console.log(`   ${authWorking ? '✅' : '❌'} Authentication: ${authWorking ? 'WORKING' : 'ISSUES'}`);
  console.log(`   ${supplierWorking ? '✅' : '❌'} Supplier Features: ${supplierWorking ? 'WORKING' : 'ISSUES'}`);
  console.log(`   ${adminWorking ? '✅' : '❌'} Admin Features: ${adminWorking ? 'WORKING' : 'ISSUES'}`);
  console.log(`   ${cartWorking ? '✅' : '❌'} Cart Features: ${cartWorking ? 'WORKING' : 'ISSUES'}`);
  console.log(`   ${orderWorking ? '✅' : '❌'} Order Features: ${orderWorking ? 'WORKING' : 'ISSUES'}`);
  
  const overallWorking = results.systemHealth && productWorking && authWorking;
  
  console.log('\n🎯 FINAL STATUS:');
  console.log(`   ${overallWorking ? '✅ SYSTEM IS FUNCTIONAL' : '❌ SYSTEM NEEDS FIXES'}`);
  
  if (overallWorking) {
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Run the database population script in Supabase');
    console.log('   2. Test with real user signups (wait for rate limit reset)');
    console.log('   3. Test product upload with real images');
    console.log('   4. Test complete end-to-end workflows');
  } else {
    console.log('\n🔧 CRITICAL FIXES NEEDED:');
    if (!results.systemHealth) console.log('   - Fix backend health issues');
    if (!productWorking) console.log('   - Fix product endpoint issues');
    if (!authWorking) console.log('   - Fix authentication system');
  }
  
  return results;
}

// Run the test
testCoreFunctionality();
