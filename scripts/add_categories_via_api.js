const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Categories from CategoryBubbles.tsx + additional ones
const categories = [
    // Frontend categories (6 main ones from CategoryBubbles.tsx)
    {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Eco-friendly home essentials, kitchenware, and living products',
        is_active: true,
        sort_order: 1
    },
    {
        name: 'Sustainable Fashion',
        slug: 'sustainable-fashion',
        description: 'Ethically made wardrobe staples, organic clothing',
        is_active: true,
        sort_order: 2
    },
    {
        name: 'Upcycled & Handmade',
        slug: 'upcycled-handmade',
        description: 'Artisan goods made from reclaimed materials',
        is_active: true,
        sort_order: 3
    },
    {
        name: 'Clean Beauty',
        slug: 'clean-beauty',
        description: 'Cruelty-free, natural skincare and beauty products',
        is_active: true,
        sort_order: 4
    },
    {
        name: 'Fitness',
        slug: 'fitness',
        description: 'Eco-friendly fitness gear, yoga accessories, and activewear',
        is_active: true,
        sort_order: 5
    },
    {
        name: 'Pets',
        slug: 'pets',
        description: 'Sustainable pet care products, eco-friendly toys and accessories',
        is_active: true,
        sort_order: 6
    },
    // Additional categories (4 more)
    {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Sustainable electronics, gadgets, and tech accessories',
        is_active: true,
        sort_order: 7
    },
    {
        name: 'Health & Wellness',
        slug: 'health-wellness',
        description: 'Natural health products, organic supplements, and wellness items',
        is_active: true,
        sort_order: 8
    },
    {
        name: 'Food & Beverages',
        slug: 'food-beverages',
        description: 'Organic food, sustainable beverages, and eco-friendly consumables',
        is_active: true,
        sort_order: 9
    },
    {
        name: 'Kids & Baby',
        slug: 'kids-baby',
        description: 'Sustainable baby products, eco-friendly children\'s items, and organic kids\' essentials',
        is_active: true,
        sort_order: 10
    }
];

// Brands to add
const brands = [
    {
        name: 'EcoTech',
        slug: 'ecotech',
        description: 'Leading sustainable technology solutions',
        is_active: true
    },
    {
        name: 'GreenHome',
        slug: 'greenhome',
        description: 'Eco-friendly home and living products',
        is_active: true
    },
    {
        name: 'OrganicWear',
        slug: 'organicwear',
        description: 'Sustainable fashion and organic clothing',
        is_active: true
    },
    {
        name: 'NaturalHealth',
        slug: 'naturalhealth',
        description: 'Natural health and wellness products',
        is_active: true
    },
    {
        name: 'PureBeauty',
        slug: 'purebeauty',
        description: 'Natural beauty and personal care products',
        is_active: true
    },
    {
        name: 'FarmFresh',
        slug: 'farmfresh',
        description: 'Organic food and sustainable beverages',
        is_active: true
    },
    {
        name: 'ActiveGreen',
        slug: 'activegreen',
        description: 'Sustainable sports and outdoor gear',
        is_active: true
    },
    {
        name: 'GreenOffice',
        slug: 'greenoffice',
        description: 'Eco-friendly office and business supplies',
        is_active: true
    }
];

async function addCategories() {
    console.log('🚀 Adding Categories and Brands to Database\n');
    
    try {
        // Test backend connection first
        console.log('1. Testing backend connection...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Backend is running');
        
        // Add categories
        console.log('\n2. Adding categories...');
        for (const category of categories) {
            try {
                const response = await axios.post(`${BASE_URL}/admin/products/categories`, category);
                console.log(`✅ Added category: ${category.name}`);
            } catch (error) {
                console.log(`❌ Failed to add category ${category.name}: ${error.response?.data?.detail || error.message}`);
            }
        }
        
        // Add brands
        console.log('\n3. Adding brands...');
        for (const brand of brands) {
            try {
                const response = await axios.post(`${BASE_URL}/admin/products/brands`, brand);
                console.log(`✅ Added brand: ${brand.name}`);
            } catch (error) {
                console.log(`❌ Failed to add brand ${brand.name}: ${error.response?.data?.detail || error.message}`);
            }
        }
        
        // Verify categories were added
        console.log('\n4. Verifying categories...');
        try {
            const categoriesResponse = await axios.get(`${BASE_URL}/products/categories`);
            console.log(`✅ Found ${categoriesResponse.data.data?.length || 0} categories in database`);
        } catch (error) {
            console.log(`❌ Failed to verify categories: ${error.response?.data?.detail || error.message}`);
        }
        
        // Verify brands were added
        console.log('\n5. Verifying brands...');
        try {
            const brandsResponse = await axios.get(`${BASE_URL}/products/brands`);
            console.log(`✅ Found ${brandsResponse.data.data?.length || 0} brands in database`);
        } catch (error) {
            console.log(`❌ Failed to verify brands: ${error.response?.data?.detail || error.message}`);
        }
        
        console.log('\n🎉 Categories and brands addition completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the script
addCategories();
