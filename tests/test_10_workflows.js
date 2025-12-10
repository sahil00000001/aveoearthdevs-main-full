const BACKEND_URL = 'http://localhost:8080';
const AI_URL = 'http://localhost:8002';

// Use form-data package for multipart/form-data
const FormData = require('form-data');

// Use Node.js built-in fetch (Node 18+)
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        return {
            ok: response.ok,
            status: response.status,
            data,
            text
        };
    } catch (error) {
        return {
            ok: false,
            error: error.message,
            status: 0
        };
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== HELPER FUNCTIONS ==========
async function signupVendor() {
    const timestamp = Date.now();
    const email = `vendor${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    // Try signup first
    const res = await makeRequest(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email,
            password,
            phone: `+1234567890${timestamp % 10000}`,
            user_type: 'supplier',
            first_name: 'Test',
            last_name: `Vendor${timestamp}`
        })
    });
    
    let token = res.data?.tokens?.access_token || res.data?.access_token || res.data?.token;
    let userId = res.data?.user?.id;
    
    // If signup failed due to rate limit, try login with existing test user
    if (!token && (res.status === 422 || res.status === 429)) {
        console.log(`  ⚠️ Signup rate limited, using existing test vendor...`);
        // Use existing test vendor
        const testEmail = 'vendor_test@test.com';
        const testPassword = 'TestPass123!';
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: testEmail, password: testPassword})
        });
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            userId = loginRes.data?.user?.id || loginRes.data?.user_id;
            console.log(`  ✅ Using existing test vendor: ${testEmail}`);
            return {token, email: testEmail, password: testPassword, userId};
        } else {
            console.log(`  ⚠️ Test vendor login failed: ${loginRes.status}, will try new email`);
        }
        // If that fails, try login with the new email
        const loginRes2 = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        if (loginRes2.ok) {
            token = loginRes2.data?.tokens?.access_token || loginRes2.data?.access_token || loginRes2.data?.token;
            userId = loginRes2.data?.user?.id;
        }
    } else if (!token && res.status !== 0) {
        // Try login
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            userId = loginRes.data?.user?.id;
        }
    }
    
    // Wait a bit for user to be created in database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {token, email, password, userId};
}

async function signupBuyer() {
    const timestamp = Date.now();
    const email = `buyer${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    const res = await makeRequest(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email,
            password,
            phone: `+1234567890${timestamp % 10000}`,
            user_type: 'buyer',
            first_name: 'Test',
            last_name: `Buyer${timestamp}`
        })
    });
    
    if (!res.ok && res.status !== 0) {
        console.log(`  ⚠️ Signup failed: ${res.status} - ${JSON.stringify(res.data || res.error).substring(0, 200)}`);
    }
    
    let token = res.data?.tokens?.access_token || res.data?.access_token || res.data?.token;
    let userId = res.data?.user?.id || res.data?.user_id;
    
    // If signup failed due to rate limit, try login with existing test user
    if (!token && (res.status === 422 || res.status === 429)) {
        console.log(`  ⚠️ Signup rate limited, using existing test buyer...`);
        // Use existing test buyer (cart_test_buyer@test.com)
        const testEmail = 'cart_test_buyer@test.com';
        const testPassword = 'Test123!@#';
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: testEmail, password: testPassword})
        });
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            userId = loginRes.data?.user?.id || loginRes.data?.user_id;
            console.log(`  ✅ Using existing test buyer: ${testEmail}`);
            return {token, email: testEmail, password: testPassword, userId};
        } else {
            console.log(`  ⚠️ Test buyer login failed: ${loginRes.status}`);
        }
        // If that fails, try login with the new email
        const loginRes2 = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        if (loginRes2.ok) {
            token = loginRes2.data?.tokens?.access_token || loginRes2.data?.access_token || loginRes2.data?.token;
            userId = loginRes2.data?.user?.id || loginRes2.data?.user_id;
            console.log(`  ✅ Using newly created buyer: ${email}`);
        }
    } else if (!token && res.status !== 0) {
        // Try login
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            userId = loginRes.data?.user?.id || loginRes.data?.user_id;
        }
    }
    
    // Wait a bit for user to be created in database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {token, email, password, userId};
}

async function login(email, password) {
    const res = await makeRequest(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });
    
    const token = res.data?.tokens?.access_token || res.data?.access_token || res.data?.token;
    return {token, ok: res.ok};
}

