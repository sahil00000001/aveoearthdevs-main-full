import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const SettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const s = await adminService.getSettings();
        setSettings(s);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const save = async () => {
    await adminService.updateSettings(settings);
  };

  if (loading || !settings) {
    return <div className="text-sm text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Site Name</label>
              <Input value={settings.general.siteName} onChange={e => setSettings({ ...settings, general: { ...settings.general, siteName: e.target.value } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Timezone</label>
              <Input value={settings.general.timezone} onChange={e => setSettings({ ...settings, general: { ...settings.general, timezone: e.target.value } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Currency</label>
              <Input value={settings.general.currency} onChange={e => setSettings({ ...settings, general: { ...settings.general, currency: e.target.value } })} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <Switch checked={settings.notifications.emailEnabled} onCheckedChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, emailEnabled: v } })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Push Notifications</span>
              <Switch checked={settings.notifications.pushEnabled} onCheckedChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, pushEnabled: v } })} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Password Min Length</label>
              <Input type="number" value={settings.security.passwordMinLength} onChange={e => setSettings({ ...settings, security: { ...settings.security, passwordMinLength: Number(e.target.value) } })} />
            </div>
            <div className="flex items-end">
              <div className="w-full flex items-center justify-between border rounded-md px-3 py-2">
                <span className="text-sm text-gray-700">Require 2FA</span>
                <Switch checked={settings.security.require2FA} onCheckedChange={(v) => setSettings({ ...settings, security: { ...settings.security, require2FA: v } })} />
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

