"use client";

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

// Sample images - replace with actual product images
const sampleImages = {
  chiaSeeds: "/spoons.png", // Replace with actual chia seeds image
  woodenChair: "/sample1.jpg", // Replace with actual wooden chair image
  checkIcon: "/bookmark.svg" // Use existing check icon or replace with specific one
};

export default function OrderConfirmation({ orderData, onContinueShopping, onGoBack, onOrderDetails, onMakeChanges }) {
  // Sample order data - replace with actual order data passed from parent
  const defaultOrderData = {
    orderNumber: "OR-001",
    customerEmail: "ravi@gmail.com",
    items: [
      {
        id: 1,
        name: "Chia Seeds",
        quantity: "1kg",
        price: 50.00,
        image: sampleImages.chiaSeeds
      },
      {
        id: 2,
        name: "Wooden Chair",
        quantity: "1",
        price: 500.00,
        image: sampleImages.woodenChair
      }
    ],
    subtotal: 550.00,
    shipping: 0, // Free shipping
    total: 550.00,
    amendDeadline: "Saturday 07 September 2025, 23:00"
  };

  const order = orderData || defaultOrderData;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-16 xl:px-[62px] pb-8">
        {/* Go Back Button */}
        <div className="mb-8 pt-4">
          <button 
            onClick={onGoBack}
            className="bg-white border border-[#b8b8b8] rounded-[4.8px] px-[25.6px] py-[12px] flex items-center gap-[25.6px] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon />
            <span className="font-poppins font-medium text-[#484848] text-[14.4px]">Go back</span>
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 max-w-[1440px] mx-auto">
          {/* Left Column - Success Message and Actions */}
          <div className="flex-1 flex flex-col items-center">
            {/* Success Icon */}
            <div className="w-[74px] h-[74px] mb-6">
              <svg viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37 74C57.435 74 74 57.435 74 37C74 16.565 57.435 0 37 0C16.565 0 0 16.565 0 37C0 57.435 16.565 74 37 74Z" fill="#4CAF50"/>
                <path d="M20 37L32 49L54 25" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="font-poppins font-semibold text-[#1a1a1a] text-[32px] text-center leading-[1.2] mb-6">
              Your Order has been placed
            </h1>

            {/* Order Details */}
            <div className="bg-white border border-[#e6e6e6] rounded-[6px] p-5 mb-6 w-full max-w-[484px]">
              <div className="text-center">
                <p className="font-poppins font-regular text-[#999999] text-[16px] leading-[1.3] mb-1">
                  Your Order number is {order.order_number || order.orderNumber || 'N/A'}
                </p>
                <p className="font-poppins font-regular text-[#999999] text-[16px] leading-[1.3]">
                  A confirmation of your order has been sent to {order.customerEmail || 'your email'}
                </p>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <button 
              onClick={onContinueShopping}
              className="bg-[#272727] hover:bg-[#1a1a1a] text-white font-poppins font-semibold text-[16px] px-10 py-4 rounded-[43px] transition-colors w-full max-w-[495px]"
            >
              Continue Shopping
            </button>
          </div>

          {/* Right Column - Order Summary and Additional Info */}
          <div className="xl:w-[424px] flex flex-col gap-6">
            {/* Order Summary */}
            <div className="bg-white border border-[#e6e6e6] rounded-[8px] p-6">
              <h2 className="font-poppins font-medium text-[#1a1a1a] text-[20px] leading-[1.5] mb-6">
                Order Summary
              </h2>

              {/* Product List */}
              <div className="space-y-4 mb-6">
                {(order?.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-[60px] h-[60px] bg-center bg-cover bg-no-repeat rounded"
                        style={{ backgroundImage: `url('${item.product?.images?.[0]?.url || '/placeholder-product.jpg'}')` }}
                      />
                      <span className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                        {item.product?.name || 'Product'}
                      </span>
                      <span className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                        x {item.quantity || 1}
                      </span>
                    </div>
                    <div className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                      ₹{((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between items-center py-3 border-b border-[#e6e6e6]">
                  <span className="font-poppins font-regular text-[#4d4d4d] text-[14px] leading-[1.5]">
                    Subtotal:
                  </span>
                  <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                    ₹{(order.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-[#e6e6e6]">
                  <span className="font-poppins font-regular text-[#4d4d4d] text-[14px] leading-[1.5]">
                    Shipping:
                  </span>
                  <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                    {(order.shipping_amount || 0) === 0 ? 'Free' : `₹${(order.shipping_amount || 0).toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <span className="font-poppins font-regular text-[#4d4d4d] text-[16px] leading-[1.5]">
                    Total:
                  </span>
                  <span className="font-poppins font-semibold text-[#1a1a1a] text-[18px] leading-[1.2]">
                    ₹{(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Details Button */}
              <button 
                onClick={onOrderDetails}
                className="w-full bg-[#7e7e7e] hover:bg-[#6e6e6e] text-white font-poppins font-semibold text-[16px] px-10 py-4 rounded-[43px] transition-colors mt-6"
              >
                Order Details
              </button>
            </div>

            {/* Amendment Notice */}
            <div className="bg-white border border-[#e6e6e6] rounded-[6px] p-6">
              <div className="text-center mb-4">
                <p className="font-poppins font-regular text-[#999999] text-[16px] leading-[1.3] mb-1">
                  You can amend or cancel your order until:
                </p>
                <p className="font-poppins font-bold text-black text-[16px] leading-[1.3]">
                  {order.amendDeadline || '24 hours from order placement'}
                </p>
              </div>

              <button 
                onClick={onMakeChanges}
                className="w-full bg-[#7e7e7e] hover:bg-[#6e6e6e] text-white font-poppins font-semibold text-[16px] px-10 py-4 rounded-[43px] transition-colors mb-4"
              >
                Make Changes to Your Order
              </button>

              <p className="font-poppins font-regular text-[#999999] text-[16px] leading-[1.3] text-center">
                You can also make changes to your order via{' '}
                <span className="text-black underline cursor-pointer">My Orders</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}