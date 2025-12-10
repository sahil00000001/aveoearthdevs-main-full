// Using native fetch (Node 18+)

async function testGoogleOAuth() {
    console.log('🔐 Testing Google OAuth Configuration');
    console.log('=====================================\n');
    
    const SUPABASE_URL = 'https://ylhvdwizcsoelpreftpy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g';
    
    try {
        // Test 1: Check Supabase auth providers
        console.log('1. Checking Supabase Auth Providers...');
        const providersResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (providersResponse.ok) {
            const data = await providersResponse.json();
            console.log('   ✅ Supabase auth endpoint accessible');
            
            if (data.external && data.external.google && data.external.google.enabled) {
                console.log('   ✅ Google OAuth is configured and enabled');
                console.log('   📋 Client ID:', data.external.google.client_id ? '✓ Configured' : '✗ Missing');
                console.log('   📋 Client Secret:', data.external.google.client_secret ? '✓ Configured' : '✗ Missing');
                console.log('   📋 Redirect URL:', data.external.google.redirect_urls || 'Not specified');
            } else {
                console.log('   ⚠️ Google OAuth is not enabled');
            }
        } else {
            console.log('   ❌ Failed to access Supabase auth settings:', providersResponse.status);
        }
        
        // Test 2: Check authorization endpoint
        console.log('\n2. Checking Google OAuth authorization endpoint...');
        const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('http://localhost:5176/auth/callback')}`;
        console.log('   📝 Auth URL:', authUrl);
        
        const authResponse = await fetch(authUrl, {
            method: 'GET',
            redirect: 'manual'
        });
        
        if (authResponse.status === 302 || authResponse.status === 307 || authResponse.status === 301) {
            console.log('   ✅ Google OAuth redirect is working');
            console.log('   🎯 Redirecting to:', authResponse.headers.get('location') || 'Google OAuth');
        } else {
            console.log('   ⚠️ Unexpected response status:', authResponse.status);
        }
        
        // Test 3: Check frontend configuration
        console.log('\n3. Checking Frontend OAuth Configuration...');
        const frontendResponse = await fetch('http://localhost:5176');
        
        if (frontendResponse.ok) {
            console.log('   ✅ Frontend is accessible');
            
            // Check if Supabase client is configured
            const configResponse = await fetch('http://localhost:5176', {
                headers: {
                    'Accept': 'text/html'
                }
            });
            
            const html = await configResponse.text();
            if (html.includes('VITE_SUPABASE_URL') || html.includes('supabase')) {
                console.log('   ✅ Supabase client appears to be configured');
            } else {
                console.log('   ⚠️ Cannot verify Supabase client configuration from HTML');
            }
        } else {
            console.log('   ❌ Frontend not accessible');
        }
        
        console.log('\n=====================================');
        console.log('✅ Google OAuth Configuration Test Complete');
        console.log('\n📋 Next Steps:');
        console.log('1. Visit: http://localhost:5176/auth-test');
        console.log('2. Click "Test Google Sign In" button');
        console.log('3. Complete OAuth flow in browser');
        console.log('4. Check for successful authentication');
        
    } catch (error) {
        console.error('❌ Error testing Google OAuth:', error.message);
    }
}

testGoogleOAuth();
