'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Download, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { getGallery } from '@/lib/db';
import type { GalleryItem } from '@/types';

const CATEGORIES = [
  { key: 'all',       tKey: 'cat.all' },
  { key: 'events',    tKey: 'cat.events' },
  { key: 'nightlife', tKey: 'cat.nightclub' },
  { key: 'food',      tKey: 'cat.food' },
  { key: 'culture',   tKey: 'cat.culture' },
  { key: 'video',     tKey: 'cat.video' },
];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [items, setItems]           = useState<GalleryItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedCat, setSelectedCat]   = useState('all');
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null);

  useEffect(() => {
    getGallery({ limit: 50 })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat === 'all'
    ? items
    : items.filter(i => i.category === selectedCat);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevItem = () => setLightboxIdx(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const nextItem = () => setLightboxIdx(i => i !== null ? (i + 1) % filtered.length : null);

  // Use first 4 items for hero collage (or fallback images)
  const heroItems = items.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <div className="relative h-64 bg-night overflow-hidden flex items-end pb-8">
        <div className="absolute inset-0 grid grid-cols-4">
          {heroItems.map(item => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item._id} src={item.url} alt="" className="w-full h-full object-cover opacity-30" />
          ))}
          {/* Fill remaining columns if fewer than 4 items */}
          {heroItems.length < 4 && Array.from({ length: 4 - heroItems.length }).map((_, i) => (
            <div key={`fill-${i}`} className="w-full h-full bg-night-50 opacity-30" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-20">
          <span className="label-editorial">{t('section.gallery.subtitle')}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('section.gallery.title')}</h1>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen">
        <div className="container-custom py-10">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {CATEGORIES.map(({ key, tKey }) => (
              <button key={key} onClick={() => setSelectedCat(key)}
                className={cn('flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  selectedCat === key ? 'bg-gold text-night' : 'bg-white dark:bg-night-50 text-night/70 dark:text-beige/70 border border-gold/10 hover:bg-gold/10'
                )}>{t(tKey)}</button>
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Images className="w-16 h-16 text-gold/20 mb-4" />
              <p className="text-night/40 dark:text-beige/40 text-lg font-semibold">{t('general.noContent')}</p>
              <p className="text-night/30 dark:text-beige/30 text-sm mt-1">{t('general.comingSoon')}</p>
            </div>
          )}

          {/* Masonry grid */}
          {!loading && items.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid"
                >
                  <button
                    onClick={() => openLightbox(i)}
                    className="group relative block w-full rounded-xl overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.title ?? ''} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      {item.type === 'video'
                        ? <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 fill-white" />
                        : <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                      }
                    </div>
                    {item.type === 'video' && (
                      <div className="absolute bottom-2 right-2">
                        <span className="flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-white text-[10px]">
                          <Play className="w-2.5 h-2.5 fill-white" /> {t('gallery.video')}
                        </span>
                      </div>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && filtered[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevItem(); }} className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            <motion.div
              key={lightboxIdx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl max-h-[90vh] px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filtered[lightboxIdx].url}
                alt={filtered[lightboxIdx].title ?? ''}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
              <p className="text-center text-white/70 text-sm mt-3">{filtered[lightboxIdx].title}</p>
            </motion.div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-sm">
              {lightboxIdx + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
