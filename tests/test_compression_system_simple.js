/**
 * Simple Test for Image Compression System
 * Tests basic functionality after backend restart
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080'
};

async function testCompressionSystem() {
  console.log('🧪 Testing Image Compression System...\n');
  
  try {
    // Test 1: Check if compression levels endpoint exists
    console.log('1. Testing compression levels endpoint...');
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/compression-levels`);
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Compression levels endpoint working');
        console.log(`   📊 Found ${Object.keys(data.data?.compression_levels || {}).length} compression levels`);
      } else {
        console.log(`   ❌ Compression levels endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Compression levels endpoint error: ${error.message}`);
    }
    
    // Test 2: Check if image upload endpoint exists
    console.log('\n2. Testing image upload endpoint...');
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/vendor/image`, {
        method: 'OPTIONS'
      });
      if (response.status !== 404) {
        console.log('   ✅ Image upload endpoint exists');
      } else {
        console.log('   ❌ Image upload endpoint not found');
      }
    } catch (error) {
      console.log(`   ❌ Image upload endpoint error: ${error.message}`);
    }
    
    // Test 3: Check if batch upload endpoint exists
    console.log('\n3. Testing batch upload endpoint...');
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/vendor/batch`, {
        method: 'OPTIONS'
      });
      if (response.status !== 404) {
        console.log('   ✅ Batch upload endpoint exists');
      } else {
        console.log('   ❌ Batch upload endpoint not found');
      }
    } catch (error) {
      console.log(`   ❌ Batch upload endpoint error: ${error.message}`);
    }
    
    // Test 4: Check if analytics endpoint exists
    console.log('\n4. Testing analytics endpoint...');
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/optimized-upload/vendor/analytics/test-vendor`, {
        method: 'GET'
      });
      if (response.status !== 404) {
        console.log('   ✅ Analytics endpoint exists');
      } else {
        console.log('   ❌ Analytics endpoint not found');
      }
    } catch (error) {
      console.log(`   ❌ Analytics endpoint error: ${error.message}`);
    }
    
    console.log('\n🎯 Image Compression System Test Complete!');
    console.log('\n📝 Note: If endpoints are not found, restart the backend server to load new routes.');
    console.log('   Run: cd backend && python main.py');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompressionSystem();
