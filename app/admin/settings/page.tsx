'use client';

import { useState } from 'react';
import { Save, Globe, Palette, Bell, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'general',       label: 'Général',        icon: Globe    },
  { key: 'appearance',    label: 'Apparence',       icon: Palette  },
  { key: 'notifications', label: 'Notifications',   icon: Bell     },
  { key: 'security',      label: 'Sécurité',        icon: Shield   },
  { key: 'data',          label: 'Données',         icon: Database },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName:    'Bangui est Doux',
    taglineFr:   'Le meilleur de Bangui',
    taglineEn:   'The Best of Bangui',
    email:       'banguiestdouxx@gmail.com',
    phone:       '+236 72 63 71 71',
    address:     'Bangui, République Centrafricaine',
    instagram:   'https://instagram.com/banguiestdoux',
    facebook:    'https://facebook.com/banguiestdoux',
    youtube:     'https://youtube.com/@banguiestdoux',
    tiktok:      'https://tiktok.com/@banguiestdoux',
    metaTitle:   'Bangui est Doux – Le meilleur de Bangui',
    metaDesc:    "Découvrez le meilleur de Bangui : événements, restaurants, nightlife, culture et lifestyle en République Centrafricaine.",
    googleMapsKey:'',
    stripeKey:   '',
    mailgunKey:  '',
    primaryColor:'#C9A84C',
    enableDark:  true,
    enableBilingual: true,
    enableShop:  true,
    enableNewsletter: true,
  });

  const handleSave = () => {
    toast.success('Paramètres enregistrés !');
  };

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Field = ({ label, name, type = 'text', placeholder = '' }: { label: string; name: keyof typeof settings; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-beige/40 uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        value={String(settings[name])}
        onChange={(e) => handleChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige outline-none focus:border-gold/50"
      />
    </div>
  );

  const Toggle = ({ label, desc, name }: { label: string; desc: string; name: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-beige">{label}</p>
        <p className="text-xs text-beige/40">{desc}</p>
      </div>
      <button
        onClick={() => handleChange(name, !settings[name])}
        className={`relative w-10 h-6 rounded-full transition-colors ${settings[name] ? 'bg-gold' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[name] ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="text-beige space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Paramètres du site</h2>
          <p className="text-beige/40 text-sm">Configuration globale de la plateforme</p>
        </div>
        <button onClick={handleSave} className="btn-gold gap-2">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === key
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-beige/40 hover:text-beige hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6">
          {activeTab === 'general' && (
            <>
              <h3 className="font-semibold text-beige border-b border-white/5 pb-3">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Nom du site"    name="siteName"  />
                <Field label="Tagline (FR)"   name="taglineFr" />
                <Field label="Tagline (EN)"   name="taglineEn" />
                <Field label="Email contact"  name="email"     type="email" />
                <Field label="Téléphone"      name="phone"     />
                <Field label="Adresse"        name="address"   />
              </div>

              <h3 className="font-semibold text-beige border-b border-white/5 pb-3 pt-2">Réseaux sociaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Instagram" name="instagram" />
                <Field label="Facebook"  name="facebook"  />
                <Field label="YouTube"   name="youtube"   />
                <Field label="TikTok"    name="tiktok"    />
              </div>

              <h3 className="font-semibold text-beige border-b border-white/5 pb-3 pt-2">SEO</h3>
              <div className="grid grid-cols-1 gap-5">
                <Field label="Meta Title"       name="metaTitle" />
                <Field label="Meta Description" name="metaDesc"  />
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <h3 className="font-semibold text-beige border-b border-white/5 pb-3">Apparence</h3>
              <div className="space-y-1 divide-y divide-white/5">
                <Toggle label="Mode sombre"       desc="Activer le toggle dark/light mode pour les visiteurs"     name="enableDark" />
                <Toggle label="Bilingue FR/EN"    desc="Afficher le sélecteur de langue (Français / Anglais)"    name="enableBilingual" />
                <Toggle label="Boutique en ligne" desc="Activer la section boutique et e-commerce"               name="enableShop" />
                <Toggle label="Newsletter"        desc="Afficher le formulaire d'abonnement newsletter"          name="enableNewsletter" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-beige/40 uppercase tracking-wider mb-2">Couleur principale</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer" />
                  <input type="text" value={settings.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige outline-none w-32" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <>
              <h3 className="font-semibold text-beige border-b border-white/5 pb-3">Clés API</h3>
              <div className="grid grid-cols-1 gap-5">
                <Field label="Google Maps API Key" name="googleMapsKey" placeholder="AIza..." type="password" />
                <Field label="Stripe Secret Key"    name="stripeKey"    placeholder="sk_live_..." type="password" />
                <Field label="Mailgun API Key"      name="mailgunKey"   placeholder="key-..." type="password" />
              </div>
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Zone dangereuse</h4>
                <p className="text-xs text-beige/40 mb-3">Ces actions sont irréversibles.</p>
                <div className="flex gap-3">
                  <button className="btn text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2">Vider le cache</button>
                  <button className="btn text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2">Export données</button>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="text-center py-12">
              <p className="text-beige/30 text-sm">Section en cours de développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
