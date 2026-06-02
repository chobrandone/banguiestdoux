'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFeaturedTalents } from '@/lib/db';
import type { Talent } from '@/types';

/* ─── Fallback seed data ────────────────────────── */
const seedTalents: Talent[] = [
  {
    _id: '1', slug: 'kessy-ekomo', name: 'Kessy EKOMO',
    title: 'Artiste & Influenceuse', titleFr: 'Artiste & Influenceuse',
    bio: '', category: 'influencer', isFeatured: true, createdAt: '',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
    videoUrl: 'https://youtube.com', instagram: '@kessy.ekomo',
  },
  {
    _id: '2', slug: 'milene', name: 'Milene',
    title: 'Chanteuse & Créatrice', titleFr: 'Chanteuse & Créatrice',
    bio: '', category: 'musician', isFeatured: true, createdAt: '',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    videoUrl: 'https://youtube.com', instagram: '@milene_music',
  },
  {
    _id: '3', slug: 'chef-arouna', name: 'Chef Arouna',
    title: 'Chef Cuisinier', titleFr: 'Chef Cuisinier',
    bio: '', category: 'chef', isFeatured: true, createdAt: '',
    image: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=600',
    instagram: '@chef.arouna',
  },
  {
    _id: '4', slug: 'dj-sango', name: 'DJ Sango',
    title: 'DJ & Producteur', titleFr: 'DJ & Producteur',
    bio: '', category: 'artist', isFeatured: true, createdAt: '',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    videoUrl: 'https://youtube.com', instagram: '@dj.sango',
  },
];

export default function TalentsSpotlight() {
  const { lang, t } = useLanguage();
  const [talents,   setTalents]   = useState<Talent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFeaturedTalents(4)
      .then((data) => setTalents(data.length ? data : seedTalents))
      .catch(() => setTalents(seedTalents))
      .finally(() => setIsLoading(false));
  }, []);

  const featured = isLoading ? seedTalents : (talents.length ? talents : seedTalents);
  const spotlightTalent = featured[0];

  return (
    <section className="section-py bg-night dark:bg-black relative overflow-hidden" id="talents">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tropical-purple/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('section.talents.subtitle')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-beige">
              {t('section.talents.title')}
            </h2>
          </div>
          <Link href="/talents" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
            {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(isLoading ? seedTalents : featured).map((talent, i) => (
            <motion.div
              key={talent._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/talents/${talent.slug}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={talent.image}
                    alt={talent.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {talent.videoUrl && (
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white group-hover:bg-gold group-hover:border-gold transition-all">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-gold transition-colors">
                      {talent.name}
                    </h3>
                    <p className="text-white/60 text-xs mb-2">
                      {lang === 'fr' ? (talent.titleFr || talent.title) : talent.title}
                    </p>
                    {talent.instagram && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Instagram className="w-3 h-3 text-gold" />
                        <span className="text-[11px] text-gold">{talent.instagram}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured interview banner */}
        {spotlightTalent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-3xl overflow-hidden relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[280px]">
              <div className="relative h-64 md:h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spotlightTalent.image} alt="Interview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-night/80" />
              </div>
              <div className="bg-night-50 p-8 md:p-10 flex flex-col justify-center">
                <span className="label-editorial mb-3">{t('talent.exclusive')}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-beige mb-4 leading-tight">
                  {lang === 'fr'
                    ? `"Bangui m'a tout donné" — ${spotlightTalent.name}`
                    : `"Bangui gave me everything" — ${spotlightTalent.name}`}
                </h3>
                <p className="text-beige/50 text-sm mb-6 leading-relaxed">
                  {lang === 'fr'
                    ? "Rencontre avec l'une des figures montantes de la scène créative de Bangui."
                    : "A meeting with one of Bangui's rising creative scene figures."}
                </p>

                <div className="flex items-center gap-4">
                  <Link href={`/talents/${spotlightTalent.slug}`} className="btn-gold">
                    <Play className="w-4 h-4 fill-current" />
                    {t('talent.watch')}
                  </Link>
                  <Link href="/talents" className="text-gold text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    {t('section.talents.title')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
