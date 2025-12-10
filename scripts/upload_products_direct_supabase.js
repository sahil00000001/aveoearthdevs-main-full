/**
 * Direct Supabase Product Upload Script
 * Uploads 5 products directly to Supabase REST API
 * Bypasses backend database connection issues
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ylhvdwizcsoelpreftpy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgzMjQ1OCwiZXhwIjoyMDc1NDA4NDU4fQ.FH_V5Fhpa4u0A_xoKb1hfYmAiFpO7Zw8gfkoEun3em8';
const fs = require('fs');
const path = require('path');

// Simple UUID v4 generator (no dependencies)
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Products to upload
const products = [
    {
        name: "Eco-Friendly Water Bottle",
        sku: "WB-ECO-001",
        price: 29.99,
        short_description: "A reusable stainless steel water bottle perfect for daily use",
        description: "Made from premium stainless steel with double-wall insulation to keep drinks cold or hot for hours",
        stock: 50,
        sustainability_score: 85,
        tags: ["eco-friendly", "water bottle", "reusable"]
    },
    {
        name: "Organic Cotton T-Shirt",
        sku: "TS-ORG-002",
        price: 24.99,
        short_description: "100% organic cotton t-shirt made with sustainable farming practices",
        description: "Comfortable and breathable organic cotton t-shirt that's gentle on your skin and the environment",
        stock: 100,
        sustainability_score: 90,
        tags: ["organic", "cotton", "t-shirt", "sustainable"]
    },
    {
        name: "Solar-Powered Charger",
        sku: "CH-SOL-003",
        price: 49.99,
        short_description: "Portable solar charger for phones and devices",
        description: "Charge your devices anywhere with this compact solar-powered charger featuring high-efficiency solar panels",
        stock: 30,
        sustainability_score: 95,
        tags: ["solar", "charger", "portable", "renewable"]
    },
    {
        name: "Bamboo Toothbrush Set",
        sku: "BR-BAM-004",
        price: 12.99,
        short_description: "Set of 4 biodegradable bamboo toothbrushes",
        description: "Natural bamboo toothbrushes with soft bristles that are completely biodegradable",
        stock: 200,
        sustainability_score: 88,
        tags: ["bamboo", "toothbrush", "biodegradable", "eco"]
    },
    {
        name: "Reusable Shopping Bag Pack",
        sku: "BG-REU-005",
        price: 19.99,
        short_description: "Pack of 5 durable reusable shopping bags",
        description: "Sturdy reusable shopping bags made from recycled materials that fold compactly",
        stock: 150,
        sustainability_score: 87,
        tags: ["reusable", "shopping bag", "eco-friendly"]
    }
];

async function uploadProductToSupabase(product) {
    try {
        const productData = {
            id: uuidv4(),
            name: product.name,
            sku: product.sku,
            slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            price: product.price,
            short_description: product.short_description,
            description: product.description,
            tags: product.tags,
            status: 'active',
            approval_status: 'approved',
            visibility: 'visible',
            supplier_id: '00000000-0000-0000-0000-000000000000' // Default supplier ID
            // Note: stock and sustainability_score are in separate tables
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const created = Array.isArray(data) ? data[0] : data;
        return created;
    } catch (error) {
        console.error(`Failed to upload ${product.name}:`, error.message);
        throw error;
    }
}

async function verifyProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,price,stock&status=eq.active&approval_status=eq.approved&limit=10`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Failed to verify products:', error.message);
        return [];
    }
}

(async () => {
    console.log('🧪 Uploading 5 Products Directly to Supabase\n');
    console.log('='.repeat(60));
    
    const results = {
        successful: [],
        failed: []
    };

    for (const product of products) {
        try {
            console.log(`📤 Uploading: ${product.name}...`);
            const created = await uploadProductToSupabase(product);
            results.successful.push(created);
            console.log(`✅ Created: ${product.name} (ID: ${created.id})`);
        } catch (error) {
            results.failed.push({ product: product.name, error: error.message });
            console.log(`❌ Failed: ${product.name} - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
        console.log('\nFailed products:');
        results.failed.forEach(f => console.log(`  - ${f.product}: ${f.error}`));
    }

    console.log('\n🔍 Verifying products are available...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const verified = await verifyProducts();
    console.log(`✅ Found ${verified.length} active products in Supabase`);
    
    if (verified.length > 0) {
        console.log('\n📦 Products in database:');
        verified.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} - $${p.price} (Stock: ${p.stock})`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Product upload complete!');
    console.log('💡 Refresh your frontend to see the new products');
})();

