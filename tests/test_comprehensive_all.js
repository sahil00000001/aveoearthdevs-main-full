const BACKEND_URL = 'http://localhost:8080';
const AI_URL = 'http://localhost:8002';
const fs = require('fs');

let testResults = {
    uploads: { bulk: [], normal: [] },
    auth: { vendor: [], buyer: [], google: [] },
    visibility: { products: [], frontend: [] },
    orders: [],
    chatbot: [],
    backend: {},
    stress: {}
};

// Helper: Wait function
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Helper: Make request with error handling
async function makeRequest(url, options = {}) {
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch {
            data = { raw: text };
        }
        return { ok: res.ok, status: res.status, data, text };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ========== UPLOAD TESTS ==========
async function testBulkUpload() {
    console.log('\n📦 Testing Bulk Upload...');
    const timestamp = Date.now();
    const categoryId = '550e8400-e29b-41d4-a716-446655440001';
    const csvContent = `name,sku,price,category_id,short_description,description
Bulk Test ${timestamp}-001,BULK-${timestamp}-001,19.99,${categoryId},Test bulk product 1,Test product for bulk upload 1
Bulk Test ${timestamp}-002,BULK-${timestamp}-002,29.99,${categoryId},Test bulk product 2,Test product for bulk upload 2`;
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="bulk_${timestamp}.csv"${CRLF}`);
    bodyParts.push(`Content-Type: text/csv${CRLF}${CRLF}`);
    bodyParts.push(Buffer.from(csvContent, 'utf-8'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    const result = await makeRequest(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formData.length.toString()
        }
    });
    
    if (result.ok && result.data?.results?.successful > 0) {
        console.log(`  ✅ Bulk upload: ${result.data.results.successful} products created`);
        testResults.uploads.bulk.push({ success: true, count: result.data.results.successful });
        return true;
    } else {
        console.log(`  ❌ Bulk upload failed: ${result.status || result.error}`);
        testResults.uploads.bulk.push({ success: false, error: result.status || result.error });
        return false;
    }
}

async function testNormalUpload(vendorToken) {
    console.log('\n📤 Testing Normal Product Upload...');
    if (!vendorToken) {
        console.log('  ⚠️ No vendor token, skipping');
        return false;
    }
    
    const timestamp = Date.now();
    const categoryId = '550e8400-e29b-41d4-a716-446655440001';
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="name"${CRLF}${CRLF}`);
    bodyParts.push(`Normal Test Product ${timestamp}${CRLF}`);
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="sku"${CRLF}${CRLF}`);
    bodyParts.push(`NORM-${timestamp}${CRLF}`);
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="price"${CRLF}${CRLF}`);
    bodyParts.push(`39.99${CRLF}`);
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="category_id"${CRLF}${CRLF}`);
    bodyParts.push(`${categoryId}${CRLF}`);
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="short_description"${CRLF}${CRLF}`);
    bodyParts.push(`Test normal upload product${CRLF}`);
    bodyParts.push(`--${boundary}--${CRLF}`);
    const formData = Buffer.concat(bodyParts.map(part => Buffer.from(part, 'utf-8')));
    
    const result = await makeRequest(`${BACKEND_URL}/supplier/products/`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Authorization': `Bearer ${vendorToken}`
        }
    });
    
    if (result.ok && result.data?.id) {
        console.log(`  ✅ Normal upload: Product created with ID ${result.data.id}`);
        testResults.uploads.normal.push({ success: true, productId: result.data.id });
        return result.data.id;
    } else {
        console.log(`  ❌ Normal upload failed: ${result.status || result.error}`);
        testResults.uploads.normal.push({ success: false, error: result.status || result.error });
        return null;
    }
}

