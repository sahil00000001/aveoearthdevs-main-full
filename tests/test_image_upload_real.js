// Test image upload with real images from internet
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Image URLs from the internet
const testImages = [
    'https://images.unsplash.com/photo-1523059623039-a9ed027e7f77?w=500',
    'https://images.unsplash.com/photo-1590736969955-71e192930a5c?w=500',
    'https://images.unsplash.com/photo-1582153634519-cf60ea79aa93?w=500'
];

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadImage(response.headers.location, filename)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            const file = fs.createWriteStream(filename);
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(filename);
            });
            
            file.on('error', reject);
        }).on('error', reject);
    });
}

async function uploadProductWithImage(imagePath, index) {
    console.log(`\n📤 Uploading product ${index + 1} with image: ${path.basename(imagePath)}`);
    
    try {
        const formData = new FormData();
        formData.append('name', `Eco Bamboo Bottle ${index + 1}`);
        formData.append('category_id', '1'); // Assuming category exists
        formData.append('sku', `BB-${Date.now()}-${index}`);
        formData.append('price', '29.99');
        formData.append('description', 'Sustainable bamboo water bottle with stainless steel interior');
        formData.append('short_description', 'Eco-friendly bamboo bottle');
        formData.append('track_quantity', 'true');
        formData.append('continue_selling', 'false');
        formData.append('visibility', 'visible');
        formData.append('images', fs.createReadStream(imagePath));
        
        const response = await fetch('http://localhost:8080/supplier/products/', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
                // Note: In production, you would include auth token here
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`   ✅ Product ${index + 1} uploaded successfully`);
            console.log(`   📦 Product ID: ${data.id}`);
            return { success: true, data };
        } else {
            console.log(`   ❌ Product ${index + 1} upload failed: ${response.status}`);
            console.log(`   📝 Error: ${JSON.stringify(data)}`);
            return { success: false, error: data };
        }
    } catch (error) {
        console.log(`   ❌ Upload error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testImageUpload() {
    console.log('🚀 Testing Image Upload with Real Images from Internet');
    console.log('====================================================\n');
    
    // Download images
    console.log('📥 Downloading images from internet...');
    const imagePaths = [];
    
    for (let i = 0; i < testImages.length; i++) {
        try {
            const filename = `test_image_${i + 1}.jpg`;
            console.log(`   Downloading image ${i + 1}...`);
            const path = await downloadImage(testImages[i], filename);
            imagePaths.push(path);
            console.log(`   ✅ Downloaded: ${filename}`);
        } catch (error) {
            console.log(`   ❌ Failed to download image ${i + 1}: ${error.message}`);
        }
    }
    
    if (imagePaths.length === 0) {
        console.log('\n❌ No images downloaded. Cannot test upload.');
        return;
    }
    
    console.log(`\n✅ Successfully downloaded ${imagePaths.length} images`);
    
    // Test upload
    console.log('\n📤 Testing product upload with images...');
    const results = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
        const result = await uploadProductWithImage(imagePaths[i], i);
        results.push(result);
        
        // Wait a bit between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test image compression
    console.log('\n🖼️ Testing image compression system...');
    try {
        const compressionTest = await fetch('http://localhost:8080/optimized-upload/vendor/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'test': 'compression'
            })
        });
        
        console.log(`   Compression API status: ${compressionTest.status}`);
    } catch (error) {
        console.log(`   ❌ Compression API test failed: ${error.message}`);
    }
    
    // Test product verification
    console.log('\n🔍 Testing product verification service...');
    try {
        const verificationTest = await fetch('http://localhost:8001/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'test': 'verification'
            })
        });
        
        console.log(`   Verification service status: ${verificationTest.status}`);
    } catch (error) {
        console.log(`   ⚠️ Product verification service: ${error.message}`);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up downloaded images...');
    for (const imagePath of imagePaths) {
        try {
            fs.unlinkSync(imagePath);
            console.log(`   🗑️ Deleted: ${path.basename(imagePath)}`);
        } catch (error) {
            console.log(`   ⚠️ Could not delete ${path.basename(imagePath)}: ${error.message}`);
        }
    }
    
    // Summary
    console.log('\n====================================================');
    console.log('🎯 Image Upload Test Results');
    console.log('====================================================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful uploads: ${successful}`);
    console.log(`❌ Failed uploads: ${failed}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check backend logs for image compression metrics');
    console.log('2. Verify products in database');
    console.log('3. Check Supabase storage for uploaded images');
    console.log('4. Test product verification API');
    console.log('5. Verify images appear on frontend');
}

testImageUpload().catch(console.error);
