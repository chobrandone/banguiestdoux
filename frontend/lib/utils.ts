import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Date helpers ───────────────────────────────── */
export function formatDate(date: string | Date, lang: 'fr' | 'en' = 'fr') {
  const locale = lang === 'fr' ? fr : enUS;
  return format(new Date(date), 'dd MMMM yyyy', { locale });
}

export function formatDateTime(date: string | Date, lang: 'fr' | 'en' = 'fr') {
  const locale = lang === 'fr' ? fr : enUS;
  return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale });
}

export function timeAgo(date: string | Date, lang: 'fr' | 'en' = 'fr') {
  const locale = lang === 'fr' ? fr : enUS;
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
}

export function isEventPast(date: string | Date) {
  return isPast(new Date(date));
}

export function isEventFuture(date: string | Date) {
  return isFuture(new Date(date));
}

/* ─── Countdown ─────────────────────────────────── */
export function getCountdown(targetDate: string | Date) {
  const target = new Date(targetDate).getTime();
  const now    = Date.now();
  const diff   = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}

/* ─── Price helpers ─────────────────────────────── */
export function formatPrice(amount: number, currency = 'XAF') {
  if (currency === 'XAF') {
    return new Intl.NumberFormat('fr-CF', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function priceRangeLabel(range: 1 | 2 | 3 | 4) {
  return '€'.repeat(range) + '€'.repeat(4 - range).replace(/€/g, '○');
}

/* ─── String helpers ────────────────────────────── */
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/* ─── Image helpers ─────────────────────────────── */
export function getImageUrl(path?: string | null, fallback = '/images/placeholder.jpg') {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`;
}

export function getBlurDataUrl() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCA2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNDOUE4NEMiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==';
}

/* ─── Category labels ───────────────────────────── */
export const eventCategoryLabels: Record<string, { fr: string; en: string; color: string }> = {
  concerts:             { fr: 'Concerts',           en: 'Concerts',           color: 'bg-purple-500' },
  festivals:            { fr: 'Festivals',           en: 'Festivals',          color: 'bg-orange-500' },
  cinema:               { fr: 'Cinéma',              en: 'Cinema',             color: 'bg-blue-500'   },
  'pool-parties':       { fr: 'Pool Parties',        en: 'Pool Parties',       color: 'bg-cyan-500'   },
  'jazz-nights':        { fr: 'Jazz Nights',         en: 'Jazz Nights',        color: 'bg-yellow-600' },
  sports:               { fr: 'Sports',              en: 'Sports',             color: 'bg-green-500'  },
  exhibitions:          { fr: 'Expositions',         en: 'Exhibitions',        color: 'bg-pink-500'   },
  'restaurant-openings':{ fr: 'Restaurants',         en: 'Restaurant Openings',color: 'bg-red-500'    },
  theatre:              { fr: 'Théâtre',             en: 'Theatre',            color: 'bg-indigo-500' },
  art:                  { fr: 'Art',                 en: 'Art',                color: 'bg-rose-500'   },
  other:                { fr: 'Autres',              en: 'Other',              color: 'bg-gray-500'   },
};

export const restaurantCategoryLabels: Record<string, { fr: string; en: string }> = {
  restaurant:  { fr: 'Restaurant',   en: 'Restaurant'  },
  bar:         { fr: 'Bar',          en: 'Bar'         },
  rooftop:     { fr: 'Rooftop',      en: 'Rooftop'     },
  lounge:      { fr: 'Lounge',       en: 'Lounge'      },
  'fast-food': { fr: 'Fast Food',    en: 'Fast Food'   },
  'street-food':{ fr: 'Street Food', en: 'Street Food' },
  cafe:        { fr: 'Café',         en: 'Café'        },
  nightclub:   { fr: 'Boîte',        en: 'Nightclub'   },
  other:       { fr: 'Autre',        en: 'Other'       },
};

/* ─── Storage helpers ───────────────────────────── */
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  },
  set: (key: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/* ─── Debounce ──────────────────────────────────── */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ─── Scroll ────────────────────────────────────── */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Validation ────────────────────────────────── */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string) {
  return /^\+?[\d\s\-()]{8,}$/.test(phone);
}
