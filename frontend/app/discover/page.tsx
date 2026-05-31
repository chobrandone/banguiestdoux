import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Camera, Star, Utensils, Music, Sun } from 'lucide-react';

export const metadata: Metadata = { title: 'Découvrir Bangui' };

const guides = [
  { title: 'Que faire à Bangui', icon: Sun, desc: "Les incontournables de la capitale centrafricaine.", href: '#todo', img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600' },
  { title: 'Où manger', icon: Utensils, desc: 'Les meilleures tables de Bangui.', href: '/restaurants', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' },
  { title: 'Nightlife', icon: Music, desc: 'Bars, clubs et soirées inoubliables.', href: '/restaurants?cat=nightclub', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600' },
  { title: 'Best Photo Spots', icon: Camera, desc: 'Les plus beaux endroits à photographier.', href: '#spots', img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600' },
];

const neighborhoods = [
  { name: 'Centre-ville', desc: 'Le cœur battant de Bangui, commerces et administrations.', img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400' },
  { name: 'Boy-Rabe', desc: "Quartier animé, marché populaire et vie de quartier authentique.", img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400' },
  { name: 'Quartier Résidentiel', desc: "Les villas et restaurants gastronomiques de Bangui.", img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400' },
  { name: 'Lakouanga', desc: 'Bord de fleuve, pêcheurs et couchers de soleil spectaculaires.', img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400' },
];

export default function DiscoverPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-screen min-h-[500px] max-h-[700px] overflow-hidden flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920" alt="Bangui" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/50 to-night/80" />
        <div className="container-custom relative z-10 pt-20 text-center">
          <span className="label-editorial mb-4 block">Guide de voyage</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-beige mb-4">
            Découvrir <span className="text-gold">Bangui</span>
          </h1>
          <p className="text-beige/70 text-xl max-w-2xl mx-auto mb-8">
            Votre guide complet pour explorer la capitale de la République Centrafricaine
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {guides.map(({ title, href }) => (
              <Link key={title} href={href} className="btn border border-beige/30 text-beige hover:bg-white/10 text-sm">
                {title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-beige dark:bg-night">
        <div className="container-custom py-16">
          {/* Guide cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" id="todo">
            {guides.map(({ title, icon: Icon, desc, href, img }) => (
              <Link key={title} href={href} className="group block bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-full bg-gold text-night">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-night dark:text-beige group-hover:text-gold transition-colors mb-1">{title}</h3>
                  <p className="text-sm text-night/50 dark:text-beige/50">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Neighborhoods */}
          <div className="mb-20" id="neighborhoods">
            <div className="flex items-center gap-3 mb-3"><div className="divider-gold" /><span className="label-editorial">Quartiers</span></div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">Quartiers tendance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {neighborhoods.map(({ name, desc, img }) => (
                <div key={name} className="group cursor-pointer">
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-display text-base font-bold text-white">{name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-night/50 dark:text-beige/50">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo spots */}
          <div id="spots">
            <div className="flex items-center gap-3 mb-3"><div className="divider-gold" /><span className="label-editorial">Photographie</span></div>
            <h2 className="font-display text-4xl font-bold text-night dark:text-beige mb-8">Meilleurs spots photo</h2>
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