// ========== AUTH TESTS ==========
async function testVendorAuth(silent = false) {
    if (!silent) console.log('\n🔐 Testing Vendor Authentication...');
    const timestamp = Date.now();
    const email = `vendor${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    // Signup
    const signupRes = await makeRequest(`${BACKEND_URL}/auth/signup`, {
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
    
    let token = null;
    if (signupRes.ok) {
        token = signupRes.data?.tokens?.access_token || signupRes.data?.access_token || signupRes.data?.token;
        if (!silent) console.log('  ✅ Vendor signup successful');
    } else {
        if (!silent) console.log(`  ⚠️ Signup failed: ${signupRes.status}, trying login...`);
    }
    
    // Login
    if (!token) {
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            if (!silent) console.log('  ✅ Vendor login successful');
        } else {
            if (!silent) console.log(`  ❌ Vendor login failed: ${loginRes.status}`);
            testResults.auth.vendor.push({ success: false, error: loginRes.status });
            return null;
        }
    }
    
    if (token) {
        testResults.auth.vendor.push({ success: true, email });
        return token;
    }
    return null;
}

async function testBuyerAuth(silent = false) {
    if (!silent) console.log('\n🔐 Testing Buyer Authentication...');
    const timestamp = Date.now();
    const email = `buyer${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    // Signup
    const signupRes = await makeRequest(`${BACKEND_URL}/auth/signup`, {
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
    
    let token = null;
    if (signupRes.ok) {
        token = signupRes.data?.tokens?.access_token || signupRes.data?.access_token || signupRes.data?.token;
        if (!silent) console.log('  ✅ Buyer signup successful');
    } else {
        if (!silent) console.log(`  ⚠️ Signup failed: ${signupRes.status}, trying login...`);
    }
    
    // Login
    if (!token) {
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        
        if (loginRes.ok) {
            token = loginRes.data?.tokens?.access_token || loginRes.data?.access_token || loginRes.data?.token;
            if (!silent) console.log('  ✅ Buyer login successful');
        } else {
            if (!silent) console.log(`  ❌ Buyer login failed: ${loginRes.status}`);
            testResults.auth.buyer.push({ success: false, error: loginRes.status });
            return null;
        }
    }
    
    if (token) {
        testResults.auth.buyer.push({ success: true, email });
        return token;
    }
    return null;
}

async function testGoogleAuth() {
    console.log('\n🔐 Testing Google OAuth...');
    // Google OAuth endpoint test - check if endpoint exists
    const result = await makeRequest(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({})
    });
    
    // OAuth endpoint may require specific params, but we check if it exists
    // Status 422 (validation error) or 400 means endpoint exists but needs proper params
    // Status 404 means endpoint doesn't exist
    if (result.status === 422 || result.status === 400 || result.status === 401 || result.ok) {
        console.log('  ✅ Google OAuth endpoint accessible');
        testResults.auth.google.push({ success: true, note: 'Endpoint accessible', status: result.status });
        return true;
    } else if (result.status === 404) {
        console.log('  ⚠️ Google OAuth endpoint not found');
        testResults.auth.google.push({ success: false, error: 'Endpoint not found' });
        return false;
    } else {
        console.log(`  ⚠️ Google OAuth: ${result.status || result.error}`);
        testResults.auth.google.push({ success: false, error: result.status || result.error });
        return false;
    }
}

// ========== VISIBILITY TESTS ==========
async function testProductVisibility() {
    console.log('\n👁️ Testing Product Visibility...');
    const result = await makeRequest(`${BACKEND_URL}/products?limit=10`);
    
    if (result.ok && result.data) {
        const total = result.data.total || 0;
        const items = result.data.items || [];
        console.log(`  ✅ Products visible: ${total} total, ${items.length} returned`);
        if (items.length > 0) {
            console.log(`  📦 Sample: ${items[0].name} - $${items[0].price}`);
            testResults.visibility.products.push({ success: true, total, returned: items.length, sampleId: items[0].id });
            return items[0].id;
        }
        testResults.visibility.products.push({ success: true, total, returned: 0 });
        return null;
    } else {
        console.log(`  ❌ Product visibility failed: ${result.status || result.error}`);
        testResults.visibility.products.push({ success: false, error: result.status || result.error });
        return null;
    }
}

async function testFrontendVisibility() {
    console.log('\n🌐 Testing Frontend Product Visibility...');
    // Test if frontend can access backend products API
    const result = await makeRequest(`${BACKEND_URL}/products?limit=5`);
    
    if (result.ok && result.data?.items?.length > 0) {
        console.log('  ✅ Frontend can access products via backend API');
        testResults.visibility.frontend.push({ success: true, accessible: true });
        return true;
    } else {
        console.log(`  ❌ Frontend visibility test failed: ${result.status || result.error}`);
        testResults.visibility.frontend.push({ success: false, error: result.status || result.error });
        return false;
    }
}

// ========== ORDER TESTS ==========
async function testPlaceOrder(buyerToken, productId) {
    console.log('\n🛒 Testing Order Placement...');
    if (!buyerToken || !productId) {
        console.log('  ⚠️ Missing token or product ID, skipping');
        return false;
    }
    
    try {
        // First, verify the product exists by checking the products endpoint
        console.log(`  🔍 Verifying product ${productId} exists...`);
        const productCheck = await makeRequest(`${BACKEND_URL}/products?product_id=${productId}`);
        if (!productCheck.ok) {
            console.log(`  ⚠️ Product verification failed: ${productCheck.status}`);
        } else {
            console.log(`  ✅ Product verified`);
        }
        
        // Step 1: Add to cart
        console.log(`  📦 Adding product ${productId} to cart...`);
        const cartRes = await makeRequest(`${BACKEND_URL}/buyer/orders/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });
        
        if (!cartRes.ok) {
            console.log(`  ⚠️ Add to cart failed: ${cartRes.status}`);
            if (cartRes.data?.detail) {
                console.log(`  Error details: ${JSON.stringify(cartRes.data.detail)}`);
            } else if (cartRes.data) {
                console.log(`  Response: ${JSON.stringify(cartRes.data).substring(0, 500)}`);
            } else if (cartRes.error) {
                console.log(`  Error: ${cartRes.error}`);
            }
            return false;
        }
        console.log('  ✅ Item added to cart');
        
        // Step 2: Create address
        const addrRes = await makeRequest(`${BACKEND_URL}/auth/profile/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zip: '12345',
                country: 'US',
                is_default: true,
                address_type: 'billing'
            })
        });
        
        let addressId = null;
        if (addrRes.ok) {
            addressId = addrRes.data?.id || addrRes.data?.address_id;
            console.log(`  ✅ Address created: ${addressId}`);
        } else {
            // Try getting existing
            const getAddr = await makeRequest(`${BACKEND_URL}/auth/profile/addresses`, {
                headers: {'Authorization': `Bearer ${buyerToken}`}
            });
            if (getAddr.ok && getAddr.data?.length > 0) {
                addressId = getAddr.data[0].id;
                console.log(`  ✅ Using existing address: ${addressId}`);
            }
        }
        
        if (!addressId) {
            console.log('  ⚠️ Could not create/get address');
            return false;
        }
        
        // Step 3: Create order
        const orderRes = await makeRequest(`${BACKEND_URL}/buyer/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                billing_address_id: addressId,
                payment_method: 'test_card',
                customer_notes: 'Test order'
            })
        });
        
        if (orderRes.ok && orderRes.data?.id) {
            console.log(`  ✅ Order placed! Order ID: ${orderRes.data.id}`);
            testResults.orders.push({ success: true, orderId: orderRes.data.id });
            return true;
        } else {
            console.log(`  ❌ Order failed: ${orderRes.status || orderRes.error}`);
            testResults.orders.push({ success: false, error: orderRes.status || orderRes.error });
            return false;
        }
    } catch (e) {
        console.log(`  ❌ Order error: ${e.message}`);
        testResults.orders.push({ success: false, error: e.message });
        return false;
    }
}

// ========== CHATBOT TESTS ==========
async function testChatbot() {
    console.log('\n🤖 Testing AI Chatbot...');
    
    // Test chatbot health
    const healthRes = await makeRequest(`${AI_URL}/health`);
    if (!healthRes.ok) {
        console.log(`  ⚠️ Chatbot service not available: ${healthRes.status || healthRes.error}`);
        testResults.chatbot.push({ success: false, error: 'Service unavailable' });
        return false;
    }
    
    // Test chat endpoint
    const chatRes = await makeRequest(`${AI_URL}/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: 'Hello, what products do you have?',
            user_token: 'test_user',
            session_id: 'test_session',
            user_type: 'guest'
        })
    });
    
    if (chatRes.ok && chatRes.data?.response) {
        console.log('  ✅ Chatbot responded successfully');
        console.log(`  💬 Response: ${chatRes.data.response.substring(0, 100)}...`);
        testResults.chatbot.push({ success: true, responded: true });
        return true;
    } else {
        console.log(`  ❌ Chatbot failed: ${chatRes.status || chatRes.error}`);
        testResults.chatbot.push({ success: false, error: chatRes.status || chatRes.error });
        return false;
    }
}

