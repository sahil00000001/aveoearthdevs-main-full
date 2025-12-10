"use client";

import { useState, useEffect } from "react";
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ChartBarIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      siteName: "AveoEarth",
      siteDescription: "Sustainable E-commerce Marketplace",
      siteUrl: "https://aveoearth.com",
      adminEmail: "admin@aveoearth.com",
      timezone: "Asia/Kolkata",
      currency: "INR",
      language: "en"
    },
    notifications: {
      emailNotifications: true,
    orderNotifications: true,
    supplierNotifications: true,
      systemAlerts: true,
      weeklyReports: true,
      monthlyReports: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: "strong",
      ipWhitelist: [],
      loginAttempts: 5,
      accountLockout: true
    },
    payment: {
      stripeEnabled: true,
      razorpayEnabled: true,
      paypalEnabled: false,
      defaultGateway: "razorpay",
      currency: "INR",
      commissionRate: 5.0
    },
    features: {
      aiVerification: true,
      esgTracking: true,
      analytics: true,
      chatSupport: true,
      mobileApp: false,
      apiAccess: true
    },
    integrations: {
      googleAnalytics: "",
      facebookPixel: "",
      mailchimp: "",
      slack: "",
      webhookUrl: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", name: "General", icon: Cog6ToothIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "payment", name: "Payment", icon: CreditCardIcon },
    { id: "features", name: "Features", icon: ChartBarIcon },
    { id: "integrations", name: "Integrations", icon: GlobeAltIcon }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
            <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
                </label>
                <input
                  type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
            value={settings.general.adminEmail}
            onChange={(e) => handleSettingChange("general", "adminEmail", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
        </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
                </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange("general", "currency", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange("general", "language", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-500">
                {key === 'emailNotifications' && 'Send email notifications for important events'}
                {key === 'orderNotifications' && 'Notify when new orders are placed'}
                {key === 'supplierNotifications' && 'Notify when suppliers register or update'}
                {key === 'systemAlerts' && 'Send system alerts and warnings'}
                {key === 'weeklyReports' && 'Send weekly performance reports'}
                {key === 'monthlyReports' && 'Send monthly analytics reports'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange("notifications", key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange("security", "twoFactorAuth", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
                </label>
                <input
              type="number"
              value={settings.security.loginAttempts}
              onChange={(e) => handleSettingChange("security", "loginAttempts", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Policy
          </label>
          <select
            value={settings.security.passwordPolicy}
            onChange={(e) => handleSettingChange("security", "passwordPolicy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="basic">Basic (6+ characters)</option>
            <option value="medium">Medium (8+ chars, 1 number)</option>
            <option value="strong">Strong (8+ chars, 1 number, 1 special)</option>
            <option value="very-strong">Very Strong (12+ chars, mixed case, numbers, symbols)</option>
          </select>
        </div>
          </div>
        </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.payment).filter(([key]) => key !== 'defaultGateway' && key !== 'currency' && key !== 'commissionRate').map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-500">
                {key === 'stripeEnabled' && 'Enable Stripe payment processing'}
                {key === 'razorpayEnabled' && 'Enable Razorpay payment processing'}
                {key === 'paypalEnabled' && 'Enable PayPal payment processing'}
              </p>
                </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange("payment", key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
                </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Payment Gateway
            </label>
            <select
              value={settings.payment.defaultGateway}
              onChange={(e) => handleSettingChange("payment", "defaultGateway", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>
                </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.payment.commissionRate}
              onChange={(e) => handleSettingChange("payment", "commissionRate", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            </div>
          </div>
        </div>
            </div>
  );
            
  const renderFeatureSettings = () => (
    <div className="space-y-6">
            <div className="space-y-4">
        {Object.entries(settings.features).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-500">
                {key === 'aiVerification' && 'AI-powered product verification system'}
                {key === 'esgTracking' && 'ESG impact tracking and reporting'}
                {key === 'analytics' && 'Advanced analytics and reporting'}
                {key === 'chatSupport' && 'Live chat support system'}
                {key === 'mobileApp' && 'Mobile application support'}
                {key === 'apiAccess' && 'API access for third-party integrations'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange("features", key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
            <div className="space-y-4">
        {Object.entries(settings.integrations).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleSettingChange("integrations", key, e.target.value)}
              placeholder={`Enter ${key} configuration...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {key === 'googleAnalytics' && 'Google Analytics tracking ID (e.g., GA-XXXXXXXXX)'}
              {key === 'facebookPixel' && 'Facebook Pixel ID (e.g., 123456789012345)'}
              {key === 'mailchimp' && 'Mailchimp API key or list ID'}
              {key === 'slack' && 'Slack webhook URL for notifications'}
              {key === 'webhookUrl' && 'Webhook URL for external integrations'}
            </p>
                </div>
              ))}
            </div>
          </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "payment":
        return renderPaymentSettings();
      case "features":
        return renderFeatureSettings();
      case "integrations":
        return renderIntegrationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm">Settings saved!</span>
              </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Settings Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.name}
        </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
