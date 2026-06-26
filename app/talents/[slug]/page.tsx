'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Instagram, Facebook, Play, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTalent } from '@/lib/db';
import type { Talent } from '@/types';

export default function TalentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTalent(slug).then(setTalent).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!talent) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">
        {lang === 'fr' ? 'Talent introuvable' : 'Talent not found'}
      </p>
      <button onClick={() => router.push('/talents')} className="btn-gold px-6 py-3">
        ← {lang === 'fr' ? 'Retour' : 'Back'}
      </button>
    </div>
  );

  const title = lang === 'fr' ? (talent.titleFr || talent.title) : talent.title;
  const bio   = lang === 'fr' ? (talent.bioFr   || talent.bio)   : talent.bio;

  return (
    <div className="min-h-screen bg-beige dark:bg-night pb-20">
      {/* Hero */}
      <div className="relative h-80 md:h-[460px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={talent.coverImage || talent.image} alt={talent.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />

        <div className="absolute top-24 left-4 sm:left-6 lg:left-8">
          <Link href="/talents" className="flex items-center gap-2 text-sm text-white/70 hover:text-gold transition-colors">
            <ChevronLeft size={16} /> {lang === 'fr' ? 'Tous les talents' : 'All talents'}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-4xl">
          <div className="flex items-end gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={talent.image} alt={talent.name} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-night shadow-xl flex-shrink-0" />
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white">{talent.name}</h1>
              <p className="text-gold text-sm md:text-base font-semibold mt-1">{title}</p>
              <div className="flex items-center gap-3 mt-2">
                {talent.instagram && (
                  <a href={`https://instagram.com/${talent.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-gold transition-colors"><Instagram size={18} /></a>
                )}
                {talent.facebook && (
                  <a href={talent.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-gold transition-colors"><Facebook size={18} /></a>
                )}
                {talent.videoUrl && (
                  <a href={talent.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/60 hover:text-gold transition-colors text-xs font-semibold">
                    <Play size={14} className="fill-current" /> {t('talent.watch')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Tagline */}
        {talent.tagline && (
          <motion.blockquote initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative pl-10 py-2">
            <Quote className="absolute left-0 top-0 w-7 h-7 text-gold/40" />
            <p className="font-display text-2xl md:text-3xl font-bold text-night dark:text-beige leading-snug italic">
              &ldquo;{talent.tagline}&rdquo;
            </p>
          </motion.blockquote>
        )}

        {/* Bio */}
        {bio && (
          <div>
            <h2 className="label-editorial mb-3">{lang === 'fr' ? 'Présentation' : 'About'}</h2>
            <p className="text-night/70 dark:text-beige/70 leading-relaxed whitespace-pre-line">{bio}</p>
          </div>
        )}

        {/* Interview Q&A */}
        {talent.qaPairs && talent.qaPairs.length > 0 && (
          <div>
            <h2 className="label-editorial mb-6">{t('talent.exclusive') || (lang === 'fr' ? 'Interview' : 'Interview')}</h2>
            <div className="space-y-6">
              {talent.qaPairs.map((qa, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#141414] border border-gold/10 dark:border-white/5 rounded-2xl p-5 md:p-6">
                  <p className="font-display text-lg font-bold text-gold mb-2">{qa.question}</p>
                  <p className="text-night/70 dark:text-beige/70 leading-relaxed whitespace-pre-line">{qa.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
