'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Users, Search, Calendar } from 'lucide-react';

interface CarItem {
  id: string; name: string; slug: string; brand: string; model: string;
  category: string; cover_image: string; seats: number; price_per_day: number;
  features: string[]; is_available: boolean;
}

const categoryLabels: Record<string, string> = {
  sedan: 'Berline', suv: 'SUV', minivan: 'Minivan',
  pickup: 'Pick-up', berline: 'Berline',
};

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }

export default function CarsPage() {
  const [cars, setCars]     = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('');

  useEffect(() => {
    fetch('/api/cars').then(r => r.json()).then(({ data }) => {
      setCars(data || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name?.toLowerCase().includes(q) || c.brand?.toLowerCase().includes(q);
    const matchC = !cat || c.category === cat;
    return matchQ && matchC;
  });

  const categories = [...new Set(cars.map(c => c.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 pb-20">
      {/* Hero */}
      <div className="bg-night text-beige py-16 px-4 text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="label-editorial mb-3">Location de véhicules</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold mb-4">
          Louez une voiture à Bangui
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-beige/60 max-w-xl mx-auto">
          Choisissez parmi notre flotte de véhicules et réservez pour le nombre de jours souhaité.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un véhicule…"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-night-50 text-sm text-night dark:text-beige outline-none focus:border-gold" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCat('')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${!cat ? 'bg-gold text-night border-gold' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-beige/50 hover:border-gold'}`}>
              Tous
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(cat === c ? '' : c)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${cat === c ? 'bg-gold text-night border-gold' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-beige/50 hover:border-gold'}`}>
                {categoryLabels[c] || c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-beige/40">
            <Car size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-display">Aucun véhicule disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((car, i) => (
              <motion.div key={car.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-white/5 group">
                {/* Image */}
                <div className="relative h-44 bg-gray-100 dark:bg-night-50">
                  {car.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={car.cover_image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Car size={48} className="text-gray-300 dark:text-white/20" /></div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-gold text-night text-[10px] font-bold rounded-full">
                    {categoryLabels[car.category] || car.category}
                  </div>
                  {!car.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500/80 px-3 py-1 rounded-full">Indisponible</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-night dark:text-beige">{car.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-beige/40 mb-3">{car.brand} {car.model}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-beige/40">
                      <Users size={12} /> {car.seats} places
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-night dark:text-beige text-sm">{formatPrice(car.price_per_day)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-beige/40">/ jour</p>
                    </div>
                  </div>
                  <Link href={`/cars/${car.slug}`}
                    className={`block w-full py-2.5 text-center text-xs font-bold rounded-xl transition-all ${car.is_available ? 'bg-gold text-night hover:bg-gold/85' : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed pointer-events-none'}`}>
                    {car.is_available ? '🚗 Réserver' : 'Indisponible'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
