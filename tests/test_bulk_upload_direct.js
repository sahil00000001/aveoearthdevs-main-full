const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const fs = require('fs');
const path = require('path');

// Test bulk upload directly with a mock auth token (DEBUG mode should accept it)
async function testBulkUploadDirect() {
    console.log('🧪 Testing Bulk Upload (Direct - using DEBUG mode auth)');
    console.log('============================================================\n');
    
    try {
        // First, get an existing category_id from products
        console.log('🔍 Fetching existing category_id from products...');
        let categoryId = null;
        
        try {
            // Try to get from products endpoint
            const productsResponse = await fetch(`${BACKEND_URL}/products?limit=1`, {
                signal: AbortSignal.timeout(10000),
            });
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                const products = productsData.items || productsData.data || productsData || [];
                if (products.length > 0 && products[0].category_id) {
                    categoryId = products[0].category_id;
                    console.log(`✅ Using category_id from existing product: ${categoryId}`);
                }
            }
        } catch (e) {
            console.log('⚠️  Could not fetch from /products, trying /search/trending...');
        }
        
        if (!categoryId) {
            try {
                // Try to get from search endpoint
                const searchResponse = await fetch(`${BACKEND_URL}/search/trending?limit=1`, {
                    signal: AbortSignal.timeout(10000),
                });
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    const products = searchData.items || searchData.data || [];
                    if (products.length > 0 && products[0].category_id) {
                        categoryId = products[0].category_id;
                        console.log(`✅ Using category_id from trending products: ${categoryId}`);
                    }
                }
            } catch (e) {
                console.log('⚠️  Could not fetch from /search/trending');
            }
        }
        
        if (!categoryId) {
            // Use a default category ID from seed_database.sql
            categoryId = '550e8400-e29b-41d4-a716-446655440001'; // Home & Living
            console.log(`⚠️  No existing category_id found, using default from seed: ${categoryId}`);
        }
        
        const csvPath = path.join(__dirname, 'test_products_5.csv');
        if (!fs.existsSync(csvPath)) {
            console.log('❌ CSV file not found:', csvPath);
            return;
        }
        
        let csvContent = fs.readFileSync(csvPath, 'utf-8');
        
        // Update CSV with category_id if we found one
        if (categoryId) {
            const lines = csvContent.split('\n');
            const header = lines[0];
            // Update data rows (skip header, update all data rows)
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const fields = lines[i].split(',');
                    // category_id is typically the 6th field (index 5) based on: name,sku,price,short_description,description,category_id,...
                    if (fields.length > 5 && (!fields[5] || fields[5].trim() === '')) {
                        fields[5] = categoryId;
                        lines[i] = fields.join(',');
                    }
                }
            }
            csvContent = lines.join('\n');
            console.log(`📝 Updated CSV with category_id=${categoryId}\n`);
        }
        console.log('📤 Uploading products via bulk CSV...');
        
        // Create FormData manually for Node.js
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        let formData = '';
        formData += `--${boundary}\r\n`;
        formData += `Content-Disposition: form-data; name="file"; filename="test_products_5.csv"\r\n`;
        formData += `Content-Type: text/csv\r\n\r\n`;
        formData += csvContent;
        formData += `\r\n--${boundary}--\r\n`;
        
        // Use DEBUG mode - backend should accept any token
        const token = 'DEBUG-MODE-TOKEN';
        
        const response = await fetch(`${BACKEND_URL}/supplier/products/bulk-import-csv`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
            },
            body: formData,
            signal: AbortSignal.timeout(180000),  // 3 minutes
        });
        
        console.log(`📥 Response status: ${response.status}`);
        const data = await response.json();
        console.log('✅ Bulk upload response:', JSON.stringify(data, null, 2));
        
        if (data.results && data.results.successful > 0) {
            console.log(`\n🎉 SUCCESS! ${data.results.successful} products created!`);
            console.log('Product IDs:', data.results.created_product_ids);
        } else {
            console.log(`\n⚠️ No products created. Errors:`);
            if (data.results && data.results.errors) {
                data.results.errors.forEach(err => {
                    console.log(`  Row ${err.row}: ${err.product_name} - ${err.error}`);
                });
            }
        }
        
        // Wait and check if products are visible
        console.log('\n⏳ Waiting 3 seconds for products to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 Verifying products are available...');
        const productsResponse = await fetch(`${BACKEND_URL}/products?limit=10`, {
            signal: AbortSignal.timeout(10000),
        });
        
        const productsData = await productsResponse.json();
        const productCount = productsData.items?.length || productsData.data?.length || 0;
        console.log(`✅ Found ${productCount} products in backend`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testBulkUploadDirect();

