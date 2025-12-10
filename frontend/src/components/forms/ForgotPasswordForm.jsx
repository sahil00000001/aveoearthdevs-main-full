"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "../../lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      const result = await auth.forgotPassword(email);
      setMessage(result?.message || "If your email exists, we've sent you a reset link.");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
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
            <span className="font-['Beth_Ellen',cursive] font-normal">Forgot </span>
            <span className="font-normal">password</span>
          </h1>
          <p className="text-[#09101d] opacity-60 text-base">Enter your email to receive a reset link.</p>
        </div>

        <div className="max-w-md mx-auto">
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block px-4 py-0 mb-2">
                <span className="text-[#09101d] text-base font-semibold opacity-80">Email Address</span>
                <span className="text-[#da1414] text-[13px] opacity-80">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50 disabled:opacity-50"
                placeholder="you@example.com"
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit" 
                disabled={isLoading}
                className="bg-[#502c0a] text-white px-[54px] py-4 rounded-[62px] text-base font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </div>
            
            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-[#09101d] text-[13px] leading-[20px] opacity-60">
                Remembered it?{" "}
                <Link href="/login" className="font-bold text-[#502c0a]">
                  Back to login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
