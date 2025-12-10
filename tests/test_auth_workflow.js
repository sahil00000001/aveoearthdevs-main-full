const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function testAuthWorkflow() {
    console.log('🧪 Testing Authentication Workflow');
    console.log('============================================================\n');
    
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
        // Test 1: Signup
        console.log('1️⃣ Testing Signup...');
        const signupResponse = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                first_name: 'Test',
                last_name: 'User',
                user_type: 'buyer',
                phone: '+1234567890'
            })
        });
        
        const signupText = await signupResponse.text();
        console.log(`   Status: ${signupResponse.status}`);
        
        if (signupResponse.ok) {
            try {
                const signupData = JSON.parse(signupText);
                console.log('✅ Signup successful');
                console.log(`   User ID: ${signupData.id || signupData.user?.id || 'N/A'}`);
                console.log(`   Email: ${signupData.email || signupData.user?.email || testEmail}`);
            } catch (e) {
                console.log('⚠️ Signup response not JSON:', signupText.slice(0, 200));
            }
        } else {
            console.log('❌ Signup failed');
            console.log('   Error:', signupText.slice(0, 300));
            return { success: false, step: 'signup' };
        }
        
        // Wait for user to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 2: Login
        console.log('\n2️⃣ Testing Login...');
        const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        
        const loginText = await loginResponse.text();
        console.log(`   Status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
            try {
                const loginData = JSON.parse(loginText);
                const token = loginData.access_token || loginData.token;
                console.log('✅ Login successful');
                console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'N/A'}`);
                return { success: true, token };
            } catch (e) {
                console.log('⚠️ Login response not JSON:', loginText.slice(0, 200));
                return { success: false, step: 'login-parse' };
            }
        } else {
            console.log('❌ Login failed');
            console.log('   Error:', loginText.slice(0, 300));
            return { success: false, step: 'login' };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testAuthWorkflow()
    .then(result => {
        if (result.success) {
            console.log('\n✅ Authentication workflow test PASSED');
            process.exit(0);
        } else {
            console.log(`\n❌ Authentication workflow test FAILED at step: ${result.step || 'unknown'}`);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Test error:', error);
        process.exit(1);
    });


