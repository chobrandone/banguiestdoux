'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getArticles } from '@/lib/db';
import type { Article } from '@/types';

const categoryColors: Record<string, string> = {
  nightlife:   'bg-purple-500',
  gastronomy:  'bg-orange-500',
  travel:      'bg-blue-500',
  culture:     'bg-gold',
  news:        'bg-red-500',
  lifestyle:   'bg-pink-500',
  interview:   'bg-teal-500',
  guide:       'bg-indigo-500',
  other:       'bg-gray-500',
};

const categoryLabel = (cat: string, lang: string) => {
  const labels: Record<string, { fr: string; en: string }> = {
    nightlife:  { fr: 'Nightlife',    en: 'Nightlife' },
    gastronomy: { fr: 'Gastronomie',  en: 'Gastronomy' },
    travel:     { fr: 'Voyage',       en: 'Travel' },
    culture:    { fr: 'Culture',      en: 'Culture' },
    news:       { fr: 'Actualités',   en: 'News' },
    lifestyle:  { fr: 'Lifestyle',    en: 'Lifestyle' },
    interview:  { fr: 'Interview',    en: 'Interview' },
    guide:      { fr: 'Guide',        en: 'Guide' },
    other:      { fr: 'Autre',        en: 'Other' },
  };
  return lang === 'fr' ? (labels[cat]?.fr ?? cat) : (labels[cat]?.en ?? cat);
};

export default function LifestyleSection() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    getArticles({ limit: 4 })
      .then((data) => setArticles(data.filter(a => a.category !== 'cinema' && a.isPublished)))
      .catch(() => setArticles([]));
  }, []);

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="section-py bg-beige-100 dark:bg-night" id="lifestyle">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('section.articles.subtitle')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-night dark:text-beige">
              {t('section.articles.title')}
            </h2>
          </div>
          <Link href="/cinema" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Magazine-style grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large feature */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <Link href={`/articles/${featured.slug}`} className="group block h-full">
                <div className="relative h-[480px] rounded-3xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.image}
                    alt={lang === 'fr' ? (featured.titleFr || featured.title) : featured.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${categoryColors[featured.category] || 'bg-gold'}`}>
                      {categoryLabel(featured.category, lang)}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {featured.readTime && (
                      <div className="flex items-center gap-2 mb-3 text-white/50 text-xs uppercase tracking-widest">
                        <span>{featured.readTime} {t('lifestyle.readTime')}</span>
                      </div>
                    )}
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white group-hover:text-gold transition-colors leading-tight mb-4">
                      {lang === 'fr' ? (featured.titleFr || featured.title) : featured.title}
                    </h3>
                    <span className="flex items-center gap-2 text-gold text-sm font-semibold group-hover:gap-3 transition-all">
                      {t('general.readMore')} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right column – small cards */}
          {rest.length > 0 && (
            <div className="lg:col-span-5 flex flex-col gap-6">
              {rest.map((article, i) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link href={`/articles/${article.slug}`} className="group flex gap-4 bg-white dark:bg-night-50 rounded-2xl p-4 hover:shadow-card-hover transition-all duration-300">
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image}
                        alt={lang === 'fr' ? (article.titleFr || article.title) : article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${categoryColors[article.category] || 'bg-gold'}`}>
                        {categoryLabel(article.category, lang)}
                      </span>
                      <h3 className="font-display text-base font-bold text-night dark:text-beige group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                        {lang === 'fr' ? (article.titleFr || article.title) : article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-night/40 dark:text-beige/40 text-xs">
                        {article.readTime && <span>{article.readTime} min</span>}
                        {article.readTime && <span>·</span>}
                        <span className="text-gold font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('general.readMore')} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Category pills — design navigation, kept intentionally */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nightlife',   href: '/restaurants?cat=nightclub', icon: '🌙', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600' },
            { label: 'Gastronomie', href: '/restaurants',               icon: '🍽️', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600' },
            { label: 'Culture',     href: '/cinema',                    icon: '🎭', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600' },
            { label: 'Talents',     href: '/talents',                   icon: '⭐', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600' },
          ].map(({ label, href, icon, img }) => (
            <Link key={label} href={href} className="group relative h-32 rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-white font-bold text-sm tracking-wide">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
