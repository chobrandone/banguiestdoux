'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const heroSlides = [
  {
    type:     'video' as const,
    src:      'https://www.w3schools.com/html/mov_bbb.mp4',
    poster:   'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920',
    titleFr:  'Le meilleur de Bangui',
    titleEn:  'The Best of Bangui',
    subtitleFr: 'Événements · Restaurants · Culture · Nightlife',
    subtitleEn: 'Events · Restaurants · Culture · Nightlife',
  },
  {
    type:    'image' as const,
    src:     'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920',
    titleFr: 'Vivez Bangui Intensément',
    titleEn: 'Experience Bangui Intensely',
    subtitleFr: 'Des moments inoubliables au cœur de l\'Afrique',
    subtitleEn: 'Unforgettable moments at the heart of Africa',
  },
  {
    type:    'image' as const,
    src:     'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920',
    titleFr: 'La Nuit à Bangui',
    titleEn: 'Bangui by Night',
    subtitleFr: 'Une scène nightlife vibrante et unique',
    subtitleEn: 'A vibrant and unique nightlife scene',
  },
];

const tickerItems = [
  '✦ Événements', '✦ Restaurants', '✦ Culture', '✦ Nightlife',
  '✦ Pool Parties', '✦ Jazz Nights', '✦ Cinema', '✦ Art',
  '✦ Gastronomie', '✦ Talents', '✦ Bangui', '✦ RCA',
];

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted,      setIsMuted]      = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  /* Auto-advance slides */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(intervalRef.current);
  }, []);

  /* Handle video play */
  useEffect(() => {
    if (heroSlides[currentSlide].type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide]);

  const slide = heroSlides[currentSlide];
  const title    = lang === 'fr' ? slide.titleFr    : (slide.titleEn    || slide.titleFr);
  const subtitle = lang === 'fr' ? slide.subtitleFr : (slide.subtitleEn || slide.subtitleFr);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {slide.type === 'video' ? (
            <video
              ref={videoRef}
              src={slide.src}
              poster={slide.poster}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.src}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Ticker strip */}
      <div className="absolute top-24 left-0 right-0 z-10 overflow-hidden py-2 border-t border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="ticker-inner gap-8">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-white/70 text-xs tracking-[0.3em] uppercase font-medium mx-4 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center container-custom">
        <div className="max-w-4xl">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-gold" />
            <span className="label-editorial text-gold/90">
              Bangui est Doux — Lifestyle &amp; Culture
            </span>
          </motion.div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-[1.05] mb-4"
            >
              {title.split(' ').map((word, i) => (
                <span key={i} className={cn(i % 3 === 1 ? 'text-gold' : '')}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/70 text-lg md:text-xl mb-10 font-light tracking-wide"
            >
              {subtitle}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/discover" className="btn-gold px-8 py-4 text-base shadow-gold-lg hover:shadow-gold-lg hover:scale-105">
              {t('hero.cta.discover')}
            </Link>
            <Link href="/events" className="btn px-8 py-4 text-base bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20">
              {t('hero.cta.events')}
            </Link>
            <Link href="/contact" className="btn px-8 py-4 text-base border border-white/30 text-white hover:bg-white/10 hidden md:inline-flex">
              {t('hero.cta.book')}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-8 mt-12"
          >
            {[
              { value: '50+', label: 'Événements / mois' },
              { value: '30+', label: 'Restaurants' },
              { value: '10K+', label: 'Followers' },
            ].map(({ value, label }) => (
              <div key={label} className="text-white">
                <div className="text-2xl font-bold text-gold font-display">{value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentSlide(i); clearInterval(intervalRef.current); }}
            className={cn(
              'rounded-full transition-all duration-300',
              i === currentSlide
                ? 'w-8 h-2 bg-gold'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* Video controls */}
      {slide.type === 'video' && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-24 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] tracking-widest uppercase">Défiler</span>
        <ChevronDown className="w-5 h-5 text-white/40" />
      </motion.div>
    </section>
  );
}
