const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const fs = require('fs');
const FormData = require('form-data');

async function testBulkUploadFresh() {
    console.log('🧪 Testing Fresh Bulk Upload\n');
    
    const timestamp = Date.now();
    const categoryId = '550e8400-e29b-41d4-a716-446655440001'; // Default category
    
    // Create CSV with unique SKUs
    const csvContent = `name,sku,price,category_id,short_description,description
Eco-Friendly Water Bottle ${timestamp},WB-${timestamp}-001,24.99,${categoryId},Sustainable stainless steel water bottle,High-quality reusable water bottle
Organic Cotton T-Shirt ${timestamp},TS-${timestamp}-002,19.99,${categoryId},100% organic cotton t-shirt,Comfortable and sustainable cotton t-shirt
Solar-Powered Charger ${timestamp},CH-${timestamp}-003,45.99,${categoryId},Portable solar charger,Charge your devices with renewable solar energy`;
    
    console.log('📤 Uploading products via bulk CSV...');
    
    // Manual multipart construction (works with FastAPI)
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2).toUpperCase();
    const CRLF = '\r\n';
    let bodyParts = [];
    
    bodyParts.push(`--${boundary}${CRLF}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="test_products_${timestamp}.csv"${CRLF}`);
    bodyParts.push(`Content-Type: text/csv${CRLF}`);
    bodyParts.push(CRLF);
    bodyParts.push(Buffer.from(csvContent, 'utf-8'));
    bodyParts.push(`${CRLF}--${boundary}--${CRLF}`);
    
    const formData = Buffer.concat(bodyParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf-8')));
    
    try {
        const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            }
        });
        
        const responseText = await response.text();
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Bulk upload successful!');
                console.log(`   Successful: ${data.results?.successful || 0}`);
                console.log(`   Failed: ${data.results?.failed || 0}`);
                
                // Wait and check products
                console.log('\n⏳ Waiting 3 seconds...');
                await new Promise(r => setTimeout(r, 3000));
                
                console.log('🔍 Checking if products are visible...');
                const productsResponse = await fetch(`${BACKEND_URL}/products?limit=10`);
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    console.log(`✅ Found ${productsData.total || 0} products`);
                    console.log(`   Items returned: ${productsData.items?.length || 0}`);
                    if (productsData.items && productsData.items.length > 0) {
                        console.log(`   Sample: ${productsData.items[0].name}`);
                    }
                } else {
                    console.log(`❌ Query failed: ${productsResponse.status}`);
                }
            } catch (e) {
                console.log('Response (not JSON):', responseText.slice(0, 300));
            }
        } else {
            console.log('❌ Upload failed');
            console.log('Error:', responseText.slice(0, 500));
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testBulkUploadFresh().catch(console.error);

