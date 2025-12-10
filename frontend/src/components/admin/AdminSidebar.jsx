"use client";

import { 
  Squares2X2Icon,
  TruckIcon,
  CubeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

const menuItems = [
  { 
    name: "Dashboard", 
    key: "dashboard", 
    icon: Squares2X2Icon 
  },
  { 
    name: "Analytics", 
    key: "analytics", 
    icon: ChartBarIcon 
  },
  { 
    name: "Users", 
    key: "users", 
    icon: UsersIcon 
  },
  { 
    name: "Suppliers", 
    key: "suppliers", 
    icon: TruckIcon 
  },
  { 
    name: "Products", 
    key: "products", 
    icon: CubeIcon 
  },
  { 
    name: "Orders", 
    key: "orders", 
    icon: ShoppingBagIcon 
  },
];

const bottomItems = [
  { 
    name: "Settings", 
    key: "settings", 
    icon: Cog6ToothIcon 
  },
  { 
    name: "Logout", 
    key: "logout", 
    icon: ArrowRightOnRectangleIcon 
  },
];

export default function AdminSidebar({ activeScreen, onScreenChange }) {
  const handleItemClick = (key) => {
    if (key === "logout") {
      // Handle logout logic here
      window.location.href = "/admin/login";
    } else {
      onScreenChange(key);
    }
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-300 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a4032] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">AE</span>
          </div>
          <div className="text-xl font-semibold text-black">AveoEarth</div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-6 py-8">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeScreen === item.key
                    ? "bg-[#1b6145] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            {bottomItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    activeScreen === item.key
                      ? "bg-[#1b6145] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
