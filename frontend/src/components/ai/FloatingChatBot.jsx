"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DraggableChatModal from "./DraggableChatModal";
import { auth, tokens } from "../../lib/api";

const FloatingChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userType, setUserType] = useState("buyer");
  const [isClient, setIsClient] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const pathname = usePathname();

  const isVendorDashboard = pathname?.startsWith('/vendor');

  const calculateModalPosition = () => {
    if (typeof window === 'undefined') return { x: 50, y: 50 };
    
    const modalWidth = 400;
    const modalHeight = 500;
    const buttonSize = 160;
    const margin = 24;
    
    const x = window.innerWidth - modalWidth - margin;
    const y = window.innerHeight - modalHeight - buttonSize - margin - 24;
    
    return {
      x: Math.max(margin, x),
      y: Math.max(margin, y)
    };
  };

  useEffect(() => {
    setIsClient(true);
    const userTokens = tokens.get();
    const loggedIn = !!userTokens?.access_token;
    
    if (loggedIn && userTokens?.access_token) {
      auth.getProfile(userTokens.access_token)
        .then(profile => {
          if (profile?.user_type === 'supplier') {
            setUserType('supplier');
          } else {
            setUserType('buyer');
          }
        })
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
          setUserType('buyer');
        });
    }
  }, []);

  if (!isClient) return null;

  return (
    <>
      <div
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 w-40 h-40 flex items-center justify-center group cursor-pointer"
        title="AI Assistant"
        style={{ 
          border: 'none', 
          padding: 0, 
          background: 'transparent',
          backgroundColor: 'transparent',
          outline: 'none',
          boxShadow: 'none'
        }}
      >
        {!videoError ? (
          <video
            src="/AveoBuddy.mp4"
            width={160}
            height={160}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              console.error('Failed to load AveoBuddy.mp4');
              setVideoError(true);
            }}
            className="w-full h-full object-contain"
            style={{ 
              border: 'none', 
              background: 'transparent',
              backgroundColor: 'transparent',
              outline: 'none',
              display: 'block'
            }}
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        )}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full opacity-80 animate-pulse"></div>
      </div>

      <DraggableChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        userType={isVendorDashboard ? "supplier" : userType}
        initialPosition={calculateModalPosition()}
      />
    </>
  );
};

export default FloatingChatBot;
