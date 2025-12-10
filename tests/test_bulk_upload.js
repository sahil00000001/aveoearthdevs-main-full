const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const fs = require('fs');
const path = require('path');

// Check if form-data is available, if not, use alternative approach
let FormData;
try {
    FormData = require('form-data');
} catch (e) {
    console.log('⚠️ form-data package not found, using alternative approach');
}

// First, we need to signup/login as a vendor to get auth token
async function signupAsVendor() {
    try {
        console.log('📝 Signing up as vendor...');
        const email = `vendor_${Date.now()}@test.com`;
        const response = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: 'password123',
                first_name: 'Test',
                last_name: 'Vendor',
                phone: '+15551234567',
                user_type: 'supplier'
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 422 && data.detail && (data.detail.includes('sign in') || data.detail.includes('partially'))) {
                console.log('⚠️ Signup partially succeeded, trying to login...');
                // Try to login instead
                const token = await loginAsVendor(email);
                return { token, email, password: 'password123' };
            }
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        
        console.log('✅ Vendor signed up successfully');
        // Try multiple token locations
        const token = data.tokens?.access_token || data.session?.access_token || data.access_token || data.user?.access_token;
        if (!token) {
            console.log('⚠️ No token in response, waiting 3 seconds for account to be ready then trying to login...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                const loginToken = await loginAsVendor(email);
                return { token: loginToken, email, password: 'password123' };
            } catch (loginErr) {
                console.log('⚠️ Login failed, but continuing anyway - user may have been created');
                // Return empty token - the upload might still work if auth is bypassed in dev
                throw new Error(`Signup succeeded but login failed: ${loginErr.message}. User may need to login manually.`);
            }
        }
        return { token, email, password: 'password123' };
    } catch (error) {
        console.error('❌ Signup failed:', error.message);
        throw error;
    }
}

async function loginAsVendor(email, password = 'password123') {
    try {
        console.log('🔐 Logging in as vendor...');
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            signal: AbortSignal.timeout(10000),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        
        console.log('✅ Vendor logged in successfully');
        const token = data.tokens?.access_token || data.session?.access_token || data.access_token;
        return token;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
    }
}

async function bulkUploadProducts(token, csvPath) {
    try {
        console.log('📤 Uploading products via bulk CSV...');
        
        // Read CSV file
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        
        console.log(`🔑 Token: ${token ? token.substring(0, 20) + '...' : 'NO TOKEN'}`);
        
        if (!token) {
            throw new Error('No authentication token provided');
        }
        
        // Always use manual multipart construction for Node.js fetch compatibility
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
        const fileContent = fs.readFileSync(csvPath);
        const fileName = path.basename(csvPath);
        
        // Build multipart body correctly for FastAPI
        const CRLF = '\r\n';
        let bodyParts = [];
        
        // Boundary line
        bodyParts.push(`--${boundary}${CRLF}`);
        // Content-Disposition header
        bodyParts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}`);
        // Content-Type header
        bodyParts.push(`Content-Type: text/csv${CRLF}`);
        // Empty line before content
        bodyParts.push(CRLF);
        // File content
        bodyParts.push(fileContent);
        // Boundary end line
        bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
        
        const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formData.length.toString()
        };
        
        console.log(`📡 Request URL: ${BACKEND_URL}/supplier/products/bulk-import-csv`);
        console.log(`📦 File size: ${formData.length} bytes`);
        
        const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            headers: headers,
            body: formData,
            signal: AbortSignal.timeout(30000),
        });
        
        console.log(`📥 Response status: ${response.status}`);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            console.error(`❌ Failed to parse JSON response: ${text}`);
            throw new Error(`Failed to parse response: ${text}`);
        }
        
        if (!response.ok) {
            console.error(`❌ Response error:`, JSON.stringify(data, null, 2));
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        
        console.log('✅ Bulk upload successful!');
        console.log('📊 Results:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('❌ Bulk upload failed:', error.message);
        throw error;
    }
}

async function verifyProducts() {
    try {
        console.log('🔍 Verifying products are available...');
        const response = await fetch(`${BACKEND_URL}/products?limit=10`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        
        const products = data.items || data.data || [];
        console.log(`✅ Found ${products.length} products in backend`);
        if (products.length > 0) {
            console.log('📦 Products:');
            products.forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.name || p.title} - $${p.price || 'N/A'}`);
            });
        }
        return products;
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        throw error;
    }
}

// Main execution
(async () => {
    console.log('🧪 Testing Bulk Product Upload\n');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Signup/Login as vendor
        const { token, email } = await signupAsVendor();
        
        if (!token) {
            console.error('❌ No auth token received');
            process.exit(1);
        }
        
        // Step 2: Bulk upload products
        const csvPath = path.join(__dirname, 'test_products_5.csv');
        if (!fs.existsSync(csvPath)) {
            console.error(`❌ CSV file not found: ${csvPath}`);
            process.exit(1);
        }
        
        await bulkUploadProducts(token, csvPath);
        
        // Step 3: Wait a bit for processing
        console.log('⏳ Waiting 3 seconds for products to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 4: Verify products are available
        await verifyProducts();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Bulk upload test completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
})();

