import React from 'react';
import Link from "next/link";

export default function OnboardingActions({ currentStep, handleSubmit, handleGoBack, hideActions = false, isBusinessStep = false }) {
  // Don't render actions if hideActions is true (e.g., for Step 1 signup)
  if (hideActions) {
    return null;
  }

  const getButtonText = () => {
    if (currentStep === 5) return 'Complete Setup';
    if (isBusinessStep) return 'Save Business Info';
    return 'Continue';
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-12 px-4">
        {/* Go Back Button */}
        {currentStep > 1 && (
          <button
            onClick={handleGoBack}
            className="bg-white border border-[#b8b8b8] hover:bg-gray-50 text-[#484848] 
                     px-8 py-4 rounded-[6px] h-[62px] w-[178px]
                     flex items-center justify-center gap-3
                     font-poppins font-medium text-[18px] transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Go back
          </button>
        )}

        {/* Next/Submit Button */}
        <button
          onClick={handleSubmit}
          className={`bg-[#174e38] hover:bg-[#0f2419] active:bg-[#083318] text-white 
                   px-[54px] py-4 rounded-[6px] h-[62px] ${currentStep > 1 ? 'w-[244px]' : 'w-[426px]'}
                   flex items-center justify-center gap-3 overflow-hidden
                   font-poppins font-medium text-[18px] leading-[0] transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:ring-opacity-50
                   ${currentStep === 1 ? 'mx-auto' : 'ml-auto'}`}
        >
          <span className="font-poppins font-medium text-[18px] text-white whitespace-pre">
            {getButtonText()}
          </span>
          {currentStep > 1 && (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Sign In Link */}
      <div className="text-center mt-8 pb-[72px]">
        <p className="text-[13px] text-[#09101d] opacity-60">
          Already have an account?{" "}
          <Link 
            href="/vendor" 
            className="font-bold text-[rgba(26,64,50,0.9)] hover:text-[#1a4032]"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </>
  );
}
