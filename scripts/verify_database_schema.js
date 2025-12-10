/**
 * Database Schema Verification Test
 * Check what's actually in the database
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
};

async function verifyDatabaseSchema() {
  console.log('🔍 Database Schema Verification');
  console.log('================================');
  
  try {
    // Test 1: Check if we can query the users table directly
    console.log('1. Testing direct database access...');
    
    try {
      const response = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/users?select=id,email&limit=1`, {
        headers: {
          'apikey': TEST_CONFIG.supabase_key,
          'Authorization': `Bearer ${TEST_CONFIG.supabase_key}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Direct database access works');
        console.log(`   📊 Found ${data.length} users`);
      } else {
        console.log(`   ❌ Direct database access failed: ${response.status}`);
        const error = await response.text();
        console.log(`   📝 Error: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Direct database error: ${error.message}`);
    }
    
    // Test 2: Check backend health
    console.log('\n2. Checking backend health...');
    
    try {
      const healthResponse = await fetch(`${TEST_CONFIG.backend_url}/health`);
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log(`   ✅ Backend healthy: ${data.status}`);
      } else {
        console.log(`   ❌ Backend unhealthy: ${healthResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Backend error: ${error.message}`);
    }
    
    // Test 3: Check products API (this should work)
    console.log('\n3. Testing products API...');
    
    try {
      const productsResponse = await fetch(`${TEST_CONFIG.backend_url}/products/`);
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        console.log(`   ✅ Products API works: ${data.total} products`);
      } else {
        console.log(`   ❌ Products API failed: ${productsResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Products API error: ${error.message}`);
    }
    
    // Test 4: Try a simple signup with minimal data
    console.log('\n4. Testing minimal signup...');
    
    try {
      const timestamp = Date.now();
      const response = await fetch(`${TEST_CONFIG.backend_url}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `minimal-${timestamp}@example.com`,
          password: 'TestPassword123!',
          first_name: 'Test',
          last_name: 'User',
          phone: '+1234567890',
          user_type: 'buyer'  // Try buyer instead of supplier
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Minimal signup successful!');
        console.log(`   📧 User ID: ${data.user?.id || 'N/A'}`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Minimal signup failed: ${response.status}`);
        console.log(`   📝 Error: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Minimal signup error: ${error.message}`);
    }
    
    console.log('\n================================');
    console.log('🎯 Database Schema Verification Results:');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Check if the SQL script actually ran successfully');
    console.log('2. Verify the database connection in Supabase dashboard');
    console.log('3. Check if there are any error messages in Supabase logs');
    console.log('4. Try running the SQL script again');
    console.log('');
    console.log('💡 Possible Issues:');
    console.log('- SQL script may not have completed successfully');
    console.log('- Database connection may be pointing to wrong database');
    console.log('- Backend may be using cached schema information');
    console.log('- Supabase RLS policies may be blocking the changes');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run the verification
verifyDatabaseSchema();
