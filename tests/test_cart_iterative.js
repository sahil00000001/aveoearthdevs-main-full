// Iterative cart test - keeps retrying and fixing until it works
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:8080';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCart() {
    console.log('\n🧪 ITERATIVE CART TEST');
    console.log('='.repeat(80));
    
    // Step 1: Create a fresh user and get token (to avoid expired tokens)
    console.log('\n📝 Step 1: Creating fresh test user and getting token...');
    let token = null;
    let userId = null;
    
    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `cart_test_${timestamp}@test.com`;
    const testPassword = 'Test123!@#';
    
    try {
        // Try signup first
        console.log(`   Attempting signup: ${testEmail}`);
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                first_name: 'Cart',
                last_name: 'Test',
                phone: '+1234567890',
                user_type: 'buyer'
            })
        });
        
        const signupData = await signupResponse.json();
        console.log(`   Signup status: ${signupResponse.status}`);
        console.log(`   Signup response: ${JSON.stringify(signupData).substring(0, 300)}`);
        
        if (signupResponse.status === 200 || signupResponse.status === 201) {
            token = signupData.tokens?.access_token || signupData.session?.access_token || signupData.access_token;
            userId = signupData.user?.id || signupData.id;
            console.log(`   ✅ Signup successful, got token`);
        } else if (signupResponse.status === 422) {
            if (signupData.detail?.includes('rate limit')) {
                console.log(`   ⚠️ Rate limit hit, trying login with same email...`);
                await wait(2000);
                // Try login (user might already exist)
                const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: testEmail, password: testPassword })
                });
                
                if (loginResponse.status === 200) {
                    const loginData = await loginResponse.json();
                    token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                    userId = loginData.user?.id || loginData.id;
                    if (token) {
                        console.log(`   ✅ Login successful after rate limit`);
                    }
                }
            } else if (signupData.detail?.includes('already exists')) {
                console.log(`   ⚠️ User exists, trying login...`);
                await wait(1000);
                const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: testEmail, password: testPassword })
                });
                
                if (loginResponse.status === 200) {
                    const loginData = await loginResponse.json();
                    token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                    userId = loginData.user?.id || loginData.id;
                    if (token) {
                        console.log(`   ✅ Login successful`);
                    }
                }
            }
        }
        
        if (!token) {
            // Fallback: try existing test user
            console.log(`   ⚠️ Signup/login failed, trying existing test user...`);
            const testUsers = [
                { email: 'buyer_test@test.com', password: 'Test123!@#' },
                { email: 'cart_test_buyer@test.com', password: 'Test123!@#' }
            ];
            
            for (const testUser of testUsers) {
                try {
                    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testUser)
                    });
                    
                    if (loginResponse.status === 200) {
                        const loginData = await loginResponse.json();
                        token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                        userId = loginData.user?.id || loginData.id;
                        if (token) {
                            console.log(`   ✅ Login successful: ${testUser.email}`);
                            break;
                        }
                    }
                } catch (err) {
                    // Continue to next user
                }
            }
        }
        
        if (!token) {
            return { success: false, error: 'Could not get token from signup or login' };
        }
        
        // Wait for user to be created in database
        console.log(`   ✅ Got token, waiting 2 seconds for user creation to propagate...`);
        await wait(2000);
    } catch (err) {
        console.log(`   ❌ Error during signup/login: ${err.message}`);
        return { success: false, error: `Signup/login failed: ${err.message}` };
    }
    
    await wait(1000);
    
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
testCart().then(result => {
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

