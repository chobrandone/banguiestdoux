'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, restaurantCategoryLabels } from '@/lib/utils';
import { getFeaturedRestaurants } from '@/lib/db';
import type { Restaurant } from '@/types';

/* ─── Fallback seed data ────────────────────────── */
const seedRestaurants: Restaurant[] = [
  {
    _id: '1', slug: 'restaurant-m', name: "Restaurant M'",
    category: 'restaurant', cuisine: ['Africaine', 'Française', 'Fusion'],
    description: "L'adresse incontournable de Bangui pour une cuisine raffinée au cœur de la capitale.",
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    rating: 4.8, reviewCount: 124, priceRange: 3,
    address: 'Centre-ville, Bangui', isFeatured: true, createdAt: '',
  },
  {
    _id: '2', slug: 'bangui-rock-club', name: 'Bangui Rock Club',
    category: 'nightclub', cuisine: ['Cocktails', 'Snacks'],
    description: "Le temple de la musique live et des nuits inoubliables à Bangui.",
    image: 'https://images.unsplash.com/photo-1545128485-c400ce7b9e5d?w=800',
    rating: 4.7, reviewCount: 89, priceRange: 2,
    address: 'Bangui', isFeatured: true, createdAt: '',
  },
  {
    _id: '3', slug: 'l-avenue', name: "L'Avenue",
    category: 'lounge', cuisine: ['International', 'Cocktails'],
    description: "Le lounge chic et moderne de Bangui, parfait pour l'apéritif et la soirée.",
    image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800',
    rating: 4.6, reviewCount: 67, priceRange: 3,
    address: "Avenue de l'Indépendance, Bangui", isFeatured: true, createdAt: '',
  },
  {
    _id: '4', slug: 'rooftop-bangui', name: 'Rooftop Bangui',
    category: 'rooftop', cuisine: ['Cocktails', 'Tapas', 'Grillades'],
    description: "La vue panoramique sur Bangui et ses cocktails signature vous attendent.",
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    rating: 4.9, reviewCount: 45, priceRange: 4,
    address: 'Centre-ville, Bangui', isFeatured: true, createdAt: '',
  },
];

const PriceRange = ({ range }: { range: number }) => (
  <span className="text-xs font-semibold">
    {Array.from({ length: 4 }, (_, i) => (
      <span key={i} className={i < range ? 'text-gold' : 'text-night/20 dark:text-beige/20'}>€</span>
    ))}
  </span>
);

export default function TrendingRestaurants() {
  const { lang, t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    getFeaturedRestaurants(4)
      .then((data) => setRestaurants(data.length ? data : seedRestaurants))
      .catch(() => setRestaurants(seedRestaurants))
      .finally(() => setIsLoading(false));
  }, []);

  const displayRestaurants = isLoading ? [] : (restaurants.length ? restaurants : seedRestaurants);

  return (
    <section className="section-py bg-white dark:bg-night-50" id="restaurants">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('section.restaurants.subtitle')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-night dark:text-beige">
              {t('section.restaurants.title')}
            </h2>
          </div>
          <Link href="/restaurants" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2">
          {(['cat.all','cat.restaurant','cat.bar','cat.rooftop','cat.lounge','cat.nightclub','cat.streetFood'] as const).map((tKey, i) => (
            <span
              key={tKey}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold cursor-default',
                i === 0 ? 'bg-gold text-white dark:text-night' : 'bg-gold/10 text-night/70 dark:text-beige/70'
              )}
            >
              {t(tKey)}
            </span>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[0,1,2,3].map(i => <div key={i} className="h-80 bg-night-50 rounded-2xl" />)}
          </div>
        )}

        {/* Restaurant cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayRestaurants.map((restaurant, i) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={`/restaurants/${restaurant.slug}`} className="group block h-full">
                  <div className="bg-white dark:bg-night rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gold text-white dark:text-night uppercase tracking-wider">
                          {restaurantCategoryLabels[restaurant.category]?.[lang] || restaurant.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors flex-1">
                          {restaurant.name}
                        </h3>
                        <PriceRange range={restaurant.priceRange} />
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-sm font-bold text-night dark:text-beige">{restaurant.rating ?? '—'}</span>
                        {restaurant.reviewCount != null && (
                          <span className="text-xs text-night/40 dark:text-beige/40">({restaurant.reviewCount})</span>
                        )}
                      </div>

                      {restaurant.cuisine && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(restaurant.cuisine as string[]).slice(0, 2).map((c) => (
                            <span key={c} className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-semibold rounded-full">{c}</span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-night/50 dark:text-beige/50 line-clamp-2 flex-1 mb-3">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gold/10">
                        <span className="flex items-center gap-1 text-xs text-night/40 dark:text-beige/40">
                          <MapPin className="w-3 h-3" /> {restaurant.address.split(',')[0]}
                        </span>
                        <span className="text-gold text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('restaurants.view')} <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/restaurants" className="btn-outline-gold px-8">
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Nightlife callout banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl overflow-hidden relative h-40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1400"
            alt="Nightlife Bangui"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-night opacity-80" />
          <div className="absolute inset-0 flex items-center justify-between px-8">
            <div>
              <p className="label-editorial text-gold mb-1">{t('restaurants.nightlifeLabel')}</p>
              <h3 className="font-display text-2xl font-bold text-white">{t('restaurants.nightlifeTitle')}</h3>
              <p className="text-white/60 text-sm mt-1">{t('restaurants.nightlifeSub')}</p>
            </div>
            <Link href="/restaurants?cat=nightclub" className="btn-gold flex-shrink-0">
              {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
