/**
 * Test System After Database Population
 * Tests all workflows after adding sample data
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080',
  frontend_url: 'http://localhost:5176'
};

async function testSystemAfterPopulation() {
  console.log('🚀 Testing System After Database Population');
  console.log('==========================================');
  
  const results = {
    products: false,
    categories: false,
    brands: false,
    productDetails: false,
    frontendProducts: false
  };
  
  // Test 1: Products endpoint
  console.log('\n📦 Testing products endpoint...');
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Products endpoint works: ${data.total || 0} products`);
      results.products = data.total > 0;
      
      if (data.total > 0) {
        console.log('   📦 Sample products:');
        data.items?.slice(0, 3).forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.name} - $${product.price}`);
        });
      }
    } else {
      console.log(`   ❌ Products endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Products endpoint error: ${error.message}`);
  }
  
  // Test 2: Categories endpoint
  console.log('\n📂 Testing categories endpoint...');
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/categories/`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Categories endpoint works: ${data.length || 0} categories`);
      results.categories = true;
      
      if (data.length > 0) {
        console.log('   📂 Sample categories:');
        data.slice(0, 3).forEach((category, index) => {
          console.log(`      ${index + 1}. ${category.name}`);
        });
      }
    } else {
      console.log(`   ❌ Categories endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Categories endpoint error: ${error.message}`);
  }
  
  // Test 3: Brands endpoint
  console.log('\n🏷️ Testing brands endpoint...');
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/brands/`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Brands endpoint works: ${data.length || 0} brands`);
      results.brands = true;
      
      if (data.length > 0) {
        console.log('   🏷️ Sample brands:');
        data.slice(0, 3).forEach((brand, index) => {
          console.log(`      ${index + 1}. ${brand.name}`);
        });
      }
    } else {
      console.log(`   ❌ Brands endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Brands endpoint error: ${error.message}`);
  }
  
  // Test 4: Individual product details
  console.log('\n🔍 Testing individual product details...');
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/1`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Product details work: ${data.name}`);
      console.log(`   📊 Price: $${data.price}, Category: ${data.category?.name || 'N/A'}`);
      results.productDetails = true;
    } else {
      console.log(`   ❌ Product details failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Product details error: ${error.message}`);
  }
  
  // Test 5: Frontend product visibility
  console.log('\n🌐 Testing frontend product visibility...');
  try {
    const response = await fetch(`${TEST_CONFIG.frontend_url}`);
    if (response.ok) {
      console.log('   ✅ Frontend is accessible');
      results.frontendProducts = true;
    } else {
      console.log(`   ❌ Frontend failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend error: ${error.message}`);
  }
  
  // Results summary
  console.log('\n==========================================');
  console.log('🎯 SYSTEM TEST RESULTS AFTER POPULATION');
  console.log('==========================================');
  
  console.log(`📦 Products: ${results.products ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`📂 Categories: ${results.categories ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`🏷️ Brands: ${results.brands ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`🔍 Product Details: ${results.productDetails ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`🌐 Frontend: ${results.frontendProducts ? '✅ WORKING' : '❌ ISSUES'}`);
  
  const allWorking = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 OVERALL STATUS:');
  console.log(`   ${allWorking ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ SOME ISSUES REMAIN'}`);
  
  if (allWorking) {
    console.log('\n🚀 SYSTEM IS READY FOR TESTING!');
    console.log('📱 All core endpoints are working');
    console.log('🛒 Products are visible and accessible');
    console.log('🏪 Ready for vendor and admin testing');
  } else {
    console.log('\n🔧 REMAINING ISSUES:');
    if (!results.products) console.log('   - Products endpoint issues');
    if (!results.categories) console.log('   - Categories endpoint issues');
    if (!results.brands) console.log('   - Brands endpoint issues');
    if (!results.productDetails) console.log('   - Product details issues');
    if (!results.frontendProducts) console.log('   - Frontend access issues');
  }
  
  return results;
}

// Run the test
testSystemAfterPopulation();
