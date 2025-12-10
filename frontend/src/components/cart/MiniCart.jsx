"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCart } from "../../hooks/useCart";

// Cart icon
const CartIcon = ({ color = "black" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function MiniCart() {
  const { cart, cartCount, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actualCartCount = cartCount || cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleProceedToCart = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative focus:outline-none"
      >
        <CartIcon />
        {actualCartCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-[#502c0a] text-white rounded-full w-[16px] h-[16px] flex items-center justify-center text-[10px] font-medium">
            {actualCartCount}
          </div>
        )}
      </button>

      {/* Mini cart dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-gradient-to-br from-[#f8fdf8] to-[#e8f5e8] border border-[#4a7c28] rounded-lg shadow-lg z-50">
            <div className="p-3 sm:p-4 border-b border-[#4a7c28]">
              <h3 className="font-poppins font-semibold text-[#1a3d0a] text-sm sm:text-base">
                Shopping Cart ({actualCartCount})
              </h3>
            </div>
            
            {cart?.items?.length > 0 ? (
              <>
                <div className="max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-2 sm:p-3 border-b border-[#d4e6c7] flex items-center gap-2 sm:gap-3 hover:bg-[#f0f8f0] transition-colors">
                      <img 
                        src={item.product?.image || item.product?.images?.[0]?.url || item.image || '/placeholder-product.jpg'} 
                        alt={item.product?.name || item.product_name || 'Product'}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-[#4a7c28]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-[#1a3d0a] truncate">{item.product?.name || item.product_name || 'Product'}</h4>
                        <p className="text-xs text-[#4a7c28]">₹{(item.unit_price || 0).toFixed(2)} × {item.quantity || 1}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8b4513] hover:text-[#a0522d] text-sm sm:text-xs p-1 rounded-full hover:bg-[#f0f8f0] transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm sm:text-base text-[#1a3d0a]">
                      Total: ₹{(cart.total_amount || cart.total || cart.items?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleProceedToCart}
                    className="w-full bg-gradient-to-r from-[#4a7c28] to-[#2d5016] text-white py-2 px-4 rounded-md text-sm font-medium hover:from-[#3d6b1f] hover:to-[#1a3d0a] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View Cart
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 sm:p-6 text-center">
                <p className="text-[#4a7c28] text-sm mb-3">Your cart is empty</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/explore');
                  }}
                  className="text-[#2d5016] hover:text-[#1a3d0a] text-sm font-medium bg-[#f0f8f0] hover:bg-[#e8f5e8] px-4 py-2 rounded-md transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
