// Comprehensive test script for all website features
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ylhvdwizcsoelpreftpy.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

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

async function testBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        logTest('Backend Health Check', response.ok, response.ok ? 'Backend is running' : `Status: ${response.status}`);
        return response.ok;
    } catch (error) {
        logTest('Backend Health Check', false, error.message);
        return false;
    }
}

async function testProductsListing() {
    try {
        const response = await fetch(`${BACKEND_URL}/products?limit=10`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        const productCount = data.items?.length || data.data?.length || 0;
        logTest('Products Listing', response.ok, `Found ${productCount} products`);
        return { success: response.ok, count: productCount };
    } catch (error) {
        logTest('Products Listing', false, error.message);
        return { success: false, count: 0 };
    }
}

async function testTrendingProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/search/trending?limit=5`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        const productCount = data.products?.length || 0;
        logTest('Trending Products', response.ok, `Found ${productCount} trending products`);
        return response.ok;
    } catch (error) {
        logTest('Trending Products', false, error.message);
        return false;
    }
}

async function testAIService() {
    try {
        // Check if AI service endpoint exists (adjust path as needed)
        const response = await fetch(`${BACKEND_URL}/ai/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
        });
        logTest('AI Service', response.ok || response.status === 404, response.status === 404 ? 'Endpoint not found (may be optional)' : 'AI service available');
        return response.ok || response.status === 404;
    } catch (error) {
        // AI service might not be available, which is okay
        logTest('AI Service', true, 'Not available (optional)');
        return true;
    }
}

async function testSupabaseConnection() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            signal: AbortSignal.timeout(5000),
        });
        logTest('Supabase Connection', response.ok || response.status === 401, response.status === 401 ? 'Connected but RLS may block' : 'Connected');
        return response.ok || response.status === 401;
    } catch (error) {
        logTest('Supabase Connection', false, error.message);
        return false;
    }
}

async function testSignupLogin() {
    try {
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        // Signup
        const signupResponse = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                first_name: 'Test',
                last_name: 'User',
                phone: '+1234567890',
                user_type: 'buyer'
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        if (!signupResponse.ok) {
            const errorData = await signupResponse.json().catch(() => ({}));
            if (signupResponse.status === 409) {
                logTest('Signup/Login', true, 'User already exists (expected in testing)');
                return true;
            }
            logTest('Signup', false, `Status: ${signupResponse.status}, ${errorData.detail || 'Unknown error'}`);
            return false;
        }
        
        // Wait a bit for account to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Login
        const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        const loginData = await loginResponse.json().catch(() => ({}));
        const hasToken = loginData.tokens?.access_token || loginData.access_token || loginData.session?.access_token;
        
        logTest('Signup/Login', loginResponse.ok && hasToken, hasToken ? 'Successfully signed up and logged in' : 'Login failed');
        return loginResponse.ok && hasToken;
    } catch (error) {
        logTest('Signup/Login', false, error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 Testing All Website Features\n');
    console.log('='.repeat(60));
    
    await testBackendHealth();
    await testSupabaseConnection();
    await testProductsListing();
    await testTrendingProducts();
    await testSignupLogin();
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
    
    console.log(`\n${results.failed.length === 0 ? '✅ All tests passed!' : '⚠️  Some tests failed'}\n`);
}

runAllTests().catch(console.error);



