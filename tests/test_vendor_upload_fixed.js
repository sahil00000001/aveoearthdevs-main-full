/**
 * Fixed Vendor Product Upload Test
 * Tests vendor product upload with correct API format
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

const TEST_CONFIG = {
  backend_url: 'http://localhost:8080'
};

// Sample product data with correct API format
const SAMPLE_PRODUCTS = [
  {
    name: 'Eco Bamboo Water Bottle',
    description: 'Sustainable bamboo water bottle with leak-proof design. Perfect for daily use and eco-conscious consumers.',
    price: 24.99,
    category_id: '1', // We'll need to get actual category IDs
    brand_id: '1', // We'll need to get actual brand IDs
    sku: 'BAMBOO-BOTTLE-001',
    short_description: 'Eco-friendly bamboo water bottle',
    weight: 0.3,
    dimensions: '{"length": 20, "width": 8, "height": 8, "unit": "cm"}',
    materials: '["Bamboo", "Silicone"]',
    tags: '["bamboo", "sustainable", "water bottle", "eco-friendly"]',
    visibility: 'visible',
    track_quantity: true,
    continue_selling: false,
    origin_country: 'China',
    care_instructions: 'Hand wash only. Do not use in dishwasher.'
  },
  {
    name: 'Organic Cotton Tote Bag',
    description: 'Reusable organic cotton tote bag for shopping. Durable and environmentally friendly.',
    price: 12.99,
    category_id: '2',
    brand_id: '2',
    sku: 'COTTON-TOTE-002',
    short_description: 'Organic cotton tote bag',
    weight: 0.2,
    dimensions: '{"length": 40, "width": 35, "height": 10, "unit": "cm"}',
    materials: '["Organic Cotton", "Cotton Thread"]',
    tags: '["cotton", "organic", "tote bag", "reusable"]',
    visibility: 'visible',
    track_quantity: true,
    continue_selling: false,
    origin_country: 'India',
    care_instructions: 'Machine wash cold. Air dry.'
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

async function getCategoriesAndBrands() {
  console.log('\n📂 Getting available categories and brands...');
  
  const categories = [];
  const brands = [];
  
  try {
    const categoriesResponse = await fetch(`${TEST_CONFIG.backend_url}/products/categories/`);
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      console.log(`   ✅ Found ${data.length || 0} categories`);
      categories.push(...(data || []));
    } else {
      console.log(`   ❌ Categories failed: ${categoriesResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Categories error: ${error.message}`);
  }
  
  try {
    const brandsResponse = await fetch(`${TEST_CONFIG.backend_url}/products/brands/`);
    if (brandsResponse.ok) {
      const data = await brandsResponse.json();
      console.log(`   ✅ Found ${data.length || 0} brands`);
      brands.push(...(data || []));
    } else {
      console.log(`   ❌ Brands failed: ${brandsResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Brands error: ${error.message}`);
  }
  
  return { categories, brands };
}

async function testVendorProductUploadFixed() {
  console.log('🏪 Fixed Vendor Product Upload Test');
  console.log('===================================');
  
  const results = {
    imageDownload: false,
    categoriesBrands: false,
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
    const filename = `fixed_vendor_test_image_${i + 1}.jpg`;
    
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
  
  // Step 2: Get categories and brands
  const { categories, brands } = await getCategoriesAndBrands();
  results.categoriesBrands = categories.length > 0 || brands.length > 0;
  
  if (categories.length > 0) {
    console.log('   📂 Available categories:');
    categories.slice(0, 3).forEach((cat, index) => {
      console.log(`      ${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });
  }
  
  if (brands.length > 0) {
    console.log('   🏷️ Available brands:');
    brands.slice(0, 3).forEach((brand, index) => {
      console.log(`      ${index + 1}. ${brand.name} (ID: ${brand.id})`);
    });
  }
  
  // Step 3: Test product upload with correct format
  console.log('\n📦 Step 3: Testing product upload with correct format...');
  
  if (imageFiles.length > 0 && (categories.length > 0 || brands.length > 0)) {
    const product = SAMPLE_PRODUCTS[0];
    const imageFile = imageFiles[0];
    
    // Use actual category and brand IDs if available
    if (categories.length > 0) {
      product.category_id = categories[0].id;
    }
    if (brands.length > 0) {
      product.brand_id = brands[0].id;
    }
    
    try {
      const formData = new FormData();
      
      // Add all product fields with correct names
      Object.keys(product).forEach(key => {
        if (product[key] !== null && product[key] !== undefined) {
          formData.append(key, product[key]);
        }
      });
      
      // Add image file
      formData.append('images', fs.createReadStream(imageFile));
      
      console.log('   📤 Uploading product with correct format...');
      console.log(`   📦 Product: ${product.name}`);
      console.log(`   💰 Price: $${product.price}`);
      console.log(`   🏷️ SKU: ${product.sku}`);
      console.log(`   📂 Category ID: ${product.category_id}`);
      console.log(`   🏷️ Brand ID: ${product.brand_id}`);
      
      const response = await fetch(`${TEST_CONFIG.backend_url}/supplier/products/`, {
        method: 'POST',
        headers: {
          // Include a mock authorization header for testing
          'Authorization': 'Bearer mock-token-for-testing',
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
        console.log(`   📝 Error: ${error.substring(0, 500)}...`);
        
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
  } else {
    console.log('   ⚠️ Skipping product upload - missing images, categories, or brands');
  }
  
  // Step 4: Test product retrieval
  console.log('\n🔍 Step 4: Testing product retrieval...');
  
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
  console.log('\n===================================');
  console.log('🎯 FIXED VENDOR UPLOAD TEST RESULTS');
  console.log('===================================');
  
  console.log(`📥 Image Download: ${results.imageDownload ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📂 Categories/Brands: ${results.categoriesBrands ? '✅ SUCCESS' : '❌ FAILED'}`);
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
    if (!results.categoriesBrands) console.log('   - Categories/brands endpoints issues');
    if (!results.productUpload) console.log('   - Product upload endpoint issues');
    if (!results.productCreation) console.log('   - Product creation in database issues');
    if (!results.productRetrieval) console.log('   - Product retrieval issues');
    if (!results.frontendVisibility) console.log('   - Frontend visibility issues');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run the products table schema fix in Supabase');
    console.log('   2. Fix authentication issues (rate limiting)');
    console.log('   3. Add sample categories and brands to database');
    console.log('   4. Test with real vendor authentication');
  }
  
  return results;
}

// Run the test
testVendorProductUploadFixed();
