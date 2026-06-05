'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail, Globe, Users, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Room {
  id: string; room_type: string; description: string;
  price_per_night: number; capacity: number;
  amenities: string[]; images: string[]; is_available: boolean;
}
interface Hotel {
  id: string; name: string; slug: string; description: string;
  address: string; neighborhood: string; stars: number;
  cover_image: string; images: string[]; amenities: string[];
  phone: string; email: string; website: string; hotel_rooms: Room[];
}

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }

export default function HotelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const [hotel, setHotel]           = useState<Hotel | null>(null);
  const [loading, setLoading]       = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeImg, setActiveImg]   = useState(0);

  useEffect(() => {
    fetch(`/api/hotels/${slug}`).then(r => r.json()).then(({ data }) => {
      setHotel(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">Hôtel introuvable</p>
      <button onClick={() => router.push('/hotels')} className="btn-gold px-6 py-3">
        ← Retour aux hôtels
      </button>
    </div>
  );

  const allImages = [hotel.cover_image, ...(hotel.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button onClick={() => router.push('/hotels')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> Tous les hôtels
        </button>

        {/* Image gallery */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-night-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[activeImg]} alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-gold' : 'border-transparent'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — hotel info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={16} className="fill-gold text-gold" />
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-night dark:text-beige">{hotel.name}</h1>
              {hotel.neighborhood && (
                <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-beige/50 mt-1">
                  <MapPin size={14} /> {hotel.neighborhood}{hotel.address ? ` — ${hotel.address}` : ''}
                </p>
              )}
            </div>

            {hotel.description && (
              <p className="text-gray-600 dark:text-beige/70 leading-relaxed">{hotel.description}</p>
            )}

            {hotel.amenities?.length > 0 && (
              <div>
                <h3 className="font-semibold text-night dark:text-beige mb-3">Services & Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map(a => (
                    <span key={a} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm">
                      <CheckCircle size={13} /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div>
              <h3 className="font-display text-xl font-bold text-night dark:text-beige mb-4">Chambres disponibles</h3>
              {(!hotel.hotel_rooms || hotel.hotel_rooms.length === 0) ? (
                <p className="text-gray-400 dark:text-beige/30 text-sm">Aucune chambre configurée pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {hotel.hotel_rooms.map(room => (
                    <motion.div key={room.id} whileHover={{ y: -2 }}
                      className={`border rounded-2xl p-5 transition-all cursor-pointer ${selectedRoom?.id === room.id
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] hover:border-gold/50'}`}
                      onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-night dark:text-beige">{room.room_type}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-beige/40 mt-0.5">
                            <Users size={12} /> {room.capacity} personne{room.capacity > 1 ? 's' : ''}
                          </div>
                          {room.description && (
                            <p className="text-sm text-gray-500 dark:text-beige/50 mt-2 line-clamp-2">{room.description}</p>
                          )}
                          {room.amenities?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.amenities.slice(0, 4).map(a => (
                                <span key={a} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-beige/50">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-lg font-bold text-night dark:text-beige">{formatPrice(room.price_per_night)}</p>
                          <p className="text-xs text-gray-400 dark:text-beige/40">/ nuit</p>
                          {!room.is_available && (
                            <span className="mt-1 inline-block px-2 py-0.5 bg-red-500/15 text-red-400 text-[10px] rounded-full">Indisponible</span>
                          )}
                        </div>
                      </div>
                      {selectedRoom?.id === room.id && (
                        <div className="mt-4 pt-4 border-t border-gold/20">
                          <a href={`/hotels/${hotel.slug}/book?room=${room.id}`}
                            className="block w-full py-3 bg-gold text-night font-bold text-center rounded-xl hover:bg-gold/85 transition-all">
                            Réserver cette chambre →
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — contact & CTA */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-night dark:text-beige mb-4">Contact & Infos</h3>
              {hotel.phone && (
                <a href={`tel:${hotel.phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-beige/60 hover:text-gold mb-2">
                  <Phone size={14} /> {hotel.phone}
                </a>
              )}
              {hotel.email && (
                <a href={`mailto:${hotel.email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-beige/60 hover:text-gold mb-2">
                  <Mail size={14} /> {hotel.email}
                </a>
              )}
              {hotel.website && (
                <a href={hotel.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-beige/60 hover:text-gold">
                  <Globe size={14} /> Site web
                </a>
              )}
            </div>

            <a href={`/hotels/${hotel.slug}/book`}
              className="block w-full py-4 bg-gold text-night font-bold text-center rounded-2xl hover:bg-gold/85 transition-all shadow-gold-lg text-sm">
              📅 Réserver un séjour
            </a>

            <p className="text-xs text-center text-gray-400 dark:text-beige/30">
              Confirmation instantanée · Paiement à l'arrivée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
