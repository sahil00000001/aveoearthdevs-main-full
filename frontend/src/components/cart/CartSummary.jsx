"use client";

export default function CartSummary({ subtotal, shipping, total, onCheckout }) {
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Default behavior
      console.log("Proceeding to checkout with total:", total);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#e6e6e6] p-5">
      {/* Title */}
      <h2 className="font-poppins font-medium text-[#1a1a1a] text-lg mb-5">
        Cart Total
      </h2>

      {/* Summary Details */}
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between py-2 border-b border-[#e6e6e6]">
          <span className="font-poppins text-[#4d4d4d] text-sm">
            Subtotal:
          </span>
          <span className="font-poppins font-medium text-[#1a1a1a] text-sm">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between py-2 border-b border-[#e6e6e6]">
          <span className="font-poppins text-[#4d4d4d] text-sm">
            Shipping:
          </span>
          <span className="font-poppins font-medium text-[#1a1a1a] text-sm">
            {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-2">
          <span className="font-poppins text-[#4d4d4d] text-sm">
            Total:
          </span>
          <span className="font-poppins font-semibold text-[#1a1a1a] text-base">
            ₹{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full bg-black hover:bg-[#333333] text-white font-poppins font-semibold text-sm px-8 py-3 rounded-[43px] mt-4 transition-colors"
      >
        Proceed to checkout
      </button>
    </div>
  );
}
