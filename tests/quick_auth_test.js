/**
 * Quick Authentication Test Script
 * Tests all authentication flows after configuration
 */

const TEST_CONFIG = {
  frontend_url: 'http://localhost:5173',
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co'
};

async function quickAuthTest() {
  console.log('🔐 Quick Authentication Test');
  console.log('============================');
  
  try {
    // Test 1: Frontend accessibility
    console.log('1. Testing frontend accessibility...');
    try {
      const response = await fetch(`${TEST_CONFIG.frontend_url}/`);
      if (response.ok) {
        console.log('   ✅ Frontend is accessible');
      } else {
        console.log(`   ❌ Frontend error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Frontend error: ${error.message}`);
    }
    
    // Test 2: Auth test page
    console.log('\n2. Testing auth test page...');
    try {
      const response = await fetch(`${TEST_CONFIG.frontend_url}/auth-test`);
      if (response.ok) {
        console.log('   ✅ Auth test page is accessible');
        console.log(`   🌐 Visit: ${TEST_CONFIG.frontend_url}/auth-test`);
      } else {
        console.log(`   ❌ Auth test page error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Auth test page error: ${error.message}`);
    }
    
    // Test 3: Backend health
    console.log('\n3. Testing backend health...');
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/`);
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Backend is running');
        console.log(`   📊 Service: ${data.name}`);
      } else {
        console.log(`   ❌ Backend error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Backend error: ${error.message}`);
    }
    
    // Test 4: Supabase connection
    console.log('\n4. Testing Supabase connection...');
    try {
      const response = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
        }
      });
      if (response.ok) {
        console.log('   ✅ Supabase connection successful');
      } else {
        console.log(`   ❌ Supabase error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Supabase error: ${error.message}`);
    }
    
    console.log('\n============================');
    console.log('🎯 Next Steps:');
    console.log('1. Configure Google OAuth in Supabase dashboard');
    console.log('2. Visit the auth test page to test authentication');
    console.log('3. Test Google sign-in functionality');
    console.log('4. Check browser console for any errors');
    console.log('\n📱 Auth Test Page: http://localhost:5173/auth-test');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
quickAuthTest();
