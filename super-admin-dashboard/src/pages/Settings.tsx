import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../services/api';
import { AnimatedCard } from '../components/AnimatedCard';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/settings');
      setSettings(res);
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPut('/api/settings', settings);
      showToast('Settings saved successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            System Settings <SettingsIcon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-gray-400 mt-2">Manage global platform configuration.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard delay={0.1}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Restaurant Name</label>
              <input 
                type="text"
                name="name"
                value={settings?.name || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
                <input 
                  type="text"
                  name="currency"
                  value={settings?.currency || 'INR'}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tax Rate (%)</label>
                <input 
                  type="number"
                  name="tax_rate"
                  value={settings?.tax_rate || 0}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone</label>
              <input 
                type="text"
                name="contact_phone"
                value={settings?.contact_phone || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contact Email</label>
              <input 
                type="email"
                name="contact_email"
                value={settings?.contact_email || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
              <input 
                type="text"
                name="address"
                value={settings?.address || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
          </form>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="h-fit">
          <h3 className="text-lg font-bold text-white mb-4">Configuration Status</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Database Connection</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Online
              </span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Socket Real-time Sync</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Online
              </span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-white">
                {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
              </span>
            </li>
          </ul>
        </AnimatedCard>
      </div>
    </div>
  );
}
