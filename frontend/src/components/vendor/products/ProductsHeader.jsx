import { useState } from 'react';
import AddProductModal from './AddProductModal';

export default function ProductsHeader({ onProductAdded }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleProductAdded = (product) => {
    console.log('Product added:', product);
    if (onProductAdded) {
      onProductAdded(product);
    }
  };

  return (
    <>
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-[20px] sm:text-[24px] font-poppins font-medium text-black tracking-[0.3px] mb-2 sm:mb-4">
            Products
          </h1>
          <p className="text-[16px] sm:text-[20px] font-poppins text-[#757575] tracking-[0.3px]">
            Welcome back! here's your business overview
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1a4032] hover:bg-[#2d5a42] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add Product
        </button>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </>
  );
}
