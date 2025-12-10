import React from 'react';
import { useRouter } from "next/navigation";

// Asset constants from Figma
const imgLogo3 = "http://localhost:3845/assets/cc2c57284e93c0a5a705fddbf8410e50b1a53fce.png";
const img = "http://localhost:3845/assets/ecdcafc622789eb388f22eedef9c5c05e7a8a155.svg";
const imgMaterialIconThemeParcel = "http://localhost:3845/assets/5ad6dc85177310e9a2fcaa59ad4f13a9e103d058.svg";
const imgAntDesignRiseOutlined = "http://localhost:3845/assets/ab9f0193c0be826dee9569e7e5cc7e0c8eafc3a6.svg";
const imgIconoirCommunity = "http://localhost:3845/assets/d5b8d91b498071b0d1a2b5c5a4bd3327c1e79cd3.svg";
const imgMaterialSymbolsRateReviewOutline = "http://localhost:3845/assets/3aef9e432994211738cc75eb6a0f2efda7e60d55.svg";
const imgEllipse4 = "http://localhost:3845/assets/71f06434a1fe1fa08c77e66af9cdd3c93c797e66.svg";

export default function OnboardingComplete() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header with Logo */}
      <div className="flex justify-center items-center pt-16 pb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-[42px] bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url('${imgLogo3}')` }}
          />
          <h1 className="font-reem text-[48px] text-black">
            AveoEarth
          </h1>
        </div>
        {/* AveoEarth Buddy */}
        <div className="absolute right-[179px] top-16">
          <div className="relative w-[90px] h-[90px]">
            <img 
              src={imgEllipse4} 
              alt="Aveo Buddy" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-8 px-4">
        <h2 className="font-poppins text-[20px] md:text-[24px] text-black max-w-[924px] mx-auto leading-relaxed">
          Your all set !, Welcome to the AevoEarth sustainable marketplace community
        </h2>
      </div>

      {/* Progress Bar - 100% Complete */}
      <div className="max-w-[890px] mx-auto mb-12 px-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-poppins font-medium text-[14px] text-black">
            Account Setup
          </span>
          <span className="font-poppins font-medium text-[14px] text-black">
            100% Complete
          </span>
        </div>
        <div className="w-full h-3 bg-[#d9f2e2] rounded-[20px]">
          <div className="h-full bg-[#217a54] rounded-[20px] w-full" />
        </div>
      </div>

      {/* Two Cards Section */}
      <div className="max-w-[1167px] mx-auto px-4 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-stretch">
        {/* Onboarding Complete Card */}
        <div className="bg-[#f8f8f8] rounded-[20px] border border-[#666666] p-6 lg:p-8 w-full lg:w-[515px] min-h-[371px] flex flex-col">
          <div className="mb-6">
            <h3 className="font-reem font-medium text-[18px] lg:text-[20px] text-black mb-3">
              Onboarding Complete
            </h3>
            <p className="font-poppins text-[12px] lg:text-[14px] text-[#717182]">
              Here's what you have accomplished
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {/* Account Setup */}
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 lg:w-7 lg:h-7 bg-[#1b6145] flex-shrink-0 mt-0.5"
                style={{
                  maskImage: `url('${img}')`,
                  maskSize: '18px 18px',
                  maskPosition: '2px 2px',
                  maskRepeat: 'no-repeat'
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Account Setup
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Basic Business Information
                </p>
              </div>
            </div>

            {/* Business Profile */}
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 lg:w-7 lg:h-7 bg-[#1b6145] flex-shrink-0 mt-0.5"
                style={{
                  maskImage: `url('${img}')`,
                  maskSize: '18px 18px',
                  maskPosition: '2px 2px',
                  maskRepeat: 'no-repeat'
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Business Profile
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Sustainability details and certifications
                </p>
              </div>
            </div>

            {/* First Product */}
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 lg:w-7 lg:h-7 bg-[#1b6145] flex-shrink-0 mt-0.5"
                style={{
                  maskImage: `url('${img}')`,
                  maskSize: '18px 18px',
                  maskPosition: '2px 2px',
                  maskRepeat: 'no-repeat'
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  First Product
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Product Information and Eco-story
                </p>
              </div>
            </div>

            {/* Ready to Sell */}
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 lg:w-7 lg:h-7 bg-[#1b6145] flex-shrink-0 mt-0.5"
                style={{
                  maskImage: `url('${img}')`,
                  maskSize: '18px 18px',
                  maskPosition: '2px 2px',
                  maskRepeat: 'no-repeat'
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Ready to Sell !
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  You are now a part of Evo Earth Community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-[#f8f8f8] rounded-[20px] border border-[#666666] p-6 lg:p-8 w-full lg:w-[515px] min-h-[371px] flex flex-col">
          <div className="mb-6">
            <h3 className="font-reem font-medium text-[18px] lg:text-[20px] text-black mb-3">
              What's Next
            </h3>
            <p className="font-poppins text-[12px] lg:text-[14px] text-[#717182]">
              Here's what you can do from your Dashboard
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {/* Manage Products */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0 mt-0.5">
                <img 
                  src={imgMaterialIconThemeParcel} 
                  alt="Manage Products" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Manage Products
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Add more Products, Update existing listings
                </p>
              </div>
            </div>

            {/* Track Performance */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0 mt-0.5">
                <img 
                  src={imgAntDesignRiseOutlined} 
                  alt="Track Performance" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Track Performance
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Monitor sales, analyze trends
                </p>
              </div>
            </div>

            {/* Connect with Community */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0 mt-0.5">
                <img 
                  src={imgIconoirCommunity} 
                  alt="Connect with Community" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Connect with Community
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Engage with other sustainable suppliers
                </p>
              </div>
            </div>

            {/* Application Under Review */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0 mt-0.5">
                <img 
                  src={imgMaterialSymbolsRateReviewOutline} 
                  alt="Application Under Review" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-poppins font-medium text-[12px] lg:text-[14px] text-black">
                  Application Under Review
                </h4>
                <p className="font-poppins text-[10px] lg:text-[12px] text-[#666666] mt-1 leading-relaxed">
                  Your application is under review. Check your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Awaits Section */}
      <div className="max-w-[1082px] mx-auto mt-8 lg:mt-12 px-4 pb-8">
        <div className="bg-[#f1f5ff] rounded-[20px] border-[0.5px] border-black p-6 lg:p-9 text-center">
          <h3 className="font-poppins font-medium text-[16px] lg:text-[18px] text-black mb-4 lg:mb-6">
            Your Dashboard Awaits
          </h3>
          <p className="font-poppins text-[14px] lg:text-[18px] text-black mb-6 lg:mb-8 leading-relaxed">
            Everything you need to manage your Sustainable Business at one place!
          </p>
          <button
            onClick={handleGoToDashboard}
            className="bg-gradient-to-r from-[#1f4d6e] to-[#35b481] text-white 
                     px-6 lg:px-8 py-3 lg:py-4 rounded-[6px] 
                     min-h-[48px] lg:h-[53px] min-w-[260px] w-auto
                     font-poppins font-medium text-[14px] lg:text-[16px] 
                     hover:shadow-lg transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:ring-opacity-50
                     inline-flex items-center justify-center whitespace-nowrap"
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
