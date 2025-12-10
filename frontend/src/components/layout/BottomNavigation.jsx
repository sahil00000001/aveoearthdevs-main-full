"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: "/explore?category=home-living",
      label: "Home & Living",
      icon: (
        <svg width="20" height="20" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 0.5L17 5.5V16.5H11V10.5H6V16.5H0V5.5L8.5 0.5Z" fill="currentColor"/>
        </svg>
      ),
      activeColor: "text-emerald-700",
      bgColor: "bg-emerald-50"
    },
    {
      href: "/explore?category=fashion",
      label: "Sustainable Fashion",
      icon: (
        <svg width="20" height="20" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.1425 3.23573L15.2371 3.22876L15.3487 3.23274L15.4612 3.24967L15.5738 3.27955L21.55 5.27163C21.7296 5.33152 21.8885 5.44138 22.0079 5.58833C22.1273 5.73528 22.2024 5.91323 22.2243 6.10133L22.2313 6.21687V11.197C22.2312 11.441 22.1417 11.6765 21.9796 11.8588C21.8175 12.0411 21.5941 12.1576 21.3518 12.1861L21.2352 12.1931H19.2432V19.1653C19.2433 19.6679 19.0535 20.152 18.7118 20.5205C18.3701 20.889 17.9017 21.1147 17.4005 21.1524L17.2511 21.1574H7.29073C6.78815 21.1576 6.30409 20.9678 5.93557 20.626C5.56706 20.2843 5.34133 19.8159 5.30364 19.3147L5.29866 19.1653V12.1931H3.30658C3.06262 12.1931 2.82715 12.1035 2.64484 11.9414C2.46254 11.7793 2.34606 11.5559 2.31752 11.3136L2.31055 11.197V6.21687C2.31048 6.02747 2.36442 5.84197 2.46604 5.68214C2.56765 5.52231 2.71273 5.39476 2.88426 5.31446L2.99184 5.27163L8.96806 3.27955C9.11779 3.22968 9.27724 3.2161 9.43325 3.23994C9.58926 3.26378 9.73738 3.32435 9.86539 3.41667C9.9934 3.50898 10.0976 3.63039 10.1695 3.77089C10.2414 3.91139 10.2789 4.06697 10.2788 4.22479C10.2765 4.74172 10.4752 5.2393 10.833 5.61242C11.1908 5.98554 11.6796 6.20498 12.1962 6.22438C12.7127 6.24377 13.2166 6.06161 13.6013 5.71637C13.9861 5.37112 14.2216 4.88984 14.258 4.3742L14.267 4.13515L14.2839 4.0226L14.3208 3.88913L14.3646 3.78654L14.4144 3.6949L14.4821 3.60227L14.5508 3.52259C14.606 3.46946 14.6641 3.42298 14.7251 3.38314L14.8208 3.33035L14.9234 3.28653L15.0309 3.25465L15.1425 3.23573Z" fill="currentColor"/>
        </svg>
      ),
      activeColor: "text-orange-700",
      bgColor: "bg-orange-50"
    },
    {
      href: "/explore?category=upcycled",
      label: "Upcycled & Handmade",
      icon: "🎨",
      activeColor: "text-purple-700",
      bgColor: "bg-purple-50"
    },
    {
      href: "/explore?category=beauty-personal-care",
      label: "Clean Beauty",
      icon: (
        <svg width="20" height="20" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.59921 1.99719C2.53314 1.06355 3.79964 0.539062 5.1202 0.539062C6.44077 0.539062 7.70727 1.06355 8.64119 1.99719C8.8238 2.17914 9.05886 2.40557 9.34639 2.67649C9.63325 2.40557 9.86798 2.17914 10.0506 1.99719C10.9806 1.07155 12.2383 0.550334 13.5505 0.54682C14.8626 0.543306 16.1231 1.05778 17.0581 1.97843C17.993 2.89908 18.5269 4.15151 18.5436 5.46355C18.5603 6.77559 18.0585 8.04122 17.1473 8.98539L10.0496 16.0831C9.8628 16.2699 9.6095 16.3748 9.34539 16.3748C9.08128 16.3748 8.82798 16.2699 8.64119 16.0831L1.54344 8.98638C0.633098 8.04752 0.128575 6.78826 0.138825 5.48056C0.149075 4.17287 0.674271 2.92167 1.59921 1.99719Z" fill="currentColor"/>
        </svg>
      ),
      activeColor: "text-pink-700",
      bgColor: "bg-pink-50"
    },
    {
      href: "/explore?category=pets",
      label: "Pets",
      icon: (
        <svg viewBox="0 0 64 64" width="20" height="20" fill="currentColor" aria-hidden="true">
          <circle cx="18" cy="22" r="6"/>
          <circle cx="28" cy="14" r="6"/>
          <circle cx="36" cy="14" r="6"/>
          <circle cx="46" cy="22" r="6"/>
          <ellipse cx="32" cy="44" rx="16" ry="13"/>
        </svg>
      ),
      activeColor: "text-amber-700",
      bgColor: "bg-amber-50"
    },
    {
      href: "/explore?category=fitness",
      label: "Fitness",
      icon: "💪",
      activeColor: "text-green-700",
      bgColor: "bg-green-50"
    }
  ];

  // Check if current path matches any nav item
  const getIsActive = (href) => {
    if (href.includes('category=')) {
      const category = href.split('category=')[1];
      return pathname.includes('explore') && (
        pathname.includes(category) || 
        (typeof window !== 'undefined' && (new URLSearchParams(window?.location?.search || '')).get('category') === category)
      );
    }
    return pathname === href;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      {/* Safe area for iPhone notch */}
      <div className="safe-area-inset-bottom">
        <div className="bg-white/90 border border-emerald-200 backdrop-blur-xl shadow-lg rounded-2xl mx-4 mb-4 px-4 py-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
          {navItems.map((item, index) => {
            const isActive = getIsActive(item.href);
            
            return (
              <Link
                key={index}
                href={item.href}
                className={`
                  group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover-lift active:scale-95
                  ${isActive ? `${item.bgColor} ${item.activeColor} shadow-md` : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'}
                  min-w-[64px] max-w-[80px] touch-manipulation
                `}
              >
                {/* Icon Container */}
                <div className={`
                  flex items-center justify-center w-8 h-8 mb-1 transition-all duration-300
                  ${isActive ? 'scale-110 animate-pulse-glow' : 'group-hover:scale-110'}
                `}>
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-[9px] sm:text-[10px] font-medium text-center leading-tight line-clamp-2 transition-all duration-300
                  ${isActive ? `font-semibold ${item.activeColor}` : 'group-hover:font-medium'}
                `}>
                  {item.label}
                </span>
                
                {/* Active Indicator - Animated Dot */}
                {isActive && (
                  <div className={`w-1 h-1 ${item.activeColor.replace('text-', 'bg-')} rounded-full mt-1 animate-pulse`}></div>
                )}
              </Link>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
