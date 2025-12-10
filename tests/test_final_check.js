const BACKEND_URL = 'http://localhost:8080';

async function finalCheck() {
    console.log('🔍 Final System Check\n');
    
    // Test 1: Bulk upload
    console.log('1️⃣ Testing bulk upload...');
    const timestamp = Date.now();
    const categoryId = '550e8400-e29b-41d4-a716-446655440001';
    const csvContent = `name,sku,price,category_id,short_description,description
Final Test Product ${timestamp},FT-${timestamp}-001,29.99,${categoryId},Test product,Final test product`;
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="test_${timestamp}.csv"${CRLF}`);
    bodyParts.push(`Content-Type: text/csv${CRLF}${CRLF}`);
    bodyParts.push(Buffer.from(csvContent, 'utf-8'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    try {
        const uploadRes = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            }
        });
        
        if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            console.log(`   ✅ Uploaded: ${uploadData.results?.successful || 0} products`);
            
            // Wait and query
            await new Promise(r => setTimeout(r, 3000));
            
            console.log('\n2️⃣ Querying products...');
            const queryRes = await fetch(`${BACKEND_URL}/products?limit=10`);
            if (queryRes.ok) {
                const queryData = await queryRes.json();
                console.log(`   Total: ${queryData.total || 0}`);
                console.log(`   Items: ${queryData.items?.length || 0}`);
                if (queryData.items && queryData.items.length > 0) {
                    console.log(`   ✅ SUCCESS! Products visible!`);
                    queryData.items.slice(0, 3).forEach((p, i) => {
                        console.log(`      ${i+1}. ${p.name} (${p.status}, ${p.approval_status}, ${p.visibility})`);
                    });
                } else {
                    console.log(`   ⚠️ No products found - check backend logs`);
                }
            }
        } else {
            console.log(`   ❌ Upload failed: ${uploadRes.status}`);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

finalCheck().catch(console.error);

