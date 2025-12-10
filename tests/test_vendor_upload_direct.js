/**
 * Vendor Product Upload Test - Bypass Authentication
 * Tests vendor product upload functionality directly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080'
};

// Sample product data for testing
const SAMPLE_PRODUCTS = [
  {
    name: 'Eco Bamboo Water Bottle',
    description: 'Sustainable bamboo water bottle with leak-proof design. Perfect for daily use and eco-conscious consumers.',
    price: '24.99',
    category: 'Kitchen & Dining',
    brand: 'EcoLife',
    stock_quantity: '50',
    sustainability_score: '9.2',
    weight: '0.3 kg',
    dimensions: '20x8x8 cm',
    material: 'Bamboo',
    color: 'Natural',
    size: '500ml',
    sku: 'BAMBOO-BOTTLE-001',
    tags: 'bamboo,sustainable,water bottle,eco-friendly'
  },
  {
    name: 'Organic Cotton Tote Bag',
    description: 'Reusable organic cotton tote bag for shopping. Durable and environmentally friendly.',
    price: '12.99',
    category: 'Fashion & Accessories',
    brand: 'GreenStyle',
    stock_quantity: '100',
    sustainability_score: '9.5',
    weight: '0.2 kg',
    dimensions: '40x35x10 cm',
    material: 'Organic Cotton',
    color: 'Natural',
    size: 'Large',
    sku: 'COTTON-TOTE-002',
    tags: 'cotton,organic,tote bag,reusable'
  }
];

// Sample image URLs
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'
];

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
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

async function testVendorProductUpload() {
  console.log('🏪 Vendor Product Upload Test');
  console.log('============================');
  
  const results = {
    imageDownload: false,
    productUpload: false,
    productCreation: false,
    productRetrieval: false,
    frontendVisibility: false
  };
  
  // Step 1: Download sample images
  console.log('\n📥 Step 1: Downloading sample images...');
  const imageFiles = [];
  
  for (let i = 0; i < SAMPLE_IMAGES.length; i++) {
    const imageUrl = SAMPLE_IMAGES[i];
    const filename = `vendor_test_image_${i + 1}.jpg`;
    
    try {
      console.log(`   📷 Downloading image ${i + 1}...`);
      await downloadImage(imageUrl, filename);
      imageFiles.push(filename);
      console.log(`   ✅ Downloaded: ${filename}`);
    } catch (error) {
      console.log(`   ❌ Failed to download image ${i + 1}: ${error.message}`);
    }
  }
  
  results.imageDownload = imageFiles.length > 0;
  console.log(`\n📊 Downloaded ${imageFiles.length} images successfully`);
  
  // Step 2: Test product upload with form data
  console.log('\n📦 Step 2: Testing product upload...');
  
  if (imageFiles.length > 0) {
    const product = SAMPLE_PRODUCTS[0];
    const imageFile = imageFiles[0];
    
    try {
      const formData = new FormData();
      
      // Add all product fields
      Object.keys(product).forEach(key => {
        formData.append(key, product[key]);
      });
      
      // Add image file
      formData.append('images', fs.createReadStream(imageFile));
      
      console.log('   📤 Uploading product with image...');
      console.log(`   📦 Product: ${product.name}`);
      console.log(`   💰 Price: $${product.price}`);
      console.log(`   🏷️ SKU: ${product.sku}`);
      
      const response = await fetch(`${TEST_CONFIG.backend_url}/supplier/products/`, {
        method: 'POST',
        headers: {
          // Don't include Authorization header to test without auth
          ...formData.getHeaders()
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Product upload successful!');
        console.log(`   📦 Product ID: ${data.id || 'N/A'}`);
        console.log(`   📦 Product Name: ${data.name || 'N/A'}`);
        console.log(`   💰 Price: $${data.price || 'N/A'}`);
        console.log(`   📊 Status: ${data.status || 'N/A'}`);
        console.log(`   📊 Approval: ${data.approval_status || 'N/A'}`);
        console.log(`   📊 Visibility: ${data.visibility || 'N/A'}`);
        
        results.productUpload = true;
        results.productCreation = true;
        
        // Store product ID for later tests
        global.testProductId = data.id;
        
      } else {
        const error = await response.text();
        console.log(`   ❌ Product upload failed: ${response.status}`);
        console.log(`   📝 Error: ${error.substring(0, 300)}...`);
        
        // Try to parse the error for more details
        try {
          const errorData = JSON.parse(error);
          if (errorData.detail) {
            console.log(`   🔍 Detailed Error: ${errorData.detail}`);
          }
        } catch (e) {
          // Error is not JSON, that's fine
        }
      }
    } catch (error) {
      console.log(`   ❌ Product upload error: ${error.message}`);
    }
  }
  
  // Step 3: Test product retrieval
  console.log('\n🔍 Step 3: Testing product retrieval...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Products retrieval successful: ${data.total || 0} products`);
      
      if (data.total > 0) {
        console.log('   📦 Available products:');
        data.items?.slice(0, 5).forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.name} - $${product.price} (${product.status || 'unknown'})`);
        });
        results.productRetrieval = true;
      } else {
        console.log('   ⚠️ No products found in database');
      }
    } else {
      const error = await response.text();
      console.log(`   ❌ Products retrieval failed: ${response.status}`);
      console.log(`   📝 Error: ${error.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Products retrieval error: ${error.message}`);
  }
  
  // Step 4: Test individual product details
  if (global.testProductId) {
    console.log('\n🔍 Step 4: Testing individual product details...');
    
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}/products/${global.testProductId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Product details retrieval successful!');
        console.log(`   📦 Product: ${data.name}`);
        console.log(`   💰 Price: $${data.price}`);
        console.log(`   📊 Status: ${data.status}`);
        console.log(`   📊 Approval: ${data.approval_status}`);
        console.log(`   📊 Visibility: ${data.visibility}`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Product details failed: ${response.status}`);
        console.log(`   📝 Error: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Product details error: ${error.message}`);
    }
  }
  
  // Step 5: Test frontend visibility
  console.log('\n🌐 Step 5: Testing frontend visibility...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/products/`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Frontend products API works: ${data.total || 0} products`);
      
      if (data.total > 0) {
        console.log('   📦 Products visible on frontend:');
        data.items?.slice(0, 3).forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.name} - $${product.price}`);
        });
        results.frontendVisibility = true;
      }
    } else {
      console.log(`   ❌ Frontend visibility failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend visibility error: ${error.message}`);
  }
  
  // Cleanup downloaded images
  console.log('\n🧹 Cleaning up downloaded images...');
  imageFiles.forEach(filename => {
    try {
      fs.unlinkSync(filename);
      console.log(`   🗑️ Deleted: ${filename}`);
    } catch (error) {
      console.log(`   ⚠️ Could not delete ${filename}: ${error.message}`);
    }
  });
  
  // Results summary
  console.log('\n============================');
  console.log('🎯 VENDOR UPLOAD TEST RESULTS');
  console.log('============================');
  
  console.log(`📥 Image Download: ${results.imageDownload ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📦 Product Upload: ${results.productUpload ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📦 Product Creation: ${results.productCreation ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`🔍 Product Retrieval: ${results.productRetrieval ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`🌐 Frontend Visibility: ${results.frontendVisibility ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  const allSuccess = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 OVERALL STATUS:');
  console.log(`   ${allSuccess ? '✅ VENDOR UPLOAD WORKING' : '❌ VENDOR UPLOAD NEEDS FIXES'}`);
  
  if (allSuccess) {
    console.log('\n🚀 VENDOR WORKFLOW IS FUNCTIONAL!');
    console.log('📱 Vendors can upload products with images');
    console.log('🛒 Products are visible on the frontend');
    console.log('🔧 Ready for production use');
  } else {
    console.log('\n🔧 ISSUES TO FIX:');
    if (!results.imageDownload) console.log('   - Image download issues');
    if (!results.productUpload) console.log('   - Product upload endpoint issues');
    if (!results.productCreation) console.log('   - Product creation in database issues');
    if (!results.productRetrieval) console.log('   - Product retrieval issues');
    if (!results.frontendVisibility) console.log('   - Frontend visibility issues');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run the products table schema fix in Supabase');
    console.log('   2. Check backend logs for specific error details');
    console.log('   3. Verify database connection and permissions');
  }
  
  return results;
}

// Run the test
testVendorProductUpload();
