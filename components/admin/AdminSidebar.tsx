'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Utensils, Film, ShoppingBag,
  Images, Users, MessageSquare, Settings, BarChart3,
  ChevronLeft, ChevronRight, Star, Globe, LogOut, Home,
  Megaphone, X,
} from 'lucide-react';
import { useAuth }     from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn }          from '@/lib/utils';

const navItems = [
  { key: 'admin.nav.dashboard',   href: '/admin',              icon: LayoutDashboard },
  { key: 'admin.nav.events',      href: '/admin/events',       icon: Calendar        },
  { key: 'admin.nav.restaurants', href: '/admin/restaurants',  icon: Utensils        },
  { key: 'admin.nav.articles',    href: '/admin/articles',     icon: Globe           },
  { key: 'admin.nav.cinema',      href: '/admin/cinema',       icon: Film            },
  { key: 'admin.nav.talents',     href: '/admin/talents',      icon: Star            },
  { key: 'admin.nav.gallery',     href: '/admin/gallery',      icon: Images          },
  { key: 'admin.nav.shop',        href: '/admin/shop',         icon: ShoppingBag     },
  { key: 'admin.nav.orders',      href: '/admin/orders',       icon: ShoppingBag     },
  { key: 'admin.nav.partners',    href: '/admin/partners',     icon: Megaphone       },
  { key: 'admin.nav.users',       href: '/admin/users',        icon: Users           },
  { key: 'admin.nav.messages',    href: '/admin/messages',     icon: MessageSquare   },
  { key: 'admin.nav.analytics',   href: '/admin/analytics',    icon: BarChart3       },
  { key: 'admin.nav.settings',    href: '/admin/settings',     icon: Settings        },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavList({ collapsed, onLinkClick }: { collapsed: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map(({ key, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onLinkClick}
                title={collapsed ? t(key) : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-gray-500 dark:text-beige/50 hover:text-gray-900 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-gold')} />
                {!collapsed && <span className="text-sm font-medium truncate">{t(key)}</span>}
                {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 bg-gold rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-white/5 space-y-2 flex-shrink-0">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 dark:text-beige/40 hover:text-gray-700 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t('admin.nav.viewSite')}</span>}
        </Link>
        <button
          onClick={() => { logout(); onLinkClick?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t('admin.nav.logout')}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-beige truncate">{user.name}</p>
              <p className="text-[10px] text-gold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const logoSrc = (mounted && theme === 'dark') ? '/images/logo-dark.svg' : '/images/logo-light.svg';

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-white/5 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="Bangui est Doux" className="h-10 w-auto object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-beige/40 hover:text-gray-700 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <NavList collapsed={collapsed} />
      </aside>

      {/* ── Mobile overlay ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-white/5 flex flex-col"
            >
              {/* Mobile logo + close */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="Bangui est Doux" className="h-10 w-auto object-contain" />
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-beige/40 hover:text-gray-700 dark:hover:text-beige hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <NavList collapsed={false} onLinkClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
