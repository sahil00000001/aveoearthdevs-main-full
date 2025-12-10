import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardScreen from '../components/admin/screens/DashboardScreen';
import AnalyticsScreen from '../components/admin/screens/AnalyticsScreen';
import UsersScreen from '../components/admin/screens/UsersScreen';
import SuppliersScreen from '../components/admin/screens/SuppliersScreen';
import ProductsScreen from '../components/admin/screens/ProductsScreen';
import OrdersScreen from '../components/admin/screens/OrdersScreen';
import SettingsScreen from '../components/admin/screens/SettingsScreen';
import TestingScreen from '../components/admin/screens/TestingScreen';
import ComprehensiveTestingScreen from '../components/admin/screens/ComprehensiveTestingScreen';
import AdvancedAnalyticsScreen from '../components/admin/screens/AdvancedAnalyticsScreen';
import PerformanceMonitoringScreen from '../components/admin/screens/PerformanceMonitoringScreen';
import StressTestingScreen from '../components/admin/screens/StressTestingScreen';
import FinalTestingDashboard from '../components/admin/screens/FinalTestingDashboard';
import RealtimeNotifications from '../components/admin/RealtimeNotifications';
import PWAInstaller from '../components/pwa/PWAInstaller';
import adminService from '../services/adminService';

const AdminDashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }

    // Mock user data for development
    setUser({
      first_name: "Admin",
      last_name: "User",
      email: "admin@aveoearth.com",
      role: "admin"
    });

    setIsLoading(false);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "analytics":
        return <AnalyticsScreen />;
      case "users":
        return <UsersScreen />;
      case "suppliers":
        return <SuppliersScreen />;
      case "products":
        return <ProductsScreen />;
      case "orders":
        return <OrdersScreen />;
      case "settings":
        return <SettingsScreen />;
      case "testing":
        return <TestingScreen />;
      case "comprehensive-testing":
        return <ComprehensiveTestingScreen />;
      case "advanced-analytics":
        return <AdvancedAnalyticsScreen />;
      case "performance":
        return <PerformanceMonitoringScreen />;
      case "stress-testing":
        return <StressTestingScreen />;
      case "final-testing":
        return <FinalTestingDashboard />;
      default:
        return <DashboardScreen />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
        collapsed={collapsed}
      />
      
      {/* Main Content */}
      <div className={collapsed ? "ml-20" : "ml-60"}>
        {/* Top Bar */}
        <div className="relative">
          <AdminTopbar user={user} />
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-sm rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        
        {/* Page Content */}
        <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-8">
          {renderScreen()}
        </main>
      </div>
      
      {/* Real-time Notifications */}
      <RealtimeNotifications />
      
      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  );
};

export default AdminDashboard;
