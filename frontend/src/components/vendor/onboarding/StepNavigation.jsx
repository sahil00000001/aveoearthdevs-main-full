import React from 'react';

export default function StepNavigation({ currentStep }) {
  if (currentStep < 3 || currentStep > 5) return null;

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white rounded-full p-[5px] flex gap-1.5">
        <div className={`${currentStep === 3 ? 'bg-[#b6e4ca]' : 'bg-[#ececec]'} rounded-full px-[17px] py-1.5`}>
          <span className="font-reem text-[10px] text-black tracking-[0.2px]">
            Product Info
          </span>
        </div>
        <div className={`${currentStep === 4 ? 'bg-[#b6e4ca]' : 'bg-[#ececec]'} rounded-full px-[11px] py-1.5`}>
          <span className="font-reem text-[10px] text-black tracking-[0.2px]">
            Inventory
          </span>
        </div>
        <div className={`${currentStep === 5 ? 'bg-[#b6e4ca]' : 'bg-[#ececec]'} rounded-full px-[12.5px] py-1.5`}>
          <span className="font-reem text-[10px] text-black tracking-[0.2px]">
            Sustainability
          </span>
        </div>
      </div>
    </div>
  );
}
