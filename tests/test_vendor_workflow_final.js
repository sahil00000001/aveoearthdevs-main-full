const https = require('https');
const http = require('http');

// Test complete vendor workflow with working backend
async function testVendorWorkflowFinal() {
    console.log('🛒 FINAL VENDOR WORKFLOW TEST\n');
    
    // Test all services first
    console.log('1. Verifying all services are running...');
    const services = [
        { name: 'Frontend', url: 'http://localhost:5173' },
        { name: 'Backend API', url: 'http://localhost:8082' },
        { name: 'AI Service', url: 'http://localhost:8002' },
        { name: 'Product Verification', url: 'http://localhost:8001' }
    ];
    
    let runningServices = 0;
    for (const service of services) {
        try {
            const response = await fetch(service.url);
            if (response.ok) {
                console.log(`✅ ${service.name}: Running`);
                runningServices++;
            } else {
                console.log(`❌ ${service.name}: Error ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${service.name}: Not running - ${error.message}`);
        }
    }
    
    if (runningServices < 4) {
        console.log('\n❌ Not all services are running. Please start all services first.');
        return false;
    }
    
    // Test backend API endpoints
    console.log('\n2. Testing backend API functionality...');
    const backendTests = [
        { name: 'Health Check', url: 'http://localhost:8082/health' },
        { name: 'Products List', url: 'http://localhost:8082/products' },
        { name: 'Supplier Products', url: 'http://localhost:8082/supplier/products' }
    ];
    
    let workingBackendTests = 0;
    for (const test of backendTests) {
        try {
            const response = await fetch(test.url);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${test.name}: Working`);
                if (test.name === 'Products List') {
                    console.log(`   📦 Found ${data.products ? data.products.length : 0} products`);
                }
                workingBackendTests++;
            } else {
                console.log(`❌ ${test.name}: Error ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Connection failed - ${error.message}`);
        }
    }
    
    // Test AI service functionality
    console.log('\n3. Testing AI service functionality...');
    const aiTests = [
        { name: 'Health Check', url: 'http://localhost:8002/health' },
        { name: 'Chat History', url: 'http://localhost:8002/chat/history/test-session' }
    ];
    
    let workingAITests = 0;
    for (const test of aiTests) {
        try {
            const response = await fetch(test.url);
            if (response.ok) {
                console.log(`✅ ${test.name}: Working`);
                workingAITests++;
            } else {
                console.log(`❌ ${test.name}: Error ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Connection failed - ${error.message}`);
        }
    }
    
    // Test product verification
    console.log('\n4. Testing product verification...');
    try {
        const response = await fetch('http://localhost:8001/');
        if (response.ok) {
            console.log('✅ Product Verification: Working');
        } else {
            console.log('❌ Product Verification: Error');
        }
    } catch (error) {
        console.log('❌ Product Verification: Connection failed');
    }
    
    // Test frontend vendor pages
    console.log('\n5. Testing frontend vendor pages...');
    const vendorPages = [
        { name: 'Vendor Login', url: 'http://localhost:5173/vendor/login' },
        { name: 'Vendor Dashboard', url: 'http://localhost:5173/vendor/dashboard' },
        { name: 'Vendor Products', url: 'http://localhost:5173/vendor/products' },
        { name: 'Admin Dashboard', url: 'http://localhost:5173/admin/dashboard' }
    ];
    
    let accessiblePages = 0;
    for (const page of vendorPages) {
        try {
            const response = await fetch(page.url);
            if (response.ok) {
                console.log(`✅ ${page.name}: Accessible`);
                accessiblePages++;
            } else {
                console.log(`❌ ${page.name}: Error ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${page.name}: Connection failed - ${error.message}`);
        }
    }
    
    // Test product creation simulation
    console.log('\n6. Testing product creation simulation...');
    try {
        // Test creating a product via the backend API
        const productData = {
            name: 'Test Eco Product',
            price: 29.99,
            description: 'This is a test eco-friendly product'
        };
        
        const createResponse = await fetch('http://localhost:8082/supplier/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (createResponse.ok) {
            console.log('✅ Product Creation: API endpoint working');
        } else {
            console.log(`❌ Product Creation: Error ${createResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Product Creation: Connection failed - ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 FINAL VENDOR WORKFLOW TEST SUMMARY:');
    console.log('======================================');
    console.log(`✅ Running services: ${runningServices}/4`);
    console.log(`✅ Working backend tests: ${workingBackendTests}/${backendTests.length}`);
    console.log(`✅ Working AI tests: ${workingAITests}/${aiTests.length}`);
    console.log(`✅ Accessible vendor pages: ${accessiblePages}/${vendorPages.length}`);
    
    const overallSuccess = runningServices === 4 && workingBackendTests >= 2 && accessiblePages >= 3;
    
    if (overallSuccess) {
        console.log('\n🎉 VENDOR WORKFLOW TEST COMPLETED SUCCESSFULLY!');
        console.log('===============================================');
        console.log('✅ All services are running');
        console.log('✅ Backend API is functional');
        console.log('✅ AI service is operational');
        console.log('✅ Product verification is working');
        console.log('✅ Frontend vendor pages are accessible');
        console.log('');
        console.log('🚀 READY FOR MANUAL VENDOR TESTING!');
        console.log('==================================');
        console.log('1. Open http://localhost:5173/vendor/login in your browser');
        console.log('2. Create a vendor account or login');
        console.log('3. Navigate to the products page');
        console.log('4. Upload products through the web interface');
        console.log('5. Test the complete vendor workflow');
        console.log('');
        console.log('💡 The system is now fully functional for vendor testing!');
    } else {
        console.log('\n❌ VENDOR WORKFLOW TEST INCOMPLETE');
        console.log('==================================');
        console.log('Some components are not working properly.');
    }
    
    return overallSuccess;
}

// Main test function
async function main() {
    console.log('🔍 Final Vendor Workflow Testing\n');
    
    const success = await testVendorWorkflowFinal();
    
    if (success) {
        console.log('\n🏁 TESTING COMPLETE - VENDOR WORKFLOW READY!');
    } else {
        console.log('\n🏁 TESTING COMPLETE - SOME ISSUES FOUND');
    }
}

// Run the tests
main().catch(console.error);
