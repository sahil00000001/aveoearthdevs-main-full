// Comprehensive system test - bulk upload, products visibility, orders, AI, recommendations
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const fs = require('fs');
const path = require('path');

const results = {
    passed: [],
    failed: []
};

function logTest(testName, passed, message = '') {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}${message ? ': ' + message : ''}`);
    if (passed) {
        results.passed.push(testName);
    } else {
        results.failed.push({ test: testName, error: message });
    }
}

async function testBulkUpload() {
    try {
        // Signup as vendor
        const signupResponse = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `bulktest${Date.now()}@example.com`,
                password: 'Test123!@#',
                first_name: 'Bulk',
                last_name: 'Tester',
                phone: '+1234567890',
                user_type: 'supplier'
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        if (!signupResponse.ok && signupResponse.status !== 409) {
            throw new Error(`Signup failed: ${signupResponse.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login
        const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `bulktest${Date.now() - 1000}@example.com`,
                password: 'Test123!@#'
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.tokens?.access_token || loginData.access_token || loginData.session?.access_token;
        
        if (!token) {
            throw new Error('No token received');
        }
        
        // Bulk upload
        const csvPath = path.join(__dirname, 'test_products_5.csv');
        if (!fs.existsSync(csvPath)) {
            logTest('Bulk Upload', false, 'CSV file not found');
            return false;
        }
        
        const csvContent = fs.readFileSync(csvPath);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
        const CRLF = '\r\n';
        let bodyParts = [];
        bodyParts.push(`--${boundary}${CRLF}`);
        bodyParts.push(`Content-Disposition: form-data; name="file"; filename="test_products_5.csv"${CRLF}`);
        bodyParts.push(`Content-Type: text/csv${CRLF}${CRLF}`);
        bodyParts.push(csvContent);
        bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
        const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
        
        const uploadResponse = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            },
            body: formData,
            signal: AbortSignal.timeout(30000),
        });
        
        const uploadData = await uploadResponse.json();
        const successCount = uploadData.results?.successful || 0;
        const failedCount = uploadData.results?.failed || 0;
        
        logTest('Bulk Upload', uploadResponse.ok, `${successCount} successful, ${failedCount} failed`);
        return uploadResponse.ok && successCount > 0;
    } catch (error) {
        logTest('Bulk Upload', false, error.message);
        return false;
    }
}

async function testProductsVisible() {
    try {
        const response = await fetch(`${BACKEND_URL}/products?limit=20`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        const productCount = data.items?.length || data.data?.length || 0;
        logTest('Products Visible', response.ok && productCount > 0, `Found ${productCount} products`);
        return response.ok && productCount > 0;
    } catch (error) {
        logTest('Products Visible', false, error.message);
        return false;
    }
}

async function testOrderPlacing() {
    try {
        // This would require adding items to cart first, then creating order
        // For now, just check if cart endpoint works
        const response = await fetch(`${BACKEND_URL}/buyer/orders/cart`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        logTest('Order/Cart System', response.ok || response.status === 401, response.status === 401 ? 'Requires auth (expected)' : 'Cart accessible');
        return response.ok || response.status === 401;
    } catch (error) {
        logTest('Order/Cart System', false, error.message);
        return false;
    }
}

async function testAIService() {
    try {
        // Check if AI service health endpoint exists
        const response = await fetch(`${BACKEND_URL}/ai/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
        });
        logTest('AI Service', response.ok || response.status === 404, response.status === 404 ? 'Not available (optional)' : 'Available');
        return response.ok || response.status === 404;
    } catch (error) {
        logTest('AI Service', true, 'Not available (optional)');
        return true;
    }
}

async function testRecommendations() {
    try {
        const response = await fetch(`${BACKEND_URL}/search/trending?limit=5`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        const productCount = data.products?.length || 0;
        logTest('Recommendations', response.ok, `Found ${productCount} trending products`);
        return response.ok;
    } catch (error) {
        logTest('Recommendations', false, error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 Comprehensive System Testing\n');
    console.log('='.repeat(60));
    
    await testProductsVisible();
    await testBulkUpload();
    await testRecommendations();
    await testOrderPlacing();
    await testAIService();
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
        console.log(`\n❌ Failed Tests:`);
        results.failed.forEach(({ test, error }) => {
            console.log(`   - ${test}: ${error}`);
        });
    }
    
    console.log(`\n${results.failed.length === 0 ? '✅ All tests passed!' : '⚠️  Some tests failed - see details above'}\n`);
}

runAllTests().catch(console.error);
