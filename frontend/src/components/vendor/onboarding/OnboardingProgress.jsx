import React from 'react';

export default function OnboardingProgress({ currentStep, totalSteps = 5 }) {
  return (
    <div className="max-w-[890px] mx-auto mb-8 px-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-poppins font-medium text-[14px] text-black">
          Account Setup
        </span>
        <span className="font-poppins font-medium text-[14px] text-black">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full h-3 bg-[#d9f2e2] rounded-[20px]">
        <div 
          className="h-full bg-[#217a54] rounded-[20px] transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
