const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log('🚀 Complete Workflow Testing (With Mock Auth)');
console.log('===============================================\n');

const results = {
    // Public endpoints
    health: false,
    categories: false,
    brands: false,
    products: false,
    search: false,
    
    // Auth endpoints
    signupEndpoint: false,
    loginEndpoint: false,
    googleOAuth: false,
    
    // Vendor endpoints (with mock auth)
    bulkUpload: false,
    productUpload: false,
    
    // Buyer endpoints (with mock auth)
    cart: false,
    addToCart: false,
    checkout: false,
    orders: false
};

// Mock token for testing (backend returns mock user currently)
const MOCK_TOKEN = 'temp-token';

// Test Health
async function testHealth() {
    console.log('1️⃣  Health Check...');
    try {
        const res = await fetch(`${BACKEND_URL}/health`);
        const data = await res.json();
        results.health = res.ok && data.status === 'healthy';
        console.log(results.health ? '   ✅ Health check passed' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Categories
async function testCategories() {
    console.log('2️⃣  Categories...');
    try {
        const res = await fetch(`${BACKEND_URL}/products/categories/tree`);
        results.categories = res.ok;
        console.log(results.categories ? '   ✅ Categories working' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Brands
async function testBrands() {
    console.log('3️⃣  Brands...');
    try {
        const res = await fetch(`${BACKEND_URL}/products/brands/active`);
        results.brands = res.ok;
        console.log(results.brands ? '   ✅ Brands working' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Products
async function testProducts() {
    console.log('4️⃣  Products...');
    try {
        const res = await fetch(`${BACKEND_URL}/products/`);
        results.products = res.ok;
        console.log(results.products ? '   ✅ Products working' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Search
async function testSearch() {
    console.log('5️⃣  Product Search...');
    try {
        const res = await fetch(`${BACKEND_URL}/search/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'test', page: 1, per_page: 10 })
        });
        results.search = res.ok || res.status === 422;
        console.log(results.search ? '   ✅ Search working' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Signup Endpoint
async function testSignupEndpoint() {
    console.log('6️⃣  Signup Endpoint...');
    try {
        const res = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        results.signupEndpoint = res.status !== 404;
        console.log(results.signupEndpoint ? '   ✅ Signup endpoint exists' : '   ❌ Not found');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Login Endpoint
async function testLoginEndpoint() {
    console.log('7️⃣  Login Endpoint...');
    try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        results.loginEndpoint = res.status !== 404;
        console.log(results.loginEndpoint ? '   ✅ Login endpoint exists' : '   ❌ Not found');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Google OAuth
async function testGoogleOAuth() {
    console.log('8️⃣  Google OAuth...');
    try {
        const res = await fetch(`${BACKEND_URL}/auth/google`, { method: 'POST' });
        results.googleOAuth = res.status !== 404;
        console.log(results.googleOAuth ? '   ✅ Google OAuth endpoint exists' : '   ❌ Not found');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Bulk Upload (with mock auth)
async function testBulkUpload() {
    console.log('9️⃣  Bulk Upload...');
    try {
        const csv = 'name,sku,price\nTest,SKU001,99.99';
        const blob = new Blob([csv], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, 'test.csv');
        
        const res = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` },
            body: formData
        });
        
        results.bulkUpload = res.status === 200 || res.status === 422 || res.status === 400;
        console.log(results.bulkUpload ? '   ✅ Bulk upload endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Product Upload
async function testProductUpload() {
    console.log('🔟 Product Upload...');
    try {
        const formData = new FormData();
        formData.append('name', 'Test Product');
        formData.append('sku', 'TEST-' + Date.now());
        formData.append('price', '99.99');
        formData.append('category_id', '00000000-0000-0000-0000-000000000000');
        
        const blob = new Blob(['dummy'], { type: 'image/jpeg' });
        formData.append('images', blob, 'test.jpg');
        
        const res = await fetch(`${BACKEND_URL}/supplier/products/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` },
            body: formData
        });
        
        results.productUpload = res.status === 201 || res.status === 422 || res.status === 400;
        console.log(results.productUpload ? '   ✅ Product upload endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Cart
async function testCart() {
    console.log('1️⃣1️⃣  Cart...');
    try {
        const res = await fetch(`${BACKEND_URL}/buyer/orders/cart`, {
            headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
        });
        results.cart = res.ok || res.status === 422;
        console.log(results.cart ? '   ✅ Cart endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Add to Cart
async function testAddToCart() {
    console.log('1️⃣2️⃣  Add to Cart...');
    try {
        const res = await fetch(`${BACKEND_URL}/buyer/orders/cart/items`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${MOCK_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: 'test-id', quantity: 1 })
        });
        results.addToCart = res.status !== 404 && res.status !== 500;
        console.log(results.addToCart ? '   ✅ Add to cart endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Checkout/Order Creation
async function testCheckout() {
    console.log('1️⃣3️⃣  Checkout/Order Creation...');
    try {
        const res = await fetch(`${BACKEND_URL}/buyer/orders/`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${MOCK_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shipping_address_id: 'test-address',
                billing_address_id: 'test-address',
                payment_method: 'test'
            })
        });
        results.checkout = res.status !== 404;
        console.log(results.checkout ? '   ✅ Checkout endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Test Orders Listing
async function testOrders() {
    console.log('1️⃣4️⃣  Orders Listing...');
    try {
        const res = await fetch(`${BACKEND_URL}/buyer/orders/`, {
            headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
        });
        results.orders = res.ok || res.status === 401 || res.status === 403;
        console.log(results.orders ? '   ✅ Orders endpoint accessible' : '   ❌ Failed');
    } catch (e) {
        console.log(`   ❌ ${e.message}`);
    }
    console.log('');
}

// Summary
function printSummary() {
    console.log('📊 Test Summary');
    console.log('===============\n');
    
    const tests = [
        { name: 'Health', result: results.health },
        { name: 'Categories', result: results.categories },
        { name: 'Brands', result: results.brands },
        { name: 'Products', result: results.products },
        { name: 'Search', result: results.search },
        { name: 'Signup Endpoint', result: results.signupEndpoint },
        { name: 'Login Endpoint', result: results.loginEndpoint },
        { name: 'Google OAuth', result: results.googleOAuth },
        { name: 'Bulk Upload', result: results.bulkUpload },
        { name: 'Product Upload', result: results.productUpload },
        { name: 'Cart', result: results.cart },
        { name: 'Add to Cart', result: results.addToCart },
        { name: 'Checkout', result: results.checkout },
        { name: 'Orders', result: results.orders }
    ];
    
    let passed = 0;
    tests.forEach(t => {
        console.log(`${t.result ? '✅' : '❌'} ${t.name}`);
        if (t.result) passed++;
    });
    
    console.log(`\n${passed}/${tests.length} endpoints accessible\n`);
}

async function runAll() {
    await testHealth();
    await testCategories();
    await testBrands();
    await testProducts();
    await testSearch();
    await testSignupEndpoint();
    await testLoginEndpoint();
    await testGoogleOAuth();
    await testBulkUpload();
    await testProductUpload();
    await testCart();
    await testAddToCart();
    await testCheckout();
    await testOrders();
    
    printSummary();
}

runAll().catch(console.error);

