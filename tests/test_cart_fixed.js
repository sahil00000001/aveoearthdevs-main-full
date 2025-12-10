// Use native fetch (Node.js 18+)
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:8080';

// Helper to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Use a fixed test user to avoid rate limits
// Can also use TEST_TOKEN environment variable to skip auth
const TEST_USER = {
    email: 'cart_test_buyer@test.com',
    password: 'Test123!@#',
    first_name: 'Cart',
    last_name: 'Test',
    phone: '+1234567890'
};

async function ensureTestUser() {
    // Check if token is provided via environment variable
    if (process.env.TEST_TOKEN) {
        console.log(`   ✅ Using token from TEST_TOKEN environment variable`);
        // Get user info from /me endpoint
        try {
            const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (profileResponse.status === 200) {
                const profileData = await profileResponse.json();
                const userId = profileData.id || profileData.user?.id;
                console.log(`   ✅ Token is valid for user: ${userId}`);
                return { token: process.env.TEST_TOKEN, userId, exists: true };
            }
        } catch (err) {
            console.log(`   ⚠️ Token validation failed: ${err.message}`);
        }
    }
    console.log('\n🔧 Setting up test user...');
    
    // Try to login first (most likely user exists)
    console.log(`   🔐 Attempting login: ${TEST_USER.email}`);
    try {
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: TEST_USER.email, 
                password: TEST_USER.password 
            })
        });
        
        if (loginResponse.status === 200) {
            const loginData = await loginResponse.json();
            const token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
            const userId = loginData.user?.id || loginData.id;
            if (token) {
                console.log(`   ✅ Test user login successful: ${TEST_USER.email}`);
                return { token, userId, exists: true };
            }
        }
        console.log(`   ⚠️ Login failed: ${loginResponse.status}`);
    } catch (err) {
        console.log(`   ⚠️ Login check failed: ${err.message}`);
    }
    
    // If login fails, try signup (but expect rate limit)
    console.log(`   📝 Attempting signup: ${TEST_USER.email}`);
    try {
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...TEST_USER,
                user_type: 'buyer'
            })
        });
        
        const signupData = await signupResponse.json();
        
        if (signupResponse.status === 200 || signupResponse.status === 201) {
            const token = signupData.tokens?.access_token || signupData.session?.access_token || signupData.access_token;
            const userId = signupData.user?.id || signupData.id;
            console.log(`   ✅ Test user created: ${TEST_USER.email}`);
            await wait(2000); // Wait for user creation
            return { token, userId, exists: false };
        } else if (signupResponse.status === 422) {
            if (signupData.detail?.includes('rate limit')) {
                console.log(`   ⚠️ Rate limit hit - waiting 5 seconds and retrying login...`);
                await wait(5000);
                // Retry login after wait
                const retryLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: TEST_USER.email, 
                        password: TEST_USER.password 
                    })
                });
                
                if (retryLoginResponse.status === 200) {
                    const retryLoginData = await retryLoginResponse.json();
                    const token = retryLoginData.tokens?.access_token || retryLoginData.session?.access_token || retryLoginData.access_token;
                    const userId = retryLoginData.user?.id || retryLoginData.id;
                    if (token) {
                        console.log(`   ✅ Login successful after rate limit wait`);
                        return { token, userId, exists: true };
                    }
                }
            }
            if (signupData.detail?.includes('already exists')) {
                // User exists, try login again
                await wait(1000);
                const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: TEST_USER.email, 
                        password: TEST_USER.password 
                    })
                });
                
                if (loginResponse.status === 200) {
                    const loginData = await loginResponse.json();
                    const token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                    const userId = loginData.user?.id || loginData.id;
                    if (token) {
                        console.log(`   ✅ Test user exists (login successful)`);
                        return { token, userId, exists: true };
                    }
                }
            }
        }
        
        throw new Error(`Signup failed: ${signupResponse.status} - ${JSON.stringify(signupData)}`);
    } catch (err) {
        throw new Error(`Cannot setup test user: ${err.message}`);
    }
}

