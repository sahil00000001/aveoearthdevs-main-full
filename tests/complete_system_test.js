const fs = require('fs');
const path = require('path');

console.log('🚀 COMPLETE SYSTEM TEST & STATUS REPORT');
console.log('==========================================\n');

async function testSystemStatus() {
    const results = {
        frontend: { status: 'unknown', details: '' },
        backend: { status: 'unknown', details: '' },
        database: { status: 'unknown', details: '' },
        workflows: {
            buyer: { status: 'unknown', details: '' },
            vendor: { status: 'unknown', details: '' },
            admin: { status: 'unknown', details: '' }
        }
    };

    try {
        console.log('🔍 Testing Frontend Status...');
        try {
            const frontendResponse = await fetch('http://localhost:5173');
            if (frontendResponse.ok) {
                results.frontend.status = 'running';
                results.frontend.details = 'Frontend is accessible on port 5173';
                console.log('   ✅ Frontend: RUNNING');
            } else {
                results.frontend.status = 'error';
                results.frontend.details = `Frontend returned status ${frontendResponse.status}`;
                console.log(`   ❌ Frontend: ERROR (${frontendResponse.status})`);
            }
        } catch (error) {
            results.frontend.status = 'down';
            results.frontend.details = 'Frontend is not accessible';
            console.log('   ❌ Frontend: DOWN');
        }

        console.log('\n🔍 Testing Backend Status...');
        try {
            const backendResponse = await fetch('http://localhost:8080/health');
            if (backendResponse.ok) {
                const healthData = await backendResponse.json();
                results.backend.status = 'running';
                results.backend.details = `Backend is running - ${healthData.service} v${healthData.version}`;
                console.log('   ✅ Backend: RUNNING');
                
                // Test backend endpoints
                console.log('\n🔍 Testing Backend Endpoints...');
                
                // Test categories
                try {
                    const categoriesResponse = await fetch('http://localhost:8080/supplier/products/categories');
                    if (categoriesResponse.ok) {
                        const categories = await categoriesResponse.json();
                        console.log(`   ✅ Categories API: ${categories.length} categories available`);
                    } else {
                        console.log(`   ❌ Categories API: ${categoriesResponse.status}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Categories API: ${error.message}`);
                }

                // Test brands
                try {
                    const brandsResponse = await fetch('http://localhost:8080/supplier/products/brands');
                    if (brandsResponse.ok) {
                        const brands = await brandsResponse.json();
                        console.log(`   ✅ Brands API: ${brands.length} brands available`);
                    } else {
                        console.log(`   ❌ Brands API: ${brandsResponse.status}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Brands API: ${error.message}`);
                }

                // Test products
                try {
                    const productsResponse = await fetch('http://localhost:8080/products/');
                    if (productsResponse.ok) {
                        const products = await productsResponse.json();
                        console.log(`   ✅ Products API: ${products.data?.length || 0} products available`);
                    } else {
                        console.log(`   ❌ Products API: ${productsResponse.status}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Products API: ${error.message}`);
                }

            } else {
                results.backend.status = 'error';
                results.backend.details = `Backend returned status ${backendResponse.status}`;
                console.log(`   ❌ Backend: ERROR (${backendResponse.status})`);
            }
        } catch (error) {
            results.backend.status = 'down';
            results.backend.details = 'Backend is not accessible';
            console.log('   ❌ Backend: DOWN');
        }

        console.log('\n🔍 Testing Database Connectivity...');
        if (results.backend.status === 'running') {
            try {
                const categoriesResponse = await fetch('http://localhost:8080/supplier/products/categories');
                if (categoriesResponse.ok) {
                    results.database.status = 'connected';
                    results.database.details = 'Database is accessible through backend';
                    console.log('   ✅ Database: CONNECTED');
                } else {
                    results.database.status = 'error';
                    results.database.details = 'Database access through backend failed';
                    console.log('   ❌ Database: ERROR');
                }
            } catch (error) {
                results.database.status = 'error';
                results.database.details = 'Database test failed';
                console.log('   ❌ Database: ERROR');
            }
        } else {
            results.database.status = 'unknown';
            results.database.details = 'Cannot test database - backend is down';
            console.log('   ⚠️ Database: UNKNOWN (backend down)');
        }

        console.log('\n🔍 Testing Workflows...');
        
        // Test Buyer Workflow
        console.log('\n📱 Testing Buyer Workflow...');
        if (results.frontend.status === 'running' && results.backend.status === 'running') {
            try {
                const productsResponse = await fetch('http://localhost:8080/products/');
                if (productsResponse.ok) {
                    results.workflows.buyer.status = 'functional';
                    results.workflows.buyer.details = 'Buyer can view products';
                    console.log('   ✅ Buyer Workflow: FUNCTIONAL');
                } else {
                    results.workflows.buyer.status = 'limited';
                    results.workflows.buyer.details = 'Buyer workflow has issues';
                    console.log('   ⚠️ Buyer Workflow: LIMITED');
                }
            } catch (error) {
                results.workflows.buyer.status = 'broken';
                results.workflows.buyer.details = 'Buyer workflow is broken';
                console.log('   ❌ Buyer Workflow: BROKEN');
            }
        } else {
            results.workflows.buyer.status = 'blocked';
            results.workflows.buyer.details = 'Buyer workflow blocked - frontend or backend down';
            console.log('   ⚠️ Buyer Workflow: BLOCKED');
        }

        // Test Vendor Workflow
        console.log('\n🏪 Testing Vendor Workflow...');
        if (results.backend.status === 'running' && results.database.status === 'connected') {
            try {
                const categoriesResponse = await fetch('http://localhost:8080/supplier/products/categories');
                const brandsResponse = await fetch('http://localhost:8080/supplier/products/brands');
                
                if (categoriesResponse.ok && brandsResponse.ok) {
                    results.workflows.vendor.status = 'ready';
                    results.workflows.vendor.details = 'Vendor can access categories and brands';
                    console.log('   ✅ Vendor Workflow: READY');
                } else {
                    results.workflows.vendor.status = 'limited';
                    results.workflows.vendor.details = 'Vendor workflow has limited functionality';
                    console.log('   ⚠️ Vendor Workflow: LIMITED');
                }
            } catch (error) {
                results.workflows.vendor.status = 'broken';
                results.workflows.vendor.details = 'Vendor workflow is broken';
                console.log('   ❌ Vendor Workflow: BROKEN');
            }
        } else {
            results.workflows.vendor.status = 'blocked';
            results.workflows.vendor.details = 'Vendor workflow blocked - backend or database issues';
            console.log('   ⚠️ Vendor Workflow: BLOCKED');
        }

        // Test Admin Workflow
        console.log('\n👑 Testing Admin Workflow...');
        if (results.backend.status === 'running') {
            try {
                const adminCategoriesResponse = await fetch('http://localhost:8080/admin/products/categories');
                if (adminCategoriesResponse.ok) {
                    results.workflows.admin.status = 'functional';
                    results.workflows.admin.details = 'Admin can access admin endpoints';
                    console.log('   ✅ Admin Workflow: FUNCTIONAL');
                } else {
                    results.workflows.admin.status = 'limited';
                    results.workflows.admin.details = 'Admin workflow has limited functionality';
                    console.log('   ⚠️ Admin Workflow: LIMITED');
                }
            } catch (error) {
                results.workflows.admin.status = 'broken';
                results.workflows.admin.details = 'Admin workflow is broken';
                console.log('   ❌ Admin Workflow: BROKEN');
            }
        } else {
            results.workflows.admin.status = 'blocked';
            results.workflows.admin.details = 'Admin workflow blocked - backend down';
            console.log('   ⚠️ Admin Workflow: BLOCKED');
        }

    } catch (error) {
        console.log(`❌ System test failed: ${error.message}`);
    }

    return results;
}

// Run the comprehensive test
testSystemStatus().then((results) => {
    console.log('\n==========================================');
    console.log('📊 COMPLETE SYSTEM STATUS REPORT');
    console.log('==========================================');
    
    console.log('\n🔧 INFRASTRUCTURE STATUS:');
    console.log(`   Frontend: ${results.frontend.status.toUpperCase()} - ${results.frontend.details}`);
    console.log(`   Backend: ${results.backend.status.toUpperCase()} - ${results.backend.details}`);
    console.log(`   Database: ${results.database.status.toUpperCase()} - ${results.database.details}`);
    
    console.log('\n👥 WORKFLOW STATUS:');
    console.log(`   Buyer: ${results.workflows.buyer.status.toUpperCase()} - ${results.workflows.buyer.details}`);
    console.log(`   Vendor: ${results.workflows.vendor.status.toUpperCase()} - ${results.workflows.vendor.details}`);
    console.log(`   Admin: ${results.workflows.admin.status.toUpperCase()} - ${results.workflows.admin.details}`);
    
    console.log('\n🎯 OVERALL SYSTEM STATUS:');
    const allRunning = results.frontend.status === 'running' && 
                      results.backend.status === 'running' && 
                      results.database.status === 'connected';
    
    if (allRunning) {
        console.log('   🟢 SYSTEM IS FULLY OPERATIONAL');
        console.log('\n✅ READY FOR:');
        console.log('   - Customer product browsing');
        console.log('   - Vendor product uploads');
        console.log('   - Admin management');
        console.log('   - Complete end-to-end testing');
    } else {
        console.log('   🟡 SYSTEM HAS ISSUES');
        console.log('\n🔧 ISSUES TO FIX:');
        
        if (results.frontend.status !== 'running') {
            console.log('   - Frontend is not running');
        }
        if (results.backend.status !== 'running') {
            console.log('   - Backend is not running');
        }
        if (results.database.status !== 'connected') {
            console.log('   - Database connectivity issues');
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('   1. Restart backend server');
        console.log('   2. Check environment variables');
        console.log('   3. Verify database connection');
        console.log('   4. Test individual components');
    }
    
    console.log('\n==========================================');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Fix any identified issues');
    console.log('   2. Test vendor product upload');
    console.log('   3. Test complete workflows');
    console.log('   4. Verify frontend integration');
    console.log('==========================================');
});
