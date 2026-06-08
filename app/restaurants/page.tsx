'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Search, Phone, ExternalLink, Clock, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, restaurantCategoryLabels } from '@/lib/utils';
import { getRestaurants } from '@/lib/db';
import type { Restaurant } from '@/types';

const CATEGORIES = [
  { key: 'all',         tKey: 'cat.all' },
  { key: 'restaurant',  tKey: 'cat.restaurant' },
  { key: 'bar',         tKey: 'cat.bar' },
  { key: 'rooftop',     tKey: 'cat.rooftop' },
  { key: 'lounge',      tKey: 'cat.lounge' },
  { key: 'nightclub',   tKey: 'cat.nightclub' },
  { key: 'cafe',        tKey: 'cat.cafe' },
  { key: 'street-food', tKey: 'cat.streetFood' },
  { key: 'fast-food',   tKey: 'cat.fastFood' },
];

const PriceRange = ({ range }: { range: number }) => (
  <span className="text-xs font-bold">
    {Array.from({ length: 4 }, (_, i) => (
      <span key={i} className={i < range ? 'text-gold' : 'text-night/20 dark:text-beige/20'}>€</span>
    ))}
  </span>
);

export default function RestaurantsPage() {
  const { lang, t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    getRestaurants({ limit: 50 })
      .then(setRestaurants)
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
      || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 bg-night overflow-hidden flex items-end pb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1566717153027-aa70e8df07c4?w=1920" alt="Restaurants" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
        <div className="container-custom relative z-10 pt-24 lg:pt-28">
          <span className="label-editorial">Gastronomie & Nightlife</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('section.restaurants.title')}</h1>
          <p className="text-beige/60 mt-2">{t('section.restaurants.subtitle')}</p>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen">
        <div className="container-custom py-10">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night/40 dark:text-beige/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('restaurants.search')}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-night-50 rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {CATEGORIES.map(({ key, tKey }) => (
              <button
                key={key}
                onClick={() => setSelectedCat(key)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
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
          {!loading && restaurants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gold/20 mb-4" />
              <p className="text-night/40 dark:text-beige/40 text-lg font-semibold">{t('general.noContent')}</p>
              <p className="text-night/30 dark:text-beige/30 text-sm mt-1">{t('general.comingSoon')}</p>
            </div>
          )}

          {!loading && restaurants.length > 0 && (
            <>
              {/* Featured grid + regular grid */}
              {selectedCat === 'all' && filtered.some(r => r.isFeatured) && (
                <>
                  <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-6">
                    ✦ {t('general.featured')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {filtered.filter(r => r.isFeatured).map((r, i) => (
                      <motion.div key={r._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
                        <Link href={`/restaurants/${r.slug}`} className="group block bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                          <div className="relative h-56">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-3 left-3"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gold text-night uppercase">{restaurantCategoryLabels[r.category]?.[lang]}</span></div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors">{r.name}</h3>
                              <PriceRange range={r.priceRange} />
                            </div>
                            <div className="flex items-center gap-1.5 mb-3">
                              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                              <span className="text-sm font-bold text-night dark:text-beige">{r.rating ?? '—'}</span>
                              {r.reviewCount != null && (
                                <span className="text-xs text-night/40 dark:text-beige/40">({r.reviewCount})</span>
                              )}
                            </div>
                            <p className="text-xs text-night/50 dark:text-beige/50 line-clamp-2 mb-3">{r.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1 text-night/40 dark:text-beige/40"><MapPin className="w-3 h-3" />{r.address.split(',')[0]}</span>
                              <span className="text-gold font-semibold group-hover:underline">{t('restaurants.reserve')} →</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-6">{t('restaurants.allAddresses')}</h2>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filtered.map((r, i) => (
                  <motion.div key={r._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
                    <Link href={`/restaurants/${r.slug}`} className="group block bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-44">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-2 left-2"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold text-night uppercase">{restaurantCategoryLabels[r.category]?.[lang]}</span></div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display text-sm font-bold text-night dark:text-beige group-hover:text-gold transition-colors line-clamp-1">{r.name}</h3>
                          <PriceRange range={r.priceRange} />
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-gold fill-gold" />
                          <span className="text-xs font-bold">{r.rating ?? '—'}</span>
                          {r.reviewCount != null && (
                            <span className="text-[10px] text-night/40 dark:text-beige/40">({r.reviewCount})</span>
                          )}
                        </div>
                        <div className="text-[10px] text-night/40 dark:text-beige/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{r.address.split(',')[0]}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
