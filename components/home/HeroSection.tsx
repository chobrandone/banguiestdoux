'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { getHeroSlides, type HeroSlide } from '@/lib/db';

const FALLBACK_SLIDE: HeroSlide = {
  _id: 'fallback',
  image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920',
  titleFr: 'Le meilleur de Bangui',
  title: 'The Best of Bangui',
  subtitleFr: "Événements · Restaurants · Culture · Nightlife",
  subtitle: 'Events · Restaurants · Culture · Nightlife',
  sortOrder: 0,
  isActive: true,
};

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const [slides, setSlides] = useState<HeroSlide[]>([FALLBACK_SLIDE]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    getHeroSlides()
      .then((data) => { if (data.length) setSlides(data); })
      .catch(() => {});
  }, []);

  /* Auto-advance slides */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];
  const title    = lang === 'fr' ? (slide.titleFr    || slide.title)    : (slide.title    || slide.titleFr);
  const subtitle = lang === 'fr' ? (slide.subtitleFr || slide.subtitle) : (slide.subtitle || slide.subtitleFr);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide._id + currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={title || ''}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

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
            <span className="label-editorial text-hero-accent">
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
              {(title || '').split(' ').map((word, i) => (
                <span key={i} className={cn(i % 3 === 1 ? 'text-hero-accent' : '')}>
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
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, i) => (
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
      )}

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] tracking-widest uppercase">{t('hero.scroll')}</span>
        <ChevronDown className="w-5 h-5 text-white/40" />
      </motion.div>
    </section>
  );
}
