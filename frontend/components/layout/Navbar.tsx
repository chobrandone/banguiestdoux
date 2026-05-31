'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingBag, Search, Sun, Moon, Globe,
  ChevronDown, ChevronRight, User, LogOut, LayoutDashboard,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth }     from '@/contexts/AuthContext';
import { useCart }     from '@/contexts/CartContext';
import { cn }          from '@/lib/utils';

const navLinks = [
  { key: 'nav.events',      href: '/events',      label: 'Événements'   },
  { key: 'nav.restaurants', href: '/restaurants', label: 'Restaurants'  },
  { key: 'nav.cinema',      href: '/cinema',      label: 'Cinéma'       },
  {
    key: 'nav.discover', href: '/discover', label: 'Découvrir',
    children: [
      { label: 'Que faire à Bangui',  href: '/discover'                    },
      { label: 'Où manger',           href: '/restaurants'                 },
      { label: 'Nightlife',           href: '/restaurants?cat=nightclub'   },
      { label: 'Quartiers tendance',  href: '/discover#neighborhoods'      },
      { label: 'Meilleures photos',   href: '/discover#spots'              },
    ],
  },
  { key: 'nav.practical', href: '/practical', label: 'Pratique'  },
  { key: 'nav.talents',   href: '/talents',   label: 'Talents'   },
  { key: 'nav.gallery',   href: '/gallery',   label: 'Galerie'   },
  { key: 'nav.shop',      href: '/shop',      label: 'Boutique'  },
];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme }  = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();

  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isMobileOpen,   setIsMobileOpen]   = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [mounted,        setMounted]        = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  const searchRef     = useRef<HTMLInputElement>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen, searchOpen]);

  const handleDropdownEnter = (key: string) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(key);
  };
  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const isTransparent = !isScrolled && !isMobileOpen;
  const closeMobile   = () => { setIsMobileOpen(false); setExpandedMobile(null); };

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-black/5 dark:border-white/5'
      )}>
        {/* Announcement bar */}
        <div className={cn(
          'overflow-hidden transition-all duration-500',
          isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
        )}>
          <div className="bg-gold text-white text-xs font-semibold text-center py-2 tracking-wider uppercase">
            ✦ Le meilleur de Bangui — Événements · Restaurants · Culture · Nightlife ✦
          </div>
        </div>

        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0" onClick={closeMobile}>
              <span className={cn(
                'font-display font-bold text-xl lg:text-2xl tracking-tight transition-colors duration-300',
                isTransparent ? 'text-white' : 'text-night dark:text-beige'
              )}>
                Bangui<span className="text-gold"> est Doux</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.key} className="relative"
                  onMouseEnter={() => link.children && handleDropdownEnter(link.key)}
                  onMouseLeave={() => link.children && handleDropdownLeave()}
                >
                  <Link href={link.href} className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-night/80 dark:text-beige/80 hover:text-gold dark:hover:text-gold hover:bg-gold/10'
                  )}>
                    {t(link.key)}
                    {link.children && <ChevronDown className="w-3 h-3 opacity-60" />}
                  </Link>

                  <AnimatePresence>
                    {link.children && activeDropdown === link.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg overflow-hidden border border-black/5 dark:border-white/8"
                      >
                        {link.children.map((child) => (
                          <Link key={child.href} href={child.href}
                            className="block px-4 py-3 text-sm text-night/80 dark:text-beige/70 hover:text-gold hover:bg-gold/5 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} aria-label="Rechercher"
                className={cn('p-2 rounded-lg transition-all', isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-night/70 dark:text-beige/70 hover:bg-gold/10 hover:text-gold')}>
                <Search className="w-5 h-5" />
              </button>

              <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all', isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-night/70 dark:text-beige/70 hover:bg-gold/10 hover:text-gold')}>
                <Globe className="w-3.5 h-3.5" />{lang.toUpperCase()}
              </button>

              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Thème"
                  className={cn('p-2 rounded-lg transition-all', isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-night/70 dark:text-beige/70 hover:bg-gold/10 hover:text-gold')}>
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              <button onClick={toggleCart} aria-label="Panier"
                className={cn('relative p-2 rounded-lg transition-all', isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-night/70 dark:text-beige/70 hover:bg-gold/10 hover:text-gold')}>
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
                )}
              </button>

              {user ? (
                <div className="relative"
                  onMouseEnter={() => handleDropdownEnter('user')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 transition-colors">
                    <User className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-night dark:text-beige max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'user' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg border border-black/5 dark:border-white/8 overflow-hidden">
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gold/10 text-night dark:text-beige transition-colors" onClick={() => setActiveDropdown(null)}>
                            <LayoutDashboard className="w-4 h-4 text-gold" /> Dashboard Admin
                          </Link>
                        )}
                        <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login" className="ml-1 px-4 py-2 bg-gold text-white text-sm font-semibold rounded-xl hover:bg-gold-700 transition-all hover:scale-[1.03] active:scale-[0.97]">
                  {t('auth.login')}
                </Link>
              )}
            </div>

            {/* Mobile bar actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button onClick={toggleCart} aria-label="Panier"
                className={cn('relative p-2 rounded-lg transition-colors', isTransparent ? 'text-white' : 'text-night dark:text-beige')}>
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
                )}
              </button>
              <button onClick={() => setIsMobileOpen(true)} aria-label="Menu"
                className={cn('p-2 rounded-lg transition-colors', isTransparent ? 'text-white' : 'text-night dark:text-beige')}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
            />

            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-[56] w-[85vw] max-w-sm bg-white dark:bg-[#111111] flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/6 flex-shrink-0">
                <span className="font-display font-bold text-lg text-night dark:text-beige">
                  Bangui<span className="text-gold"> est Doux</span>
                </span>
                <button onClick={closeMobile}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-night dark:text-beige hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-3">
                {navLinks.map((link, i) => (
                  <motion.div key={link.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {link.children ? (
                      <>
                        <button
                          onClick={() => setExpandedMobile(expandedMobile === link.key ? null : link.key)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold text-night dark:text-beige hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gold transition-all"
                        >
                          <span>{t(link.key)}</span>
                          <ChevronRight className={cn('w-4 h-4 opacity-40 transition-transform', expandedMobile === link.key && 'rotate-90')} />
                        </button>
                        <AnimatePresence>
                          {expandedMobile === link.key && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="ml-3 pl-3 border-l-2 border-gold/20 py-1 space-y-0.5">
                                {link.children.map((child) => (
                                  <Link key={child.href} href={child.href} onClick={closeMobile}
                                    className="block px-3 py-2.5 text-sm text-night/60 dark:text-beige/60 hover:text-gold hover:bg-gold/5 rounded-lg transition-all">
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={link.href} onClick={closeMobile}
                        className="flex items-center px-4 py-3.5 rounded-xl text-base font-semibold text-night dark:text-beige hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gold transition-all">
                        {t(link.key)}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Bottom section */}
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-white/6 px-4 py-4 space-y-3">
                {/* Theme + Language row */}
                <div className="grid grid-cols-2 gap-2">
                  {mounted && (
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-white/8 text-sm font-semibold text-night dark:text-beige hover:bg-gold/15 hover:text-gold transition-all">
                      {theme === 'dark' ? <><Sun className="w-4 h-4" /> Clair</> : <><Moon className="w-4 h-4" /> Sombre</>}
                    </button>
                  )}
                  <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-white/8 text-sm font-semibold text-night dark:text-beige hover:bg-gold/15 hover:text-gold transition-all">
                    <Globe className="w-4 h-4" />
                    {lang === 'fr' ? 'English' : 'Français'}
                  </button>
                </div>

                {/* Auth */}
                {user ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link href="/admin" onClick={closeMobile}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-700 transition-all">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard Admin
                      </Link>
                    )}
                    <button onClick={() => { logout(); closeMobile(); }}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 dark:border-red-500/30 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link href="/auth/login" onClick={closeMobile}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-700 transition-all">
                    {t('auth.login')}
                  </Link>
                )}

                {/* Social links */}
                <div className="flex items-center justify-center gap-5 pt-1">
                  {[['Instagram', 'https://instagram.com'], ['Facebook', 'https://facebook.com'], ['TikTok', 'https://tiktok.com']].map(([name, href]) => (
                    <a key={name} href={href} target="_blank" rel="noreferrer"
                      className="text-xs text-night/40 dark:text-beige/40 hover:text-gold transition-colors font-medium">
                      {name}
                    </a>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Search Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input ref={searchRef} type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher événements, restaurants, articles..."
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#1A1A1A] text-night dark:text-beige rounded-2xl text-lg border-2 border-gold/30 focus:border-gold outline-none"
                />
                <button onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-night/40 dark:text-beige/40 hover:text-night dark:hover:text-beige">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {searchQuery && (
                <div className="mt-2 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-black/5 dark:border-white/8 overflow-hidden">
                  <p className="px-4 py-3 text-sm text-night/50 dark:text-beige/50">
                    Recherche pour &ldquo;{searchQuery}&rdquo;...
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
