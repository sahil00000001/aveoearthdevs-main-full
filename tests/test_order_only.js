const BACKEND_URL = 'http://localhost:8080';

async function makeRequest(url, options = {}) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, options);
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        return {
            ok: response.ok,
            status: response.status,
            data,
            text
        };
    } catch (error) {
        return {
            ok: false,
            error: error.message,
            status: 0
        };
    }
}

async function test() {
    console.log('Testing order placement...\n');
    
    // 1. Signup buyer
    const timestamp = Date.now();
    const email = `buyer${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    console.log('1. Signing up buyer...');
    const signupRes = await makeRequest(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email,
            password,
            phone: `+1234567890${timestamp % 10000}`,
            user_type: 'buyer',
            first_name: 'Test',
            last_name: `Buyer${timestamp}`
        })
    });
    
    console.log(`  Signup response: status=${signupRes.status}, data=${signupRes.data ? JSON.stringify(signupRes.data).substring(0, 500) : 'no data'}`);
    let token = signupRes.data?.tokens?.access_token || signupRes.data?.access_token || signupRes.data?.token;
    if (!token) {
        console.log('  Signup did not return token, trying login...');
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        console.log(`  Login response: status=${loginRes.status}, data=${loginRes.data ? JSON.stringify(loginRes.data).substring(0, 500) : 'no data'}`);
        token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
    }
    
    if (!token) {
        console.log(`  ❌ Failed to get token. Signup: ${JSON.stringify(signupRes.data)}`);
        return;
    }
    console.log(`  ✅ Got token: ${token.substring(0, 20)}...`);
    
    // 2. Get a product
    console.log('\n2. Getting a product...');
    const productsRes = await makeRequest(`${BACKEND_URL}/products?limit=1`);
    if (!productsRes.ok || !productsRes.data?.items?.[0]) {
        console.log(`  ❌ Failed to get products: ${JSON.stringify(productsRes.data)}`);
        return;
    }
    const product = productsRes.data.items[0];
    const productId = product.id;
    console.log(`  ✅ Got product: ${productId} - ${product.name}`);
    
    // 3. Add to cart
    console.log('\n3. Adding to cart...');
    const cartRes = await makeRequest(`${BACKEND_URL}/buyer/orders/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: 1
        })
    });
    
    if (!cartRes.ok) {
        console.log(`  ❌ Failed to add to cart: ${cartRes.status}`);
        console.log(`  Response: ${cartRes.text.substring(0, 1000)}`);
        return;
    }
    console.log('  ✅ Added to cart');
    
    console.log('\n✅ All tests passed!');
}

test().catch(console.error);

