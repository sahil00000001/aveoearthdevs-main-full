"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, tokens } from "../../lib/api";

export default function UserProfilePopup({ isOpen, onClose, isLoggedIn, userProfile }) {
  const popupRef = useRef(null);
  const router = useRouter();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignUpClick = () => {
    router.push("/signup");
    onClose();
  };

  const handleSupplierClick = () => {
    router.push("/vendor/onboarding");
    onClose();
  };

  const handleLogout = () => {
    tokens.clear();
    router.push("/");
    onClose();
  };

  // Check if user is a seller/supplier (vendor)
  const isVendor = userProfile?.user_metadata?.user_type === 'supplier' || 
                   userProfile?.user_metadata?.user_type === 'seller' ||
                   userProfile?.user_type === 'supplier' ||
                   userProfile?.user_type === 'seller';

  // Get user's first name or email
  const userName = userProfile?.first_name || 
                   userProfile?.name || 
                   userProfile?.email?.split('@')[0] || 
                   'User';

  return (
    <div 
      ref={popupRef}
      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-[8px] shadow-lg border border-gray-200 w-[200px]"
      style={{ minWidth: "200px" }}
    >
      {!isLoggedIn ? (
        <div className="p-4">
          {/* Hello User */}
          <div className="mb-2">
            <p className="font-poppins font-medium text-[16px] text-black text-left">
              Hello User
            </p>
          </div>

          {/* Sign up message */}
          <div className="mb-4">
            <p className="font-poppins font-medium text-[12px] text-[#595959] leading-[16px]">
              Sign up to access your AveoEarth Accounts
            </p>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUpClick}
            className="w-full bg-[rgba(36,28,23,0.9)] text-white rounded-[5px] h-9 mb-4 
                     flex items-center justify-center font-poppins font-medium text-[10px] 
                     hover:bg-[#241c17] transition-colors"
          >
            Sign Up
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-gray-200 mb-4"></div>

          {/* Become a Supplier */}
          <button
            onClick={handleSupplierClick}
            className="w-full text-center font-poppins font-medium text-[10px] text-black 
                     leading-[16px] hover:text-[#241c17] transition-colors"
          >
            Become a Supplier
          </button>
        </div>
      ) : (
        <div className="p-4">
          {/* Hello User with name */}
          <div className="mb-3">
            <p className="font-poppins font-medium text-[16px] text-black text-left">
              Hello {userName}
            </p>
          </div>

          <hr className="border-gray-200 mb-3" />

          {/* Menu Options */}
          <div className="space-y-2">
            <Link 
              href="/account/dashboard" 
              className="flex items-center gap-2 px-2 py-2 font-poppins font-medium text-[12px] text-black hover:bg-gray-50 hover:text-[#241c17] transition-colors rounded-md"
              onClick={onClose}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </Link>
            
            <Link 
              href="/account/settings" 
              className="flex items-center gap-2 px-2 py-2 font-poppins font-medium text-[12px] text-black hover:bg-gray-50 hover:text-[#241c17] transition-colors rounded-md"
              onClick={onClose}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Settings
            </Link>

            {isVendor && (
              <Link 
                href="/vendor/dashboard" 
                className="flex items-center gap-2 px-2 py-2 font-poppins font-medium text-[12px] text-black hover:bg-gray-50 hover:text-[#241c17] transition-colors rounded-md"
                onClick={onClose}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Vendor Dashboard
              </Link>
            )}

            <hr className="border-gray-200" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-2 w-full text-left font-poppins font-medium text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-md"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
