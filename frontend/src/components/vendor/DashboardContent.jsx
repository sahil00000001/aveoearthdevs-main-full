import React, { useState } from 'react';
import DashboardStats from './DashboardStats';
import InventoryContent from './InventoryContent';
import AddProductModal from './products/AddProductModal';

// Plus Icon Component
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardContent({ vendor }) {
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  return (
    <div className="bg-white relative w-full h-full">
      {/* Dashboard Content */}
      <div className="p-4 sm:p-7 pb-4">
        {/* Dashboard Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="font-poppins font-semibold text-[20px] sm:text-[24px] text-black tracking-[0.3px] mb-2">
            Dashboard
          </h1>
          <p className="font-poppins text-[14px] sm:text-[20px] text-[#757575] tracking-[0.3px]">
            Welcome back! here's your business overview
          </p>

          {/* Add Products Button */}
          <div className="absolute top-[20px] sm:top-[34px] right-4 sm:right-7">
            <button
              onClick={() => setShowNewProductModal(true)}
              className="bg-[#2f6b4f] h-[36px] sm:h-[38px] px-3 sm:px-4 rounded-[5px] flex items-center gap-2 sm:gap-3 text-white hover:bg-[#245a41] transition-colors"
            >
              <PlusIcon />
              <span className="font-poppins font-semibold text-[8px] sm:text-[10px] tracking-[0.3px]">
                Add Products
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats vendor={vendor} />

      {/* Inventory Section */}
      <div className="px-4 sm:px-7">
        <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <div>
              <h3 className="text-[14px] sm:text-[16px] font-inter font-semibold text-black mb-1">
                Inventory Overview
              </h3>
              <p className="text-[13px] sm:text-[15px] font-inter font-medium text-[#909090]">
                Quick view of your product inventory levels
              </p>
            </div>
            <button
              onClick={() => {
                // Navigate to full inventory page
                window.location.href = '/vendor/inventory';
              }}
              className="text-[#2f6b4f] hover:text-[#245a41] text-sm font-medium whitespace-nowrap"
            >
              View All →
            </button>
          </div>

          {/* Inventory Component */}
          <InventoryContent isCompact={true} />
        </div>
      </div>
      
      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={showNewProductModal} 
        onClose={() => setShowNewProductModal(false)} 
      />
    </div>
  );
}
