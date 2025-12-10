// Test Product Upload Functionality
// This tests if product uploading actually works

console.log('🔍 Testing Product Upload Functionality...\n');

// Test 1: Check if we can get categories and brands first
async function testPrerequisites() {
    console.log('📋 Testing Prerequisites...');
    
    try {
        // Test categories
        const categoriesResponse = await fetch('http://localhost:8080/products/categories/tree');
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log(`✅ Categories available: ${categories.length} categories`);
            if (categories.length > 0) {
                console.log(`   First category: ${categories[0].name}`);
                return categories[0].id;
            }
        } else {
            console.log(`❌ Categories error: ${categoriesResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Categories error: ${error.message}`);
    }
    
    try {
        // Test brands
        const brandsResponse = await fetch('http://localhost:8080/products/brands/active');
        if (brandsResponse.ok) {
            const brands = await brandsResponse.json();
            console.log(`✅ Brands available: ${brands.length} brands`);
            if (brands.length > 0) {
                console.log(`   First brand: ${brands[0].name}`);
                return brands[0].id;
            }
        } else {
            console.log(`❌ Brands error: ${brandsResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Brands error: ${error.message}`);
    }
    
    return null;
}

// Test 2: Test product creation with minimal data
async function testProductCreation() {
    console.log('\n🛍️ Testing Product Creation...');
    
    // Create a simple test product
    const productData = {
        name: 'Test Eco Product',
        description: 'A test product for upload testing',
        short_description: 'Test product',
        category_id: '00000000-0000-0000-0000-000000000003', // From our test data
        brand_id: '00000000-0000-0000-0000-000000000004', // From our test data
        sku: 'TEST-ECO-001',
        price: 29.99,
        compare_at_price: 39.99,
        status: 'draft',
        approval_status: 'pending',
        visibility: 'hidden',
        materials: ['Test Material'],
        tags: ['test', 'eco-friendly']
    };
    
    console.log('📝 Product Data:');
    console.log(`   Name: ${productData.name}`);
    console.log(`   SKU: ${productData.sku}`);
    console.log(`   Price: $${productData.price}`);
    console.log(`   Category ID: ${productData.category_id}`);
    console.log(`   Brand ID: ${productData.brand_id}`);
    
    try {
        const response = await fetch('http://localhost:8080/supplier/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Product creation successful!`);
            console.log(`   Product ID: ${data.id}`);
            console.log(`   Product Name: ${data.name}`);
            console.log(`   Status: ${data.status}`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Product creation failed: ${response.status}`);
            console.log(`   Error: ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Product creation error: ${error.message}`);
        return false;
    }
}

// Test 3: Test product creation with form data (as expected by backend)
async function testProductCreationFormData() {
    console.log('\n📝 Testing Product Creation with Form Data...');
    
    // Create form data as expected by the backend
    const formData = new FormData();
    formData.append('name', 'Test Eco Product Form');
    formData.append('description', 'A test product using form data');
    formData.append('short_description', 'Test form product');
    formData.append('category_id', '00000000-0000-0000-0000-000000000003');
    formData.append('brand_id', '00000000-0000-0000-0000-000000000004');
    formData.append('sku', 'TEST-FORM-001');
    formData.append('price', '29.99');
    formData.append('compare_at_price', '39.99');
    formData.append('status', 'draft');
    formData.append('approval_status', 'pending');
    formData.append('visibility', 'hidden');
    formData.append('materials', '["Test Material"]');
    formData.append('tags', '["test", "form-data"]');
    
    // Create a dummy image file
    const dummyImage = new Blob(['dummy image content'], { type: 'image/jpeg' });
    formData.append('images', dummyImage, 'test-image.jpg');
    
    console.log('📝 Form Data:');
    console.log(`   Name: Test Eco Product Form`);
    console.log(`   SKU: TEST-FORM-001`);
    console.log(`   Price: $29.99`);
    console.log(`   Images: 1 file`);
    
    try {
        const response = await fetch('http://localhost:8080/supplier/products', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Form data product creation successful!`);
            console.log(`   Product ID: ${data.id}`);
            console.log(`   Product Name: ${data.name}`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Form data product creation failed: ${response.status}`);
            console.log(`   Error: ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Form data product creation error: ${error.message}`);
        return false;
    }
}

// Test 4: Test if products can be retrieved after creation
async function testProductRetrieval() {
    console.log('\n📦 Testing Product Retrieval...');
    
    try {
        const response = await fetch('http://localhost:8080/products');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Products retrieved successfully!`);
            console.log(`   Total products: ${data.items?.length || 0}`);
            console.log(`   Total pages: ${data.total_pages || 0}`);
            
            if (data.items && data.items.length > 0) {
                console.log(`   First product: ${data.items[0].name}`);
                console.log(`   First product SKU: ${data.items[0].sku}`);
            }
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ Product retrieval failed: ${response.status}`);
            console.log(`   Error: ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Product retrieval error: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runProductUploadTests() {
    console.log('🚀 PRODUCT UPLOAD FUNCTIONALITY TEST');
    console.log('====================================\n');
    
    // Test 1: Check prerequisites
    const prerequisites = await testPrerequisites();
    
    // Test 2: Test JSON product creation
    const jsonCreation = await testProductCreation();
    
    // Test 3: Test form data product creation
    const formCreation = await testProductCreationFormData();
    
    // Test 4: Test product retrieval
    const retrieval = await testProductRetrieval();
    
    // Summary
    console.log('\n📊 PRODUCT UPLOAD TEST SUMMARY');
    console.log('===============================');
    
    const tests = [
        { name: 'Prerequisites (Categories/Brands)', result: prerequisites !== null },
        { name: 'JSON Product Creation', result: jsonCreation },
        { name: 'Form Data Product Creation', result: formCreation },
        { name: 'Product Retrieval', result: retrieval }
    ];
    
    const passed = tests.filter(t => t.result).length;
    const total = tests.length;
    
    tests.forEach(test => {
        const status = test.result ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('\n🎉 PRODUCT UPLOAD IS FULLY FUNCTIONAL!');
        console.log('   ✅ Categories and brands available');
        console.log('   ✅ Products can be created via JSON');
        console.log('   ✅ Products can be created via form data');
        console.log('   ✅ Products can be retrieved');
        console.log('\n💡 You can now upload products through the vendor interface!');
    } else {
        console.log('\n⚠️ Product upload has issues');
        console.log('   Check the failed tests above');
        
        if (!prerequisites) {
            console.log('\n🔧 FIX NEEDED:');
            console.log('   1. Run the minimal_test_data.sql in Supabase');
            console.log('   2. Ensure categories and brands are populated');
        }
    }
}

// Run the tests
runProductUploadTests().catch(console.error);
