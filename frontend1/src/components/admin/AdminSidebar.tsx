import React from 'react';
import logoImage from '@/assets/logo.webp';
import { 
  Squares2X2Icon,
  TruckIcon,
  CubeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

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
    name: "Testing", 
    key: "testing", 
    icon: ChartBarIcon 
  },
  { 
    name: "Advanced Analytics", 
    key: "advanced-analytics", 
    icon: ChartBarIcon 
  },
  { 
    name: "Comprehensive Testing", 
    key: "comprehensive-testing", 
    icon: ChartBarIcon 
  },
  { 
    name: "Performance", 
    key: "performance", 
    icon: ChartBarIcon 
  },
  { 
    name: "Stress Testing", 
    key: "stress-testing", 
    icon: ChartBarIcon 
  },
  { 
    name: "Final Testing", 
    key: "final-testing", 
    icon: ChartBarIcon 
  },
  { 
    name: "Logout", 
    key: "logout", 
    icon: ArrowRightOnRectangleIcon 
  },
];

interface AdminSidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  collapsed?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeScreen, onScreenChange, collapsed = false }) => {
  const handleItemClick = (key: string) => {
    if (key === "logout") {
      // Handle logout logic here
      window.location.href = "/admin/login";
    } else {
      onScreenChange(key);
    }
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-60'} fixed left-0 top-0 bottom-0 bg-white/95 backdrop-blur border-r border-gray-200 flex flex-col transition-[width] duration-200`}
      >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="AveoEarth Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="text-xl font-semibold text-black">AveoEarth</div>
          )}
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeScreen === item.key
                    ? "bg-emerald-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {!collapsed && item.name}
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
                      ? "bg-emerald-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {!collapsed && item.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
