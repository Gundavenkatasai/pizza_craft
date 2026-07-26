import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../services/api';
import { Save, Store, MapPin, Clock, Phone, Mail, Globe, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res: any = await apiGet('/api/settings');
        setSettings(res.data || res || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/api/settings', settings);
      // Show success toast
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Restaurant Settings</h1>
          <p className="text-gray-500 mt-1">Configure your global store details and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
        >
          {saving ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-500" /> General Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input 
                    type="text" 
                    value={settings?.name || ''} 
                    onChange={e => setSettings({...settings, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%)</label>
                  <input 
                    type="number" 
                    value={settings?.tax_percentage || 0} 
                    onChange={e => setSettings({...settings, tax_percentage: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={settings?.description || ''} 
                  onChange={e => setSettings({...settings, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> Contact & Location
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone className="w-4 h-4"/> Phone Number</label>
                  <input 
                    type="text" 
                    value={settings?.contact?.phone || ''} 
                    onChange={e => setSettings({...settings, contact: {...settings?.contact, phone: e.target.value}})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail className="w-4 h-4"/> Email Address</label>
                  <input 
                    type="email" 
                    value={settings?.contact?.email || ''} 
                    onChange={e => setSettings({...settings, contact: {...settings?.contact, email: e.target.value}})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  rows={2}
                  value={settings?.contact?.address || ''} 
                  onChange={e => setSettings({...settings, contact: {...settings?.contact, address: e.target.value}})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" /> Branding
            </h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="h-32 object-contain" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Logo</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" /> Status
            </h2>
            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">Accepting Orders</p>
                <p className="text-xs text-gray-500">Toggle store online/offline status</p>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings?.is_active || false}
                  onChange={e => setSettings({...settings, is_active: e.target.checked})}
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
