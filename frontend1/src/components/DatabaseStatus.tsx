import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DatabaseStatus = () => {
  const [status, setStatus] = useState('Checking database...');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        setStatus('Connecting to database...');
        
        // Test basic connection first
        console.log('🔍 Testing basic connection...');
        const { data: basicData, error: basicError } = await supabase
          .from('products')
          .select('id, name')
          .limit(1);
        
        console.log('🔍 Basic test result:', { basicData, basicError });
        
        if (basicError) {
          setStatus(`❌ Basic Connection Error: ${basicError.message}`);
          console.error('❌ Basic connection failed:', basicError);
          return;
        }
        
        // If basic connection works, try full queries
        setStatus('Testing full queries...');
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(5);
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(5);
        
        console.log('🔍 Products query result:', { productsData, productsError });
        console.log('🔍 Categories query result:', { categoriesData, categoriesError });
        
        if (productsError) {
          setStatus(`❌ Products Query Error: ${productsError.message}`);
          console.error('❌ Products query failed:', productsError);
        } else if (categoriesError) {
          setStatus(`❌ Categories Query Error: ${categoriesError.message}`);
          console.error('❌ Categories query failed:', categoriesError);
        } else {
          setStatus(`✅ Connected! Found ${productsData?.length || 0} products and ${categoriesData?.length || 0} categories`);
          setProducts(productsData || []);
          setCategories(categoriesData || []);
        }
      } catch (error) {
        setStatus(`❌ Connection Error: ${error}`);
        console.error('❌ Database check error:', error);
      }
    };

    checkDatabase();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-bold text-lg mb-2">Database Status</h3>
      <p className="mb-4">{status}</p>
      
      {products.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold">Products ({products.length}):</h4>
          <ul className="text-sm space-y-1">
            {products.map((product, index) => (
              <li key={index}>• {product.name} - ₹{product.price}</li>
            ))}
          </ul>
        </div>
      )}
      
      {categories.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold">Categories ({categories.length}):</h4>
          <ul className="text-sm space-y-1">
            {categories.map((category, index) => (
              <li key={index}>• {category.name}</li>
            ))}
          </ul>
        </div>
      )}

      {products.length === 0 && categories.length === 0 && (
        <div className="bg-yellow-50 p-3 rounded border">
          <h4 className="font-semibold text-yellow-800">No Data Found</h4>
          <p className="text-sm text-yellow-700">
            Your database is empty. You need to load the sample data.
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>1. Go to Supabase Dashboard → SQL Editor</p>
            <p>2. Run the SQL script from load-sample-data.js</p>
            <p>3. Refresh this page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;
