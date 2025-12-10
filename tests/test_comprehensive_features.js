// Comprehensive feature test - verifies all major features
const BACKEND_URL = 'http://localhost:8080';

async function makeRequest(url, options = {}) {
    try {
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

const results = {
    passed: [],
    failed: [],
    skipped: []
};

function logTest(name, passed, message = '', skipped = false) {
    const status = passed ? '✅' : (skipped ? '⏭️' : '❌');
    console.log(`${status} ${name}${message ? ': ' + message : ''}`);
    if (skipped) {
        results.skipped.push(name);
    } else if (passed) {
        results.passed.push(name);
    } else {
        results.failed.push({ test: name, error: message });
    }
}

async function testEndpoint(method, path, name, options = {}) {
    const res = await makeRequest(`${BACKEND_URL}${path}`, {
        method,
        ...options
    });
    
    // 404 means endpoint doesn't exist, 401/403 means auth required (endpoint exists)
    const exists = res.status !== 404;
    const accessible = res.ok || res.status === 401 || res.status === 403 || res.status === 422;
    
    if (!exists) {
        logTest(name, false, 'Endpoint does not exist', false);
        return false;
    }
    
    if (accessible) {
        logTest(name, true, `Endpoint exists (status: ${res.status})`, false);
        return true;
    }
    
    logTest(name, false, `Endpoint exists but returned error: ${res.status}`, false);
    return false;
}

async function runTests() {
    console.log('\n🧪 COMPREHENSIVE FEATURE TEST\n');
    console.log('='.repeat(70));
    
    // Core Auth Endpoints
    console.log('\n📋 Authentication Endpoints:');
    await testEndpoint('POST', '/auth/signup', 'Signup endpoint');
    await testEndpoint('POST', '/auth/login', 'Login endpoint');
    await testEndpoint('POST', '/auth/resend-verification', 'Resend verification email endpoint');
    await testEndpoint('POST', '/auth/refresh', 'Refresh token endpoint');
    await testEndpoint('POST', '/auth/verify-token', 'Verify token endpoint');
    await testEndpoint('POST', '/auth/change-email', 'Change email endpoint');
    await testEndpoint('POST', '/auth/change-password', 'Change password endpoint');
    await testEndpoint('POST', '/auth/forgot-password', 'Forgot password endpoint');
    await testEndpoint('POST', '/auth/reset-password', 'Reset password endpoint');
    
    // Product Endpoints
    console.log('\n📋 Product Endpoints:');
    await testEndpoint('GET', '/products', 'List products');
    await testEndpoint('GET', '/products/search', 'Search products');
    await testEndpoint('POST', '/products/supplier/products', 'Create product (supplier)');
    await testEndpoint('POST', '/products/supplier/bulk-upload', 'Bulk upload (supplier)');
    await testEndpoint('POST', '/products/supplier/verify-before-creation', 'Product verification AI');
    
    // Admin Product Endpoints
    console.log('\n📋 Admin Product Management:');
    await testEndpoint('GET', '/products/admin/products', 'Admin list products');
    await testEndpoint('POST', '/products/admin/products/{id}/review', 'Admin review/approve product');
    await testEndpoint('POST', '/products/admin/bulk-approve', 'Admin bulk approve');
    
    // Cart & Orders
    console.log('\n📋 Cart & Order Endpoints:');
    await testEndpoint('GET', '/orders/cart', 'Get cart');
    await testEndpoint('POST', '/orders/cart/items', 'Add to cart');
    await testEndpoint('POST', '/orders', 'Create order');
    await testEndpoint('GET', '/orders', 'List orders');
    
    // Address Endpoints
    console.log('\n📋 Address Endpoints:');
    await testEndpoint('GET', '/addresses', 'List addresses');
    await testEndpoint('POST', '/addresses', 'Create address');
    
    // Profile Endpoints
    console.log('\n📋 Profile Endpoints:');
    await testEndpoint('GET', '/auth/profile', 'Get profile');
    await testEndpoint('PUT', '/auth/profile', 'Update profile');
    
    // Search & Analytics
    console.log('\n📋 Search & Analytics:');
    await testEndpoint('GET', '/search/trending', 'Trending products');
    await testEndpoint('GET', '/search/personalized', 'Personalized products');
    await testEndpoint('GET', '/products/analytics', 'Product analytics');
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed Tests:');
        results.failed.forEach(({ test, error }) => {
            console.log(`   - ${test}: ${error}`);
        });
    }
    
    const total = results.passed.length + results.failed.length;
    const successRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
    console.log(`\n📈 Success Rate: ${successRate}%`);
    
    if (results.failed.length === 0) {
        console.log('\n✅ All endpoints are accessible!');
    } else {
        console.log('\n⚠️  Some endpoints may be missing or have issues.');
    }
    console.log('');
}

runTests().catch(console.error);

