'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Car, Users, ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CarItem {
  id: string; name: string; slug: string; brand: string; model: string; year: number;
  category: string; description: string; cover_image: string; images: string[];
  seats: number; price_per_day: number; features: string[]; is_available: boolean;
}

const categoryLabels: Record<string, string> = {
  sedan: 'Berline', suv: 'SUV', minivan: 'Minivan', pickup: 'Pick-up', berline: 'Berline',
};
function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }

export default function CarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const [car, setCar]         = useState<CarItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetch(`/api/cars/${slug}`).then(r => r.json()).then(({ data }) => {
      setCar(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
  if (!car) return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">Véhicule introuvable</p>
      <button onClick={() => router.push('/cars')} className="btn-gold px-6 py-3">← Retour</button>
    </div>
  );

  const allImages = [car.cover_image, ...(car.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/cars')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> Tous les véhicules
        </button>

        {/* Images */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-100 dark:bg-night-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[activeImg]} alt={car.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-3 py-1 bg-gold text-night text-xs font-bold rounded-full">
                {categoryLabels[car.category] || car.category}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-gold' : 'border-transparent'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-night dark:text-beige">{car.name}</h1>
              <p className="text-gray-400 dark:text-beige/40 mt-1">{car.brand} {car.model} {car.year ? `· ${car.year}` : ''}</p>
            </div>
            {car.description && <p className="text-gray-600 dark:text-beige/70 leading-relaxed">{car.description}</p>}
            <div className="flex items-center gap-4 py-4 border-y border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-beige/60">
                <Users size={16} /> {car.seats} places
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-beige/60">
                <Car size={16} /> {categoryLabels[car.category] || car.category}
              </div>
            </div>
            {car.features?.length > 0 && (
              <div>
                <h3 className="font-semibold text-night dark:text-beige mb-3">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <span key={f} className="flex items-center gap-1 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-sm">
                      <CheckCircle size={13} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-bold text-night dark:text-beige">{formatPrice(car.price_per_day)}</p>
              <p className="text-sm text-gray-400 dark:text-beige/40 mb-6">par jour</p>
              {car.is_available ? (
                <Link href={`/cars/${car.slug}/rent`}
                  className="block w-full py-4 bg-gold text-night font-bold text-center rounded-2xl hover:bg-gold/85 transition-all shadow-gold-lg">
                  🚗 Louer ce véhicule
                </Link>
              ) : (
                <div className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-400 text-center rounded-2xl text-sm">
                  Indisponible actuellement
                </div>
              )}
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-beige/30">Paiement à la prise en charge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
