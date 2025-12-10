"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Checkout from "../../components/checkout/Checkout";
import OrderConfirmation from "../../components/OrderConfirmation";
import { useOrders } from "../../hooks/useOrders";

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4.20996 4.412L9.79796 9.999L4.20996 15.587" 
      stroke="#858C94" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      transform="rotate(180 8 8)"
    />
  </svg>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { createOrder } = useOrders();
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handleGoBack = () => {
    if (isOrderConfirmed) {
      setIsOrderConfirmed(false);
      setOrderData(null);
    } else {
      router.push('/cart');
    }
  };

  const handlePlaceOrder = async (orderDetails) => {
    try {
      const result = await createOrder(orderDetails);
      setOrderData(result);
      setIsOrderConfirmed(true);
    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleContinueShopping = () => {
    router.push('/explore');
  };

  const handleOrderDetails = () => {
    if (orderData?.order_id) {
      router.push(`/account/orders/${orderData.order_id}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-16 pb-8">
        {/* Go Back Button */}
        <div className="mb-4 pt-4">
          <button 
            onClick={handleGoBack}
            className="bg-white border border-[#b8b8b8] rounded-[4.8px] px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
          >
            <ArrowLeftIcon />
            <span className="font-poppins font-medium text-[#484848]">Go back</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="font-poppins font-semibold text-[#1a1a1a] text-2xl leading-[1.2]">
            {isOrderConfirmed ? "Order Confirmation" : "Checkout"}
          </h1>
        </div>

        {/* Content */}
        {isOrderConfirmed ? (
          <OrderConfirmation 
            orderData={orderData}
            onContinueShopping={handleContinueShopping}
            onGoBack={handleGoBack}
            onOrderDetails={handleOrderDetails}
          />
        ) : (
          <Checkout 
            onGoBack={handleGoBack}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </div>

      {/* Footer - Only show when not in confirmation */}
      {!isOrderConfirmed && <Footer />}
    </div>
  );
}
