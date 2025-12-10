const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🚀 Comprehensive Workflow Testing');
console.log('==================================\n');

const results = {
    tests: [],
    passed: 0,
    failed: 0
};

function addResult(name, passed, details = '') {
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
    
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
}

// ========== WORKFLOW 1: EMAIL SIGNUP ==========
async function testEmailSignup() {
    console.log('\n📧 Workflow 1: Email Signup');
    console.log('---------------------------');
    
    try {
        const testEmail = `test_${Date.now()}@example.com`;
        const response = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'TestPass123!',
                phone: `+1234${Date.now().toString().slice(-6)}`,
                first_name: 'Test',
                last_name: 'User',
                user_type: 'buyer'
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.user) {
            addResult('Email Signup', true, `User ID: ${data.user.id}`);
            return { success: true, user: data.user, tokens: data.tokens };
        } else {
            addResult('Email Signup', false, data.detail || 'Unknown error');
            return { success: false, error: data.detail };
        }
    } catch (error) {
        addResult('Email Signup', false, error.message);
        return { success: false, error: error.message };
    }
}

// ========== WORKFLOW 2: PHONE SIGNUP ==========
async function testPhoneSignup() {
    console.log('\n📱 Workflow 2: Phone Signup');
    console.log('---------------------------');
    
    try {
        const testPhone = `+1555${Date.now().toString().slice(-7)}`;
        const response = await fetch(`${BACKEND_URL}/auth/signup-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `phone_${Date.now()}@example.com`,
                phone: testPhone,
                first_name: 'Phone',
                last_name: 'User',
                user_type: 'buyer'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addResult('Phone Signup', true, `Requires OTP: ${data.requires_phone_verification}`);
            return { success: true, user: data.user };
        } else {
            addResult('Phone Signup', false, data.detail || 'Unknown error');
            return { success: false };
        }
    } catch (error) {
        addResult('Phone Signup', false, error.message);
        return { success: false };
    }
}

// ========== WORKFLOW 3: VENDOR SIGNUP & PRODUCT UPLOAD ==========
async function testVendorWorkflow() {
    console.log('\n🏪 Workflow 3: Vendor Product Upload');
    console.log('------------------------------------');
    
    try {
        // 1. Vendor Signup
        const vendorEmail = `vendor_${Date.now()}@example.com`;
        const signupRes = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: vendorEmail,
                password: 'VendorPass123!',
                phone: `+1666${Date.now().toString().slice(-7)}`,
                first_name: 'Vendor',
                last_name: 'Test',
                user_type: 'supplier'
            })
        });
        
        const signupData = await signupRes.json();
        
        if (!signupRes.ok) {
            addResult('Vendor Signup', false, signupData.detail);
            return { success: false };
        }
        
        addResult('Vendor Signup', true, `ID: ${signupData.user.id}`);
        const token = signupData.tokens?.access_token;
        
        if (!token) {
            addResult('Vendor Token', false, 'No access token received');
            return { success: false };
        }
        
        // 2. Get Categories (needed for product creation)
        const categoriesRes = await fetch(`${BACKEND_URL}/products/categories/tree`);
        const categories = await categoriesRes.json();
        addResult('Fetch Categories', categoriesRes.ok, `Found: ${categories.length || 0}`);
        
        // 3. Get Brands
        const brandsRes = await fetch(`${BACKEND_URL}/products/brands/active`);
        const brands = await brandsRes.json();
        addResult('Fetch Brands', brandsRes.ok, `Found: ${brands.length || 0}`);
        
        // 4. Test Bulk CSV Upload
        const csvContent = `name,sku,price,short_description
Eco Bamboo Toothbrush,SKU-${Date.now()},12.99,Sustainable bamboo toothbrush
Reusable Water Bottle,SKU-${Date.now() + 1},24.99,Stainless steel water bottle`;
        
        const formData = new FormData();
        formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'products.csv');
        
        const bulkRes = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (bulkRes.ok) {
            const bulkData = await bulkRes.json();
            addResult('Bulk CSV Upload', true, `${bulkData.results?.successful || 0} products created`);
        } else {
            const error = await bulkRes.text();
            addResult('Bulk CSV Upload', false, error.substring(0, 100));
        }
        
        return { success: true, token, vendorId: signupData.user.id };
        
    } catch (error) {
        addResult('Vendor Workflow', false, error.message);
        return { success: false };
    }
}

// ========== WORKFLOW 4: BUYER BROWSING & CART ==========
async function testBuyerWorkflow() {
    console.log('\n🛒 Workflow 4: Buyer Browse & Cart');
    console.log('----------------------------------');
    
    try {
        // 1. Browse Products
        const productsRes = await fetch(`${BACKEND_URL}/products/?page=1&limit=10`);
        const productsData = await productsRes.json();
        addResult('Browse Products', productsRes.ok, `Found: ${productsData.total || 0} products`);
        
        // 2. Search Products
        const searchRes = await fetch(`${BACKEND_URL}/products/?search=eco&page=1&limit=5`);
        const searchData = await searchRes.json();
        addResult('Search Products', searchRes.ok, `Results: ${searchData.total || 0}`);
        
        // 3. Filter by Category (if categories exist)
        const categoriesRes = await fetch(`${BACKEND_URL}/products/categories/tree`);
        if (categoriesRes.ok) {
            const categories = await categoriesRes.json();
            if (categories.length > 0) {
                const filterRes = await fetch(`${BACKEND_URL}/products/?category_id=${categories[0].id}`);
                addResult('Filter by Category', filterRes.ok, 'Category filter working');
            } else {
                addResult('Filter by Category', true, 'No categories to test');
            }
        }
        
        return { success: true };
        
    } catch (error) {
        addResult('Buyer Workflow', false, error.message);
        return { success: false };
    }
}

// ========== WORKFLOW 5: GOOGLE OAUTH ==========
async function testGoogleOAuth() {
    console.log('\n🔐 Workflow 5: Google OAuth');
    console.log('---------------------------');
    
    try {
        const response = await fetch(`${BACKEND_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Expect 400/401/422 for missing token, but endpoint should exist
        if (response.status === 404) {
            addResult('Google OAuth Endpoint', false, 'Endpoint not found');
        } else {
            addResult('Google OAuth Endpoint', true, `Ready (status: ${response.status})`);
        }
        
        return { success: true };
    } catch (error) {
        addResult('Google OAuth', false, error.message);
        return { success: false };
    }
}

// ========== WORKFLOW 6: BACKEND HEALTH ==========
async function testBackendHealth() {
    console.log('\n🏥 Workflow 6: Backend Health');
    console.log('-----------------------------');
    
    try {
        // 1. Health Check
        const healthRes = await fetch(`${BACKEND_URL}/health`);
        const health = await healthRes.json();
        addResult('Backend Health', healthRes.ok, `Version: ${health.version}`);
        
        // 2. Root Endpoint
        const rootRes = await fetch(`${BACKEND_URL}/`);
        const root = await rootRes.json();
        addResult('Root Endpoint', rootRes.ok, root.name);
        
        // 3. Database Connection (via categories)
        const dbRes = await fetch(`${BACKEND_URL}/products/categories/tree`);
        addResult('Database Connection', dbRes.ok, 'Categories endpoint responsive');
        
        return { success: true };
    } catch (error) {
        addResult('Backend Health', false, error.message);
        return { success: false };
    }
}

// ========== WORKFLOW 7: FRONTEND AVAILABILITY ==========
async function testFrontend() {
    console.log('\n🌐 Workflow 7: Frontend');
    console.log('-----------------------');
    
    try {
        const response = await fetch(FRONTEND_URL, { method: 'HEAD' });
        addResult('Frontend Accessible', response.ok, FRONTEND_URL);
        return { success: response.ok };
    } catch (error) {
        addResult('Frontend Accessible', false, error.message);
        return { success: false };
    }
}

// ========== RUN ALL WORKFLOWS ==========
async function runAllWorkflows() {
    console.log('Starting comprehensive workflow tests...\n');
    
    await testBackendHealth();
    await testFrontend();
    await testEmailSignup();
    await testPhoneSignup();
    await testGoogleOAuth();
    await testVendorWorkflow();
    await testBuyerWorkflow();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.passed).forEach(t => {
            console.log(`   - ${t.name}: ${t.details}`);
        });
    }
    
    console.log('\n' + (results.failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests need attention'));
}

runAllWorkflows().catch(console.error);






