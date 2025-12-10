/**
 * Test backend API products endpoint
 */

const BACKEND_URL = 'http://localhost:8080';

async function testBackendProducts() {
  console.log('\n🧪 Testing Backend Products API...\n');
  
  try {
    // Test 1: Get products (backend routes are at root, not /api/v1)
    console.log('1. Testing GET /products...');
    const productsResponse = await fetch(`${BACKEND_URL}/products?limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      console.log('✅ Products endpoint works!');
      console.log(`   Total: ${data.total || 0}, Found: ${data.data?.length || 0} products`);
      if (data.data && data.data.length > 0) {
        console.log(`   Sample: ${data.data[0].name} - ₹${data.data[0].price}`);
      } else {
        console.log('   ⚠️  No products in database');
      }
    } else {
      console.log(`❌ Products endpoint failed: ${productsResponse.status}`);
      const errorText = await productsResponse.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
    }
    
    // Test 2: Get featured products  
    console.log('\n2. Testing GET /search/trending...');
    const featuredResponse = await fetch(`${BACKEND_URL}/search/trending?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (featuredResponse.ok) {
      const featured = await featuredResponse.json();
      console.log('✅ Featured products endpoint works!');
      console.log(`   Found: ${featured.length || 0} featured products`);
    } else {
      console.log(`⚠️  Featured endpoint: ${featuredResponse.status} (might not exist)`);
    }
    
    // Test 3: Get eco-friendly products
    console.log('\n3. Testing GET /search/eco-friendly...');
    const ecoResponse = await fetch(`${BACKEND_URL}/search/eco-friendly?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (ecoResponse.ok) {
      const eco = await ecoResponse.json();
      console.log('✅ Eco-friendly products endpoint works!');
      console.log(`   Found: ${eco.length || 0} eco-friendly products`);
    } else {
      console.log(`⚠️  Eco-friendly endpoint: ${ecoResponse.status} (might not exist)`);
    }
    
    console.log('\n✅ Backend API test completed!\n');
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n❌ Request timeout - backend might not be running');
    } else {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }
}

testBackendProducts();

