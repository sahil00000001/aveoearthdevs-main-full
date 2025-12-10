const https = require('https');
const http = require('http');

// Test all services
async function testAllServices() {
    console.log('🚀 Testing All Services...\n');
    
    const services = [
        { name: 'Backend API', url: 'http://localhost:8000/health', port: 8000 },
        { name: 'AI Service', url: 'http://localhost:8001/health', port: 8001 },
        { name: 'Product Verification', url: 'http://localhost:8002/', port: 8002 },
        { name: 'Frontend', url: 'http://localhost:5173', port: 5173 }
    ];
    
    const results = {};
    
    for (const service of services) {
        try {
            console.log(`Testing ${service.name}...`);
            const response = await fetch(service.url);
            if (response.ok) {
                console.log(`✅ ${service.name}: Running`);
                results[service.name] = 'running';
            } else {
                console.log(`⚠️  ${service.name}: Responding but with error (${response.status})`);
                results[service.name] = 'error';
            }
        } catch (error) {
            console.log(`❌ ${service.name}: Not running (${error.message})`);
            results[service.name] = 'not_running';
        }
    }
    
    console.log('\n📊 Service Status Summary:');
    console.log('========================');
    for (const [name, status] of Object.entries(results)) {
        const icon = status === 'running' ? '✅' : status === 'error' ? '⚠️' : '❌';
        console.log(`${icon} ${name}: ${status}`);
    }
    
    return results;
}

// Test vendor product upload functionality
async function testVendorUpload() {
    console.log('\n🛒 Testing Vendor Product Upload...\n');
    
    try {
        // Test backend products endpoint
        console.log('1. Testing backend products endpoint...');
        const productsResponse = await fetch('http://localhost:8000/api/products');
        if (productsResponse.ok) {
            const products = await productsResponse.json();
            console.log(`✅ Backend products endpoint: Working (${products.length || 0} products found)`);
        } else {
            console.log(`❌ Backend products endpoint: Error ${productsResponse.status}`);
            return false;
        }
        
        // Test categories endpoint
        console.log('2. Testing categories endpoint...');
        const categoriesResponse = await fetch('http://localhost:8000/api/products/categories');
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log(`✅ Categories endpoint: Working (${categories.length || 0} categories found)`);
        } else {
            console.log(`❌ Categories endpoint: Error ${categoriesResponse.status}`);
            return false;
        }
        
        // Test brands endpoint
        console.log('3. Testing brands endpoint...');
        const brandsResponse = await fetch('http://localhost:8000/api/products/brands');
        if (brandsResponse.ok) {
            const brands = await brandsResponse.json();
            console.log(`✅ Brands endpoint: Working (${brands.length || 0} brands found)`);
        } else {
            console.log(`❌ Brands endpoint: Error ${brandsResponse.status}`);
            return false;
        }
        
        // Test product creation
        console.log('4. Testing product creation...');
        const productData = {
            name: 'Test Product from Script',
            description: 'This is a test product created by the test script',
            price: 29.99,
            category_id: '00000000-0000-0000-0000-000000000001', // Eco-Friendly category
            brand_id: '00000000-0000-0000-0000-000000000002',   // GreenTest brand
            sku: 'TEST-SCRIPT-001',
            short_description: 'Test product for upload testing'
        };
        
        const createResponse = await fetch('http://localhost:8000/api/supplier/products', {
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
            return false;
        }
        
        console.log('\n🎉 All vendor upload tests passed!');
        return true;
        
    } catch (error) {
        console.log(`❌ Vendor upload test failed: ${error.message}`);
        return false;
    }
}

// Main test function
async function main() {
    console.log('🔍 Comprehensive Service and Upload Testing\n');
    
    // Test all services
    const serviceResults = await testAllServices();
    
    // Check if backend is running before testing upload
    if (serviceResults['Backend API'] === 'running') {
        await testVendorUpload();
    } else {
        console.log('\n❌ Cannot test vendor upload - Backend API is not running');
    }
    
    console.log('\n🏁 Testing Complete!');
}

// Run the tests
main().catch(console.error);
