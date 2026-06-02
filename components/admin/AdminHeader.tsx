'use client';

import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin':             'Dashboard',
  '/admin/events':      'Événements',
  '/admin/restaurants': 'Restaurants',
  '/admin/articles':    'Articles',
  '/admin/gallery':     'Galerie',
  '/admin/shop':        'Boutique',
  '/admin/talents':     'Talents',
  '/admin/messages':    'Messages',
  '/admin/settings':    'Paramètres',
  '/admin/analytics':   'Analytiques',
  '/admin/users':       'Utilisateurs',
  '/admin/orders':      'Commandes',
  '/admin/partners':    'Partenaires',
};

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname  = usePathname();
  const { theme, setTheme } = useTheme();
  const { user }  = useAuth();

  const title = pageTitles[pathname] || 'Admin';

  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-beige/50 hover:text-beige hover:bg-white/5 transition-all"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-beige">{title}</h1>
          <p className="text-xs text-beige/30">Bangui est Doux · CMS</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-beige/30">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-beige placeholder:text-beige/30 outline-none w-40"
          />
          <kbd className="text-[10px] border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

        {/* Theme */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-beige/40 hover:text-beige hover:bg-white/5 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-beige/40 hover:text-beige hover:bg-white/5 transition-all">
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
