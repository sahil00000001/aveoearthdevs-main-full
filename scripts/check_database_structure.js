const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.ylhvdwizcsoelpreftpy:8EZEJZtU3mzMXQW2@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function checkDatabaseStructure() {
  try {
    console.log('🔧 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n📋 Checking table structures...');
    
    // Check users table structure
    const usersStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👥 Users table structure:');
    usersStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check existing data
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Existing users: ${usersCount.rows[0].count}`);
    
    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`📦 Existing products: ${productsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();

