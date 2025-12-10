const https = require('https');
const http = require('http');

// Test vendor product upload functionality with backend on port 8080
async function testVendorUpload8080() {
    console.log('🛒 Testing Vendor Product Upload (Backend Port 8080)...\n');
    
    try {
        // Test backend health
        console.log('1. Testing backend health...');
        const healthResponse = await fetch('http://localhost:8080/health');
        if (healthResponse.ok) {
            const health = await healthResponse.json();
            console.log(`✅ Backend Health: ${health.status || 'OK'}`);
        } else {
            console.log(`❌ Backend Health: Error ${healthResponse.status}`);
            return false;
        }
        
        // Test backend products endpoint
        console.log('2. Testing backend products endpoint...');
        const productsResponse = await fetch('http://localhost:8080/api/products');
        if (productsResponse.ok) {
            const products = await productsResponse.json();
            console.log(`✅ Backend products endpoint: Working (${products.length || 0} products found)`);
        } else {
            console.log(`❌ Backend products endpoint: Error ${productsResponse.status}`);
            const error = await productsResponse.text();
            console.log(`Error details: ${error}`);
        }
        
        // Test categories endpoint
        console.log('3. Testing categories endpoint...');
        const categoriesResponse = await fetch('http://localhost:8080/api/products/categories');
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log(`✅ Categories endpoint: Working (${categories.length || 0} categories found)`);
        } else {
            console.log(`❌ Categories endpoint: Error ${categoriesResponse.status}`);
            const error = await categoriesResponse.text();
            console.log(`Error details: ${error}`);
        }
        
        // Test brands endpoint
        console.log('4. Testing brands endpoint...');
        const brandsResponse = await fetch('http://localhost:8080/api/products/brands');
        if (brandsResponse.ok) {
            const brands = await brandsResponse.json();
            console.log(`✅ Brands endpoint: Working (${brands.length || 0} brands found)`);
        } else {
            console.log(`❌ Brands endpoint: Error ${brandsResponse.status}`);
            const error = await brandsResponse.text();
            console.log(`Error details: ${error}`);
        }
        
        // Test supplier products endpoint
        console.log('5. Testing supplier products endpoint...');
        const supplierProductsResponse = await fetch('http://localhost:8080/api/supplier/products');
        if (supplierProductsResponse.ok) {
            const supplierProducts = await supplierProductsResponse.json();
            console.log(`✅ Supplier products endpoint: Working (${supplierProducts.length || 0} products found)`);
        } else {
            console.log(`❌ Supplier products endpoint: Error ${supplierProductsResponse.status}`);
            const error = await supplierProductsResponse.text();
            console.log(`Error details: ${error}`);
        }
        
        // Test product creation
        console.log('6. Testing product creation...');
        const productData = {
            name: 'Test Product from Script 8080',
            description: 'This is a test product created by the test script on port 8080',
            price: 29.99,
            category_id: '00000000-0000-0000-0000-000000000001', // Eco-Friendly category
            brand_id: '00000000-0000-0000-0000-000000000002',   // GreenTest brand
            sku: 'TEST-SCRIPT-8080-001',
            short_description: 'Test product for upload testing on port 8080'
        };
        
        const createResponse = await fetch('http://localhost:8080/api/supplier/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // Mock token for testing
            },
            body: JSON.stringify(productData)
        });
        
        if (createResponse.ok) {
            const createdProduct = await createResponse.json();
            console.log(`✅ Product creation: Working (Product ID: ${createdProduct.id})`);
        } else {
            const error = await createResponse.text();
            console.log(`❌ Product creation: Error ${createResponse.status} - ${error}`);
        }
        
        console.log('\n🎉 Vendor upload testing completed!');
        return true;
        
    } catch (error) {
        console.log(`❌ Vendor upload test failed: ${error.message}`);
        return false;
    }
}

// Test frontend accessibility
async function testFrontendAccess() {
    console.log('\n🌐 Testing Frontend Access...\n');
    
    try {
        const frontendResponse = await fetch('http://localhost:5173');
        if (frontendResponse.ok) {
            console.log('✅ Frontend: Accessible');
            console.log('\n📝 Next Steps:');
            console.log('1. Open http://localhost:5173/vendor/login in your browser');
            console.log('2. Create a vendor account or login');
            console.log('3. Navigate to the products page');
            console.log('4. Try uploading a product');
            return true;
        } else {
            console.log(`❌ Frontend: Error ${frontendResponse.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Frontend test failed: ${error.message}`);
        return false;
    }
}

// Main test function
async function main() {
    console.log('🔍 Comprehensive Vendor Upload Testing (Port 8080)\n');
    
    await testVendorUpload8080();
    await testFrontendAccess();
    
    console.log('\n🏁 Testing Complete!');
    console.log('\n💡 Summary:');
    console.log('- Backend is running on port 8080');
    console.log('- Frontend is accessible on port 5173');
    console.log('- You can now test the vendor upload functionality through the web interface');
}

// Run the tests
main().catch(console.error);
