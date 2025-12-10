"use client";

import { useState } from "react";
import VendorOnboarding from "../onboarding/page";
import VendorSidebar from "../../../components/vendor/VendorSidebar";
import DashboardContent from "../../../components/vendor/DashboardContent";
import ProductsContent from "../../../components/vendor/ProductsContent";
import OrdersContent from "../../../components/vendor/OrdersContent";
import AnalyticsContent from "../../../components/vendor/AnalyticsContent";
import SettingsContent from "../../../components/vendor/SettingsContent";

// Mobile Menu Icon Component
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [vendor, setVendor] = useState({
    name: "John Organic",
    email: "john@organicfarm.com",
    phone: "+1234567890",
    totalUsers: 40689,
    activeOrders: 12,
    monthlyRevenue: 8420,
    lowStockAlerts: 3
  });

  const handleOnboardingComplete = (vendorData) => {
    setVendor(vendorData);
    setActiveTab("dashboard");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  return (
    <div className="bg-white w-full min-h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Vendor Dashboard</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Sidebar - Hidden on mobile, overlay when open */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:w-[240px] lg:flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          <VendorSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            vendor={vendor}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto lg:h-screen">
        {activeTab === "dashboard" && <DashboardContent vendor={vendor} />}
        {activeTab === "onboarding" && (
          <VendorOnboarding onComplete={handleOnboardingComplete} />
        )}
        {activeTab === "products" && <ProductsContent />}
        {activeTab === "orders" && <OrdersContent />}
        {activeTab === "analytics" && <AnalyticsContent />}
        {activeTab === "settings" && <SettingsContent />}
      </div>
    </div>
  );
}
