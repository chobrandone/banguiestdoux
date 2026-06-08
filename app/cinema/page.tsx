'use client';

import { Film, Music, Theater, Palette, Calendar, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const movies = [
  {
    titleFr: 'Mufasa : Le Roi Lion', titleEn: 'Mufasa: The Lion King',
    genre: 'Animation', rating: 4.2,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600',
    dateFr: '15 août 2025', dateEn: 'Aug 15, 2025',
    screening: 'Cinéma Rex, Bangui',
  },
  {
    titleFr: 'Vaiana 2', titleEn: 'Moana 2',
    genre: 'Animation', rating: 4.5,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
    dateFr: '16 août 2025', dateEn: 'Aug 16, 2025',
    screening: 'Cinéma Rex, Bangui',
  },
  {
    titleFr: 'Film Africain', titleEn: 'African Film',
    genreFr: 'Drame', genreEn: 'Drama', rating: 4.7,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600',
    dateFr: '20 août 2025', dateEn: 'Aug 20, 2025',
    screening: 'Cinéma Oubangui',
  },
  {
    titleFr: 'Jazz in Africa', titleEn: 'Jazz in Africa',
    genreFr: 'Documentaire', genreEn: 'Documentary', rating: 4.8,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600',
    dateFr: '25 août 2025', dateEn: 'Aug 25, 2025',
    screening: 'Espace Culturel',
  },
];

const culturalEvents = [
  {
    icon: Music,
    titleFr: 'TÎ-ï Festival',          titleEn: 'TÎ-ï Festival',
    dateFr: '1er sept. 2025',          dateEn: 'Sept 1, 2025',
    descFr: 'Le festival de musique centrafricaine incontournable.',
    descEn: 'The unmissable Central African music festival.',
  },
  {
    icon: Palette,
    titleFr: 'Exposition Art Urbain',   titleEn: 'Urban Art Exhibition',
    dateFr: '18 août 2025',            dateEn: 'Aug 18, 2025',
    descFr: 'Les artistes émergents de Bangui exposent leurs œuvres.',
    descEn: "Bangui's emerging artists showcase their work.",
  },
  {
    icon: Theater,
    titleFr: "Théâtre de l'Oubangui",  titleEn: 'Oubangui Theatre',
    dateFr: 'Chaque vendredi',         dateEn: 'Every Friday',
    descFr: 'Pièces de théâtre en français et sango.',
    descEn: 'Plays performed in French and Sango.',
  },
  {
    icon: Film,
    titleFr: 'Ciné en plein air',      titleEn: 'Outdoor Cinema',
    dateFr: 'Mensuellement',           dateEn: 'Monthly',
    descFr: 'Projections gratuites sous les étoiles de Bangui.',
    descEn: 'Free screenings under the stars of Bangui.',
  },
];

export default function CinemaPage() {
  const { t, lang } = useLanguage();

  return (
    <>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {movies.map((movie) => (
                <div key={movie.titleFr} className="group bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <div className="relative h-64 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.image}
                      alt={lang === 'fr' ? movie.titleFr : movie.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full uppercase">
                        {lang === 'fr' ? (movie.genreFr ?? movie.genre) : (movie.genreEn ?? movie.genre)}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-white text-[10px] font-bold">{movie.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-1">
                      {lang === 'fr' ? movie.titleFr : movie.titleEn}
                    </h3>
                    <p className="text-xs text-night/40 dark:text-beige/40 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      {lang === 'fr' ? movie.dateFr : movie.dateEn}
                    </p>
                    <p className="text-xs text-night/50 dark:text-beige/50">{movie.screening}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Agenda */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold" />
              <span className="label-editorial">{t('cinema.agenda')}</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">{t('cinema.culturalAgenda')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {culturalEvents.map(({ icon: Icon, titleFr, titleEn, dateFr, dateEn, descFr, descEn }) => (
                <div key={titleFr} className="flex gap-4 bg-white dark:bg-night-50 rounded-2xl p-5 hover:shadow-card-hover transition-all group cursor-pointer">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-night transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-0.5">
                      {lang === 'fr' ? titleFr : titleEn}
                    </h3>
                    <p className="text-xs text-gold font-semibold mb-1">
                      {lang === 'fr' ? dateFr : dateEn}
                    </p>
                    <p className="text-sm text-night/50 dark:text-beige/50">
                      {lang === 'fr' ? descFr : descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urban Art */}
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
