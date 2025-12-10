"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { auth, tokens } from "../../lib/api";
import UserProfilePopup from "../ui/UserProfilePopup";
import MiniCart from "../cart/MiniCart";
import SearchAutocomplete from "../search/SearchAutocomplete";
import { useCart } from "../../hooks/useCart";

// SVG Icons as inline components
const ChevronDownIcon = ({ color = "#666666" }) => (
  <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 4L0 0H7L3.5 4Z" fill={color}/>
  </svg>
);

const CartIcon = ({ color = "black" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill={color}/>
  </svg>
);

const UserIcon = ({ color = "black" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color}/>
  </svg>
);


// Vendor Profile Component
const VendorProfile = ({ isLoggedIn, userProfile }) => {
  const [isVendorPopupOpen, setIsVendorPopupOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleSignOut = () => {
    // Clear tokens
    tokens.clear();
    // Reload the page or redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVendorPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="flex items-center gap-6">
      {/* Notification Icon - only show when logged in */}
      {isLoggedIn && (
        <div className="relative">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[12px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            6
          </div>
        </div>
      )}
      
      {/* Conditional rendering based on login status */}
      {isLoggedIn ? (
        // Vendor Profile - show when logged in
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsVendorPopupOpen(!isVendorPopupOpen)}>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="text-right">
              <div className="text-[14px] text-gray-800 font-bold font-poppins">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.first_name || "User"
                }
              </div>
              <div className="text-[12px] text-gray-600 font-semibold font-poppins">
                {userProfile?.user_type?.charAt(0).toUpperCase() + userProfile?.user_type?.slice(1) || "User"}
              </div>
            </div>
            <ChevronDownIcon color="#818181" />
          </div>
          
          {/* Dropdown Menu */}
          {isVendorPopupOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link 
                href="/vendor/dashboard" 
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsVendorPopupOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dashboard
              </Link>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        // Sign Up Button - show when not logged in
        <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-[5px] font-poppins font-semibold text-[14px] tracking-[0.3px] transition-colors shadow-md hover:shadow-lg">
          Join Green Community
        </Link>
      )}
    </div>
  );
};

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if we're in vendor dashboard
  const isVendorDashboard = pathname?.startsWith('/vendor');

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Check if user is logged in and fetch profile on component mount
  useEffect(() => {
    setIsClient(true);
    const userTokens = tokens.get();
    const loggedIn = !!userTokens?.access_token;
    setIsLoggedIn(loggedIn);
    
    // Fetch user profile if logged in
    if (loggedIn && userTokens?.access_token) {
      auth.getProfile(userTokens.access_token)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
        });
    }
    
    // Listener to react to token changes elsewhere in the app (login/logout)
    const onTokensChanged = (ev) => {
      const toks = ev?.detail || tokens.get();
      const nowLoggedIn = !!toks?.access_token;
      setIsLoggedIn(nowLoggedIn);
      if (nowLoggedIn && toks?.access_token) {
        auth.getProfile(toks.access_token)
          .then(profile => setUserProfile(profile))
          .catch(() => setUserProfile(null));
      } else {
        setUserProfile(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ae_tokens_changed', onTokensChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ae_tokens_changed', onTokensChanged);
      }
    };
  }, []);

  return (
    <div className="w-full fixed top-0 left-0 z-20">
      {/* Impact Banner */}
      {!isVendorDashboard && (
        <div className="bg-emerald-700 text-white py-2 px-4 text-center text-sm">
          <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7l2-7z" fill="currentColor"/></svg>
              <span>2,847 trees planted this month</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-2-2h-3l-1-2H9L8 6H5a2 2 0 0 0-2 2v8" stroke="currentColor" strokeWidth="2"/></svg>
              <span>15.2T CO₂ offset</span>
            </div>
            <div className="hidden lg:flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 2l3 3-9 9H10v-3l9-9z" stroke="currentColor" strokeWidth="2"/></svg>
              <span>500K+ plastic items saved</span>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white/90 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 py-3 w-full`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6">
            <Image src="/logo.png" alt="AveoEarth Logo" width={24} height={24} className="w-full h-full object-contain" />
          </div>
          <span className="text-[24px] font-eb-garamond font-medium tracking-[-0.72px] hidden sm:block text-emerald-700">AveoEarth</span>
        </Link>

        {/* Search Bar - only show for non-vendor pages */}
        {!isVendorDashboard && (
          <div className="hidden lg:flex max-w-[500px] flex-1 mx-6">
            <SearchAutocomplete
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              onSelectItem={(item) => {
                // Optional: handle item selection
                console.log('Selected item:', item);
              }}
              placeholder="Search eco-friendly products..."
              className="glass rounded-[20px] px-[23px] py-2 w-full shadow-eco border border-white/20"
            />
          </div>
        )}

        {/* Desktop Navigation */}
        {!isVendorDashboard && (
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/category" className="text-gray-700 hover:text-emerald-700 transition-colors font-medium">Categories</Link>
            <Link href="/explore?sort=new" className="text-gray-700 hover:text-emerald-700 transition-colors font-medium">New Arrivals</Link>
            <Link href="/explore?sort=popular" className="text-gray-700 hover:text-emerald-700 transition-colors font-medium">Best Sellers</Link>
            <Link href="/community" className="text-gray-700 hover:text-emerald-700 transition-colors font-medium">Community</Link>
            <Link href="/about" className="text-gray-700 hover:text-emerald-700 transition-colors font-medium">About Us</Link>
          </nav>
        )}

        {/* Right Side Items */}
        <div className="flex items-center gap-6">
          {isClient && (
            <>
              {isVendorDashboard ? (
                <VendorProfile isLoggedIn={isLoggedIn} userProfile={userProfile} />
              ) : (
                <>
                  {/* Cart - only show for non-vendor pages */}
                  <MiniCart />


                  {/* User Icon / Profile */}
                  <div className="relative">
                    {isClient ? (
                      <>
                        {isLoggedIn ? (
                          <button onClick={() => setIsUserPopupOpen(!isUserPopupOpen)} className="relative focus:outline-none text-gray-700 hover:text-emerald-700">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                            </svg>
                          </button>
                        ) : (
                          <button onClick={() => setIsUserPopupOpen(!isUserPopupOpen)} className="relative focus:outline-none text-gray-700 hover:text-emerald-700">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                            </svg>
                          </button>
                        )}
                        
                        <UserProfilePopup 
                          isOpen={isUserPopupOpen}
                          onClose={() => setIsUserPopupOpen(false)}
                          isLoggedIn={isLoggedIn}
                          userProfile={userProfile}
                        />
                      </>
                    ) : (
                      // Fallback during SSR
                      <div className="w-[32px] h-[32px] bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
