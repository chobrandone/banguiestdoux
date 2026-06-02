'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Utensils, Film, ShoppingBag,
  Images, Users, MessageSquare, Settings, BarChart3,
  ChevronLeft, ChevronRight, Star, Globe, LogOut, Home,
  Megaphone, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard',       href: '/admin',                icon: LayoutDashboard },
  { label: 'Événements',      href: '/admin/events',         icon: Calendar        },
  { label: 'Restaurants',     href: '/admin/restaurants',    icon: Utensils        },
  { label: 'Articles',        href: '/admin/articles',       icon: Globe           },
  { label: 'Cinéma & Culture', href: '/admin/cinema',        icon: Film            },
  { label: 'Talents',         href: '/admin/talents',        icon: Star            },
  { label: 'Galerie',         href: '/admin/gallery',        icon: Images          },
  { label: 'Boutique',        href: '/admin/shop',           icon: ShoppingBag     },
  { label: 'Commandes',       href: '/admin/orders',         icon: ShoppingBag     },
  { label: 'Partenaires',     href: '/admin/partners',       icon: Megaphone       },
  { label: 'Utilisateurs',    href: '/admin/users',          icon: Users           },
  { label: 'Messages',        href: '/admin/messages',       icon: MessageSquare   },
  { label: 'Analytiques',     href: '/admin/analytics',      icon: BarChart3       },
  { label: 'Paramètres',      href: '/admin/settings',       icon: Settings        },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavList({ collapsed, onLinkClick }: { collapsed: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onLinkClick}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-beige/50 hover:text-beige hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-gold')} />
                {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
                {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 bg-gold rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-2 flex-shrink-0">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-beige/40 hover:text-beige hover:bg-white/5 transition-all"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Voir le site</span>}
        </Link>
        <button
          onClick={() => { logout(); onLinkClick?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-beige truncate">{user.name}</p>
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

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-[#0A0A0A] border-r border-white/5 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-lg font-bold text-beige"
              >
                BED <span className="text-gold">Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/40 hover:text-beige hover:bg-white/5 transition-all"
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
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#0A0A0A] border-r border-white/5 flex flex-col"
            >
              {/* Mobile logo + close */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 flex-shrink-0">
                <div className="font-display text-lg font-bold text-beige">
                  BED <span className="text-gold">Admin</span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/40 hover:text-beige hover:bg-white/5 transition-all"
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
