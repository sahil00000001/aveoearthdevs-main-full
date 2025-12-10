// Test Vendor Product Upload Flow
// This script tests the complete vendor product creation workflow

console.log('🚀 Testing Vendor Product Upload Flow...');

// Test 1: Check if services are running
async function checkServices() {
    console.log('\n📋 Checking Services...');
    
    const services = [
        { name: 'Frontend', url: 'http://localhost:5173' },
        { name: 'Backend', url: 'http://localhost:8080/health' },
        { name: 'AI Service', url: 'http://localhost:8002/health' },
        { name: 'Product Verification', url: 'http://localhost:8001' }
    ];

    for (const service of services) {
        try {
            const response = await fetch(service.url);
            if (response.ok) {
                console.log(`✅ ${service.name} is running`);
            } else {
                console.log(`❌ ${service.name} returned ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${service.name} not accessible: ${error.message}`);
        }
    }
}

// Test 2: Test backend products endpoint (should work after data population)
async function testProductsEndpoint() {
    console.log('\n🔍 Testing Products Endpoint...');
    try {
        const response = await fetch('http://localhost:8080/products');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Products endpoint working: ${data.items?.length || 0} products found`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Products endpoint error: ${response.status} - ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Products endpoint error: ${error.message}`);
        return false;
    }
}

// Test 3: Test product creation with correct format
async function testProductCreation() {
    console.log('\n🔍 Testing Product Creation...');
    
    // Create form data as expected by the backend
    const formData = new FormData();
    formData.append('name', 'Test Eco Product');
    formData.append('description', 'A test product for workflow testing');
    formData.append('short_description', 'Test eco product');
    formData.append('category_id', '00000000-0000-0000-0000-000000000003'); // From our test data
    formData.append('brand_id', '00000000-0000-0000-0000-000000000004'); // From our test data
    formData.append('sku', 'TEST-ECO-001');
    formData.append('price', '29.99');
    formData.append('compare_at_price', '39.99');
    formData.append('status', 'draft');
    formData.append('approval_status', 'pending');
    formData.append('visibility', 'hidden');
    formData.append('materials', '["Organic Cotton", "Recycled Plastic"]');
    formData.append('tags', '["test", "eco-friendly", "sustainable"]');
    
    // Create a dummy image file for testing
    const dummyImage = new Blob(['dummy image content'], { type: 'image/jpeg' });
    formData.append('images', dummyImage, 'test-image.jpg');

    try {
        const response = await fetch('http://localhost:8080/supplier/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Product creation successful: ${data.name} (ID: ${data.id})`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Product creation failed: ${response.status} - ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Product creation error: ${error.message}`);
        return false;
    }
}

// Test 4: Test categories endpoint
async function testCategoriesEndpoint() {
    console.log('\n🔍 Testing Categories Endpoint...');
    try {
        const response = await fetch('http://localhost:8080/products/categories/tree');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Categories endpoint working: ${data.length} categories found`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Categories endpoint error: ${response.status} - ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Categories endpoint error: ${error.message}`);
        return false;
    }
}

// Test 5: Test brands endpoint
async function testBrandsEndpoint() {
    console.log('\n🔍 Testing Brands Endpoint...');
    try {
        const response = await fetch('http://localhost:8080/products/brands/active');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Brands endpoint working: ${data.length} brands found`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Brands endpoint error: ${response.status} - ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Brands endpoint error: ${error.message}`);
        return false;
    }
}

// Test 6: Simulate frontend vendor workflow
async function simulateVendorWorkflow() {
    console.log('\n🔍 Simulating Frontend Vendor Workflow...');
    
    // Step 1: Vendor login simulation
    console.log('1. Simulating vendor login...');
    const vendorSession = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'supplier@test.com',
        businessName: 'EcoTest Solutions',
        loginTime: new Date().toISOString()
    };
    console.log(`✅ Vendor logged in: ${vendorSession.businessName}`);

    // Step 2: Load categories and brands
    console.log('2. Loading categories and brands...');
    const categoriesResponse = await fetch('http://localhost:8080/products/categories/tree');
    const brandsResponse = await fetch('http://localhost:8080/products/brands/active');
    
    if (categoriesResponse.ok && brandsResponse.ok) {
        const categories = await categoriesResponse.json();
        const brands = await brandsResponse.json();
        console.log(`✅ Loaded ${categories.length} categories and ${brands.length} brands`);
    } else {
        console.log('❌ Failed to load categories or brands');
        return false;
    }

    // Step 3: Create product
    console.log('3. Creating product...');
    const productCreated = await testProductCreation();
    
    if (productCreated) {
        console.log('✅ Complete vendor workflow simulation successful!');
        return true;
    } else {
        console.log('❌ Product creation failed in workflow simulation');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('📋 Running Complete Vendor Product Upload Tests...\n');
    
    const tests = [
        { name: 'Service Check', fn: checkServices },
        { name: 'Products Endpoint', fn: testProductsEndpoint },
        { name: 'Categories Endpoint', fn: testCategoriesEndpoint },
        { name: 'Brands Endpoint', fn: testBrandsEndpoint },
        { name: 'Product Creation', fn: testProductCreation },
        { name: 'Vendor Workflow', fn: simulateVendorWorkflow }
    ];

    const results = [];
    
    for (const test of tests) {
        console.log(`\n🔍 Running ${test.name}...`);
        const result = await test.fn();
        results.push({ name: test.name, passed: result });
    }

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! The vendor product upload flow is fully functional.');
    } else {
        console.log('⚠️ Some tests failed. Check the issues above.');
        console.log('\n💡 Next steps:');
        console.log('1. Run the minimal_test_data.sql in Supabase');
        console.log('2. Check if all services are running');
        console.log('3. Test the frontend vendor interface');
    }
}

// Run the tests
runAllTests().catch(console.error);
