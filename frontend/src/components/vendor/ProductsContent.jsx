import React, { useState } from 'react';
import ProductsHeader from './products/ProductsHeader';
import ProductsSearch from './products/ProductsSearch';
import ProductsTable from './products/ProductsTable';

export default function ProductsContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductAdded = (product) => {
    // Trigger a refresh of the products table
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-white w-full h-full p-4 sm:p-7 pb-4">
      <div className="w-full">
        <ProductsHeader onProductAdded={handleProductAdded} />
        <ProductsSearch />
        <ProductsTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
