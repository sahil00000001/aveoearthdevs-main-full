import React from 'react';

export default function OnboardingHeader() {
  return (
    <>
      {/* Header with Logo */}
      <div className="flex justify-center items-center pt-16 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-[42px] bg-contain bg-no-repeat bg-center">
            <img 
              src="/logo.png" 
              alt="AveoEarth Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-reem text-[48px] text-black">
            AveoEarth
          </h1>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center mb-12">
        <h2 className="font-poppins text-[24px] text-black">
          Conscious commerce, frictionless for you
        </h2>
      </div>
    </>
  );
}
