"use client";

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="19.2" height="19.2" viewBox="0 0 19.2 19.2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4.209 4.412L15.583 15.175" 
      stroke="#858c94" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      transform="rotate(180 9.6 9.6)"
    />
  </svg>
);

// Progress tracker icons
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OrderDetails({ orderData, onBack }) {
  // Sample data - replace with actual order data
  const defaultOrderData = {
    orderId: "#4152",
    orderDate: "21 October, 2025",
    productCount: 3,
    paymentMethod: "Paypal",
    status: "processing", // "received", "processing", "onway", "delivered"
    billingAddress: {
      name: "Ravi Garg",
      address: "4140 Punjab Rd. Janak Puri , New Delhi 110034",
      email: "ravi@gmail.com",
      phone: "+91-9565845845"
    },
    shippingAddress: {
      name: "Ravina Garg", 
      address: "4140 Punjab Rd. Janak Puri , New Delhi 110034",
      email: "ravina@gmail.com",
      phone: "+91-9565845845"
    },
    products: [
      {
        id: 1,
        name: "Wood Spoon",
        image: "/spoons.png",
        price: 100,
        quantity: 5,
        subtotal: 500
      },
      {
        id: 2,
        name: "Wood Spoon",
        image: "/spoons.png", 
        price: 100,
        quantity: 2,
        subtotal: 200
      },
      {
        id: 3,
        name: "Wood Spoon",
        image: "/spoons.png",
        price: 100,
        quantity: 10,
        subtotal: 1000
      }
    ],
    pricing: {
      subtotal: 170,
      discount: "20%",
      shipping: "Free",
      total: 170
    },
    changeDeadline: "21 October, 2025"
  };

  const order = orderData || defaultOrderData;

  const progressSteps = [
    { key: "received", label: "Order received", completed: true },
    { key: "processing", label: "Processing", completed: order.status === "processing" || order.status === "onway" || order.status === "delivered" },
    { key: "onway", label: "On the way", completed: order.status === "onway" || order.status === "delivered" },
    { key: "delivered", label: "Delivered", completed: order.status === "delivered" }
  ];

  return (
    <div className="min-h-screen bg-[#e1e4e3] relative">
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-16 xl:px-[62px] pb-8">
        {/* Go Back Button */}
        <div className="mb-4 pt-4">
          <button 
            onClick={onBack}
            className="bg-white border border-[#b8b8b8] rounded-[4.8px] px-[25.6px] py-[12px] flex items-center gap-[25.6px] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon />
            <span className="font-poppins font-medium text-[#484848] text-[14.4px]">Go back</span>
          </button>
        </div>

        {/* Order Details Container */}
        <div className="bg-white rounded-[8px] border border-[#e6e6e6] max-w-[984px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6] rounded-t-[8px]">
            <div className="flex items-center gap-2 text-nowrap">
              <h1 className="font-poppins font-medium text-[#1a1a1a] text-[20px] leading-[1.5]">
                Order Details
              </h1>
              <span className="font-poppins font-regular text-[#4d4d4d] text-[14px]">•</span>
              <span className="font-poppins font-regular text-[#4d4d4d] text-[14px]">
                {order.orderDate}
              </span>
              <span className="font-poppins font-regular text-[#4d4d4d] text-[14px]">•</span>
              <span className="font-poppins font-regular text-[#4d4d4d] text-[14px]">
                {order.productCount} Products
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-poppins font-regular text-[#4d4d4d] text-[14px]">
                till {order.changeDeadline}
              </span>
              <button className="bg-[#7e7e7e] hover:bg-[#6e6e6e] text-white font-poppins font-semibold text-[11.2px] px-7 py-[11.2px] rounded-[43px] transition-colors">
                Make Changes to Your Order
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Billing & Shipping Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Side - Addresses */}
              <div className="bg-white border border-[#e6e6e6] rounded-[6px] p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Billing Address */}
                  <div>
                    <h3 className="font-poppins font-medium text-[#999999] text-[14px] uppercase tracking-[0.42px] mb-6">
                      Billing Address
                    </h3>
                    <div className="space-y-4">
                      <p className="font-poppins font-regular text-[#1a1a1a] text-[16px] leading-[1.5]">
                        {order.billingAddress.name}
                      </p>
                      <p className="font-poppins font-regular text-[#666666] text-[14px] leading-[1.5]">
                        {order.billingAddress.address}
                      </p>
                      <div>
                        <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1">
                          Email
                        </p>
                        <p className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                          {order.billingAddress.email}
                        </p>
                      </div>
                      <div>
                        <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1">
                          Phone
                        </p>
                        <p className="font-poppins font-regular text-[#1a1a1a] text-[16px] leading-[1.5]">
                          {order.billingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-l border-[#e6e6e6] pl-6">
                    <h3 className="font-poppins font-medium text-[#999999] text-[14px] uppercase tracking-[0.42px] mb-6">
                      Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <p className="font-poppins font-regular text-[#1a1a1a] text-[16px] leading-[1.5]">
                        {order.shippingAddress.name}
                      </p>
                      <p className="font-poppins font-regular text-[#666666] text-[14px] leading-[1.5]">
                        {order.shippingAddress.address}
                      </p>
                      <div>
                        <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1">
                          Email
                        </p>
                        <p className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                          {order.shippingAddress.email}
                        </p>
                      </div>
                      <div>
                        <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1">
                          Phone
                        </p>
                        <p className="font-poppins font-regular text-[#1a1a1a] text-[16px] leading-[1.5]">
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Order Info */}
              <div className="bg-white border border-[#e6e6e6] rounded-[6px]">
                {/* Order ID & Payment */}
                <div className="flex items-center gap-5 px-5 py-[18px]">
                  <div>
                    <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1.5">
                      Order ID:
                    </p>
                    <p className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5] w-20">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-[#e6e6e6]"></div>
                  <div>
                    <p className="font-poppins font-medium text-[#999999] text-[12px] uppercase tracking-[0.36px] mb-1.5">
                      Payment Method:
                    </p>
                    <p className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5] w-32">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#e6e6e6]"></div>

                {/* Pricing */}
                <div className="px-5 py-[18px] space-y-1">
                  <div className="flex justify-between items-center pb-3">
                    <span className="font-poppins font-regular text-[#666666] text-[14px] leading-[1.5]">
                      Subtotal:
                    </span>
                    <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                      ₹{order.pricing.subtotal}
                    </span>
                  </div>
                  <div className="h-px bg-[#e6e6e6]"></div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="font-poppins font-regular text-[#666666] text-[14px] leading-[1.5]">
                      Discount
                    </span>
                    <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                      {order.pricing.discount}
                    </span>
                  </div>
                  <div className="h-px bg-[#e6e6e6]"></div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="font-poppins font-regular text-[#666666] text-[14px] leading-[1.5]">
                      Shipping
                    </span>
                    <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                      {order.pricing.shipping}
                    </span>
                  </div>
                  <div className="h-px bg-[#e6e6e6]"></div>
                  
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-poppins font-regular text-[#1a1a1a] text-[18px] leading-[1.5]">
                      Total
                    </span>
                    <span className="font-poppins font-semibold text-[#7e7e7e] text-[18px] leading-[1.5]">
                      ₹{order.pricing.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-[#e6e6e6] rounded-full">
                  <div 
                    className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(progressSteps.filter(step => step.completed).length - 1) * 33.33}%` 
                    }}
                  ></div>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center relative z-10">
                  {progressSteps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-center transition-colors ${
                        step.completed 
                          ? 'bg-[#4CAF50] text-white' 
                          : 'bg-white border-2 border-[#666666] text-[#666666]'
                      }`}>
                        {step.completed && index === 0 ? (
                          <CheckIcon />
                        ) : (
                          <span className="font-poppins font-medium text-[14px]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <p className={`font-poppins text-[14px] text-center mt-4 ${
                        step.completed ? 'font-medium text-[#333333]' : 'font-regular text-[#666666]'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              {/* Products Header */}
              <div className="bg-[#f2f2f2] h-9 flex items-center px-5 mb-4">
                <div className="grid grid-cols-12 gap-4 w-full">
                  <div className="col-span-5">
                    <span className="font-poppins font-medium text-[#4d4d4d] text-[12px] uppercase tracking-[0.36px]">
                      Product
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-poppins font-medium text-[#4d4d4d] text-[12px] uppercase tracking-[0.36px]">
                      Price
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="font-poppins font-medium text-[#4d4d4d] text-[12px] uppercase tracking-[0.36px]">
                      Quantity
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-poppins font-medium text-[#4d4d4d] text-[12px] uppercase tracking-[0.36px]">
                      Subtotal
                    </span>
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={product.id}>
                    <div className="grid grid-cols-12 gap-4 items-center px-5 py-4">
                      <div className="col-span-5 flex items-center gap-3">
                        <div 
                          className="w-[70px] h-[70px] bg-center bg-cover bg-no-repeat rounded"
                          style={{ backgroundImage: `url('${product.image}')` }}
                        />
                        <span className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                          {product.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                          ₹{product.price}
                        </span>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                          x{product.quantity}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-poppins font-medium text-[#1a1a1a] text-[14px] leading-[1.5]">
                          ₹{product.subtotal}
                        </span>
                      </div>
                    </div>
                    {index < order.products.length - 1 && (
                      <div className="h-px bg-[#e6e6e6] mx-5"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
