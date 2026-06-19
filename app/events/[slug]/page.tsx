'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin, Ticket, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, eventCategoryLabels, cn } from '@/lib/utils';
import { getEvent } from '@/lib/db';
import type { Event } from '@/types';

/** Normalize any phone format to digits only, for a wa.me link */
function toWhatsappLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(slug)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">
        {lang === 'fr' ? 'Événement introuvable' : 'Event not found'}
      </p>
      <button onClick={() => router.push('/events')} className="btn-gold px-6 py-3">
        ← {t('general.seeAll')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige dark:bg-night pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/events"
          className="flex items-center gap-2 text-sm text-night/40 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> {t('general.seeAll')}
        </Link>

        {/* Hero image */}
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          <div className="absolute top-4 left-4">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider',
              eventCategoryLabels[event.category]?.color || 'bg-gold'
            )}>
              {eventCategoryLabels[event.category]?.[lang] || event.category}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/70 text-sm mt-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" /> {formatDate(event.date, lang)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" /> {event.location}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {event.description && (
              <p className="text-night/70 dark:text-beige/70 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            )}

            {event.address && (
              <div className="flex items-start gap-3 py-4 border-t border-gold/10">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-night dark:text-beige">{event.location}</p>
                  <p className="text-sm text-night/50 dark:text-beige/50">{event.address}</p>
                </div>
              </div>
            )}

            {event.organizer && (
              <p className="text-sm text-night/50 dark:text-beige/50">
                {lang === 'fr' ? 'Organisé par' : 'Organized by'} <span className="font-semibold text-night dark:text-beige">{event.organizer}</span>
              </p>
            )}
          </div>

          {/* Sidebar: ticket + WhatsApp contact */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#141414] border border-gold/10 dark:border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-bold text-night dark:text-beige">
                {event.isFree ? t('general.free') : `${(event.ticketPrice ?? 0).toLocaleString()} XAF`}
              </p>
              <p className="text-sm text-night/40 dark:text-beige/40 mb-6">
                {event.isFree ? (lang === 'fr' ? 'Entrée gratuite' : 'Free entry') : t('events.tickets')}
              </p>

              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-night font-bold text-center rounded-2xl hover:bg-gold/85 transition-all shadow-gold-lg mb-3"
                >
                  <Ticket className="w-4 h-4" /> {t('events.tickets')}
                </a>
              )}

              {event.contactWhatsapp && (
                <a
                  href={toWhatsappLink(event.contactWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-bold text-center rounded-2xl hover:bg-[#25D366]/85 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  {lang === 'fr' ? 'Contacter sur WhatsApp' : 'Contact on WhatsApp'}
                </a>
              )}

              {!event.contactWhatsapp && !event.ticketUrl && (
                <div className="w-full py-4 bg-night/5 dark:bg-white/5 text-night/40 dark:text-beige/40 text-center rounded-2xl text-sm">
                  {lang === 'fr' ? 'Aucune information de contact disponible' : 'No contact information available'}
                </div>
              )}
            </div>

            {event.contactWhatsapp && (
              <p className="text-xs text-center text-night/30 dark:text-beige/30">
                {lang === 'fr' ? 'Contactez directement l\'organisateur via WhatsApp' : 'Reach the organizer directly via WhatsApp'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
