import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const DatabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('Click to test database connection');
  const [isLoading, setIsLoading] = useState(false);

  const testDatabase = async () => {
    setIsLoading(true);
    setTestResult('Testing database connection...');
    
    try {
      console.log('🧪 Starting database test...');
      
      // Test 1: Basic connection
      console.log('🧪 Test 1: Basic connection test');
      const { data: basicData, error: basicError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      console.log('🧪 Basic test result:', { basicData, basicError });
      
      if (basicError) {
        setTestResult(`❌ Basic connection failed: ${basicError.message}`);
        return;
      }
      
      // Test 2: Count products
      console.log('🧪 Test 2: Count products');
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      console.log('🧪 Count result:', { count, countError });
      
      if (countError) {
        setTestResult(`❌ Count query failed: ${countError.message}`);
        return;
      }
      
      // Test 3: Get sample products
      console.log('🧪 Test 3: Get sample products');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5);
      
      console.log('🧪 Products result:', { productsData, productsError });
      
      if (productsError) {
        setTestResult(`❌ Products query failed: ${productsError.message}`);
        return;
      }
      
      setTestResult(`✅ Database connection successful! Found ${count} products. Sample: ${productsData?.[0]?.name || 'None'}`);
      
    } catch (error) {
      console.error('🧪 Database test error:', error);
      setTestResult(`❌ Database test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-bold text-lg mb-2">Database Connection Test</h3>
      <p className="mb-4">{testResult}</p>
      <button 
        onClick={testDatabase}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Database Connection'}
      </button>
    </div>
  );
};

export default DatabaseTest;
