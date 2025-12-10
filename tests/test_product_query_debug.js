const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testProductQuery() {
    console.log('🔍 Testing Product Query Debug\n');
    
    // Test 1: Direct Supabase query
    if (SUPABASE_URL && SUPABASE_KEY) {
        console.log('1️⃣ Testing Direct Supabase Query...');
        try {
            // Query without filters first
            const url1 = `${SUPABASE_URL}/rest/v1/products?select=id,name,status,approval_status,visibility&limit=5`;
            console.log(`   URL: ${url1}`);
            
            const res1 = await fetch(url1, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data1 = await res1.json();
            console.log(`   Status: ${res1.status}`);
            console.log(`   Products (no filters): ${Array.isArray(data1) ? data1.length : 'not array'}`);
            if (Array.isArray(data1) && data1.length > 0) {
                console.log(`   Sample product:`, JSON.stringify(data1[0], null, 2));
            }
            
            // Query with status filter
            const url2 = `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=id,name,status&limit=5`;
            console.log(`\n   URL with status filter: ${url2}`);
            const res2 = await fetch(url2, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data2 = await res2.json();
            console.log(`   Status: ${res2.status}`);
            console.log(`   Products (status=active): ${Array.isArray(data2) ? data2.length : 'not array'}`);
            
            // Query with all filters
            const url3 = `${SUPABASE_URL}/rest/v1/products?status=eq.active&approval_status=eq.approved&visibility=eq.visible&select=id,name,status,approval_status,visibility&limit=5`;
            console.log(`\n   URL with all filters: ${url3}`);
            const res3 = await fetch(url3, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                }
            });
            const data3 = await res3.json();
            console.log(`   Status: ${res3.status}`);
            console.log(`   Content-Range: ${res3.headers.get('content-range') || 'N/A'}`);
            console.log(`   Products (all filters): ${Array.isArray(data3) ? data3.length : 'not array'}`);
            if (!Array.isArray(data3)) {
                console.log(`   Response:`, JSON.stringify(data3, null, 2).slice(0, 500));
            }
            
        } catch (error) {
            console.error('   ❌ Direct Supabase query error:', error.message);
        }
    } else {
        console.log('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    }
    
    // Test 2: Backend endpoint
    console.log('\n2️⃣ Testing Backend Endpoint...');
    try {
        const res = await fetch(`${BACKEND_URL}/products?limit=5`);
        const data = await res.json();
        console.log(`   Status: ${res.status}`);
        console.log(`   Total: ${data.total || 0}`);
        console.log(`   Items: ${data.items?.length || 0}`);
        if (data.items && data.items.length > 0) {
            console.log(`   Sample:`, JSON.stringify(data.items[0], null, 2));
        }
    } catch (error) {
        console.error('   ❌ Backend query error:', error.message);
    }
}

testProductQuery().catch(console.error);

