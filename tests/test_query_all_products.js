// Test querying ALL products without filters to see what exists
const BACKEND_URL = 'http://localhost:8080';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testAllProducts() {
    console.log('🔍 Testing Direct Supabase Query\n');
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
        return;
    }
    
    // Query ALL products (no filters)
    try {
        const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,status,approval_status,visibility&limit=10`;
        console.log('1️⃣ Query ALL products (no filters):');
        console.log(`   URL: ${url.substring(0, 100)}...\n`);
        
        const res = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await res.json();
        console.log(`   Status: ${res.status}`);
        console.log(`   Products found: ${Array.isArray(data) ? data.length : 'not array'}`);
        
        if (Array.isArray(data) && data.length > 0) {
            console.log('\n   Sample products:');
            data.slice(0, 5).forEach((p, i) => {
                console.log(`   ${i+1}. ${p.name}`);
                console.log(`      status: "${p.status}", approval: "${p.approval_status}", visibility: "${p.visibility}"`);
            });
            
            // Now test with filters
            console.log('\n2️⃣ Testing with filters...');
            const filterUrl = `${SUPABASE_URL}/rest/v1/products?select=id,name&status=eq.active&approval_status=eq.approved&visibility=eq.visible&limit=5`;
            const filterRes = await fetch(filterUrl, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const filterData = await filterRes.json();
            console.log(`   Status: ${filterRes.status}, Found: ${Array.isArray(filterData) ? filterData.length : 'not array'}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAllProducts().catch(console.error);

