const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.ylhvdwizcsoelpreftpy:8EZEJZtU3mzMXQW2@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function populateDatabase() {
  try {
    console.log('🔧 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📝 Reading SQL file...');
    const sqlContent = fs.readFileSync('minimal_data_setup.sql', 'utf8');
    
    console.log('🚀 Executing SQL commands...');
    await client.query(sqlContent);
    
    console.log('✅ Database populated successfully!');
    
    // Test the data
    console.log('\n🔍 Testing populated data...');
    
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Users: ${usersResult.rows[0].count}`);
    
    const productsResult = await client.query('SELECT COUNT(*) FROM products');
    console.log(`📦 Products: ${productsResult.rows[0].count}`);
    
    const ordersResult = await client.query('SELECT COUNT(*) FROM orders');
    console.log(`📋 Orders: ${ordersResult.rows[0].count}`);
    
    const cartsResult = await client.query('SELECT COUNT(*) FROM carts');
    console.log(`🛒 Carts: ${cartsResult.rows[0].count}`);
    
    console.log('\n🎉 Database population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
  } finally {
    await client.end();
  }
}

populateDatabase();
