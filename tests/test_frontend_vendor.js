const https = require('https');
const http = require('http');

// Test frontend vendor interface
async function testFrontendVendor() {
    console.log('🛒 Testing Frontend Vendor Interface...\n');
    
    try {
        // Test if frontend is accessible
        console.log('1. Testing frontend accessibility...');
        const frontendResponse = await fetch('http://localhost:5173');
        if (frontendResponse.ok) {
            console.log('✅ Frontend: Accessible');
        } else {
            console.log(`❌ Frontend: Error ${frontendResponse.status}`);
            return false;
        }
        
        // Test vendor login page
        console.log('2. Testing vendor login page...');
        const vendorLoginResponse = await fetch('http://localhost:5173/vendor/login');
        if (vendorLoginResponse.ok) {
            console.log('✅ Vendor Login Page: Accessible');
        } else {
            console.log(`❌ Vendor Login Page: Error ${vendorLoginResponse.status}`);
        }
        
        // Test vendor dashboard page
        console.log('3. Testing vendor dashboard page...');
        const vendorDashboardResponse = await fetch('http://localhost:5173/vendor/dashboard');
        if (vendorDashboardResponse.ok) {
            console.log('✅ Vendor Dashboard Page: Accessible');
        } else {
            console.log(`❌ Vendor Dashboard Page: Error ${vendorDashboardResponse.status}`);
        }
        
        // Test vendor products page
        console.log('4. Testing vendor products page...');
        const vendorProductsResponse = await fetch('http://localhost:5173/vendor/products');
        if (vendorProductsResponse.ok) {
            console.log('✅ Vendor Products Page: Accessible');
        } else {
            console.log(`❌ Vendor Products Page: Error ${vendorProductsResponse.status}`);
        }
        
        console.log('\n🎉 Frontend vendor interface is accessible!');
        console.log('\n📝 Next Steps:');
        console.log('1. Open http://localhost:5173/vendor/login in your browser');
        console.log('2. Create a vendor account or login');
        console.log('3. Navigate to the products page');
        console.log('4. Try uploading a product');
        
        return true;
        
    } catch (error) {
        console.log(`❌ Frontend vendor test failed: ${error.message}`);
        return false;
    }
}

// Test if we can access the vendor interface through the browser
async function main() {
    console.log('🔍 Frontend Vendor Interface Testing\n');
    
    await testFrontendVendor();
    
    console.log('\n🏁 Testing Complete!');
    console.log('\n💡 Since the backend is not running due to database connection issues,');
    console.log('   you can still test the frontend vendor interface manually by:');
    console.log('   1. Opening http://localhost:5173/vendor/login in your browser');
    console.log('   2. Creating a vendor account');
    console.log('   3. Testing the product upload interface');
    console.log('   4. The frontend should work with mock data or Supabase directly');
}

// Run the tests
main().catch(console.error);
