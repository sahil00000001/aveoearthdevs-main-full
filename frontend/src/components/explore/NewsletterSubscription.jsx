"use client";

import { useState } from "react";

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.3334 5.00001C18.3334 4.08334 17.5834 3.33334 16.6667 3.33334H3.33341C2.41675 3.33334 1.66675 4.08334 1.66675 5.00001M18.3334 5.00001V15C18.3334 15.9167 17.5834 16.6667 16.6667 16.6667H3.33341C2.41675 16.6667 1.66675 15.9167 1.66675 15V5.00001M18.3334 5.00001L10.0001 10.8333L1.66675 5.00001"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail("");
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <div className="bg-[#eaeaea] px-6 py-12 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-poppins font-bold text-[24px] lg:text-[32px] text-[#272727] mb-3">
              Thank You for Subscribing!
            </h2>
            <p className="font-poppins text-[16px] text-[#4d4d4d] max-w-2xl mx-auto">
              You'll be the first to know about our latest eco-friendly products and exclusive offers.
            </p>
          </div>
          <button
            onClick={() => setIsSubscribed(false)}
            className="font-poppins text-[14px] text-[#4d4d4d] hover:text-[#272727] underline transition-colors"
          >
            Subscribe with different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#eaeaea] px-6 py-12 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-poppins font-bold text-[24px] lg:text-[32px] text-[#272727] mb-3">
            Stay Updated with Eco-Friendly Products
          </h2>
          <p className="font-poppins text-[16px] text-[#4d4d4d] max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to discover sustainable products, 
            exclusive discounts, and eco-living tips delivered straight to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <EmailIcon />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-neutral-300 border border-[#272727] text-[#272727] placeholder-[#666666] pl-12 pr-24 py-4 rounded-full font-poppins text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1a4032] hover:bg-[#0f2a1d] disabled:bg-[#404040] disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-poppins font-semibold text-[14px] flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="font-poppins text-[12px] text-[#999999]">
            By subscribing, you agree to receive marketing emails from AveoEarth. 
            You can unsubscribe at any time.{" "}
            <a href="/privacy" className="text-[#e6e6e6] hover:text-white underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
