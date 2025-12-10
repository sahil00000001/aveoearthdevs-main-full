import React from 'react';

export default function StepHeader({ currentStep }) {
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Welcome to AveoEarth",
          description: "Lets start by setting up your supplier account. Join our community of sustainable businesses"
        };
      case 2:
        return {
          title: "Business and Sustainability Profile",
          description: "Tell us about your business structure and sustainability practices"
        };
      case 3:
      case 4:
      case 5:
        return {
          title: "Product information Wizard",
          description: "Add your product to get started on AevoEarth Marketplace"
        };
      default:
        return {
          title: "",
          description: ""
        };
    }
  };

  const { title, description } = getStepInfo();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1a4032]">
            <path fill="currentColor" d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z"/>
          </svg>
        </div>
        <h3 className="font-reem font-medium text-[16px] text-[#1a4032]">
          {title}
        </h3>
      </div>
      <p className="font-poppins text-[12px] text-[#272727]">
        {description}
      </p>
    </div>
  );
}
