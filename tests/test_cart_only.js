// Use global fetch (Node.js 18+)
const API_BASE = 'http://localhost:8080';

async function testCartOnly() {
    console.log('\n🧪 Testing Cart Add Operation Only\n');
    
    // Step 1: Sign up a buyer, then login
    console.log('1. Signing up buyer...');
    const timestamp = Date.now();
    const email = `buyer${timestamp}@test.com`;
    const password = 'Test123!@#';
    
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            phone: `+1234567890${timestamp % 10000}`,
            user_type: 'buyer',
            first_name: 'Test',
            last_name: `Buyer${timestamp}`
        })
    });
    
    const signupData = await signupRes.json();
    console.log('Signup status:', signupRes.status);
    
    if (signupRes.status !== 201 && signupRes.status !== 200) {
        console.error('❌ Signup failed:', JSON.stringify(signupData, null, 2));
        return;
    }
    
    // Wait for user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 1b: Login to get token
    console.log('\n1b. Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password
        })
    });
    
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login response keys:', Object.keys(loginData));
    
    if (loginRes.status !== 200) {
        console.error('❌ Login failed:', JSON.stringify(loginData, null, 2));
        return;
    }
    
    const token = loginData?.tokens?.access_token || loginData?.access_token || loginData?.token;
    if (!token) {
        console.error('❌ No token from login:', JSON.stringify(loginData, null, 2));
        return;
    }
    console.log('✅ Got token:', token.substring(0, 20) + '...');
    
    // Step 2: Get a product
    console.log('\n2. Getting a product...');
    const productsRes = await fetch(`${API_BASE}/products?limit=1`);
    const productsData = await productsRes.json();
    console.log('Products status:', productsRes.status);
    
    let productId = null;
    if (productsData?.items && productsData.items.length > 0) {
        productId = productsData.items[0].id;
        console.log('✅ Found product:', productId);
    } else {
        console.error('❌ No products found');
        return;
    }
    
    // Step 3: Get or create cart
    console.log('\n3. Getting/creating cart...');
    const cartRes = await fetch(`${API_BASE}/buyer/orders/cart`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const cartData = await cartRes.json();
    console.log('Cart status:', cartRes.status);
    console.log('Cart response:', JSON.stringify(cartData, null, 2));
    
    if (cartRes.status !== 200) {
        console.error('❌ Failed to get/create cart');
        return;
    }
    
    const cartId = cartData?.id;
    if (!cartId) {
        console.error('❌ No cart ID');
        return;
    }
    console.log('✅ Got cart ID:', cartId);
    
    // Step 4: Add item to cart
    console.log('\n4. Adding item to cart...');
    const addRes = await fetch(`${API_BASE}/buyer/orders/cart/items`, {
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
    
    const addData = await addRes.json();
    console.log('Add to cart status:', addRes.status);
    console.log('Add to cart response:', JSON.stringify(addData, null, 2));
    
    if (addRes.status === 200 || addRes.status === 201) {
        console.log('\n✅ SUCCESS: Item added to cart!');
    } else {
        console.log('\n❌ FAILED: Could not add item to cart');
    }
}

testCartOnly().catch(console.error);