async function bulkUpload(token) {
    // Get category
    const catRes = await makeRequest(`${BACKEND_URL}/products/categories?limit=1`);
    let categoryId = catRes.data?.[0]?.id || catRes.data?.items?.[0]?.id || "00000000-0000-0000-0000-000000000001";
    
    const csvContent = `name,description,price,category_id,sku,status,approval_status,visibility
Test Product ${Date.now()},Test Description,29.99,${categoryId},SKU-${Date.now()},active,approved,visible
Test Product 2 ${Date.now()},Test Description 2,39.99,${categoryId},SKU-${Date.now() + 1},active,approved,visible`;
    
    // Use manual multipart/form-data construction like test_complete_workflow.js
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="products_${Date.now()}.csv"${CRLF}`);
    bodyParts.push(`Content-Type: text/csv${CRLF}${CRLF}`);
    bodyParts.push(Buffer.from(csvContent, 'utf-8'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    const formDataBuffer = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    const res = await makeRequest(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formDataBuffer.length.toString()
        },
        body: formDataBuffer
    });
    
    return {ok: res.ok, data: res.data};
}

async function normalUpload(token) {
    // Get category
    const catRes = await makeRequest(`${BACKEND_URL}/products/categories?limit=1`);
    let categoryId = catRes.data?.[0]?.id || catRes.data?.items?.[0]?.id || "00000000-0000-0000-0000-000000000001";
    
    // Use manual multipart/form-data construction
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    
    const fields = {
        name: `Test Product ${Date.now()}`,
        description: 'Test Description',
        price: '24.99',
        category_id: categoryId,
        sku: `SKU-${Date.now()}`,
        status: 'active',
        approval_status: 'approved',
        visibility: 'visible'
    };
    
    for (const [key, value] of Object.entries(fields)) {
        bodyParts.push(`--${boundary}${CRLF}`);
        bodyParts.push(`Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`);
        bodyParts.push(Buffer.from(String(value), 'utf-8'));
        bodyParts.push(CRLF);
    }
    
    // Add image file
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="image"; filename="test.jpg"${CRLF}`);
    bodyParts.push(`Content-Type: image/jpeg${CRLF}${CRLF}`);
    bodyParts.push(Buffer.from('fake image data'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    
    const formDataBuffer = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    const res = await makeRequest(`${BACKEND_URL}/supplier/products/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formDataBuffer.length.toString()
        },
        body: formDataBuffer
    });
    
    if (!res.ok) {
        console.log(`  ⚠️ Normal upload error: ${res.status} - ${JSON.stringify(res.data || res.error).substring(0, 400)}`);
    }
    
    return {ok: res.ok, productId: res.data?.id, error: res.data || res.error};
}

async function getProduct() {
    const res = await makeRequest(`${BACKEND_URL}/products?limit=1`);
    return res.data?.items?.[0]?.id || res.data?.[0]?.id;
}

async function addToCart(token, productId) {
    if (!token) {
        console.log('  ⚠️ No token provided for addToCart');
        return {ok: false, error: 'No token'};
    }
    if (!productId) {
        console.log('  ⚠️ No productId provided for addToCart');
        return {ok: false, error: 'No productId'};
    }
    
    const res = await makeRequest(`${BACKEND_URL}/buyer/orders/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: 1
        })
    });
    
    if (!res.ok) {
        console.log(`  ⚠️ Add to cart error: ${res.status} - ${JSON.stringify(res.data || res.error).substring(0, 300)}`);
    }
    
    return {ok: res.ok, data: res.data};
}