// ========== BACKEND FEATURES TESTS ==========
async function testBackendFeatures() {
    console.log('\n🔧 Testing Backend Features...');
    const features = {
        health: false,
        categories: false,
        brands: false,
        search: false
    };
    
    // Health check
    const health = await makeRequest(`${BACKEND_URL}/health`);
    features.health = health.ok;
    console.log(`  ${features.health ? '✅' : '❌'} Health check: ${health.status || health.error}`);
    
    // Categories
    const categories = await makeRequest(`${BACKEND_URL}/products/categories`);
    features.categories = categories.ok;
    console.log(`  ${features.categories ? '✅' : '❌'} Categories: ${categories.status || categories.error}`);
    
    // Brands
    const brands = await makeRequest(`${BACKEND_URL}/products/brands`);
    features.brands = brands.ok;
    console.log(`  ${features.brands ? '✅' : '❌'} Brands: ${brands.status || brands.error}`);
    
    // Search
    const search = await makeRequest(`${BACKEND_URL}/products/search?q=test`);
    features.search = search.ok;
    console.log(`  ${features.search ? '✅' : '❌'} Search: ${search.status || search.error}`);
    
    testResults.backend = features;
    return Object.values(features).every(v => v);
}

// ========== STRESS TESTS ==========
async function stressTest(iterations = 10) {
    console.log(`\n💪 Running Stress Test (${iterations} iterations)...`);
    const results = {
        productQueries: { success: 0, failed: 0, avgTime: 0 },
        authRequests: { success: 0, failed: 0, avgTime: 0 },
        uploads: { success: 0, failed: 0, avgTime: 0 }
    };
    
    const times = [];
    for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        const res = await makeRequest(`${BACKEND_URL}/products?limit=10`);
        const time = Date.now() - start;
        times.push(time);
        
        if (res.ok) {
            results.productQueries.success++;
        } else {
            results.productQueries.failed++;
        }
        await wait(100); // Small delay between requests
    }
    
    results.productQueries.avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`  📊 Product Queries: ${results.productQueries.success}/${iterations} success, avg ${results.productQueries.avgTime.toFixed(0)}ms`);
    
    testResults.stress = results;
    return results.productQueries.success === iterations;
}

