"use client";

import { useState } from "react";

export default function CouponCode({ value, onChange }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!value.trim()) return;
    
    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Applying coupon:", value);
      // Handle coupon application logic here
      setIsApplying(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleApplyCoupon();
  };

  return (
    <div className="bg-white rounded-lg border border-[#e6e6e6] p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Title */}
        <h3 className="font-poppins font-medium text-[#1a1a1a] text-lg whitespace-nowrap">
          Coupon Code
        </h3>

        {/* Input and Button */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          {/* Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter code"
              className="w-full bg-white border border-[#e6e6e6] rounded-[46px] px-5 py-3 font-poppins text-sm text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:border-[#333333] transition-colors"
            />
          </div>

          {/* Apply Button */}
          <button
            type="submit"
            disabled={!value.trim() || isApplying}
            className={`bg-[#333333] hover:bg-[#1a1a1a] disabled:bg-[#999999] disabled:cursor-not-allowed text-white font-poppins font-semibold text-sm px-6 py-3 rounded-[43px] whitespace-nowrap transition-colors ${
              isApplying ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {isApplying ? "Applying..." : "Apply Coupon"}
          </button>
        </form>
      </div>
    </div>
  );
}
