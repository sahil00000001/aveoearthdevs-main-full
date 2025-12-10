// Test if service role key can insert products directly
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ylhvdwizcsoelpreftpy.supabase.co';
// Get service role key from backend .env (you'll need to add it manually for this test)
const SUPABASE_SERVICE_ROLE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Please provide SUPABASE_SERVICE_ROLE_KEY as argument or env variable');
    console.log('Usage: node test_service_role_key.js YOUR_SERVICE_ROLE_KEY');
    process.exit(1);
}

async function testServiceRoleKey() {
    console.log('🧪 Testing Service Role Key with Supabase REST API...\n');
    console.log(`URL: ${SUPABASE_URL}/rest/v1/products`);
    console.log(`Key length: ${SUPABASE_SERVICE_ROLE_KEY.length}`);
    console.log(`Key starts with: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

    const testProduct = {
        id: crypto.randomUUID(),
        name: "Test Product Service Role",
        sku: "TEST-SR-001",
        slug: "test-product-service-role",
        price: 9.99,
        short_description: "Testing service role key",
        description: "This is a test product to verify service role key works",
        supplier_id: "00000000-0000-0000-0000-000000000001",
        status: "active",
        approval_status: "approved",
        visibility: "visible",
        tags: ["test"]
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testProduct),
            signal: AbortSignal.timeout(10000),
        });

        console.log(`Response Status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Response Body: ${responseText}\n`);

        if (response.ok) {
            console.log('✅ Service role key works! Product inserted successfully.');
            const data = JSON.parse(responseText);
            console.log(`Created product ID: ${data[0]?.id || data.id}`);
        } else {
            console.log('❌ Service role key failed!');
            if (response.status === 403) {
                console.log('\n⚠️ 403 Forbidden - RLS is blocking even service role key.');
                console.log('This means either:');
                console.log('  1. The service role key is incorrect');
                console.log('  2. The key is the anon key, not service role key');
                console.log('  3. RLS policies are blocking service_role (should not happen)');
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testServiceRoleKey();



