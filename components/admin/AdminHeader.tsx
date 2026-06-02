'use client';

import { useState } from 'react';
import { Bell, Search, Sun, Moon, Menu, Globe } from 'lucide-react';
import { useTheme }    from 'next-themes';
import { useAuth }     from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

const pageTitleKeys: Record<string, string> = {
  '/admin':             'admin.nav.dashboard',
  '/admin/events':      'admin.nav.events',
  '/admin/restaurants': 'admin.nav.restaurants',
  '/admin/articles':    'admin.nav.articles',
  '/admin/cinema':      'admin.nav.cinema',
  '/admin/gallery':     'admin.nav.gallery',
  '/admin/shop':        'admin.nav.shop',
  '/admin/talents':     'admin.nav.talents',
  '/admin/messages':    'admin.nav.messages',
  '/admin/settings':    'admin.nav.settings',
  '/admin/analytics':   'admin.nav.analytics',
  '/admin/users':       'admin.nav.users',
  '/admin/orders':      'admin.nav.orders',
  '/admin/partners':    'admin.nav.partners',
};

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for theme icon
  if (typeof window !== 'undefined' && !mounted) setMounted(true);

  const titleKey = pageTitleKeys[pathname] || 'admin.nav.dashboard';

  return (
    <header className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-beige/50 hover:text-gray-800 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-beige">{t(titleKey)}</h1>
          <p className="text-xs text-gray-400 dark:text-beige/30">{t('admin.header.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 text-gray-400 dark:text-beige/30">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder={t('admin.header.search')}
            className="bg-transparent text-sm text-gray-700 dark:text-beige placeholder:text-gray-400 dark:placeholder:text-beige/30 outline-none w-40"
          />
          <kbd className="text-[10px] border border-gray-300 dark:border-white/10 rounded px-1.5 py-0.5 text-gray-400 dark:text-beige/30">⌘K</kbd>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          title={t('admin.lang.switch')}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-gray-500 dark:text-beige/40 hover:text-gray-800 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-xs font-bold"
        >
          <Globe className="w-4 h-4" />
          {lang.toUpperCase()}
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t('admin.theme.light') : t('admin.theme.dark')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-beige/40 hover:text-gray-800 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-beige/40 hover:text-gray-800 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center text-gold font-bold text-sm cursor-pointer hover:bg-gold/30 transition-colors">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
