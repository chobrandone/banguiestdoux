'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Images } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFeaturedGallery } from '@/lib/db';
import type { GalleryItem } from '@/types';

/* ─── Fallback seed data ─────────────────────────── */
const seedItems = [
  { _id: '1', type: 'image' as const, url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600', span: 'col-span-2 row-span-2', isFeatured: true, createdAt: '' },
  { _id: '2', type: 'video' as const, url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600', span: '', isFeatured: true, createdAt: '' },
  { _id: '3', type: 'image' as const, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600', span: '', isFeatured: true, createdAt: '' },
  { _id: '4', type: 'image' as const, url: 'https://images.unsplash.com/photo-1515923152115-758a6b16f35e?w=600', span: '', isFeatured: true, createdAt: '' },
  { _id: '5', type: 'image' as const, url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', span: '', isFeatured: true, createdAt: '' },
  { _id: '6', type: 'image' as const, url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600', span: '', isFeatured: true, createdAt: '' },
  { _id: '7', type: 'video' as const, url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600', span: 'col-span-2', isFeatured: true, createdAt: '' },
];

type SpannedItem = GalleryItem & { span?: string };

/** Assign grid span classes based on position */
function applySpans(items: GalleryItem[]): SpannedItem[] {
  return items.slice(0, 7).map((item, i) => ({
    ...item,
    span: i === 0 ? 'col-span-2 row-span-2' : i === 6 ? 'col-span-2' : '',
  }));
}

export default function GalleryPreview() {
  const { t } = useLanguage();
  const [items,     setItems]     = useState<SpannedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFeaturedGallery(7)
      .then((data) => setItems(applySpans(data.length ? data : seedItems)))
      .catch(() => setItems(seedItems))
      .finally(() => setIsLoading(false));
  }, []);

  const displayItems = isLoading ? seedItems : (items.length ? items : seedItems);

  return (
    <section className="section-py bg-beige dark:bg-night-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('section.gallery.subtitle')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-night dark:text-beige">
              {t('section.gallery.title')}
            </h2>
          </div>
          <Link href="/gallery" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
            <Images className="w-4 h-4" /> {t('general.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 grid-rows-3 gap-3 h-[600px]">
          {displayItems.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative rounded-xl overflow-hidden group cursor-pointer ${(item as SpannedItem).span || ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm border border-white/50 text-white group-hover:bg-gold group-hover:border-gold group-hover:scale-110 transition-all duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                  {item.type === 'video' ? '▶ Vidéo' : '📷 Photo'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/gallery" className="btn-gold px-8">
            <Images className="w-4 h-4" />
            Voir toute la galerie
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
