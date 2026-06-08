'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Wifi, Car, Coffee, Dumbbell, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Room { id: string; room_type: string; price_per_night: number; capacity: number; }
interface Hotel {
  id: string; name: string; slug: string; description: string;
  address: string; neighborhood: string; stars: number;
  cover_image: string; images: string[]; amenities: string[];
  phone: string; hotel_rooms: Room[];
}

const amenityIcon: Record<string, React.ReactNode> = {
  wifi: <Wifi size={14} />, parking: <Car size={14} />,
  restaurant: <Coffee size={14} />, gym: <Dumbbell size={14} />,
};

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < n ? 'fill-gold text-gold' : 'text-gray-300 dark:text-white/20'} />
      ))}
    </div>
  );
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' XAF';
}

export default function HotelsPage() {
  const { t } = useLanguage();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stars, setStars] = useState(0);

  useEffect(() => {
    fetch('/api/hotels').then(r => r.json()).then(({ data }) => {
      setHotels(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = hotels.filter(h => {
    const q = search.toLowerCase();
    const matchQ = !q || h.name?.toLowerCase().includes(q) || h.neighborhood?.toLowerCase().includes(q);
    const matchS = !stars || h.stars === stars;
    return matchQ && matchS;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 lg:pt-32 pb-20">
      {/* Hero */}
      <div className="bg-night text-beige py-16 px-4 text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="label-editorial mb-3">Hébergements</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold mb-4">
          Hôtels à Bangui
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-beige/60 max-w-xl mx-auto">
          Trouvez et réservez votre chambre parmi les meilleurs hôtels de la capitale centrafricaine.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un hôtel ou quartier..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-night-50 text-sm text-night dark:text-beige outline-none focus:border-gold" />
          </div>
          <div className="flex gap-2">
            {[0,1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setStars(s === stars ? 0 : s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${stars === s && s > 0 ? 'bg-gold text-night border-gold' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-beige/50 hover:border-gold'}`}>
                {s === 0 ? 'Tous' : `${s}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-beige/40">
            <p className="text-lg font-display">Aucun hôtel disponible pour le moment.</p>
            <p className="text-sm mt-2">Revenez bientôt — de nouveaux établissements arrivent !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hotel, i) => {
              const minPrice = hotel.hotel_rooms?.length
                ? Math.min(...hotel.hotel_rooms.map(r => r.price_per_night))
                : null;
              return (
                <motion.div key={hotel.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-white/5">
                  {/* Image */}
                  <div className="relative h-52 bg-gray-100 dark:bg-night-50">
                    {hotel.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hotel.cover_image} alt={hotel.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20">
                        <span className="text-4xl">🏨</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                      <StarRow n={hotel.stars} />
                    </div>
                    {minPrice && (
                      <div className="absolute bottom-3 right-3 bg-gold text-night text-xs font-bold px-3 py-1 rounded-full">
                        À partir de {formatPrice(minPrice)}/nuit
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-night dark:text-beige mb-1">{hotel.name}</h3>
                    {hotel.neighborhood && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-beige/50 mb-3">
                        <MapPin size={12} /> {hotel.neighborhood}
                      </div>
                    )}
                    {hotel.description && (
                      <p className="text-sm text-gray-500 dark:text-beige/50 line-clamp-2 mb-4">{hotel.description}</p>
                    )}

                    {/* Amenities */}
                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 4).map(a => (
                          <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs">
                            {amenityIcon[a.toLowerCase()] || null} {a}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-beige/30">
                        {hotel.hotel_rooms?.length || 0} chambre{(hotel.hotel_rooms?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <Link href={`/hotels/${hotel.slug}`}
                        className="px-4 py-2 bg-gold text-night text-xs font-bold rounded-xl hover:bg-gold/85 transition-all">
                        Voir & Réserver
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