async function testCartOperations() {
    console.log('\n🧪 CART OPERATIONS TEST');
    console.log('='.repeat(80));
    
    try {
        // Step 1: Ensure test user exists
        const { token, userId } = await ensureTestUser();
        console.log(`\n✅ Authenticated as: ${userId}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);
        
        // Step 2: Verify user profile
        console.log(`\n🔍 Step 2: Verifying user profile`);
        const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const profileData = await profileResponse.json();
        if (profileResponse.status === 200) {
            console.log(`   ✅ Profile verified: ${profileData.id || profileData.email}`);
        } else {
            console.log(`   ⚠️ Profile check status: ${profileResponse.status}`);
        }
        await wait(1000);
        
        // Step 3: Get available product
        console.log(`\n🛍️ Step 3: Getting available product`);
        const productsResponse = await fetch(`${BASE_URL}/products?limit=10`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData.items || productsData.data || (Array.isArray(productsData) ? productsData : []);
        
        if (productsResponse.status !== 200 || products.length === 0) {
            throw new Error(`No products available. Status: ${productsResponse.status}, Products: ${products.length}`);
        }
        
        const productId = products[0].id;
        const variantId = products[0].variants?.[0]?.id || null;
        console.log(`   ✅ Found product: ${productId}`);
        console.log(`   Product name: ${products[0].name || 'N/A'}`);
        if (variantId) {
            console.log(`   Variant ID: ${variantId}`);
        }
        await wait(1000);
        
        // Step 4: Get cart (should be empty initially)
        console.log(`\n🛒 Step 4: Getting cart`);
        const getCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cartData = await getCartResponse.json();
        console.log(`   Cart Status: ${getCartResponse.status}`);
        if (getCartResponse.status === 200) {
            const itemCount = cartData.items?.length || cartData.cart_items?.length || 0;
            console.log(`   ✅ Cart retrieved: ${itemCount} items`);
        } else {
            console.log(`   ⚠️ Cart status: ${getCartResponse.status}`);
        }
        await wait(1000);
        
        // Step 5: Add item to cart
        console.log(`\n➕ Step 5: Adding product to cart`);
        const cartPayload = {
            product_id: productId,
            quantity: 2
        };
        if (variantId) {
            cartPayload.variant_id = variantId;
        }
        
        const addCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartPayload)
        });
        
        const addCartData = await addCartResponse.json();
        console.log(`   Add Status: ${addCartResponse.status}`);
        console.log(`   Response: ${JSON.stringify(addCartData, null, 2)}`);
        
        if (addCartResponse.status !== 200 && addCartResponse.status !== 201) {
            throw new Error(`Add to cart failed: ${addCartResponse.status} - ${JSON.stringify(addCartData)}`);
        }
        console.log(`   ✅ Item added to cart successfully!`);
        await wait(1000);
        
        // Step 6: Verify cart has item
        console.log(`\n🔍 Step 6: Verifying cart has item`);
        const verifyCartResponse = await fetch(`${BASE_URL}/buyer/orders/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const verifyCartData = await verifyCartResponse.json();
        if (verifyCartResponse.status === 200) {
            const itemCount = verifyCartData.items?.length || verifyCartData.cart_items?.length || 0;
            const total = verifyCartData.total_amount || verifyCartData.total || 0;
            console.log(`   ✅ Cart verified: ${itemCount} items, Total: ₹${total}`);
            
            if (itemCount === 0) {
                throw new Error('Cart is empty after adding item');
            }
        } else {
            throw new Error(`Cart verification failed: ${verifyCartResponse.status}`);
        }
        
        console.log(`\n✅✅✅ ALL CART TESTS PASSED! ✅✅✅`);
        return { success: true, message: 'All cart operations successful' };
        
    } catch (error) {
        console.error(`\n❌ TEST FAILED:`);
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
            console.error(`   Stack: ${error.stack}`);
        }
        return { success: false, error: error.message };
    }
}

// Run test
testCartOperations().then(result => {
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

