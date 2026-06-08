'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Search, Filter, Grid3X3, List, ChevronRight, Ticket, Clock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, eventCategoryLabels, cn } from '@/lib/utils';
import { getEvents } from '@/lib/db';
import type { Event } from '@/types';

const CATEGORIES = [
  { key: 'all',                 tKey: 'cat.all' },
  { key: 'concerts',            tKey: 'cat.concerts' },
  { key: 'festivals',           tKey: 'cat.festivals' },
  { key: 'cinema',              tKey: 'cat.cinema' },
  { key: 'pool-parties',        tKey: 'cat.poolParties' },
  { key: 'jazz-nights',         tKey: 'cat.jazzNights' },
  { key: 'sports',              tKey: 'cat.sports' },
  { key: 'exhibitions',         tKey: 'cat.exhibitions' },
  { key: 'restaurant-openings', tKey: 'cat.restaurantOpenings' },
];

type ViewMode = 'grid' | 'list';

export default function EventsPage() {
  const { lang, t } = useLanguage();
  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [viewMode, setViewMode]       = useState<ViewMode>('grid');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    getEvents({ limit: 50 })
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((ev) => {
    const matchesCat = selectedCat === 'all' || ev.category === selectedCat;
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase())
      || ev.location.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-night overflow-hidden flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920" alt="Events" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="container-custom relative z-10 pt-24 md:pt-28">
          <span className="label-editorial">Agenda</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('events.title')}</h1>
          <p className="text-beige/60 mt-2">{t('section.events.subtitle')}</p>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen">
        <div className="container-custom py-10">
          {/* Search & Filters bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night/40 dark:text-beige/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('events.search')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-night-50 rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-3 rounded-xl border transition-all', viewMode === 'grid' ? 'bg-gold text-night border-gold' : 'border-gold/20 text-night/50 dark:text-beige/50 hover:border-gold/50')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-3 rounded-xl border transition-all', viewMode === 'list' ? 'bg-gold text-night border-gold' : 'border-gold/20 text-night/50 dark:text-beige/50 hover:border-gold/50')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {CATEGORIES.map(({ key, tKey }) => (
              <button
                key={key}
                onClick={() => setSelectedCat(key)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                  selectedCat === key
                    ? 'bg-gold text-night shadow-gold'
                    : 'bg-white dark:bg-night-50 text-night/70 dark:text-beige/70 hover:bg-gold/10 border border-gold/10'
                )}
              >
                {t(tKey)}
              </button>
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-16 h-16 text-gold/20 mb-4" />
              <p className="text-night/40 dark:text-beige/40 text-lg font-semibold">{t('general.noContent')}</p>
              <p className="text-night/30 dark:text-beige/30 text-sm mt-1">{t('general.comingSoon')}</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <>
              {/* Count */}
              <p className="text-sm text-night/50 dark:text-beige/50 mb-6">
                {filtered.length} {t('events.found')}
              </p>

              {/* Events Grid */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((event, i) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/events/${event.slug}`} className="group block bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-52 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase', eventCategoryLabels[event.category]?.color || 'bg-gold')}>
                              {eventCategoryLabels[event.category]?.[lang] || event.category}
                            </span>
                          </div>
                          {event.isFeatured && (
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold text-night uppercase">★ Featured</span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <span className="text-gold font-bold text-sm">
                              {event.isFree ? t('general.free') : `${(event.ticketPrice ?? 0).toLocaleString()} XAF`}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display text-base font-bold text-night dark:text-beige group-hover:text-gold transition-colors line-clamp-2 mb-2">{event.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-night/50 dark:text-beige/50 mb-1">
                            <Calendar className="w-3 h-3 text-gold" />{formatDate(event.date, lang)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-night/50 dark:text-beige/50">
                            <MapPin className="w-3 h-3 text-gold" />{event.location}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* List view */
                <div className="space-y-4">
                  {filtered.map((event, i) => (
                    <motion.div key={event._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/events/${event.slug}`} className="group flex gap-4 bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 p-4">
                        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase', eventCategoryLabels[event.category]?.color || 'bg-gold')}>
                              {eventCategoryLabels[event.category]?.[lang]}
                            </span>
                            <span className="text-gold font-bold text-sm flex-shrink-0">
                              {event.isFree ? t('general.free') : `${(event.ticketPrice ?? 0).toLocaleString()} XAF`}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors mt-2 line-clamp-1">{event.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-night/50 dark:text-beige/50">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold" />{formatDate(event.date, lang)}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold" />{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <ChevronRight className="w-5 h-5 text-gold" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <Calendar className="w-16 h-16 text-gold/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-night/50 dark:text-beige/50">{t('general.noResults')}</h3>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
