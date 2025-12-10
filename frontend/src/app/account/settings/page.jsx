"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/api';
import { tokens } from '@/lib/api';
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import NewsletterSubscription from "../../../components/explore/NewsletterSubscription";
import AddressManager from "../../../components/address/AddressManager";
import profileService from "../../../services/profileService";
import { ChevronDownIcon, EyeIcon } from "@heroicons/react/24/outline";

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="19.2" height="19.2" viewBox="0 0 19.2 19.2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4.209 4.412L15.583 15.175" 
      stroke="#858c94" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      transform="rotate(180 9.6 9.6)"
    />
  </svg>
);

export default function AccountSettingsPage() {
  const { isLoggedIn, userProfile, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  // Form state for personal information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "", 
    email: "",
    phoneNumber: ""
  });

  // Form state for extended profile
  const [extendedProfile, setExtendedProfile] = useState({
    dateOfBirth: "",
    gender: "",
    bio: ""
  });

  // Form state for preferences
  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "INR",
    theme: "light",
    newsletter: true,
    recommendations: true
  });

  // Form state for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_marketing: true,
    email_orders: true,
    email_security: true,
    sms_orders: false,
    sms_marketing: false,
    push_orders: true,
    push_marketing: false
  });

  // Load user data when available
  useEffect(() => {
    if (userProfile) {
      setPersonalInfo({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phone || ""
      });
    }

    if (userProfile) {
      setExtendedProfile({
        dateOfBirth: userProfile.date_of_birth || "",
        gender: userProfile.gender || "",
        bio: userProfile.bio || ""
      });

      // Load preferences
      if (userProfile.preferences) {
        setPreferences(prev => ({
          ...prev,
          ...userProfile.preferences
        }));
      }

      // Load notification settings
      if (userProfile.notification_settings) {
        setNotificationSettings(prev => ({
          ...prev,
          ...userProfile.notification_settings
        }));
      }
    }
  }, [userProfile]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const profileData = {
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        phone: personalInfo.phoneNumber
      };

      await profileService.updateBasicProfile(profileData);
      await refreshProfile();
      showMessage('Personal information updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      showMessage(err.message || 'Failed to update personal information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendedProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const profileData = {
        date_of_birth: extendedProfile.dateOfBirth || null,
        gender: extendedProfile.gender || null,
        bio: extendedProfile.bio || null
      };

      await profileService.updateCompleteProfile(profileData);
      await refreshProfile();
      showMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      showMessage(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await profileService.updateCompleteProfile({ preferences });
      await refreshProfile();
      showMessage('Preferences updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      showMessage(err.message || 'Failed to update preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await profileService.updateCompleteProfile({ notification_settings: notificationSettings });
      await refreshProfile();
      showMessage('Notification settings updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      showMessage(err.message || 'Failed to update notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const token = tokens.get()?.access_token;
      if (!token) {
        throw new Error('No authentication token');
      }

      await auth.resetPassword(passwordData.newPassword, token);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('Password changed successfully!');
    } catch (err) {
      console.error('Password change error:', err);
      showMessage(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleExtendedProfileChange = (field, value) => {
    setExtendedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'profile', label: 'Extended Profile' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-[#e1e4e3]">
      <Navbar />
      
      {authLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account settings...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Success/Error Messages */}
          {success && (
            <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-16 xl:px-[62px] pb-8">
            {/* Go Back Button */}
            <div className="mb-4 pt-4">
              <button 
                onClick={handleGoBack}
                className="bg-white border border-[#b8b8b8] rounded-[4.8px] px-[25.6px] py-[12px] flex items-center gap-[25.6px] hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon />
                <span className="font-poppins font-medium text-[#484848] text-[14.4px]">Go back</span>
              </button>
            </div>

            <div className="max-w-[1200px] mx-auto">
              {/* Account Settings Header */}
              <div className="bg-white rounded-[8px] border border-[#e6e6e6] overflow-hidden mb-8">
                <div className="bg-white px-6 py-4 border-b border-[#e6e6e6]">
                  <h1 className="font-poppins font-medium text-[#1a1a1a] text-[24px] leading-[1.5]">
                    Account Settings
                  </h1>
                </div>

                {/* Tabs Navigation */}
                <div className="px-6 pt-4">
                  <div className="flex flex-wrap gap-2 border-b border-gray-200">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Personal Info Tab */}
                  {activeTab === 'personal' && (
                    <form onSubmit={handlePersonalInfoSubmit}>
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                                First name *
                              </label>
                              <input
                                type="text"
                                value={personalInfo.firstName}
                                onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                                Last name *
                              </label>
                              <input
                                type="text"
                                value={personalInfo.lastName}
                                onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              Email (read-only)
                            </label>
                            <input
                              type="email"
                              value={personalInfo.email}
                              readOnly
                              className="w-full h-[49px] px-4 py-3.5 bg-gray-100 border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={personalInfo.phoneNumber}
                              onChange={(e) => handlePersonalInfoChange('phoneNumber', e.target.value)}
                              className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="lg:w-[300px] flex flex-col items-center">
                          <div className="w-56 h-56 mb-6">
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-4xl text-gray-400">
                                {profileService.getUserInitials(userProfile)}
                              </span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            className="bg-white border-2 border-[#272727] px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[#272727] text-[14px] leading-[1.2] hover:bg-[#f5f5f5] transition-colors"
                          >
                            Choose Image
                          </button>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[14px] leading-[1.2] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Extended Profile Tab */}
                  {activeTab === 'profile' && (
                    <form onSubmit={handleExtendedProfileSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={extendedProfile.dateOfBirth}
                              onChange={(e) => handleExtendedProfileChange('dateOfBirth', e.target.value)}
                              className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              Gender
                            </label>
                            <select
                              value={extendedProfile.gender}
                              onChange={(e) => handleExtendedProfileChange('gender', e.target.value)}
                              className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none"
                            >
                              <option value="">Select Gender</option>
                              {profileService.getGenderOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                            Bio
                          </label>
                          <textarea
                            value={extendedProfile.bio}
                            onChange={(e) => handleExtendedProfileChange('bio', e.target.value)}
                            rows="4"
                            maxLength="500"
                            className="w-full px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none resize-none"
                            placeholder="Tell us about yourself..."
                          />
                          <p className="text-sm text-gray-500">
                            {extendedProfile.bio.length}/500 characters
                          </p>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[14px] leading-[1.2] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Addresses Tab */}
                  {activeTab === 'addresses' && (
                    <AddressManager showTitle={false} />
                  )}

                  {/* Preferences Tab */}
                  {activeTab === 'preferences' && (
                    <form onSubmit={handlePreferencesSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-poppins font-medium text-[#1a1a1a] text-[16px]">
                              Language & Region
                            </h3>
                            <div className="space-y-1.5">
                              <label className="font-poppins font-regular text-[#1a1a1a] text-[14px]">
                                Language
                              </label>
                              <select
                                value={preferences.language}
                                onChange={(e) => handlePreferencesChange('language', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] focus:border-[#272727] focus:outline-none"
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-poppins font-regular text-[#1a1a1a] text-[14px]">
                                Currency
                              </label>
                              <select
                                value={preferences.currency}
                                onChange={(e) => handlePreferencesChange('currency', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] focus:border-[#272727] focus:outline-none"
                              >
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-poppins font-medium text-[#1a1a1a] text-[16px]">
                              Shopping Preferences
                            </h3>
                            <div className="space-y-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={preferences.newsletter}
                                  onChange={(e) => handlePreferencesChange('newsletter', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 font-poppins text-[#1a1a1a] text-[14px]">
                                  Subscribe to newsletter
                                </span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={preferences.recommendations}
                                  onChange={(e) => handlePreferencesChange('recommendations', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 font-poppins text-[#1a1a1a] text-[14px]">
                                  Personalized recommendations
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[14px] leading-[1.2] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <form onSubmit={handleNotificationSettingsSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="font-poppins font-medium text-[#1a1a1a] text-[16px]">
                              Email Notifications
                            </h3>
                            <div className="space-y-3">
                              <label className="flex items-center justify-between">
                                <span className="font-poppins text-[#1a1a1a] text-[14px]">
                                  Order updates
                                </span>
                                <input
                                  type="checkbox"
                                  checked={notificationSettings.email_orders}
                                  onChange={(e) => handleNotificationChange('email_orders', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                              <label className="flex items-center justify-between">
                                <span className="font-poppins text-[#1a1a1a] text-[14px]">
                                  Marketing emails
                                </span>
                                <input
                                  type="checkbox"
                                  checked={notificationSettings.email_marketing}
                                  onChange={(e) => handleNotificationChange('email_marketing', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                              <label className="flex items-center justify-between">
                                <span className="font-poppins text-[#1a1a1a] text-[14px]">
                                  Security alerts
                                </span>
                                <input
                                  type="checkbox"
                                  checked={notificationSettings.email_security}
                                  onChange={(e) => handleNotificationChange('email_security', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-poppins font-medium text-[#1a1a1a] text-[16px]">
                              SMS Notifications
                            </h3>
                            <div className="space-y-3">
                              <label className="flex items-center justify-between">
                                <span className="font-poppins text-[#1a1a1a] text-[14px]">
                                  Order updates
                                </span>
                                <input
                                  type="checkbox"
                                  checked={notificationSettings.sms_orders}
                                  onChange={(e) => handleNotificationChange('sms_orders', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                              <label className="flex items-center justify-between">
                                <span className="font-poppins text-[#1a1a1a] text-[14px]">
                                  Marketing messages
                                </span>
                                <input
                                  type="checkbox"
                                  checked={notificationSettings.sms_marketing}
                                  onChange={(e) => handleNotificationChange('sms_marketing', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[14px] leading-[1.2] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Notification Settings'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="space-y-6">
                        <h3 className="font-poppins font-medium text-[#1a1a1a] text-[18px]">
                          Change Password
                        </h3>
                        <div className="space-y-1.5">
                          <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none pr-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            >
                              <EyeIcon className="w-5 h-5 text-[#666666]" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                              >
                                <EyeIcon className="w-5 h-5 text-[#666666]" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-poppins font-regular text-[#1a1a1a] text-[14px] leading-[1.5]">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                className="w-full h-[49px] px-4 py-3.5 bg-white border border-[#e6e6e6] rounded-[6px] font-poppins font-regular text-[#666666] text-[16px] leading-[1.3] focus:border-[#272727] focus:outline-none pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                              >
                                <EyeIcon className="w-5 h-5 text-[#666666]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-[43px] font-poppins font-semibold text-[14px] leading-[1.2] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <NewsletterSubscription />

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  );
}
