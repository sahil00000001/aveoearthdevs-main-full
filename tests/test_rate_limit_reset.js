/**
 * Test Rate Limiting Reset
 * Check if Supabase rate limiting has reset
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080'
};

async function testRateLimitReset() {
  console.log('🔄 Testing Rate Limit Reset');
  console.log('============================');
  
  try {
    // Test with a unique email to avoid conflicts
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    
    console.log(`📧 Testing with email: ${testEmail}`);
    
    const response = await fetch(`${TEST_CONFIG.backend_url}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890',
        user_type: 'supplier'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Rate limit has reset! Signup successful!');
      console.log(`📧 User ID: ${data.user?.id || 'N/A'}`);
      console.log(`📧 Email: ${data.user?.email || 'N/A'}`);
      console.log(`👤 User Type: ${data.user?.user_type || 'N/A'}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('1. ✅ Rate limiting: Fixed');
      console.log('2. 🔧 Apply database enum fix');
      console.log('3. 🛍️ Upload products with images');
      console.log('4. 🌐 Verify frontend display');
      
    } else {
      const error = await response.text();
      console.log(`⚠️ Rate limit still active: ${response.status}`);
      console.log(`📝 Error: ${error.substring(0, 100)}...`);
      
      if (error.includes('rate limit')) {
        console.log('\n⏰ Rate limit is still active');
        console.log('💡 Wait another 1-2 minutes and try again');
      } else {
        console.log('\n🔧 Different error - may be enum issue');
        console.log('💡 Apply database enum fix first');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRateLimitReset();
