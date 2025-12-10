// Cart test that uses an existing user (created manually or via admin API)
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:8080';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCartWithExistingUser() {
    console.log('\n🧪 CART TEST WITH EXISTING USER');
    console.log('='.repeat(80));
    
    // Try to login with a known test user that should exist
    // If this user doesn't exist, you need to create it manually via Supabase Admin
    const testEmail = 'cart_test_buyer@test.com';
    const testPassword = 'Test123!@#';
    
    console.log(`\n📝 Step 1: Logging in with existing user: ${testEmail}`);
    let token = null;
    let userId = null;
    
    try {
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        
        const loginData = await loginResponse.json();
        console.log(`   Login status: ${loginResponse.status}`);
        
        if (loginResponse.status === 200) {
            token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
            userId = loginData.user?.id || loginData.id;
            console.log(`   ✅ Login successful, got token for user: ${userId}`);
        } else {
            console.log(`   ❌ Login failed: ${JSON.stringify(loginData)}`);
            console.log(`   ⚠️  Please create a test user manually:`);
            console.log(`   - Email: ${testEmail}`);
            console.log(`   - Password: ${testPassword}`);
            console.log(`   - User type: buyer`);
            return { success: false, error: 'Test user does not exist. Please create manually.' };
        }
    } catch (err) {
        return { success: false, error: `Login error: ${err.message}` };
    }
    
    await wait(2000); // Wait for user to be ready
    
    // Step 2: Get products
    console.log('\n🛍️ Step 2: Getting products');
    let productId = null;
    try {
        const productsResponse = await fetch(`${BASE_URL}/products?limit=10`);
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData.items || productsData.data || (Array.isArray(productsData) ? productsData : []);
        
        if (products.length === 0) {
            throw new Error('No products available');
        }
        
        productId = products[0].id;
        console.log(`   ✅ Found product: ${productId} - ${products[0].name}`);
    } catch (err) {
        return { success: false, error: `Product fetch failed: ${err.message}` };
    }
    
    await wait(1000);
    
    // Step 3: Test cart GET
    console.log('\n🛒 Step 3: Testing GET /buyer/orders/cart');
    let cartId = null;
    try {
        const getCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cartData = await getCartResponse.json();
        console.log(`   Status: ${getCartResponse.status}`);
        console.log(`   Response keys: ${Object.keys(cartData || {}).join(', ')}`);
        
        if (getCartResponse.status === 200) {
            cartId = cartData.id || cartData.cart?.id;
            const itemCount = cartData.items?.length || cartData.cart_items?.length || 0;
            console.log(`   ✅ Cart retrieved: ${cartId}, ${itemCount} items`);
        } else {
            console.log(`   ❌ Cart GET failed: ${JSON.stringify(cartData)}`);
            return { success: false, error: `Cart GET failed: ${getCartResponse.status} - ${JSON.stringify(cartData)}` };
        }
    } catch (err) {
        return { success: false, error: `Cart GET error: ${err.message}` };
    }
    
    await wait(1000);
    
    // Step 4: Test cart POST (add item)
    console.log('\n➕ Step 4: Testing POST /buyer/orders/cart/items');
    try {
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
        console.log(`   Status: ${addCartResponse.status}`);
        console.log(`   Response: ${JSON.stringify(addCartData, null, 2)}`);
        
        if (addCartResponse.status === 200 || addCartResponse.status === 201) {
            console.log(`   ✅ Item added to cart successfully!`);
        } else {
            return { success: false, error: `Add to cart failed: ${addCartResponse.status} - ${JSON.stringify(addCartData)}` };
        }
    } catch (err) {
        return { success: false, error: `Add to cart error: ${err.message}` };
    }
    
    await wait(1000);
    
    // Step 5: Verify cart has item
    console.log('\n🔍 Step 5: Verifying cart has item');
    try {
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
            
            if (itemCount === 0) {
                return { success: false, error: 'Cart is empty after adding item' };
            }
        } else {
            return { success: false, error: `Cart verification failed: ${verifyCartResponse.status}` };
        }
    } catch (err) {
        return { success: false, error: `Cart verification error: ${err.message}` };
    }
    
    console.log('\n✅✅✅ ALL CART TESTS PASSED! ✅✅✅');
    return { success: true };
}

// Run test
testCartWithExistingUser().then(result => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULT');
    console.log('='.repeat(80));
    if (result.success) {
        console.log('✅ SUCCESS: All cart operations passed!');
        process.exit(0);
    } else {
        console.log(`❌ FAILED: ${result.error}`);
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});


