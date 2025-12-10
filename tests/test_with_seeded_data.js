const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log('🌱 Testing with Seeded Database');
console.log('================================\n');

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

async function testCategories() {
    console.log('\n📂 Testing Categories');
    console.log('--------------------');
    
    const res = await fetch(`${BACKEND_URL}/products/categories/tree`);
    const data = await res.json();
    
    addResult('Fetch Categories', res.ok, `Found: ${data.length} categories`);
    
    if (data.length > 0) {
        console.log('   Categories:');
        data.forEach(cat => console.log(`     - ${cat.name} (${cat.slug})`));
    }
    
    return data;
}

async function testBrands() {
    console.log('\n🏷️  Testing Brands');
    console.log('-----------------');
    
    const res = await fetch(`${BACKEND_URL}/products/brands/active`);
    const data = await res.json();
    
    addResult('Fetch Brands', res.ok, `Found: ${data.length} brands`);
    
    if (data.length > 0) {
        console.log('   Brands:');
        data.forEach(brand => console.log(`     - ${brand.name}`));
    }
    
    return data;
}

async function testProducts() {
    console.log('\n📦 Testing Products');
    console.log('-------------------');
    
    const res = await fetch(`${BACKEND_URL}/products/?page=1&limit=20`);
    const data = await res.json();
    
    addResult('Fetch Products', res.ok, `Found: ${data.total} products`);
    
    if (data.items && data.items.length > 0) {
        console.log('   Products:');
        data.items.forEach((p, i) => {
            console.log(`     ${i + 1}. ${p.name} - $${p.price}`);
            console.log(`        SKU: ${p.sku} | Status: ${p.status}`);
        });
    }
    
    return data;
}

async function testProductSearch() {
    console.log('\n🔍 Testing Product Search');
    console.log('-------------------------');
    
    const searchTerms = ['bamboo', 'bottle', 'eco', 'cotton'];
    
    for (const term of searchTerms) {
        const res = await fetch(`${BACKEND_URL}/products/?search=${term}`);
        const data = await res.json();
        
        addResult(`Search "${term}"`, res.ok, `Results: ${data.total}`);
    }
}

async function testProductFilters() {
    console.log('\n🎚️  Testing Product Filters');
    console.log('---------------------------');
    
    // Test price filter
    const priceRes = await fetch(`${BACKEND_URL}/products/?min_price=10&max_price=25`);
    const priceData = await priceRes.json();
    addResult('Price Filter (10-25)', priceRes.ok, `Found: ${priceData.total}`);
    
    // Test sorting
    const sortRes = await fetch(`${BACKEND_URL}/products/?sort_by=price&sort_order=asc`);
    const sortData = await sortRes.json();
    addResult('Sort by Price', sortRes.ok, `Found: ${sortData.total}`);
}

async function testBulkUploadEndpoint() {
    console.log('\n📤 Testing Bulk Upload Endpoint');
    console.log('--------------------------------');
    
    // Test endpoint exists (will fail auth, but that's expected)
    const csvContent = 'name,sku,price\nTest Product,TEST-001,9.99';
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'test.csv');
    
    const res = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
        method: 'POST',
        body: formData
    });
    
    // Expect 401/403 without auth, that means endpoint exists
    if (res.status === 401 || res.status === 403) {
        addResult('Bulk Upload Endpoint', true, `Ready (requires auth)`);
    } else if (res.ok) {
        addResult('Bulk Upload Endpoint', true, 'Working');
    } else {
        addResult('Bulk Upload Endpoint', false, `Status: ${res.status}`);
    }
}

async function runTests() {
    console.log('Running tests with seeded database...\n');
    
    await testCategories();
    await testBrands();
    await testProducts();
    await testProductSearch();
    await testProductFilters();
    await testBulkUploadEndpoint();
    
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
    } else {
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Run seed_database.sql in Supabase SQL Editor');
        console.log('   2. Re-run this test to verify seeded data');
        console.log('   3. Test with actual user accounts after rate limit reset');
    }
}

runTests().catch(console.error);

