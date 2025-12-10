"use client";

import { useState } from "react";

export default function CheckoutSummary({ cartItems = [], subtotal = 0, shipping = 0, total = 0, onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  const handlePlaceOrder = () => {
    if (!agreeToPolicies) {
      alert('Please agree to the Terms & Conditions, Privacy Policy, and Refund Policy to proceed with the payment.');
      return;
    }

    onPlaceOrder && onPlaceOrder({
      paymentMethod,
      cartItems,
      total
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#e6e6e6] sticky top-6">
      {/* Order Summary */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-xl">
            Order Summary
          </h3>
          
          {/* Product List */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-[60px] h-[60px] bg-center bg-cover bg-no-repeat rounded"
                    style={{ backgroundImage: `url('${item.product?.images?.[0]?.url || '/placeholder-product.jpg'}')` }}
                  />
                  <div className="flex flex-col">
                    <span className="font-poppins text-[#1a1a1a] text-sm">
                      {item.product?.name || 'Product'}
                    </span>
                    <span className="font-poppins text-[#1a1a1a] text-sm">
                      x {item.quantity || 1}
                    </span>
                  </div>
                </div>
                <div className="font-poppins font-medium text-[#1a1a1a] text-sm">
                  ₹{((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1">
            {/* Subtotal */}
            <div className="flex items-center justify-between py-3 border-t border-[#e6e6e6]">
              <span className="font-poppins text-[#4d4d4d] text-sm">
                Subtotal:
              </span>
              <span className="font-poppins font-medium text-[#1a1a1a] text-sm">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            
            {/* Shipping */}
            <div className="flex items-center justify-between py-3 border-t border-[#e6e6e6]">
              <span className="font-poppins text-[#4d4d4d] text-sm">
                Shipping:
              </span>
              <span className="font-poppins font-medium text-[#1a1a1a] text-sm">
                {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            
            {/* Total */}
            <div className="flex items-center justify-between pt-3">
              <span className="font-poppins text-[#4d4d4d] text-base">
                Total:
              </span>
              <span className="font-poppins font-semibold text-[#1a1a1a] text-lg">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-xl">
            Payment Method
          </h3>
          
          <div className="space-y-2.5">
            {/* Cash on Delivery */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 sr-only"
                />
                <div className="w-5 h-5 bg-white border-2 border-[#272727] rounded-full flex items-center justify-center">
                  {paymentMethod === "cod" && (
                    <div className="w-2 h-2 bg-[#272727] rounded-full" />
                  )}
                </div>
              </div>
              <label 
                htmlFor="cod" 
                className="font-poppins text-[#4d4d4d] text-sm cursor-pointer"
              >
                Cash on Delivery
              </label>
            </div>
            
            {/* PayPal */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 sr-only"
                />
                <div className="w-5 h-5 bg-white border border-[#cccccc] rounded-full flex items-center justify-center">
                  {paymentMethod === "paypal" && (
                    <div className="w-2 h-2 bg-[#272727] rounded-full" />
                  )}
                </div>
              </div>
              <label 
                htmlFor="paypal" 
                className="font-poppins text-[#4d4d4d] text-sm cursor-pointer"
              >
                Paypal
              </label>
            </div>
            
            {/* Amazon Pay */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="radio"
                  id="amazon"
                  name="paymentMethod"
                  value="amazon"
                  checked={paymentMethod === "amazon"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 sr-only"
                />
                <div className="w-5 h-5 bg-white border border-[#cccccc] rounded-full flex items-center justify-center">
                  {paymentMethod === "amazon" && (
                    <div className="w-2 h-2 bg-[#272727] rounded-full" />
                  )}
                </div>
              </div>
              <label 
                htmlFor="amazon" 
                className="font-poppins text-[#4c4c4c] text-sm cursor-pointer"
              >
                Amazon Pay
              </label>
            </div>
          </div>
        </div>

        {/* Policy Agreement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="policy-agreement-cart"
              checked={agreeToPolicies}
              onChange={(e) => setAgreeToPolicies(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="policy-agreement-cart" className="text-sm text-gray-700 cursor-pointer">
                I have reviewed the{' '}
                <a
                  href="/TermsandConditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline"
                >
                  Terms & Conditions
                </a>
                ,{' '}
                <a
                  href="/PrivacyPolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline"
                >
                  Privacy Policy
                </a>
                ,{' '}
                <a
                  href="/RefundsandCancellation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline"
                >
                  Shipping & Delivery and Refunds & Cancellation
                </a>{' '}
                policies and I agree to proceed with the payment.
              </label>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!agreeToPolicies}
          className="w-full bg-[#272727] text-white font-poppins font-semibold text-base py-4 rounded-[43px] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
