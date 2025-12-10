// Test querying products without filters to see what exists
const BACKEND_URL = 'http://localhost:8080';

async function testQueryNoFilters() {
    console.log('Testing product query without status filters...\n');
    
    // Try to query all products first (via a different endpoint if available)
    // Or modify the query to remove filters temporarily
    
    // For now, let's check if we can access the Supabase directly
    // But since we don't have env vars here, let's check backend logs
    console.log('Note: Check backend logs for Supabase query details');
    
    // Test the backend endpoint
    try {
        const res = await fetch(`${BACKEND_URL}/products?limit=10`);
        const data = await res.json();
        console.log(`Backend returned: total=${data.total || 0}, items=${data.items?.length || 0}`);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

setTimeout(() => testQueryNoFilters(), 8000);

