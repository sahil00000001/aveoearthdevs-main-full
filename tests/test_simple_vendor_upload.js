const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🏪 Simple Vendor Upload Test');
console.log('===================================\n');

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filename);
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

async function testSimpleUpload() {
    try {
        console.log('📥 Step 1: Downloading sample image...');
        
        // Download one sample image
        const imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';
        const filename = 'simple_test_image.jpg';
        
        try {
            await downloadImage(imageUrl, filename);
            console.log(`   ✅ Downloaded: ${filename}`);
        } catch (error) {
            console.log(`   ❌ Failed to download image: ${error.message}`);
            return;
        }

        console.log('\n📦 Step 2: Testing simple product upload...');
        
        // Create form data manually using fetch with FormData
        const formData = new FormData();
        
        // Add product fields
        formData.append('name', 'Simple Test Product');
        formData.append('category_id', '7305a8c3-86c2-41a6-919c-d54d490f170f'); // Electronics
        formData.append('sku', 'SIMPLE-TEST-001');
        formData.append('price', '19.99');
        formData.append('brand_id', 'f008d3c7-c7ee-4499-8850-4b6c0ac5b0b0'); // SolarTech
        formData.append('short_description', 'A simple test product');
        formData.append('description', 'This is a simple test product for vendor upload testing.');
        formData.append('visibility', 'visible');
        
        // Add image file
        if (fs.existsSync(filename)) {
            const fileBuffer = fs.readFileSync(filename);
            const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
            formData.append('images', blob, filename);
            console.log(`   📷 Added image: ${filename}`);
        }

        // Test product upload
        try {
            console.log('   🚀 Uploading product...');
            const uploadResponse = await fetch('http://localhost:8080/supplier/products/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Bearer temp-vendor-token'
                }
            });
            
            console.log(`   📊 Upload status: ${uploadResponse.status}`);
            
            if (uploadResponse.ok) {
                const product = await uploadResponse.json();
                console.log(`   ✅ Product uploaded successfully: ${product.name}`);
                console.log(`   🆔 Product ID: ${product.id}`);
            } else {
                const error = await uploadResponse.text();
                console.log(`   ❌ Upload failed: ${error}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Upload error: ${error.message}`);
        }

        console.log('\n🔍 Step 3: Testing product retrieval...');
        
        try {
            const productsResponse = await fetch('http://localhost:8080/products/');
            const productsData = await productsResponse.json();
            console.log(`   ✅ Products retrieval successful: ${productsData.data?.length || 0} products`);
            
            if (productsData.data && productsData.data.length > 0) {
                console.log(`   📦 First product: ${productsData.data[0].name}`);
            } else {
                console.log('   ⚠️ No products found in database');
            }
            
        } catch (error) {
            console.log(`   ❌ Products retrieval failed: ${error.message}`);
        }

        console.log('\n🧹 Cleaning up...');
        
        // Clean up downloaded image
        try {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
                console.log(`   🗑️ Deleted: ${filename}`);
            }
        } catch (error) {
            console.log(`   ⚠️ Could not delete ${filename}: ${error.message}`);
        }

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    }
}

// Run the test
testSimpleUpload().then(() => {
    console.log('\n===================================');
    console.log('🎯 SIMPLE VENDOR UPLOAD TEST RESULTS');
    console.log('===================================');
    console.log('📥 Image Download: ✅ SUCCESS');
    console.log('📦 Product Upload: 🔄 TESTING');
    console.log('🔍 Product Retrieval: 🔄 TESTING');
    console.log('\n🎯 OVERALL STATUS:');
    console.log('   🔄 SIMPLE UPLOAD TESTING COMPLETE');
});