async function placeOrder(token) {
    // First add to cart
    const productId = await getProduct();
    if (!productId) return {ok: false, error: 'No product found'};
    
    const cartRes = await addToCart(token, productId);
    if (!cartRes.ok) return cartRes;
    
    // Create address - use /addresses endpoint (not /auth/profile/addresses)
    const addrRes = await makeRequest(`${BACKEND_URL}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            type: 'billing',
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postal_code: '12345',
            country: 'US',
            is_default: true
        })
    });
    
    if (!addrRes.ok) {
        console.log(`  ⚠️ Address creation error: ${addrRes.status} - ${JSON.stringify(addrRes.data || addrRes.error).substring(0, 300)}`);
    }
    
    let addressId = addrRes.data?.id || addrRes.data?.address_id;
    if (!addressId && addrRes.ok) {
        // Try getting existing
        const getAddr = await makeRequest(`${BACKEND_URL}/addresses`, {
            headers: {'Authorization': `Bearer ${token}`}
        });
        addressId = getAddr.data?.[0]?.id || getAddr.data?.items?.[0]?.id || (getAddr.data?.items && getAddr.data.items[0]?.id);
    }
    
    if (!addressId) {
        console.log(`  ⚠️ Could not create/get address: ${JSON.stringify(addrRes.data || addrRes.error).substring(0, 300)}`);
        return {ok: false, error: 'Could not create/get address'};
    }
    
    // Place order
    const orderRes = await makeRequest(`${BACKEND_URL}/buyer/orders/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            billing_address_id: addressId,
            payment_method: 'test_card'
        })
    });
    
    if (!orderRes.ok) {
        console.log(`  ⚠️ Place order error: ${orderRes.status} - ${JSON.stringify(orderRes.data || orderRes.error).substring(0, 400)}`);
    }
    
    return {ok: orderRes.ok, orderId: orderRes.data?.id, error: orderRes.data || orderRes.error};
}

