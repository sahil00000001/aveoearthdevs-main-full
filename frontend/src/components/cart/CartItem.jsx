"use client";

import Image from "next/image";
import { useState } from "react";

// Close/Remove Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M18 6L6 18M6 6L18 18" 
      stroke="#999999" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Minus Icon
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.91669 7H11.0834" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Plus Icon  
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 2.91669V11.0834M2.91669 7H11.0834" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 200);
  };

  const itemSubtotal = (item.unit_price || 0) * (item.quantity || 1);
  
  // Get product image - try multiple sources for consistency
  const getProductImage = () => {
    if (item.product?.image) return item.product.image;
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].url;
    }
    return item.image || '/placeholder-product.jpg';
  };

  return (
    <div className={`px-4 py-4 transition-all duration-200 ${isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Product Info */}
        <div className="col-span-5 flex items-center gap-3">
          <div className="relative w-[80px] h-[80px] bg-center bg-cover bg-no-repeat rounded-lg overflow-hidden">
            <Image
              src={getProductImage()}
              alt={item.product_name || 'Product'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-poppins text-[#1a1a1a] text-sm font-normal">
              {item.product?.name || item.product_name || 'Product'}
            </h3>
          </div>
        </div>

        {/* Price */}
        <div className="col-span-2 text-center">
          <span className="font-poppins text-[#1a1a1a] text-sm font-normal">
            ₹{(item.unit_price || 0).toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="col-span-3 flex justify-center">
          <div className="bg-white border border-[#e6e6e6] rounded-[170px] p-1.5 flex items-center gap-1.5">
            {/* Minus Button */}
            <button 
              onClick={() => handleQuantityChange((item.quantity || 1) - 1)}
              className="bg-[#f2f2f2] hover:bg-[#e8e8e8] rounded-full w-[28px] h-[28px] flex items-center justify-center transition-colors"
              disabled={(item.quantity || 1) <= 1}
            >
              <MinusIcon />
            </button>

            {/* Quantity Display */}
            <div className="font-poppins text-[#1a1a1a] text-sm font-normal w-8 text-center">
              {item.quantity || 1}
            </div>

            {/* Plus Button */}
            <button 
              onClick={() => handleQuantityChange((item.quantity || 1) + 1)}
              className="bg-[#f2f2f2] hover:bg-[#e8e8e8] rounded-full w-[28px] h-[28px] flex items-center justify-center transition-colors"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="col-span-1 text-center">
          <span className="font-poppins text-[#1a1a1a] text-sm font-medium">
            ₹{itemSubtotal.toFixed(2)}
          </span>
        </div>

        {/* Remove Button */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={handleRemove}
            className="w-5 h-5 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors"
            aria-label={`Remove ${item.product_name || 'product'} from cart`}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
