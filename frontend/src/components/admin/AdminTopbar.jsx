"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChevronDownIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

export default function AdminTopbar({ user }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (user) => {
    if (!user) return "A";
    const firstName = user.first_name || user.name || "";
    const lastName = user.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "A";
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Admin";
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.name || user.email || "Admin";
  };

  return (
    <div className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-300 flex items-center px-6 z-10">
      {/* Mobile menu button */}
      <button className="lg:hidden mr-4">
        <Bars3Icon className="h-6 w-6 text-gray-600" />
      </button>
      
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, users, orders..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-6 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <BellIcon className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">New supplier registration pending review</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">5 new products awaiting approval</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">System maintenance scheduled for tonight</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-emerald-700">
                {getUserInitials(user)}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-gray-900">
                {getUserDisplayName(user)}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-600" />
          </button>
          
          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{getUserDisplayName(user)}</p>
                <p className="text-xs text-gray-500">{user?.email || "admin@aveoearth.com"}</p>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserIcon className="h-4 w-4" />
                  Profile Settings
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Cog6ToothIcon className="h-4 w-4" />
                  Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
}
