const BACKEND_URL = 'http://localhost:8080';
const fs = require('fs');

// Test helpers
async function testBulkUpload() {
    console.log('\n📦 TEST 1: Bulk Upload\n');
    const timestamp = Date.now();
    const categoryId = '550e8400-e29b-41d4-a716-446655440001';
    const csvContent = `name,sku,price,category_id,short_description,description
Bulk Test Product ${timestamp},BULK-${timestamp}-001,29.99,${categoryId},Test bulk product,Test product for bulk upload`;
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="bulk_${timestamp}.csv"${CRLF}`);
    bodyParts.push(`Content-Type: text/csv${CRLF}${CRLF}`);
    bodyParts.push(Buffer.from(csvContent, 'utf-8'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    try {
        const res = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log(`✅ Bulk upload: ${data.results?.successful || 0} products`);
            return true;
        } else {
            console.log(`❌ Bulk upload failed: ${res.status}`);
            return false;
        }
    } catch (e) {
        console.log(`❌ Bulk upload error: ${e.message}`);
        return false;
    }
}

async function testNormalUpload() {
    console.log('\n📤 TEST 2: Normal Product Upload\n');
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
    bodyParts.push(`NORM-${timestamp}-001${CRLF}`);
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
    
    try {
        const res = await fetch(`${BACKEND_URL}/supplier/products/`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log(`✅ Normal upload: Product created with ID ${data.id || 'unknown'}`);
            return true;
        } else {
            const text = await res.text();
            console.log(`❌ Normal upload failed: ${res.status} - ${text.substring(0, 200)}`);
            return false;
        }
    } catch (e) {
        console.log(`❌ Normal upload error: ${e.message}`);
        return false;
    }
}

async function testVendorAuth() {
    console.log('\n🔐 TEST 3: Vendor Authentication\n');
    const timestamp = Date.now();
    const email = `vendor${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    try {
        // Signup
        const signupRes = await fetch(`${BACKEND_URL}/auth/signup`, {
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
            const data = await signupRes.json();
            token = data.access_token || data.token;
            console.log('✅ Vendor signup successful');
        } else {
            const text = await signupRes.text();
            console.log(`⚠️ Signup failed: ${signupRes.status} - ${text.substring(0, 200)}`);
        }
        
        // Login
        if (!token) {
            const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            
            if (loginRes.ok) {
                const data = await loginRes.json();
                token = data.access_token || data.token;
                console.log('✅ Vendor login successful');
            } else {
                console.log(`❌ Vendor login failed: ${loginRes.status}`);
                return null;
            }
        }
        
        return token;
    } catch (e) {
        console.log(`❌ Vendor auth error: ${e.message}`);
        return null;
    }
}

async function testUserAuth() {
    console.log('\n🔐 TEST 4: User/Buyer Authentication\n');
    const timestamp = Date.now();
    const email = `buyer${timestamp}@test.com`;
    const password = 'TestPass123!';
    
    try {
        // Signup
        const signupRes = await fetch(`${BACKEND_URL}/auth/signup`, {
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
            const data = await signupRes.json();
            token = data.access_token || data.token;
            console.log('✅ Buyer signup successful');
        } else {
            const text = await signupRes.text();
            console.log(`⚠️ Signup failed: ${signupRes.status} - ${text.substring(0, 200)}`);
        }
        
        // Login
        if (!token) {
            const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            
            if (loginRes.ok) {
                const data = await loginRes.json();
                token = data.access_token || data.token;
                console.log('✅ Buyer login successful');
                return token;
            } else {
                console.log(`❌ Buyer login failed: ${loginRes.status}`);
                return null;
            }
        }
        
        return token;
    } catch (e) {
        console.log(`❌ Buyer auth error: ${e.message}`);
        return null;
    }
}

async function testProductVisibility() {
    console.log('\n👁️ TEST 5: Product Visibility\n');
    try {
        const res = await fetch(`${BACKEND_URL}/products?limit=10`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Total products: ${data.total || 0}`);
            console.log(`Items returned: ${data.items?.length || 0}`);
            if (data.items && data.items.length > 0) {
                console.log('✅ Products visible!');
                data.items.slice(0, 3).forEach((p, i) => {
                    console.log(`  ${i+1}. ${p.name} - $${p.price}`);
                });
                return data.items[0]?.id || null;
            } else {
                console.log('⚠️ No products found');
                return null;
            }
        } else {
            console.log(`❌ Query failed: ${res.status}`);
            return null;
        }
    } catch (e) {
        console.log(`❌ Visibility error: ${e.message}`);
        return null;
    }
}

async function testPlaceOrder(buyerToken, productId) {
    console.log('\n🛒 TEST 6: Place Order\n');
    if (!buyerToken || !productId) {
        console.log('⚠️ Skipping order test - missing token or product ID');
        return false;
    }
    
    try {
        // Step 1: Add item to cart
        const cartRes = await fetch(`${BACKEND_URL}/buyer/orders/cart/items`, {
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
            const text = await cartRes.text();
            console.log(`⚠️ Add to cart failed: ${cartRes.status} - ${text.substring(0, 200)}`);
            return false;
        }
        console.log('✅ Item added to cart');
        
        // Step 2: Create billing address (order needs billing_address_id)
        const addressRes = await fetch(`${BACKEND_URL}/auth/profile/addresses`, {
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
        
        let billingAddressId = null;
        if (addressRes.ok) {
            const addrData = await addressRes.json();
            billingAddressId = addrData.id || addrData.address_id;
            console.log(`✅ Address created: ${billingAddressId}`);
        } else {
            // Try to get existing address
            const getAddrRes = await fetch(`${BACKEND_URL}/auth/profile/addresses`, {
                headers: {'Authorization': `Bearer ${buyerToken}`}
            });
            if (getAddrRes.ok) {
                const addrs = await getAddrRes.json();
                if (addrs.length > 0) {
                    billingAddressId = addrs[0].id;
                    console.log(`✅ Using existing address: ${billingAddressId}`);
                }
            }
        }
        
        if (!billingAddressId) {
            console.log('⚠️ Could not create or find address');
            return false;
        }
        
        // Step 3: Create order from cart
        const orderRes = await fetch(`${BACKEND_URL}/buyer/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                billing_address_id: billingAddressId,
                payment_method: 'test_card',
                customer_notes: 'Test order from workflow test'
            })
        });
        
        if (orderRes.ok) {
            const data = await orderRes.json();
            console.log(`✅ Order placed! Order ID: ${data.id || data.order_id || 'unknown'}`);
            return true;
        } else {
            const text = await orderRes.text();
            console.log(`❌ Order failed: ${orderRes.status} - ${text.substring(0, 300)}`);
            return false;
        }
    } catch (e) {
        console.log(`❌ Order error: ${e.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 COMPLETE WORKFLOW TESTING\n');
    console.log('='.repeat(50));
    
    const results = {
        bulkUpload: false,
        normalUpload: false,
        vendorAuth: false,
        userAuth: false,
        productVisibility: false,
        placeOrder: false
    };
    
    // Wait for backend
    await new Promise(r => setTimeout(r, 3000));
    
    // Test bulk upload
    results.bulkUpload = await testBulkUpload();
    await new Promise(r => setTimeout(r, 2000));
    
    // Test normal upload
    results.normalUpload = await testNormalUpload();
    await new Promise(r => setTimeout(r, 2000));
    
    // Test vendor auth
    const vendorToken = await testVendorAuth();
    results.vendorAuth = vendorToken ? true : false;
    await new Promise(r => setTimeout(r, 1000));
    
    // Test user auth
    const buyerToken = await testUserAuth();
    results.userAuth = buyerToken ? true : false;
    await new Promise(r => setTimeout(r, 2000));
    
    // Test product visibility
    const productId = await testProductVisibility();
    results.productVisibility = productId ? true : false;
    await new Promise(r => setTimeout(r, 1000));
    
    // Test placing order
    results.placeOrder = await testPlaceOrder(buyerToken, productId);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY\n');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(r => r);
    console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
}

runAllTests().catch(console.error);

