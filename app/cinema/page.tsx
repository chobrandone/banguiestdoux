'use client';

import { useEffect, useState } from 'react';
import { Film, Music, Theater, Palette, Calendar, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getArticles, getUpcomingEvents } from '@/lib/db';
import type { Article, Event } from '@/types';

const CULTURAL_ICONS = [Music, Palette, Theater, Film];

export default function CinemaPage() {
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getArticles({ limit: 8 }).then(data => data.filter(a => a.category === 'cinema' || a.category === 'culture')),
      getUpcomingEvents(4),
    ])
      .then(([arts, evts]) => { setArticles(arts); setEvents(evts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero — design image kept intentionally */}
      <div className="relative h-72 overflow-hidden flex items-end pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920"
          alt="Cinema"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-24 lg:pt-28">
          <span className="label-editorial">{t('cinema.arts')}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('cinema.title')}</h1>
          <p className="text-beige/60 mt-2">{t('cinema.subtitle')}</p>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen py-16">
        <div className="container-custom space-y-16">

          {/* Now Screening */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('cinema.nowScreening')}</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('cinema.nowPlaying')}</h2>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
                {[0,1,2,3].map(i => <div key={i} className="h-72 bg-night/10 dark:bg-beige/5 rounded-2xl" />)}
              </div>
            )}

            {!loading && articles.length === 0 && (
              <p className="text-night/40 dark:text-beige/40">
                {lang === 'fr' ? 'Aucun film ou article cinéma disponible pour le moment.' : 'No cinema articles available at the moment.'}
              </p>
            )}

            {!loading && articles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {articles.map((article) => (
                  <div key={article._id} className="group bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                    <div className="relative h-64 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image}
                        alt={lang === 'fr' ? (article.titleFr || article.title) : article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full uppercase">
                          {article.category}
                        </span>
                      </div>
                      {article.readTime && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full">
                          <Star className="w-3 h-3 text-gold fill-gold" />
                          <span className="text-white text-[10px] font-bold">{article.readTime} min</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-1 line-clamp-2">
                        {lang === 'fr' ? (article.titleFr || article.title) : article.title}
                      </h3>
                      {article.publishedAt && (
                        <p className="text-xs text-night/40 dark:text-beige/40 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {article.author && typeof article.author === 'string' && (
                        <p className="text-xs text-night/50 dark:text-beige/50">{article.author}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cultural Agenda */}
          {!loading && events.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="divider-gold" />
                <span className="label-editorial">{t('cinema.agenda')}</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('cinema.culturalAgenda')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event, i) => {
                  const Icon = CULTURAL_ICONS[i % CULTURAL_ICONS.length];
                  return (
                    <div key={event._id} className="flex gap-4 bg-white dark:bg-night-50 rounded-2xl p-5 hover:shadow-card-hover transition-all group cursor-pointer">
                      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-night transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-0.5">
                          {event.title}
                        </h3>
                        <p className="text-xs text-gold font-semibold mb-1">
                          {new Date(event.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {event.location ? ` · ${event.location}` : ''}
                        </p>
                        {event.description && (
                          <p className="text-sm text-night/50 dark:text-beige/50 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Urban Art — design section with curated images, kept intentionally */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('cinema.urbanArt')}</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('cinema.urbanArtTitle')}</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                'https://images.unsplash.com/photo-1578926288207-32356e87e18b?w=600',
                'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
                'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600',
              ].map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Art" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