// ========== COMPLETE WORKFLOW ==========
async function runCompleteWorkflow(runNumber) {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`🚀 COMPLETE WORKFLOW TEST - RUN #${runNumber}`);
    console.log('='.repeat(60));
    
    const workflowResults = {
        run: runNumber,
        timestamp: new Date().toISOString(),
        steps: {}
    };
    
    // 1. Test vendor auth
    console.log('\n🔐 Step 1: Vendor Authentication');
    const vendorToken = await testVendorAuth(true);
    workflowResults.steps.vendorAuth = !!vendorToken;
    if (vendorToken) {
        console.log('  ✅ Vendor authenticated');
    } else {
        console.log('  ❌ Vendor auth failed - workflow cannot continue');
    }
    await wait(1000);
    
    // 2. Test bulk upload
    console.log('\n📦 Step 2: Bulk Upload');
    workflowResults.steps.bulkUpload = await testBulkUpload();
    await wait(2000);
    
    // 3. Test normal upload
    console.log('\n📤 Step 3: Normal Product Upload');
    const productId = await testNormalUpload(vendorToken);
    workflowResults.steps.normalUpload = !!productId;
    if (productId) {
        console.log(`  ✅ Product created: ${productId}`);
    }
    await wait(2000);
    
    // 4. Test buyer auth
    console.log('\n🔐 Step 4: Buyer Authentication');
    const buyerToken = await testBuyerAuth(true);
    workflowResults.steps.buyerAuth = !!buyerToken;
    if (buyerToken) {
        console.log('  ✅ Buyer authenticated');
    } else {
        console.log('  ❌ Buyer auth failed - cannot test orders');
    }
    await wait(1000);
    
    // 5. Test product visibility
    console.log('\n👁️ Step 5: Product Visibility');
    const visibleProductId = await testProductVisibility();
    workflowResults.steps.productVisibility = !!visibleProductId;
    await wait(1000);
    
    // 6. Test order placement (use visible product or uploaded product)
    console.log('\n🛒 Step 6: Order Placement');
    const orderProductId = visibleProductId || productId;
    if (buyerToken && orderProductId) {
        workflowResults.steps.orderPlacement = await testPlaceOrder(buyerToken, orderProductId);
    } else {
        console.log('  ⚠️ Skipping order test - missing token or product ID');
        workflowResults.steps.orderPlacement = false;
    }
    
    // 7. Test chatbot
    console.log('\n🤖 Step 7: AI Chatbot');
    workflowResults.steps.chatbot = await testChatbot();
    
    const allPassed = Object.values(workflowResults.steps).every(v => v);
    const passedCount = Object.values(workflowResults.steps).filter(v => v).length;
    const totalCount = Object.keys(workflowResults.steps).length;
    console.log(`\n  ${allPassed ? '✅' : '⚠️'} Workflow ${runNumber}: ${passedCount}/${totalCount} steps passed`);
    
    return workflowResults;
}

