// Simple cart test that uses existing authenticated user
// Set TEST_TOKEN environment variable with a valid auth token, or it will try to login
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:8080';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCartWithToken() {
    console.log('\n🧪 SIMPLE CART TEST');
    console.log('='.repeat(80));
    
    // Get token from env or use Google OAuth user from console
    const token = process.env.TEST_TOKEN || null;
    
    if (!token) {
        console.log('❌ No TEST_TOKEN provided. Please set TEST_TOKEN environment variable.');
        console.log('   Example: $env:TEST_TOKEN="your_token_here"; node tests/test_cart_simple.js');
        console.log('   Or use a token from your browser console after Google OAuth login');
        process.exit(1);
    }
    
    try {
        // Step 1: Verify token
        console.log(`\n🔍 Step 1: Verifying token`);
        const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const profileData = await profileResponse.json();
        if (profileResponse.status !== 200) {
            throw new Error(`Token invalid: ${profileResponse.status} - ${JSON.stringify(profileData)}`);
        }
        
        const userId = profileData.id;
        console.log(`   ✅ Token valid for user: ${userId}`);
        await wait(1000);
        
        // Step 2: Get products
        console.log(`\n🛍️ Step 2: Getting products`);
        const productsResponse = await fetch(`${BASE_URL}/products?limit=10`);
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData.items || productsData.data || (Array.isArray(productsData) ? productsData : []);
        
        if (products.length === 0) {
            throw new Error('No products available');
        }
        
        const productId = products[0].id;
        console.log(`   ✅ Found product: ${productId} - ${products[0].name}`);
        await wait(1000);
        
        // Step 3: Get cart
        console.log(`\n🛒 Step 3: Getting cart`);
        const getCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Cart Status: ${getCartResponse.status}`);
        if (getCartResponse.status === 200) {
            const cartData = await getCartResponse.json();
            const itemCount = cartData.items?.length || cartData.cart_items?.length || 0;
            console.log(`   ✅ Cart retrieved: ${itemCount} items`);
        } else {
            const errorData = await getCartResponse.json();
            console.log(`   ⚠️ Cart error: ${JSON.stringify(errorData)}`);
        }
        await wait(1000);
        
        // Step 4: Add to cart
        console.log(`\n➕ Step 4: Adding product to cart`);
        const addCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });
        
        const addCartData = await addCartResponse.json();
        console.log(`   Add Status: ${addCartResponse.status}`);
        console.log(`   Response: ${JSON.stringify(addCartData, null, 2)}`);
        
        if (addCartResponse.status !== 200 && addCartResponse.status !== 201) {
            throw new Error(`Add to cart failed: ${addCartResponse.status} - ${JSON.stringify(addCartData)}`);
        }
        
        console.log(`   ✅ Item added to cart!`);
        await wait(1000);
        
        // Step 5: Verify cart
        console.log(`\n🔍 Step 5: Verifying cart`);
        const verifyCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (verifyCartResponse.status === 200) {
            const verifyCartData = await verifyCartResponse.json();
            const itemCount = verifyCartData.items?.length || verifyCartData.cart_items?.length || 0;
            console.log(`   ✅ Cart verified: ${itemCount} items`);
            
            if (itemCount > 0) {
                console.log(`\n✅✅✅ CART TEST PASSED! ✅✅✅`);
                return { success: true };
            }
        }
        
        throw new Error('Cart verification failed');
        
    } catch (error) {
        console.error(`\n❌ TEST FAILED: ${error.message}`);
        if (error.stack) {
            console.error(error.stack);
        }
        return { success: false, error: error.message };
    }
}

testCartWithToken().then(result => {
    process.exit(result.success ? 0 : 1);
});


