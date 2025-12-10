"use client";

import { useRef, useState } from "react";

export default function OTPVerification({ length = 6, onVerify }) {
  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === length) {
      onVerify?.(otp);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button className="flex items-center text-[#2c3a4b] hover:text-[#502c0a] font-semibold text-base">
            <div className="w-3 h-2 mr-2 rotate-90">
              <svg viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 4L0 0H7L3.5 4Z" fill="currentColor"/>
              </svg>
            </div>
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-[#09101d] mb-4">
            <span className="font-['Beth_Ellen',cursive] font-normal">Verify </span>
            <span className="font-normal">OTP</span>
          </h1>
          <p className="text-[#09101d] opacity-60 text-base mb-6">
            We sent a {length}-digit code to your WhatsApp. Enter it below to verify your account.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block px-4 py-0 mb-2">
                <span className="text-[#09101d] text-base font-semibold opacity-80">OTP Code</span>
                <span className="text-[#da1414] text-[13px] opacity-80">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp((e.target.value || "").replace(/\D/g, "").slice(0, length))}
                className="w-full tracking-widest text-center text-lg px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                placeholder={"•".repeat(length)}
                pattern={`[0-9]{${length}}`}
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button 
                type="submit" 
                disabled={otp.length !== length}
                className="bg-[#502c0a] text-white px-[54px] py-4 rounded-[62px] text-base font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
