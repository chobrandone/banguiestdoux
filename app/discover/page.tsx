'use client';

import Link from 'next/link';
import { Camera, Utensils, Music, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const guides = [
  {
    titleKey: 'discover.guides.todo',     descKey: 'discover.guides.todo.desc',
    icon: Sun,    href: '#todo',
    img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600',
  },
  {
    titleKey: 'discover.guides.eat',      descKey: 'discover.guides.eat.desc',
    icon: Utensils, href: '/restaurants',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  },
  {
    titleKey: 'discover.guides.nightlife',descKey: 'discover.guides.nightlife.desc',
    icon: Music,  href: '/restaurants?cat=nightclub',
    img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600',
  },
  {
    titleKey: 'discover.guides.photoSpots',descKey: 'discover.guides.photo.desc',
    icon: Camera, href: '#spots',
    img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600',
  },
];

const neighborhoods = [
  { nameKey: 'discover.neighborhood.downtown',    descKey: 'discover.neighborhood.downtown.desc',    img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400' },
  { nameKey: 'discover.neighborhood.boyrabe',     descKey: 'discover.neighborhood.boyrabe.desc',     img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400' },
  { nameKey: 'discover.neighborhood.residential', descKey: 'discover.neighborhood.residential.desc', img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400' },
  { nameKey: 'discover.neighborhood.lakouanga',   descKey: 'discover.neighborhood.lakouanga.desc',   img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400' },
];

export default function DiscoverPage() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <div className="relative h-screen min-h-[500px] max-h-[700px] overflow-hidden flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920" alt="Bangui" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/50 to-night/80" />
        <div className="container-custom relative z-10 pt-20 text-center">
          <span className="label-editorial mb-4 block">{t('discover.guide')}</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-beige mb-4">
            {t('nav.discover').split(' ')[0]} <span className="text-gold">Bangui</span>
          </h1>
          <p className="text-beige/70 text-xl max-w-2xl mx-auto mb-8">
            {t('discover.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {guides.map(({ titleKey, href }) => (
              <Link key={titleKey} href={href} className="btn border border-beige/30 text-beige hover:bg-white/10 text-sm">
                {t(titleKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-beige dark:bg-night">
        <div className="container-custom py-16">
          {/* Guide cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" id="todo">
            {guides.map(({ titleKey, descKey, icon: Icon, href, img }) => (
              <Link key={titleKey} href={href} className="group block bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={t(titleKey)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-full bg-gold text-white dark:text-night">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-1">{t(titleKey)}</h3>
                  <p className="text-sm text-night/50 dark:text-beige/50">{t(descKey)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Neighborhoods */}
          <div className="mb-20" id="neighborhoods">
            <div className="flex items-center gap-3 mb-3"><div className="divider-gold" /><span className="label-editorial">{t('discover.neighborhoods')}</span></div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('discover.neighborhoodsTrending')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {neighborhoods.map(({ nameKey, descKey, img }) => (
                <div key={nameKey} className="group cursor-pointer">
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={t(nameKey)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-display text-base font-bold text-white">{t(nameKey)}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-night/50 dark:text-beige/50">{t(descKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo spots */}
          <div id="spots">
            <div className="flex items-center gap-3 mb-3"><div className="divider-gold" /><span className="label-editorial">{t('discover.photography')}</span></div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('discover.photoSpots')}</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400',
                'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400',
                'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400',
                'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
                'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
              ].map((url, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
