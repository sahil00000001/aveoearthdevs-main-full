/**
 * Database Enum Check
 * Check what enum values are actually in the database
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
};

async function checkDatabaseEnums() {
  console.log('🔍 Database Enum Check');
  console.log('======================');
  
  try {
    // Test 1: Check if we can query products with lowercase values
    console.log('1. Testing products API with lowercase status...');
    
    const lowercaseResponse = await fetch(`${TEST_CONFIG.backend_url}/products/?status=active`);
    if (lowercaseResponse.ok) {
      const data = await lowercaseResponse.json();
      console.log(`   ✅ Lowercase 'active' works: ${data.total} products`);
    } else {
      const error = await lowercaseResponse.text();
      console.log(`   ❌ Lowercase 'active' failed: ${lowercaseResponse.status}`);
      console.log(`   📝 Error: ${error.substring(0, 100)}...`);
    }
    
    // Test 2: Check if we can query products with uppercase values
    console.log('\n2. Testing products API with uppercase status...');
    
    const uppercaseResponse = await fetch(`${TEST_CONFIG.backend_url}/products/?status=ACTIVE`);
    if (uppercaseResponse.ok) {
      const data = await uppercaseResponse.json();
      console.log(`   ✅ Uppercase 'ACTIVE' works: ${data.total} products`);
    } else {
      const error = await uppercaseResponse.text();
      console.log(`   ❌ Uppercase 'ACTIVE' failed: ${uppercaseResponse.status}`);
      console.log(`   📝 Error: ${error.substring(0, 100)}...`);
    }
    
    // Test 3: Check products without status filter
    console.log('\n3. Testing products API without status filter...');
    
    const noFilterResponse = await fetch(`${TEST_CONFIG.backend_url}/products/`);
    if (noFilterResponse.ok) {
      const data = await noFilterResponse.json();
      console.log(`   ✅ No filter works: ${data.total} products`);
    } else {
      const error = await noFilterResponse.text();
      console.log(`   ❌ No filter failed: ${noFilterResponse.status}`);
      console.log(`   📝 Error: ${error.substring(0, 100)}...`);
    }
    
    // Test 4: Check backend health
    console.log('\n4. Checking backend health...');
    
    const healthResponse = await fetch(`${TEST_CONFIG.backend_url}/health`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`   ✅ Backend healthy: ${data.status}`);
    } else {
      console.log(`   ❌ Backend unhealthy: ${healthResponse.status}`);
    }
    
    console.log('\n======================');
    console.log('🎯 Enum Check Results:');
    console.log('- This will help identify if the issue is with enum values');
    console.log('- Check the terminal logs for specific enum errors');
    console.log('- The issue might be in the database schema vs code mismatch');
    
  } catch (error) {
    console.error('❌ Enum check failed:', error.message);
  }
}

// Run the check
checkDatabaseEnums();
