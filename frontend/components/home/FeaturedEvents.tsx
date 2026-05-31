'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Ticket } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUpcomingEvents } from '@/store/slices/eventsSlice';
import type { RootState, AppDispatch } from '@/store/store';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, eventCategoryLabels, cn } from '@/lib/utils';

/* ─── Fallback seed data ─────────────────────────── */
const seedEvents = [
  {
    _id: '1', slug: 'bbq-pool-party', isFree: false, isFeatured: true,
    title: 'BBQ & Pool Party', category: 'pool-parties',
    date: '2025-08-10T18:00:00Z', location: 'Bangui',
    ticketPrice: 5000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
  },
  {
    _id: '2', slug: 'journee-femme', isFree: true, isFeatured: true,
    title: "Journée Internationale de la Femme", category: 'festivals',
    date: '2025-08-08T10:00:00Z', location: 'Bangui',
    ticketPrice: 0,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
  },
  {
    _id: '3', slug: 'cinema-mufasa', isFree: false, isFeatured: true,
    title: 'Cinéma en Famille – Mufasa', category: 'cinema',
    date: '2025-08-15T19:30:00Z', location: 'Bangui',
    ticketPrice: 3000,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  },
  {
    _id: '4', slug: 'tournoi-inter-entreprises', isFree: false, isFeatured: true,
    title: 'Tournoi Inter-Entreprises', category: 'sports',
    date: '2025-08-20T08:00:00Z', location: 'Bangui',
    ticketPrice: 2000,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
  },
  {
    _id: '5', slug: 'ti-i-festival', isFree: false, isFeatured: true,
    title: 'TÎ-ï Festival', category: 'festivals',
    date: '2025-09-01T17:00:00Z', location: 'Bangui',
    ticketPrice: 10000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  },
  {
    _id: '6', slug: 'soiree-jazz', isFree: false, isFeatured: true,
    title: "Soirée Jazz Restaurant M'", category: 'jazz-nights',
    date: '2025-08-25T20:00:00Z', location: "Restaurant M'",
    ticketPrice: 7500,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FeaturedEvents() {
  const { lang, t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { upcoming, isLoading } = useSelector((s: RootState) => s.events);

  useEffect(() => { dispatch(fetchUpcomingEvents()); }, [dispatch]);

  const events = upcoming.length ? upcoming : seedEvents;

  return (
    <section className="section-py bg-beige dark:bg-night" id="events">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('section.events.subtitle')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-night dark:text-beige">
              {t('section.events.title')}
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all"
          >
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured large card + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero event card */}
          {events[0] && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <Link href={`/events/${events[0].slug}`} className="group block h-full">
                <div className="relative h-[500px] rounded-3xl overflow-hidden card-premium">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={events[0].image}
                    alt={events[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider',
                      eventCategoryLabels[events[0].category]?.color || 'bg-gold'
                    )}>
                      {eventCategoryLabels[events[0].category]?.[lang] || events[0].category}
                    </span>
                  </div>

                  {/* Featured badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold text-night uppercase tracking-wider">
                      ✦ {t('general.featured')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
                      {events[0].title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gold" />
                        {formatDate(events[0].date, lang)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gold" />
                        {events[0].location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gold font-bold text-lg">
                        {events[0].isFree ? t('general.free') : `${events[0].ticketPrice?.toLocaleString()} XAF`}
                      </span>
                      <span className="flex items-center gap-1.5 text-white text-sm font-semibold group-hover:gap-2 transition-all">
                        <Ticket className="w-4 h-4" /> {t('events.tickets')} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right grid */}
          <div className="lg:col-span-7">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
            >
              {events.slice(1, 5).map((event) => (
                <motion.div key={event._id} variants={cardVariants}>
                  <Link href={`/events/${event.slug}`} className="group block">
                    <div className="relative h-[230px] rounded-2xl overflow-hidden card-premium bg-white dark:bg-night-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider',
                          eventCategoryLabels[event.category]?.color || 'bg-gold'
                        )}>
                          {eventCategoryLabels[event.category]?.[lang] || event.category}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-base font-bold text-white group-hover:text-gold transition-colors line-clamp-1 mb-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gold" />
                            {formatDate(event.date, lang)}
                          </span>
                          <span className="text-gold font-semibold">
                            {event.isFree ? t('general.free') : `${event.ticketPrice?.toLocaleString()} XAF`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* View all mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/events" className="btn-outline-gold px-8">
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
