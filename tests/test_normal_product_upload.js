const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const fs = require('fs');
const FormData = require('form-data');

async function testNormalProductUpload() {
    console.log('🧪 Testing Normal Single Product Upload');
    console.log('============================================================\n');
    
    try {
        // Get category_id
        let categoryId = '550e8400-e29b-41d4-a716-446655440001'; // Default from seed
        
        // Create a test product
        const form = new FormData();
        const timestamp = Date.now();
        const testProduct = {
            name: `Test Product ${timestamp}`,
            sku: `TEST-${timestamp}`,
            price: 29.99,
            category_id: categoryId,
            short_description: 'Test product description',
            description: 'Full test product description for normal upload test',
            visibility: 'visible'
        };
        
        form.append('name', testProduct.name);
        form.append('sku', testProduct.sku);
        form.append('price', testProduct.price.toString());
        form.append('category_id', testProduct.category_id);
        form.append('short_description', testProduct.short_description);
        form.append('description', testProduct.description);
        form.append('visibility', testProduct.visibility);
        
        // Create a minimal test image (1x1 PNG)
        const testImage = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );
        form.append('images', testImage, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        console.log('📤 Uploading product:', testProduct.name);
        
        const response = await fetch(`${BACKEND_URL}/supplier/products/`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        const responseText = await response.text();
        console.log(`📥 Response status: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Product created successfully!');
                console.log(`   Product ID: ${data.id || data.product_id}`);
                console.log(`   Name: ${data.name}`);
                console.log(`   SKU: ${data.sku}`);
                console.log(`   Price: $${data.price}`);
                return { success: true, productId: data.id || data.product_id };
            } catch (e) {
                console.log('⚠️ Response is not JSON:', responseText.slice(0, 200));
                return { success: false, error: 'Invalid JSON response' };
            }
        } else {
            console.log('❌ Upload failed');
            console.log('   Error:', responseText.slice(0, 300));
            return { success: false, error: responseText };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testNormalProductUpload()
    .then(result => {
        if (result.success) {
            console.log('\n✅ Normal product upload test PASSED');
            process.exit(0);
        } else {
            console.log('\n❌ Normal product upload test FAILED');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Test error:', error);
        process.exit(1);
    });


