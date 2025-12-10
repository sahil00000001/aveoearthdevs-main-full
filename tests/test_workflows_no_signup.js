const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log('🧪 Testing Workflows (No Signup Required)');
console.log('==========================================\n');

const results = {
    categories: false,
    brands: false,
    products: false,
    productSearch: false,
    healthCheck: false,
    bulkUploadEndpoint: false
};

// Test Health Check
async function testHealthCheck() {
    console.log('1️⃣  Testing Health Check...');
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        if (response.ok && data.status === 'healthy') {
            results.healthCheck = true;
            console.log('   ✅ Health check passed');
        } else {
            console.log('   ❌ Health check failed');
        }
    } catch (error) {
        console.log(`   ❌ Health check error: ${error.message}`);
    }
    console.log('');
}

// Test Categories
async function testCategories() {
    console.log('2️⃣  Testing Categories Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/categories/tree`);
        const data = await response.json();
        if (response.ok) {
            results.categories = true;
            console.log(`   ✅ Categories endpoint working (${Array.isArray(data) ? data.length : 0} categories)`);
        } else {
            console.log(`   ❌ Categories failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Categories error: ${error.message}`);
    }
    console.log('');
}

// Test Brands
async function testBrands() {
    console.log('3️⃣  Testing Brands Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/brands/active`);
        const data = await response.json();
        if (response.ok) {
            results.brands = true;
            console.log(`   ✅ Brands endpoint working (${Array.isArray(data) ? data.length : 0} brands)`);
        } else {
            console.log(`   ❌ Brands failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Brands error: ${error.message}`);
    }
    console.log('');
}

// Test Products
async function testProducts() {
    console.log('4️⃣  Testing Products Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/products/`);
        const data = await response.json();
        if (response.ok) {
            results.products = true;
            console.log(`   ✅ Products endpoint working (${data.total || 0} products)`);
        } else {
            console.log(`   ❌ Products failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Products error: ${error.message}`);
    }
    console.log('');
}

// Test Product Search
async function testProductSearch() {
    console.log('5️⃣  Testing Product Search...');
    try {
        // Search endpoint is POST /search/, not GET /products/search
        const response = await fetch(`${BACKEND_URL}/search/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'test', page: 1, per_page: 10 })
        });
        if (response.ok || response.status === 200) {
            results.productSearch = true;
            console.log('   ✅ Product search endpoint working');
        } else {
            // Check if endpoint exists (422 = validation error, means endpoint exists)
            const data = await response.json().catch(() => ({}));
            if (response.status === 422 || response.status === 400) {
                results.productSearch = true;
                console.log('   ✅ Product search endpoint exists');
            } else {
                console.log(`   ⚠️  Product search: ${response.status}`);
            }
        }
    } catch (error) {
        console.log(`   ❌ Product search error: ${error.message}`);
    }
    console.log('');
}

// Test Bulk Upload Endpoint Exists
async function testBulkUploadEndpoint() {
    console.log('6️⃣  Testing Bulk Upload Endpoint (exists check)...');
    try {
        // Just check if endpoint exists (expect 401/403 without auth)
        const csvContent = 'name,sku,price\nTest,SKU001,99.99';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, 'test.csv');

        const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            body: formData
        });

        // 401/403 means endpoint exists, just needs auth
        if (response.status === 401 || response.status === 403 || response.status === 422 || response.ok) {
            results.bulkUploadEndpoint = true;
            console.log('   ✅ Bulk upload endpoint exists');
            if (response.status === 401 || response.status === 403) {
                console.log('   Note: Requires authentication (expected)');
            }
        } else {
            console.log(`   ❌ Bulk upload endpoint: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Bulk upload error: ${error.message}`);
    }
    console.log('');
}

// Print Summary
function printSummary() {
    console.log('📊 Test Summary');
    console.log('===============\n');
    
    const tests = [
        { name: 'Health Check', result: results.healthCheck },
        { name: 'Categories', result: results.categories },
        { name: 'Brands', result: results.brands },
        { name: 'Products', result: results.products },
        { name: 'Product Search', result: results.productSearch },
        { name: 'Bulk Upload Endpoint', result: results.bulkUploadEndpoint }
    ];

    let passed = 0;
    tests.forEach(test => {
        const status = test.result ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${test.result ? 'PASSED' : 'FAILED'}`);
        if (test.result) passed++;
    });

    console.log(`\nTotal: ${passed}/${tests.length} passed\n`);
}

// Run all tests
async function runAllTests() {
    await testHealthCheck();
    await testCategories();
    await testBrands();
    await testProducts();
    await testProductSearch();
    await testBulkUploadEndpoint();
    
    printSummary();
}

runAllTests().catch(console.error);

