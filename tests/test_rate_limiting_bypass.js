/**
 * Rate Limiting Bypass Test
 * Test different approaches to bypass Supabase rate limiting
 */

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
};

async function testRateLimitingBypass() {
  console.log('🚀 Rate Limiting Bypass Test');
  console.log('============================');
  
  try {
    // Test 1: Try different email domains
    console.log('1. Testing different email domains...');
    
    const emailDomains = [
      'test@example.com',
      'test@test.com', 
      'test@demo.com',
      'test@sample.com',
      'test@localhost.com'
    ];
    
    for (const email of emailDomains) {
      try {
        const response = await fetch(`${TEST_CONFIG.backend_url}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: 'TestPassword123!',
            first_name: 'Test',
            last_name: 'User',
            phone: '+1234567890',
            user_type: 'supplier'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${email} - Signup successful!`);
          console.log(`   📧 User ID: ${data.user?.id || 'N/A'}`);
          break;
        } else {
          const error = await response.text();
          console.log(`   ⚠️ ${email} - Status: ${response.status}`);
          if (error.includes('rate limit')) {
            console.log(`   📝 Rate limited`);
          } else {
            console.log(`   📝 Error: ${error.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${email} - Error: ${error.message}`);
      }
    }
    
    // Test 2: Try phone-based signup
    console.log('\n2. Testing phone-based signup...');
    
    try {
      const phoneResponse = await fetch(`${TEST_CONFIG.backend_url}/auth/signup-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'phone-test@example.com',
          phone: '+1234567891',
          first_name: 'Phone',
          last_name: 'Test',
          user_type: 'supplier'
        })
      });
      
      if (phoneResponse.ok) {
        const data = await phoneResponse.json();
        console.log('   ✅ Phone signup successful!');
        console.log(`   📱 User ID: ${data.user?.id || 'N/A'}`);
      } else {
        const error = await phoneResponse.text();
        console.log(`   ⚠️ Phone signup status: ${phoneResponse.status}`);
        console.log(`   📝 Error: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Phone signup error: ${error.message}`);
    }
    
    // Test 3: Check if we can create products without authentication
    console.log('\n3. Testing product creation without auth...');
    
    try {
      const formData = new FormData();
      formData.append('name', 'Test Product');
      formData.append('category_id', '550e8400-e29b-41d4-a716-446655440001');
      formData.append('sku', 'TEST-PRODUCT-001');
      formData.append('price', '19.99');
      formData.append('short_description', 'Test product');
      formData.append('description', 'This is a test product');
      formData.append('visibility', 'visible');
      formData.append('track_quantity', 'true');
      
      // Create a simple test image
      const testImageData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      formData.append('images', new Blob([testImageData], { type: 'image/png' }), 'test.png');
      
      const productResponse = await fetch(`${TEST_CONFIG.backend_url}/supplier/products/`, {
        method: 'POST',
        body: formData
      });
      
      if (productResponse.ok) {
        const data = await productResponse.json();
        console.log('   ✅ Product created without auth!');
        console.log(`   🛍️ Product ID: ${data.id || 'N/A'}`);
      } else {
        const error = await productResponse.text();
        console.log(`   ⚠️ Product creation status: ${productResponse.status}`);
        console.log(`   📝 Error: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Product creation error: ${error.message}`);
    }
    
    // Test 4: Check current time and suggest wait time
    console.log('\n4. Rate limiting analysis...');
    
    const now = new Date();
    console.log(`   🕐 Current time: ${now.toISOString()}`);
    console.log(`   ⏰ Rate limit typically resets every 60 seconds`);
    console.log(`   💡 Try again in 1-2 minutes`);
    
    console.log('\n============================');
    console.log('🎯 Rate Limiting Test Results:');
    console.log('- Supabase has strict rate limiting for security');
    console.log('- Different email domains may have different limits');
    console.log('- Phone signup might have different limits');
    console.log('- Rate limits reset automatically');
    
    console.log('\n🔧 Solutions:');
    console.log('1. Wait for rate limit to reset (1-2 minutes)');
    console.log('2. Use different email domains');
    console.log('3. Try phone-based signup');
    console.log('4. Contact Supabase support to increase limits');
    
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

// Run the test
testRateLimitingBypass();
