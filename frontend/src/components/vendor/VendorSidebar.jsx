import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DraggableChatModal from '../ai/DraggableChatModal';
import { tokens } from '../../lib/api';

// Dashboard Icon
const DashboardIcon = ({ color = "#202224" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
  </svg>
);

// Products Icon
const ProductsIcon = ({ color = "#202224" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Orders Icon
const OrdersIcon = ({ color = "#202224" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Logout Icon
const LogoutIcon = ({ color = "#202224" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17L21 12L16 7M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chat Icon
const ChatIcon = ({ color = "#202224" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="11" r="1" fill={color}/>
    <circle cx="8" cy="11" r="1" fill={color}/>
    <circle cx="16" cy="11" r="1" fill={color}/>
  </svg>
);

// Asset constants from Figma
const imgLogo2 = "http://localhost:3845/assets/cc2c57284e93c0a5a705fddbf8410e50b1a53fce.png";
const imgDivider = "http://localhost:3845/assets/32025f1bbc4ae0d2cad181a275b9877a06eb93f1.svg";
const imgHideBg = "http://localhost:3845/assets/2e2b44013b3695127826312507aa7bdb68efebb4.svg";

export default function VendorSidebar({ activeTab, setActiveTab, vendor }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const router = useRouter();
  
  const handleSignOut = () => {
    // Clear tokens
    tokens.clear();
    // Redirect to home page
    router.push('/');
  };
  
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "products", label: "Products", icon: ProductsIcon },
    { id: "orders", label: "Order Lists", icon: OrdersIcon },
    // { id: "analytics", label: "Inventory", icon: "☰" }
  ];

  const bottomItems = [
    { id: "chat", label: "AI Assistant", icon: ChatIcon, action: () => setIsChatOpen(true) },
    // { id: "settings", label: "Settings", icon: "⚙" },
    { id: "logout", label: "Logout", icon: LogoutIcon, action: handleSignOut }
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#666666] z-10 flex flex-col lg:w-60 md:w-64">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-5 shrink-0">
        <div
          className="w-[33.906px] h-[31.835px] bg-no-repeat bg-[50%_34.09%]"
          style={{
            backgroundImage: `url('${imgLogo2}')`,
            backgroundSize: '127.48% 135.77%'
          }}
        />
        <div className="font-eb-garamond font-semibold text-[20px] sm:text-[27.889px] text-black leading-normal">
          AveoEarth
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Top Navigation Items */}
        <div className="flex flex-col mt-4 sm:mt-8">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="h-[50px] relative px-3 sm:px-4">
                {/* Green side indicator for active item */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1b6145] rounded-r"></div>
                )}

                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-full flex items-center px-3 sm:px-4 transition-colors relative rounded-lg ${
                    isActive
                      ? 'bg-[#1b6145] text-white'
                      : 'text-[#202224] hover:bg-gray-50'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-6 sm:w-8 text-center mr-2 sm:mr-3">
                    {typeof item.icon === 'function' ? (
                      <item.icon color={isActive ? "white" : "#202224"} />
                    ) : (
                      <span className={`text-[18px] sm:text-[22px] ${isActive ? "text-white" : "text-[#202224]"}`}>
                        {item.icon}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`font-nunito font-semibold text-[12px] sm:text-[14px] tracking-[0.3px] ${
                    isActive ? "text-white" : "text-[#202224]"
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Items */}
        <div className="pb-4 sm:pb-6">
          {/* Divider */}
          <div className="h-[1px] mx-3 sm:mx-4 my-4">
            <img alt="" className="w-full h-full object-cover" src={imgDivider} />
          </div>

          {bottomItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="h-[50px] relative px-3 sm:px-4">
                {/* Green side indicator for active item */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1b6145] rounded-r"></div>
                )}

                <button
                  onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                  className={`w-full h-full flex items-center px-3 sm:px-4 transition-colors relative rounded-lg ${
                    isActive
                      ? 'bg-[#1b6145] text-white'
                      : item.id === 'chat'
                        ? 'text-[#1b6145] hover:bg-[#1b6145]/10 border border-[#1b6145]'
                        : 'text-[#202224] hover:bg-gray-50'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-6 sm:w-8 text-center mr-2 sm:mr-3">
                    {typeof item.icon === 'function' ? (
                      <item.icon color={
                        isActive
                          ? "white"
                          : item.id === 'chat'
                            ? "#1b6145"
                            : "#202224"
                      } />
                    ) : (
                      <span className={`text-[18px] sm:text-[22px] ${
                        isActive
                          ? "text-white"
                          : item.id === 'chat'
                            ? "text-[#1b6145]"
                            : "text-[#202224]"
                      }`}>
                        {item.icon}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`font-nunito font-semibold text-[12px] sm:text-[14px] tracking-[0.3px] ${
                    isActive
                      ? "text-white"
                      : item.id === 'chat'
                        ? "text-[#1b6145]"
                        : "text-[#202224]"
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Chat Modal */}
      {isChatOpen && (
        <DraggableChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userType="supplier"
        />
      )}
    </div>
  );
}
