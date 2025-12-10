// Test querying products directly to see what exists
const BACKEND_URL = 'http://localhost:8080';

async function testQuery() {
    console.log('🔍 Testing Product Queries\n');
    
    // Test 1: Query all products (no filters) - if we can check backend logs
    console.log('1️⃣ Querying products with filters (status=active, approval=approved, visibility=visible)');
    try {
        const res = await fetch(`${BACKEND_URL}/products?limit=10`);
        const data = await res.json();
        console.log(`   Status: ${res.status}`);
        console.log(`   Total: ${data.total || 0}`);
        console.log(`   Items: ${data.items?.length || 0}`);
        if (data.items && data.items.length > 0) {
            console.log(`   Sample: ${data.items[0].name} - status:${data.items[0].status}, approval:${data.items[0].approval_status}, visibility:${data.items[0].visibility}`);
        }
    } catch (e) {
        console.error('   Error:', e.message);
    }
    
    console.log('\n✅ Check backend logs for Supabase query details');
    console.log('   Look for lines starting with "🔍 Querying Supabase REST API"');
    console.log('   And "📥 Supabase response" to see what products exist');
}

testQuery().catch(console.error);

