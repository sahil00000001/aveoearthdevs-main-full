// Use native fetch (Node.js 18+) or fallback
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';

// Helper to generate unique email
function generateEmail() {
    return `buyer_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
}

// Helper to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBuyerSignupAndCart() {
    console.log('\n🧪 FOCUSED TEST: Buyer Signup → Add to Cart\n');
    console.log('='.repeat(80));
    
    const email = generateEmail();
    const password = 'Test123!@#';
    const firstName = 'Test';
    const lastName = 'Buyer';
    const phone = '+1234567890';
    
    try {
        // Step 1: Try Signup, fallback to login if rate limited
        console.log(`\n📝 Step 1: Signing up buyer: ${email}`);
        let signupResponse;
        let signupData;
        let token = null;
        let userId = null;
        
        try {
            signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    user_type: 'buyer'
                })
            });
            
            signupData = await signupResponse.json();
            console.log(`   Status: ${signupResponse.status}`);
            
            if (signupResponse.status === 200 || signupResponse.status === 201) {
                token = signupData.tokens?.access_token || signupData.session?.access_token || signupData.access_token;
                userId = signupData.user?.id || signupData.id;
            } else if (signupResponse.status === 422 && (signupData.detail?.includes('rate limit') || signupData.detail?.includes('already exists'))) {
                console.log(`   ⚠️ Rate limit or user exists, trying login with same credentials...`);
                // Try to login with the same email/password (user might already exist)
                await wait(2000);
                const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (loginResponse.status === 200) {
                    const loginData = await loginResponse.json();
                    token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                    userId = loginData.user?.id || loginData.id;
                    console.log(`   ✅ Login successful with same credentials`);
                } else {
                    throw new Error(`Signup failed (rate limit/exists) and login also failed: ${signupResponse.status}`);
                }
            } else {
                throw new Error(`Signup failed: ${signupResponse.status} - ${JSON.stringify(signupData)}`);
            }
        } catch (signupErr) {
            console.log(`   ⚠️ Signup error: ${signupErr.message}, trying login...`);
            await wait(2000);
            const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (loginResponse.status === 200) {
                const loginData = await loginResponse.json();
                token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
                userId = loginData.user?.id || loginData.id;
                console.log(`   ✅ Login successful after signup attempt`);
            } else {
                throw new Error(`Signup and login both failed: ${signupErr.message}`);
            }
        }
        
        if (!token) {
            throw new Error('No token received from signup or login');
        }
        console.log(`   ✅ Buyer signed up: ${userId}`);
        console.log(`   ✅ Token received: ${token.substring(0, 20)}...`);
        
        // Wait for user creation to propagate
        await wait(2000);
        
        // Step 2: Verify user exists in database via profile endpoint
        console.log(`\n🔍 Step 2: Verifying user exists in public.users`);
        try {
            const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const profileData = await profileResponse.json();
            console.log(`   Profile Status: ${profileResponse.status}`);
            if (profileResponse.status === 200) {
                console.log(`   ✅ User exists in database: ${profileData.id || profileData.user?.id}`);
            } else {
                console.log(`   ⚠️ Profile check failed: ${JSON.stringify(profileData)}`);
            }
        } catch (profileErr) {
            console.log(`   ⚠️ Profile check error: ${profileErr.message}`);
        }
        
        // Step 3: Get a product to add to cart
        console.log(`\n🛍️ Step 3: Getting available product`);
        const productsResponse = await fetch(`${BASE_URL}/products?limit=10`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const productsData = await productsResponse.json();
        let productId = null;
        let variantId = null;
        
        // Handle different response structures
        const products = productsData.products || productsData.items || productsData.data || (Array.isArray(productsData) ? productsData : []);
        
        if (productsResponse.status === 200 && products.length > 0) {
            productId = products[0].id;
            // Variants might be in a separate field or nested
            if (products[0].variants && Array.isArray(products[0].variants) && products[0].variants.length > 0) {
                variantId = products[0].variants[0].id;
            }
            console.log(`   ✅ Found product: ${productId}`);
            console.log(`   Product name: ${products[0].name || 'N/A'}`);
            if (variantId) {
                console.log(`   ✅ Found variant: ${variantId}`);
            } else {
                console.log(`   ℹ️ No variant (will use product directly)`);
            }
        } else {
            console.log(`   ⚠️ No products available`);
            console.log(`   Response status: ${productsResponse.status}`);
            console.log(`   Response keys: ${Object.keys(productsData || {}).join(', ')}`);
            throw new Error('No products available for cart test');
        }
        
        // Step 4: Add to cart
        console.log(`\n🛒 Step 4: Adding product to cart`);
        console.log(`   Product ID: ${productId}`);
        console.log(`   Variant ID: ${variantId || 'none'}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);
        
        const cartPayload = {
            product_id: productId,
            quantity: 1
        };
        
        if (variantId) {
            cartPayload.variant_id = variantId;
        }
        
        const cartResponse = await fetch(`${BASE_URL}/buyer/orders/cart/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartPayload)
        });
        
        const cartData = await cartResponse.json();
        console.log(`   Cart Status: ${cartResponse.status}`);
        console.log(`   Cart Response: ${JSON.stringify(cartData, null, 2)}`);
        
        if (cartResponse.status === 200 || cartResponse.status === 201) {
            console.log(`   ✅ Successfully added to cart!`);
            return { success: true, message: 'Buyer signup and cart addition successful' };
        } else {
            throw new Error(`Add to cart failed: ${cartResponse.status} - ${JSON.stringify(cartData)}`);
        }
        
    } catch (error) {
        console.error(`\n❌ TEST FAILED:`);
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
            console.error(`   Stack: ${error.stack}`);
        }
        return { success: false, error: error.message };
    }
}

async function testBuyerLoginAndCart() {
    console.log('\n🧪 FOCUSED TEST: Buyer Login → Add to Cart\n');
    console.log('='.repeat(80));
    
    const email = generateEmail();
    const password = 'Test123!@#';
    
    try {
        // Step 1: Signup first
        console.log(`\n📝 Step 1: Signing up buyer: ${email}`);
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                first_name: 'Test',
                last_name: 'Buyer',
                phone: '+1234567890',
                user_type: 'buyer'
            })
        });
        
        const signupData = await signupResponse.json();
        if (signupResponse.status !== 200 && signupResponse.status !== 201) {
            throw new Error(`Signup failed: ${signupResponse.status}`);
        }
        
        console.log(`   ✅ Buyer signed up`);
        await wait(2000);
        
        // Step 2: Login
        console.log(`\n🔐 Step 2: Logging in buyer: ${email}`);
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const loginData = await loginResponse.json();
        console.log(`   Login Status: ${loginResponse.status}`);
        console.log(`   Login Response: ${JSON.stringify(loginData, null, 2)}`);
        
        if (loginResponse.status !== 200) {
            throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
        }
        
        const token = loginData.tokens?.access_token || loginData.session?.access_token || loginData.access_token;
        const userId = loginData.user?.id || loginData.id;
        
        if (!token) {
            throw new Error('No token received from login');
        }
        
        console.log(`   ✅ Buyer logged in: ${userId}`);
        await wait(2000);
        
        // Step 3: Get product
        const productsResponse = await fetch(`${BASE_URL}/products?limit=1`);
        const productsData = await productsResponse.json();
        let productId = null;
        
        if (productsResponse.status === 200 && productsData.products && productsData.products.length > 0) {
            productId = productsData.products[0].id;
        }
        
        if (!productId) {
            throw new Error('No product available');
        }
        
        // Step 4: Add to cart
        console.log(`\n🛒 Step 3: Adding product to cart`);
        const cartResponse = await fetch(`${BASE_URL}/buyer/orders/cart/items`, {
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
        
        const cartData = await cartResponse.json();
        console.log(`   Cart Status: ${cartResponse.status}`);
        console.log(`   Cart Response: ${JSON.stringify(cartData, null, 2)}`);
        
        if (cartResponse.status === 200 || cartResponse.status === 201) {
            console.log(`   ✅ Successfully added to cart!`);
            return { success: true, message: 'Buyer login and cart addition successful' };
        } else {
            throw new Error(`Add to cart failed: ${cartResponse.status} - ${JSON.stringify(cartData)}`);
        }
        
    } catch (error) {
        console.error(`\n❌ TEST FAILED:`);
        console.error(`   Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runFocusedTests() {
    console.log('\n🎯 FOCUSED BUYER CART TESTS');
    console.log('='.repeat(80));
    console.log('Testing ONLY the failing buyer cart operations');
    console.log('='.repeat(80));
    
    const results = [];
    
    // Test 1: Buyer Signup → Add to Cart
    console.log('\n\n📋 TEST 1/2: Buyer Signup → Add to Cart');
    const result1 = await testBuyerSignupAndCart();
    results.push({ test: 'Buyer Signup → Add to Cart', ...result1 });
    await wait(3000);
    
    // Test 2: Buyer Login → Add to Cart
    console.log('\n\n📋 TEST 2/2: Buyer Login → Add to Cart');
    const result2 = await testBuyerLoginAndCart();
    results.push({ test: 'Buyer Login → Add to Cart', ...result2 });
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 FOCUSED TEST SUMMARY');
    console.log('='.repeat(80));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    results.forEach((result, index) => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${result.test}`);
        if (!result.success) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log(`\n✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);
    console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
    
    return { passed, failed, total: results.length, results };
}

// Run tests
runFocusedTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

