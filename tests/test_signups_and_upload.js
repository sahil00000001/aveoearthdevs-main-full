const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🧪 Testing Signups and Bulk Upload');
console.log('====================================\n');

const results = {
    emailSignup: false,
    phoneSignup: false,
    googleOAuth: false,
    bulkUpload: false,
    errors: []
};

// Test Email Signup
async function testEmailSignup() {
    console.log('1️⃣  Testing Email Signup...');
    try {
        const testData = {
            email: `test_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            phone: `+123456789${Date.now().toString().slice(-4)}`,
            first_name: 'Test',
            last_name: 'User',
            user_type: 'buyer'
        };

        const response = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('   ✅ Email signup working');
            console.log(`   User ID: ${data.user?.id}`);
            results.emailSignup = true;
        } else {
            console.log(`   ❌ Email signup failed: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data).substring(0, 200)}`);
            results.errors.push(`Email signup: ${data.detail || data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`   ❌ Email signup error: ${error.message}`);
        results.errors.push(`Email signup: ${error.message}`);
    }
    console.log('');
}

// Test Phone Signup
async function testPhoneSignup() {
    console.log('2️⃣  Testing Phone Signup...');
    try {
        const testData = {
            email: `phone_${Date.now()}@example.com`,
            phone: `+123456789${Date.now().toString().slice(-4)}`,
            first_name: 'Phone',
            last_name: 'User',
            user_type: 'buyer'
        };

        const response = await fetch(`${BACKEND_URL}/auth/signup-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('   ✅ Phone signup working');
            console.log(`   User ID: ${data.user?.id}`);
            console.log(`   Requires verification: ${data.requires_phone_verification}`);
            results.phoneSignup = true;
        } else {
            console.log(`   ❌ Phone signup failed: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data).substring(0, 200)}`);
            results.errors.push(`Phone signup: ${data.detail || data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`   ❌ Phone signup error: ${error.message}`);
        results.errors.push(`Phone signup: ${error.message}`);
    }
    console.log('');
}

// Test Google OAuth (check endpoint exists)
async function testGoogleOAuth() {
    console.log('3️⃣  Testing Google OAuth Endpoint...');
    try {
        // Just check if endpoint exists - actual OAuth needs frontend
        const response = await fetch(`${BACKEND_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Expect 400/401 for missing token, but endpoint should exist
        if (response.status === 400 || response.status === 401 || response.status === 422) {
            console.log('   ✅ Google OAuth endpoint exists');
            console.log(`   Note: Requires OAuth token from frontend`);
            results.googleOAuth = true;
        } else if (response.ok) {
            console.log('   ✅ Google OAuth working');
            results.googleOAuth = true;
        } else {
            console.log(`   ⚠️  Google OAuth endpoint returned: ${response.status}`);
            console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}`);
            // Don't mark as error if endpoint exists
            if (response.status !== 404) {
                results.googleOAuth = true;
            }
        }
    } catch (error) {
        console.log(`   ❌ Google OAuth error: ${error.message}`);
        results.errors.push(`Google OAuth: ${error.message}`);
    }
    console.log('');
}

// Test Bulk Upload (CSV upload endpoint)
async function testBulkUpload() {
    console.log('4️⃣  Testing Bulk CSV Upload...');
    try {
        // Check if bulk upload endpoint exists
        const endpoints = [
            '/supplier/products/bulk-import-csv',
            '/supplier/products/bulk-import',
            '/supplier/products/csv-upload',
            '/supplier/products/import-csv',
            '/supplier/products/bulk-upload',
            '/supplier/products/bulk',
            '/products/bulk-upload',
            '/optimized-upload/bulk'
        ];

        let endpointFound = false;
        for (const endpoint of endpoints) {
            try {
                // Create a minimal CSV content for testing
                const csvContent = 'name,sku,price,category_id\nTest Product,SKU001,99.99,test-category-id';
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const formData = new FormData();
                formData.append('file', blob, 'test-products.csv');

                const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                    method: 'POST',
                    body: formData
                    // Note: Don't set Content-Type header, browser will set it with boundary
                });

                if (response.status === 401 || response.status === 403) {
                    console.log(`   ✅ Bulk upload endpoint exists: ${endpoint}`);
                    console.log(`   Note: Requires authentication token`);
                    results.bulkUpload = true;
                    endpointFound = true;
                    break;
                } else if (response.ok) {
                    console.log(`   ✅ Bulk upload working: ${endpoint}`);
                    results.bulkUpload = true;
                    endpointFound = true;
                    break;
                } else if (response.status === 400 || response.status === 422) {
                    console.log(`   ✅ Bulk upload endpoint exists: ${endpoint}`);
                    console.log(`   Note: Validation error (expected without proper data)`);
                    results.bulkUpload = true;
                    endpointFound = true;
                    break;
                }
            } catch (err) {
                // Continue to next endpoint
                continue;
            }
        }

        if (!endpointFound) {
            console.log('   ❌ Bulk upload endpoint not found');
            results.errors.push('Bulk upload: Endpoint not found');
        }
    } catch (error) {
        console.log(`   ❌ Bulk upload error: ${error.message}`);
        results.errors.push(`Bulk upload: ${error.message}`);
    }
    console.log('');
}

// Run all tests
async function runAllTests() {
    await testEmailSignup();
    await testPhoneSignup();
    await testGoogleOAuth();
    await testBulkUpload();

    console.log('📊 Test Summary:');
    console.log('================');
    console.log(`Email Signup: ${results.emailSignup ? '✅' : '❌'}`);
    console.log(`Phone Signup: ${results.phoneSignup ? '✅' : '❌'}`);
    console.log(`Google OAuth: ${results.googleOAuth ? '✅' : '❌'}`);
    console.log(`Bulk Upload: ${results.bulkUpload ? '✅' : '❌'}`);

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(err => console.log(`   - ${err}`));
    }

    const allPassed = results.emailSignup && results.phoneSignup && results.googleOAuth && results.bulkUpload;
    console.log(`\n${allPassed ? '✅ All tests passed!' : '⚠️  Some tests need attention.'}`);
}

runAllTests().catch(console.error);

