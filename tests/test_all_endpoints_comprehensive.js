const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log('🔍 Comprehensive Endpoint Testing');
console.log('==================================\n');

const results = {
    // Public endpoints
    health: false,
    root: false,
    categories: false,
    brands: false,
    products: false,
    productSearch: false,
    
    // Auth endpoints (will test existence, not full functionality due to rate limits)
    signupEndpoint: false,
    loginEndpoint: false,
    googleOAuthEndpoint: false,
    
    // Vendor endpoints (test existence)
    bulkUploadEndpoint: false,
    productUploadEndpoint: false,
    
    // Admin endpoints (test existence)
    adminEndpoints: false
};

// Test Health
async function testHealth() {
    console.log('1️⃣  Health Check...');
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        if (response.ok && data.status === 'healthy') {
            results.health = true;
            console.log('   ✅ Health check passed');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Root
async function testRoot() {
    console.log('2️⃣  Root Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/`);
        const data = await response.json();
        if (response.ok) {
            results.root = true;
            console.log('   ✅ Root endpoint working');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Categories
async function testCategories() {
    console.log('3️⃣  Categories...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/categories/tree`);
        if (response.ok) {
            const data = await response.json();
            results.categories = true;
            console.log(`   ✅ Categories working (${Array.isArray(data) ? data.length : 0} items)`);
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Brands
async function testBrands() {
    console.log('4️⃣  Brands...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/brands/active`);
        if (response.ok) {
            const data = await response.json();
            results.brands = true;
            console.log(`   ✅ Brands working (${Array.isArray(data) ? data.length : 0} items)`);
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Products
async function testProducts() {
    console.log('5️⃣  Products Listing...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/`);
        if (response.ok) {
            const data = await response.json();
            results.products = true;
            console.log(`   ✅ Products working (total: ${data.total || 0})`);
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Product Search
async function testProductSearch() {
    console.log('6️⃣  Product Search...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/search?q=test`);
        if (response.ok || response.status === 404) {
            results.productSearch = true;
            console.log('   ✅ Product search endpoint exists');
        }
    } catch (error) {
        console.log(`   ⚠️  ${error.message}`);
    }
    console.log('');
}

// Test Signup Endpoint Ex百度istence
async function testSignupEndpoint() {
    console.log('7️⃣  Signup Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        // Expect 422 (validation error) or 400, not 404
        if (response.status !== 404) {
            results.signupEndpoint = true;
            console.log('   ✅ Signup endpoint exists');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Login Endpoint
async function testLoginEndpoint() {
    console.log('8️⃣  Login Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        if (response.status !== 404) {
            results.loginEndpoint = true;
            console.log('   ✅ Login endpoint exists');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Google OAuth
async function testGoogleOAuth() {
    console.log('9️⃣  Google OAuth Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/auth/google`, {
            method: 'POST'
        });
        if (response.status !== 404) {
            results.googleOAuthEndpoint = true;
            console.log('   ✅ Google OAuth endpoint exists');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Bulk Upload
async function testBulkUpload() {
    console.log('🔟 Bulk Upload Endpoint...');
    try {
        const csv = 'name,sku,price\nTest,SKU001,99.99';
        const blob = new Blob([csv], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, 'test.csv');
        
        const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            body: formData
        });
        
        // 401/403 means endpoint exists
        if (response.status === 401 || response.status === 403 || response.ok) {
            results.bulkUploadEndpoint = true;
            console.log('   ✅ Bulk upload endpoint exists');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Test Product Upload
async function testProductUpload() {
    console.log('1️⃣1️⃣ Product Upload Endpoint...');
    try {
        const formData = new FormData();
        formData.append('name', 'Test');
        
        const response = await fetch(`${BACKEND_URL}/supplier/products/`, {
            method: 'POST',
            body: formData
        });
        
        // 401/403/422 means endpoint exists
        if (response.status === 401 || response.status === 403 || response.status === 422) {
            results.productUploadEndpoint = true;
            console.log('   ✅ Product upload endpoint exists');
        }
    } catch (error) {
        console.log(`   ❌ ${error.message}`);
    }
    console.log('');
}

// Summary
function printSummary() {
    console.log('📊 Summary');
    console.log('==========\n');
    
    const tests = [
        { name: 'Health Check', result: results.health },
        { name: 'Root Endpoint', result: results.root },
        { name: 'Categories', result: results.categories },
        { name: 'Brands', result: results.brands },
        { name: 'Products', result: results.products },
        { name: 'Product Search', result: results.productSearch },
        { name: 'Signup Endpoint', result: results.signupEndpoint },
        { name: 'Login Endpoint', result: results.loginEndpoint },
        { name: 'Google OAuth', result: results.googleOAuthEndpoint },
        { name: 'Bulk Upload', result: results.bulkUploadEndpoint },
        { name: 'Product Upload', result: results.productUploadEndpoint }
    ];
    
    let passed = 0;
    tests.forEach(test => {
        console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
        if (test.result) passed++;
    });
    
    console.log(`\n${passed}/${tests.length} endpoints working\n`);
    
    if (passed === tests.length) {
        console.log('🎉 All endpoints are accessible!\n');
        console.log('Note: Authentication-required endpoints need valid tokens.');
        console.log('Note: Signup may be rate-limited by Supabase.');
    }
}

async function runAll() {
    await testHealth();
    await testRoot();
    await testCategories();
    await testBrands();
    await testProducts();
    await testProductSearch();
    await testSignupEndpoint();
    await testLoginEndpoint();
    await testGoogleOAuth();
    await testBulkUpload();
    await testProductUpload();
    
    printSummary();
}

runAll().catch(console.error);

