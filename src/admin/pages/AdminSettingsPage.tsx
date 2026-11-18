import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Settings, Save, CheckCircle2, Shield, Database, Share2, Image, Globe } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/settings');
        setSettings(data || {});
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.put('/api/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 font-mono bg-white border border-gray-200">
        Loading Newsroom Configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Publication Control
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            DharmaWatch Settings & Identity
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Configure branding, header mantras, security parameters, and newsroom identity
          </p>
        </div>

        {hasPermission(['admin']) && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-dw-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Settings successfully saved and live on publication.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2">
            Brand Identity & Public Slogans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Publication Title
              </label>
              <input
                type="text"
                value={settings.site_title || settings.site_name || 'DharmaWatch'}
                onChange={(e) => {
                  handleChange('site_title', e.target.value);
                  handleChange('site_name', e.target.value);
                }}
                className="w-full text-xs p-2 border border-gray-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.site_tagline || 'Documenting. Verifying. Reporting.'}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
              <span>Top Header Left Slogan</span>
              <span className="text-[10px] text-gray-400 font-mono">Public Header Bar</span>
            </label>
            <input
              type="text"
              value={settings.primary_slogan || settings.header_slogan || 'Proudly Hindu. Proudly Indian.'}
              onChange={(e) => {
                handleChange('primary_slogan', e.target.value);
                handleChange('header_slogan', e.target.value);
              }}
              className="w-full text-xs p-2 border border-gray-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
              <span>Top Header Sanskrit Mantra</span>
              <span className="text-[10px] text-dw-red font-mono font-bold">Lord Vishnu & Truth Praise</span>
            </label>
            <input
              type="text"
              value={settings.sanskrit_mantra || 'सत्यमेव जयते • ॐ नमो भगवते वासुदेवाय'}
              onChange={(e) => handleChange('sanskrit_mantra', e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 font-serif font-bold text-dw-red"
            />
          </div>
        </div>

        {/* Social Sharing & Link Preview (Open Graph / Telegram / WhatsApp / X) */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>Social Sharing & Link Preview (OpenGraph / Telegram / WhatsApp / X)</span>
            </h2>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono">1200 × 630 px</span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Controls the preview image, title, and description displayed when someone shares <code className="bg-gray-100 px-1 py-0.5 text-gray-700">https://thedharmawatch.in/</code> on Telegram, WhatsApp, Facebook, X (Twitter), and LinkedIn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                <span>Preview Image Path or Absolute URL</span>
                <span className="text-[10px] text-gray-400 font-mono">OG &amp; Twitter Card</span>
              </label>
              <input
                type="text"
                value={settings.og_image || '/dharmawatch-social-preview.png'}
                onChange={(e) => handleChange('og_image', e.target.value)}
                placeholder="/dharmawatch-social-preview.png"
                className="w-full text-xs p-2 border border-gray-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                <span>Cache-Bust Version Tag</span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">Busts App Cache</span>
              </label>
              <input
                type="text"
                value={settings.og_image_version || '2.2'}
                onChange={(e) => handleChange('og_image_version', e.target.value)}
                placeholder="2.2"
                className="w-full text-xs p-2 border border-gray-300 font-mono"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Change this (e.g. 2.3) whenever you update the image to force instant reload on Telegram &amp; WhatsApp.</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Social Share Title
              </label>
              <input
                type="text"
                value={settings.og_title || 'The Dharma Watch | Journalism of Courage · The National Journal of Record'}
                onChange={(e) => handleChange('og_title', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Social Share Description
              </label>
              <textarea
                rows={2}
                value={settings.og_description || 'An independent national broadsheet news publication and investigative journal of record. Dedicated to fearless reporting, constitutional accountability, and primary evidence verification.'}
                onChange={(e) => handleChange('og_description', e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Visual Card Preview */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-2">Live Social Card Preview (1.91:1)</span>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg bg-gray-50 shadow-sm">
              <div className="relative aspect-[1.91/1] bg-white border-b border-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={settings.og_image || '/dharmawatch-social-preview.png'}
                  alt="OpenGraph Preview"
                  className="w-full h-full object-contain"
                  onError={(e: any) => {
                    e.target.src = '/dharmawatch-social-preview.png';
                  }}
                />
              </div>
              <div className="p-3 bg-white space-y-1">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">thedharmawatch.in</div>
                <div className="text-xs font-bold text-gray-900 line-clamp-1">
                  {settings.og_title || 'The Dharma Watch | Journalism of Courage · The National Journal of Record'}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {settings.og_description || 'An independent national broadsheet news publication and investigative journal of record. Dedicated to fearless reporting, constitutional accountability, and primary evidence verification.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Standards & Mission */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2">
            Mission & Counter-Propaganda Declaration
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Editorial Mandate & Purpose
            </label>
            <textarea
              rows={4}
              value={settings.editorial_philosophy || settings.editorial_mandate || 'Our identity is Hindu. Our home is India. Our standard is evidence.'}
              onChange={(e) => {
                handleChange('editorial_philosophy', e.target.value);
                handleChange('editorial_mandate', e.target.value);
              }}
              className="w-full text-xs p-3 border border-gray-300 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Contact & Secure Communication */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2">
            Newsroom Inquiries & Confidential Leaks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Editorial Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email || 'contact@thedharmawatch.in'}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Confidential Whistleblower Desk
              </label>
              <input
                type="email"
                value={settings.tips_email || 'tips@thedharmawatch.in'}
                onChange={(e) => handleChange('tips_email', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Newsroom PGP Public Key Fingerprint
            </label>
            <input
              type="text"
              value={settings.pgp_fingerprint || '4A8B 91E2 3F0C 7D5A B9E8 2D4F 6A1C 8E3B 5D9F 0A7E'}
              onChange={(e) => handleChange('pgp_fingerprint', e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 font-mono text-gray-700"
            />
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-gray-50 border border-gray-200 p-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-gray-500" />
            <span>Infrastructure Telemetry</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-gray-400 block text-[10px]">ENGINE</span>
              <span className="font-bold text-gray-800">Node 24 + SQLite</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">DATABASE</span>
              <span className="font-bold text-gray-800">WAL Mode Active</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">AUTH SYSTEM</span>
              <span className="font-bold text-gray-800">HMAC-SHA256 JWT</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">CMS TYPE</span>
              <span className="font-bold text-emerald-700">Custom Newsroom</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