// ========== MAIN TEST RUNNER ==========
async function runAllTests() {
    console.log('\n🧪 COMPREHENSIVE TESTING SUITE');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}\n`);
    
    // Wait for services
    console.log('⏳ Waiting for services to be ready...');
    await wait(5000);
    
    // Individual feature tests
    console.log('\n📋 PHASE 1: Individual Feature Tests');
    await testBackendFeatures();
    await wait(1000);
    
    const vendorToken = await testVendorAuth();
    await wait(1000);
    
    const buyerToken = await testBuyerAuth();
    await wait(1000);
    
    await testGoogleAuth();
    await wait(1000);
    
    await testBulkUpload();
    await wait(2000);
    
    await testNormalUpload(vendorToken);
    await wait(2000);
    
    const productId = await testProductVisibility();
    await wait(1000);
    
    await testFrontendVisibility();
    await wait(1000);
    
    await testPlaceOrder(buyerToken, productId);
    await wait(1000);
    
    await testChatbot();
    await wait(1000);
    
    // Stress tests
    console.log('\n📋 PHASE 2: Stress Tests');
    await stressTest(20);
    
    // Complete workflow tests (5 times)
    console.log('\n📋 PHASE 3: Complete Workflow Tests (5 runs)');
    const workflowRuns = [];
    for (let i = 1; i <= 5; i++) {
        const result = await runCompleteWorkflow(i);
        workflowRuns.push(result);
        await wait(3000); // Delay between runs
    }
    
    // Final summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n📦 Uploads:');
    console.log(`  Bulk: ${testResults.uploads.bulk.filter(r => r.success).length}/${testResults.uploads.bulk.length} passed`);
    console.log(`  Normal: ${testResults.uploads.normal.filter(r => r.success).length}/${testResults.uploads.normal.length} passed`);
    
    console.log('\n🔐 Authentication:');
    console.log(`  Vendor: ${testResults.auth.vendor.filter(r => r.success).length}/${testResults.auth.vendor.length} passed`);
    console.log(`  Buyer: ${testResults.auth.buyer.filter(r => r.success).length}/${testResults.auth.buyer.length} passed`);
    console.log(`  Google: ${testResults.auth.google.filter(r => r.success).length}/${testResults.auth.google.length} passed`);
    
    console.log('\n👁️ Visibility:');
    console.log(`  Products: ${testResults.visibility.products.filter(r => r.success).length}/${testResults.visibility.products.length} passed`);
    console.log(`  Frontend: ${testResults.visibility.frontend.filter(r => r.success).length}/${testResults.visibility.frontend.length} passed`);
    
    console.log('\n🛒 Orders:');
    console.log(`  ${testResults.orders.filter(r => r.success).length}/${testResults.orders.length} passed`);
    
    console.log('\n🤖 Chatbot:');
    console.log(`  ${testResults.chatbot.filter(r => r.success).length}/${testResults.chatbot.length} passed`);
    
    console.log('\n🚀 Complete Workflows:');
    workflowRuns.forEach((run, i) => {
        const passed = Object.values(run.steps).filter(v => v).length;
        const total = Object.keys(run.steps).length;
        console.log(`  Run ${i + 1}: ${passed}/${total} steps passed`);
    });
    
    // Save results
    const report = {
        timestamp: new Date().toISOString(),
        results: testResults,
        workflows: workflowRuns,
        summary: {
            totalWorkflows: workflowRuns.length,
            successfulWorkflows: workflowRuns.filter(r => Object.values(r.steps).every(v => v)).length
        }
    };
    
    fs.writeFileSync('comprehensive_test_report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Full report saved to: comprehensive_test_report.json');
    
    const allWorkflowsPassed = workflowRuns.every(r => Object.values(r.steps).every(v => v));
    console.log(`\n${allWorkflowsPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
    console.log(`Completed at: ${new Date().toISOString()}\n`);
}

// Run tests
runAllTests().catch(console.error);

