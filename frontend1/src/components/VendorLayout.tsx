import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import logoImage from '@/assets/logo.webp';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  LogOut,
  Menu,
  X,
  Leaf,
  User
} from 'lucide-react';

const VendorLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { vendor, signOut, isAuthenticated } = useVendorAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/vendor/dashboard' },
    { id: 'products', label: 'Products', icon: Package, href: '/vendor/products' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/vendor/orders' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/vendor/analytics' },
    { id: 'profile', label: 'Profile', icon: User, href: '/vendor/profile' }
  ];

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const currentTab = getCurrentTab();

  const handleSignOut = () => {
    signOut();
    navigate('/vendor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-moss/10 to-clay/5 relative overflow-hidden flex">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-forest/10 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-moss/10 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-clay/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-forest/20 px-4 py-3 flex items-center justify-between relative z-50 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="AveoEarth Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg text-forest">AveoEarth</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-forest hover:bg-forest/10 transition-colors duration-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-forest/30 shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-forest/20">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="AveoEarth Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xl text-forest">AveoEarth</span>
              <span className="text-sm text-moss ml-2 font-medium">Vendor Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-forest to-moss text-white shadow-lg scale-105'
                        : 'text-forest hover:bg-forest/10 hover:text-moss hover:scale-105'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-forest/20">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-forest/10">
              <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{vendor?.businessName?.charAt(0) || 'V'}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-forest">{vendor?.businessName || 'Vendor'}</div>
                <div className="text-sm text-muted-foreground">{vendor?.email || 'vendor@example.com'}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-forest hover:text-moss hover:bg-forest/20 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0 relative z-10 overflow-auto">
        <div className="pt-16 lg:pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VendorLayout;