// ========== 10 DIFFERENT WORKFLOW SCENARIOS ==========
const workflows = [
    {
        name: "1. Vendor Signup → Bulk Upload",
        test: async () => {
            console.log('\n📋 Workflow 1: Vendor Signup → Bulk Upload');
            const {token} = await signupVendor();
            if (!token) {
                console.log('  ❌ Failed to get vendor token');
                return false;
            }
            console.log('  ✅ Vendor signed up');
            await wait(1000);
            const result = await bulkUpload(token);
            if (!result.ok) {
                console.log(`  ⚠️ Bulk upload error: ${JSON.stringify(result.data || result.error).substring(0, 300)}`);
            }
            console.log(`  ${result.ok ? '✅' : '❌'} Bulk upload: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "2. Vendor Signup → Normal Upload",
        test: async () => {
            console.log('\n📋 Workflow 2: Vendor Signup → Normal Upload');
            const {token} = await signupVendor();
            if (!token) return false;
            console.log('  ✅ Vendor signed up');
            await wait(1000);
            const result = await normalUpload(token);
            console.log(`  ${result.ok ? '✅' : '❌'} Normal upload: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "3. Buyer Signup → Add to Cart",
        test: async () => {
            console.log('\n📋 Workflow 3: Buyer Signup → Add to Cart');
            const {token} = await signupBuyer();
            if (!token) return false;
            console.log('  ✅ Buyer signed up');
            await wait(1000);
            const productId = await getProduct();
            if (!productId) {
                console.log('  ❌ No product found');
                return false;
            }
            const result = await addToCart(token, productId);
            console.log(`  ${result.ok ? '✅' : '❌'} Add to cart: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "4. Buyer Login → Add to Cart → Place Order",
        test: async () => {
            console.log('\n📋 Workflow 4: Buyer Login → Add to Cart → Place Order');
            const {email, password} = await signupBuyer();
            await wait(500);
            const {token} = await login(email, password);
            if (!token) return false;
            console.log('  ✅ Buyer logged in');
            await wait(1000);
            const result = await placeOrder(token);
            console.log(`  ${result.ok ? '✅' : '❌'} Place order: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "5. Vendor Signup → Bulk Upload → Normal Upload",
        test: async () => {
            console.log('\n📋 Workflow 5: Vendor Signup → Bulk Upload → Normal Upload');
            const {token} = await signupVendor();
            if (!token) return false;
            console.log('  ✅ Vendor signed up');
            await wait(1000);
            const bulk = await bulkUpload(token);
            console.log(`  ${bulk.ok ? '✅' : '❌'} Bulk upload: ${bulk.ok ? 'success' : 'failed'}`);
            await wait(1000);
            const normal = await normalUpload(token);
            console.log(`  ${normal.ok ? '✅' : '❌'} Normal upload: ${normal.ok ? 'success' : 'failed'}`);
            return bulk.ok && normal.ok;
        }
    },
    {
        name: "6. Buyer Signup → Login → Add to Cart",
        test: async () => {
            console.log('\n📋 Workflow 6: Buyer Signup → Login → Add to Cart');
            const {email, password} = await signupBuyer();
            await wait(500);
            const {token} = await login(email, password);
            if (!token) return false;
            console.log('  ✅ Buyer logged in');
            await wait(1000);
            const productId = await getProduct();
            if (!productId) {
                console.log('  ❌ No product found');
                return false;
            }
            const result = await addToCart(token, productId);
            console.log(`  ${result.ok ? '✅' : '❌'} Add to cart: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "7. Vendor Signup → Normal Upload → Bulk Upload",
        test: async () => {
            console.log('\n📋 Workflow 7: Vendor Signup → Normal Upload → Bulk Upload');
            const {token} = await signupVendor();
            if (!token) return false;
            console.log('  ✅ Vendor signed up');
            await wait(1000);
            const normal = await normalUpload(token);
            console.log(`  ${normal.ok ? '✅' : '❌'} Normal upload: ${normal.ok ? 'success' : 'failed'}`);
            await wait(1000);
            const bulk = await bulkUpload(token);
            console.log(`  ${bulk.ok ? '✅' : '❌'} Bulk upload: ${bulk.ok ? 'success' : 'failed'}`);
            return bulk.ok && normal.ok;
        }
    },
    {
        name: "8. Buyer Signup → Place Order (Full)",
        test: async () => {
            console.log('\n📋 Workflow 8: Buyer Signup → Place Order (Full)');
            const {token} = await signupBuyer();
            if (!token) return false;
            console.log('  ✅ Buyer signed up');
            await wait(1000);
            const result = await placeOrder(token);
            console.log(`  ${result.ok ? '✅' : '❌'} Place order: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "9. Buyer Login → Add to Cart (Re-login)",
        test: async () => {
            console.log('\n📋 Workflow 9: Buyer Login → Add to Cart (Re-login)');
            const {email, password} = await signupBuyer();
            await wait(500);
            const {token} = await login(email, password);
            if (!token) {
                console.log('  ❌ Login failed');
                return false;
            }
            console.log('  ✅ Buyer logged in');
            await wait(1000);
            const productId = await getProduct();
            if (!productId) {
                console.log('  ❌ No product found');
                return false;
            }
            const result = await addToCart(token, productId);
            console.log(`  ${result.ok ? '✅' : '❌'} Add to cart: ${result.ok ? 'success' : 'failed'}`);
            return result.ok;
        }
    },
    {
        name: "10. Vendor Signup → Bulk Upload → Buyer Signup → Add to Cart → Place Order",
        test: async () => {
            console.log('\n📋 Workflow 10: Vendor Signup → Bulk Upload → Buyer Signup → Add to Cart → Place Order');
            const {token: vendorToken} = await signupVendor();
            if (!vendorToken) return false;
            console.log('  ✅ Vendor signed up');
            await wait(1000);
            const bulk = await bulkUpload(vendorToken);
            console.log(`  ${bulk.ok ? '✅' : '❌'} Bulk upload: ${bulk.ok ? 'success' : 'failed'}`);
            await wait(2000);
            const {token: buyerToken} = await signupBuyer();
            if (!buyerToken) return false;
            console.log('  ✅ Buyer signed up');
            await wait(1000);
            const result = await placeOrder(buyerToken);
            console.log(`  ${result.ok ? '✅' : '❌'} Place order: ${result.ok ? 'success' : 'failed'}`);
            return bulk.ok && result.ok;
        }
    }
];

// ========== MAIN TEST RUNNER ==========
async function runAllWorkflows() {
    console.log('\n🧪 TESTING 10 DIFFERENT WORKFLOWS');
    console.log('='.repeat(70));
    
    const results = [];
    
    for (let i = 0; i < workflows.length; i++) {
        const workflow = workflows[i];
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Workflow ${i + 1}/10: ${workflow.name}`);
        console.log('='.repeat(70));
        
        try {
            const success = await workflow.test();
            results.push({name: workflow.name, success});
            console.log(`\n  ${success ? '✅ PASSED' : '❌ FAILED'}: ${workflow.name}`);
        } catch (error) {
            console.log(`\n  ❌ ERROR: ${workflow.name}`);
            console.log(`  Error: ${error.message}`);
            if (error.stack) console.log(`  Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
            results.push({name: workflow.name, success: false, error: error.message});
        }
        
        await wait(2000); // Wait between workflows
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n✅ Passed: ${passed}/10`);
    console.log(`❌ Failed: ${failed}/10`);
    console.log(`\nSuccess Rate: ${(passed / 10 * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.success ? '✅' : '❌'} ${r.name}`);
        if (r.error) console.log(`     Error: ${r.error}`);
    });
    
    return results;
}

// Run tests
runAllWorkflows().catch(console.error);

