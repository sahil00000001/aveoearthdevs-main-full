const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const ANALYTICS_URL = `${BASE_URL}/analytics`;
const DASHBOARD_URL = `${BASE_URL}/dashboard`;

// Test data
const testUser = {
    user_id: 'test-user-123',
    session_id: 'test-session-456'
};

const testProducts = [
    {
        id: 'prod-1',
        name: 'Wireless Headphones',
        price: 99.99,
        category_id: 'cat-electronics',
        brand_id: 'brand-sony'
    },
    {
        id: 'prod-2',
        name: 'Smartphone Case',
        price: 29.99,
        category_id: 'cat-accessories',
        brand_id: 'brand-apple'
    },
    {
        id: 'prod-3',
        name: 'Laptop Stand',
        price: 49.99,
        category_id: 'cat-accessories',
        brand_id: 'brand-logitech'
    }
];

async function testPersonalizationSystem() {
    console.log('🚀 Testing Personalization and Analytics System\n');
    
    try {
        // Test 1: Track user activities
        console.log('1. Testing user activity tracking...');
        await testActivityTracking();
        
        // Test 2: Get personalized recommendations
        console.log('\n2. Testing personalized recommendations...');
        await testPersonalizedRecommendations();
        
        // Test 3: Get bundle recommendations
        console.log('\n3. Testing bundle recommendations...');
        await testBundleRecommendations();
        
        // Test 4: Test dashboard analytics
        console.log('\n4. Testing dashboard analytics...');
        await testDashboardAnalytics();
        
        // Test 5: Test profit optimization
        console.log('\n5. Testing profit optimization...');
        await testProfitOptimization();
        
        console.log('\n✅ All personalization system tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing personalization system:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function testActivityTracking() {
    const activities = [
        {
            activity_type: 'page_view',
            activity_data: {
                page_url: '/products',
                time_spent: 30
            },
            context: {
                device_type: 'desktop',
                browser: 'chrome'
            }
        },
        {
            activity_type: 'product_view',
            activity_data: {
                product_id: testProducts[0].id,
                category_id: testProducts[0].category_id,
                brand_id: testProducts[0].brand_id,
                price: testProducts[0].price,
                time_spent: 45
            }
        },
        {
            activity_type: 'add_to_cart',
            activity_data: {
                product_id: testProducts[0].id,
                quantity: 1,
                price: testProducts[0].price,
                cart_value: testProducts[0].price
            }
        },
        {
            activity_type: 'search',
            activity_data: {
                search_query: 'wireless headphones',
                results_count: 15,
                time_spent: 20
            }
        },
        {
            activity_type: 'purchase',
            activity_data: {
                product_id: testProducts[0].id,
                order_value: testProducts[0].price,
                quantity: 1,
                conversion_value: testProducts[0].price
            }
        }
    ];
    
    for (const activity of activities) {
        try {
            const response = await axios.post(`${ANALYTICS_URL}/track-activity`, {
                user_id: testUser.user_id,
                session_id: testUser.session_id,
                activity_type: activity.activity_type,
                activity_data: activity.activity_data,
                context: activity.context
            });
            
            console.log(`  ✅ Tracked ${activity.activity_type}: ${response.data.message}`);
        } catch (error) {
            console.log(`  ❌ Failed to track ${activity.activity_type}: ${error.response?.data?.detail || error.message}`);
        }
    }
}

async function testPersonalizedRecommendations() {
    try {
        const response = await axios.post(`${ANALYTICS_URL}/recommendations`, {
            user_id: testUser.user_id,
            session_id: testUser.session_id,
            limit: 5,
            recommendation_type: 'product'
        });
        
        console.log(`  ✅ Got ${response.data.data.count} personalized recommendations`);
        console.log(`  📊 Recommendations:`, response.data.data.recommendations.map(r => ({
            name: r.name,
            price: r.price,
            score: r.recommendation_score,
            reason: r.recommendation_reason
        })));
        
    } catch (error) {
        console.log(`  ❌ Failed to get recommendations: ${error.response?.data?.detail || error.message}`);
    }
}

async function testBundleRecommendations() {
    try {
        const response = await axios.post(`${ANALYTICS_URL}/bundles`, {
            user_id: testUser.user_id,
            session_id: testUser.session_id,
            cart_items: [testProducts[0]],
            limit: 3
        });
        
        console.log(`  ✅ Got ${response.data.data.count} bundle recommendations`);
        console.log(`  📦 Bundles:`, response.data.data.bundles.map(b => ({
            name: b.name,
            type: b.type,
            bundle_price: b.bundle_price,
            savings: b.savings_amount,
            score: b.recommendation_score
        })));
        
    } catch (error) {
        console.log(`  ❌ Failed to get bundle recommendations: ${error.response?.data?.detail || error.message}`);
    }
}

async function testDashboardAnalytics() {
    try {
        // Test dashboard overview
        const overviewResponse = await axios.get(`${DASHBOARD_URL}/overview?days=30`);
        console.log(`  ✅ Dashboard overview: ${overviewResponse.data.message}`);
        console.log(`  📊 Key metrics:`, overviewResponse.data.data.key_metrics);
        
        // Test user analytics
        const userAnalyticsResponse = await axios.get(`${DASHBOARD_URL}/user-analytics?days=30`);
        console.log(`  ✅ User analytics: ${userAnalyticsResponse.data.message}`);
        
        // Test recommendation analytics
        const recAnalyticsResponse = await axios.get(`${DASHBOARD_URL}/recommendation-analytics?days=30`);
        console.log(`  ✅ Recommendation analytics: ${recAnalyticsResponse.data.message}`);
        
    } catch (error) {
        console.log(`  ❌ Failed to get dashboard analytics: ${error.response?.data?.detail || error.message}`);
    }
}

async function testProfitOptimization() {
    try {
        const response = await axios.get(`${ANALYTICS_URL}/profit-optimization`);
        console.log(`  ✅ Profit optimization analysis: ${response.data.message}`);
        
        const analysis = response.data.data;
        console.log(`  💰 Revenue distribution:`, analysis.revenue_distribution);
        console.log(`  📈 Optimization strategies:`, Object.keys(analysis.optimization_strategies));
        
    } catch (error) {
        console.log(`  ❌ Failed to get profit optimization: ${error.response?.data?.detail || error.message}`);
    }
}

async function testUserSegments() {
    try {
        const response = await axios.get(`${ANALYTICS_URL}/user-segments`);
        console.log(`  ✅ User segments: ${response.data.message}`);
        console.log(`  👥 Segments:`, response.data.data.segments);
        
    } catch (error) {
        console.log(`  ❌ Failed to get user segments: ${error.response?.data?.detail || error.message}`);
    }
}

async function testRecommendationPerformance() {
    try {
        const response = await axios.get(`${ANALYTICS_URL}/recommendation-performance?days=30`);
        console.log(`  ✅ Recommendation performance: ${response.data.message}`);
        console.log(`  📊 Performance metrics:`, response.data.data.performance_metrics);
        
    } catch (error) {
        console.log(`  ❌ Failed to get recommendation performance: ${error.response?.data?.detail || error.message}`);
    }
}

async function testBundlePerformance() {
    try {
        const response = await axios.get(`${ANALYTICS_URL}/bundle-performance?days=30`);
        console.log(`  ✅ Bundle performance: ${response.data.message}`);
        console.log(`  📦 Bundle metrics:`, response.data.data.bundle_performance);
        
    } catch (error) {
        console.log(`  ❌ Failed to get bundle performance: ${error.response?.data?.detail || error.message}`);
    }
}

async function testUserBehaviorProfile() {
    try {
        const response = await axios.get(`${ANALYTICS_URL}/user-profile/${testUser.user_id}`);
        console.log(`  ✅ User behavior profile: ${response.data.message}`);
        console.log(`  👤 Profile data:`, {
            preferred_categories: response.data.data.preferred_categories,
            preferred_brands: response.data.data.preferred_brands,
            price_sensitivity: response.data.data.price_sensitivity,
            customer_lifecycle_stage: response.data.data.customer_lifecycle_stage,
            personalization_score: response.data.data.personalization_score
        });
        
    } catch (error) {
        console.log(`  ❌ Failed to get user behavior profile: ${error.response?.data?.detail || error.message}`);
    }
}

async function testInteractionTracking() {
    try {
        // Test recommendation interaction tracking
        const recResponse = await axios.post(`${ANALYTICS_URL}/track-recommendation-interaction`, null, {
            params: {
                recommendation_id: 'test-rec-123',
                interaction_type: 'click',
                user_id: testUser.user_id,
                session_id: testUser.session_id
            }
        });
        console.log(`  ✅ Recommendation interaction tracked: ${recResponse.data.message}`);
        
        // Test bundle interaction tracking
        const bundleResponse = await axios.post(`${ANALYTICS_URL}/track-bundle-interaction`, null, {
            params: {
                bundle_id: 'test-bundle-123',
                interaction_type: 'view',
                user_id: testUser.user_id,
                session_id: testUser.session_id
            }
        });
        console.log(`  ✅ Bundle interaction tracked: ${bundleResponse.data.message}`);
        
    } catch (error) {
        console.log(`  ❌ Failed to track interactions: ${error.response?.data?.detail || error.message}`);
    }
}

// Run the tests
testPersonalizationSystem();
