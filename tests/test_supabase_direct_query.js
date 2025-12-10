// Test direct Supabase query to see products
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testDirectQuery() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment');
        return;
    }
    
    console.log('🔍 Testing Direct Supabase Queries\n');
    
    // Query 1: All products (no filters)
    try {
        const url1 = `${SUPABASE_URL}/rest/v1/products?select=id,name,status,approval_status,visibility&limit=10`;
        console.log('1️⃣ Query ALL products (no filters):');
        console.log(`   URL: ${url1}\n`);
        
        const res1 = await fetch(url1, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data1 = await res1.json();
        console.log(`   Status: ${res1.status}`);
        console.log(`   Products found: ${Array.isArray(data1) ? data1.length : 'not array'}`);
        
        if (Array.isArray(data1) && data1.length > 0) {
            console.log('\n   Sample products:');
            data1.slice(0, 5).forEach((p, i) => {
                console.log(`   ${i+1}. ${p.name}`);
                console.log(`      status: "${p.status}", approval: "${p.approval_status}", visibility: "${p.visibility}"`);
            });
        } else if (!Array.isArray(data1)) {
            console.log('   Response:', JSON.stringify(data1, null, 2).slice(0, 500));
        }
        
        // Query 2: With status filter
        if (Array.isArray(data1) && data1.length > 0) {
            console.log('\n2️⃣ Query with status=eq.active filter:');
            const url2 = `${SUPABASE_URL}/rest/v1/products?select=id,name,status&status=eq.active&limit=5`;
            const res2 = await fetch(url2, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data2 = await res2.json();
            console.log(`   Status: ${res2.status}, Found: ${Array.isArray(data2) ? data2.length : 'not array'}`);
            
            // Query 3: All three filters
            console.log('\n3️⃣ Query with all filters (status=active, approval=approved, visibility=visible):');
            const url3 = `${SUPABASE_URL}/rest/v1/products?select=id,name,status,approval_status,visibility&status=eq.active&approval_status=eq.approved&visibility=eq.visible&limit=5`;
            const res3 = await fetch(url3, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data3 = await res3.json();
            console.log(`   Status: ${res3.status}, Found: ${Array.isArray(data3) ? data3.length : 'not array'}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDirectQuery().catch(console.error);

