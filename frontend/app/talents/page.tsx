'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Instagram, ArrowRight, Star, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { talentsAPI } from '@/lib/api';
import type { Talent } from '@/types';

const CATS = [
  { key:'all',          fr:'Tous' },
  { key:'artist',       fr:'Artistes' },
  { key:'musician',     fr:'Musiciens' },
  { key:'entrepreneur', fr:'Entrepreneurs' },
  { key:'influencer',   fr:'Influenceurs' },
  { key:'chef',         fr:'Chefs' },
  { key:'creator',      fr:'Créateurs' },
];

export default function TalentsPage() {
  const { lang, t } = useLanguage();
  const [talents, setTalents]       = useState<Talent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    talentsAPI.getAll({ limit: '50' })
      .then((res) => {
        const data = res.data?.data ?? [];
        setTalents(Array.isArray(data) ? data : []);
      })
      .catch(() => setTalents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat === 'all' ? talents : talents.filter(t => t.category === selectedCat);

  const featuredTalent = filtered.find(t => t.isFeatured) ?? filtered[0];

  return (
    <>
      <div className="relative h-72 bg-night overflow-hidden flex items-end pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920" alt="Talents" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-24">
          <span className="label-editorial">{t('section.talents.subtitle')}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('section.talents.title')}</h1>
        </div>
      </div>

      <div className="bg-night dark:bg-black min-h-screen">
        <div className="container-custom py-10">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {CATS.map(({ key, fr }) => (
              <button key={key} onClick={() => setSelectedCat(key)}
                className={cn('flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  selectedCat === key ? 'bg-gold text-night' : 'border border-beige/20 text-beige/60 hover:border-gold/50 hover:text-gold'
                )}>{fr}</button>
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && talents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-16 h-16 text-beige/10 mb-4" />
              <p className="text-beige/40 text-lg font-semibold">Aucun contenu disponible</p>
              <p className="text-beige/30 text-sm mt-1">Revenez bientôt pour du nouveau contenu</p>
            </div>
          )}

          {!loading && talents.length > 0 && (
            <>
              {/* Featured talent – full-width */}
              {featuredTalent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 rounded-3xl overflow-hidden relative h-72 md:h-96"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredTalent.image} alt="" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center p-8 md:p-12">
                    <div>
                      <span className="label-editorial mb-3 block">Interview Exclusive</span>
                      <h2 className="font-display text-3xl md:text-5xl font-bold text-beige mb-2">{featuredTalent.name}</h2>
                      <p className="text-beige/60 mb-6">{featuredTalent.titleFr ?? featuredTalent.title}</p>
                      <div className="flex gap-3">
                        <Link href={`/talents/${featuredTalent.slug}`} className="btn-gold">
                          <Play className="w-4 h-4 fill-current" /> Voir l&apos;interview
                        </Link>
                        <Link href={`/talents/${featuredTalent.slug}`} className="btn border border-beige/30 text-beige hover:bg-beige/10">
                          En savoir plus <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((talent, i) => (
                  <motion.div key={talent._id} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
                    <Link href={`/talents/${talent.slug}`} className="group block">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={talent.image} alt={talent.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        {talent.videoUrl && (
                          <div className="absolute top-3 right-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white group-hover:bg-gold group-hover:border-gold transition-all">
                              <Play className="w-3 h-3 fill-white ml-0.5" />
                            </div>
                          </div>
                        )}
                        {talent.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold text-night uppercase">★ Featured</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-display text-lg font-bold text-white group-hover:text-gold transition-colors">{talent.name}</h3>
                          <p className="text-white/50 text-xs mb-2">{talent.titleFr ?? talent.title}</p>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
