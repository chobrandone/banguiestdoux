'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, MapPin, Phone, Clock, CalendarCheck, Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { restaurantCategoryLabels } from '@/lib/utils';
import { getRestaurant } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/types';
import toast from 'react-hot-toast';

const PriceRange = ({ range }: { range: number }) => (
  <span className="text-sm font-bold">
    {Array.from({ length: 4 }, (_, i) => (
      <span key={i} className={i < range ? 'text-gold' : 'text-night/20 dark:text-beige/20'}>€</span>
    ))}
  </span>
);

export default function RestaurantDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getRestaurant(slug).then(setRestaurant).finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error(lang === 'fr' ? 'Veuillez remplir tous les champs requis' : 'Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('restaurant_reservations').insert([{
        restaurant_id:    restaurant._id,
        restaurant_name:  restaurant.name,
        restaurant_phone: restaurant.phone || null,
        restaurant_email: restaurant.email || null,
        guest_name:       form.name,
        guest_phone:      form.phone,
        guest_email:      form.email || null,
        reservation_date: form.date,
        reservation_time: form.time,
        guests:           form.guests,
        notes:            form.notes || null,
      }]);
      if (error) throw error;
      setSubmitted(true);
      toast.success(lang === 'fr' ? 'Réservation envoyée !' : 'Reservation sent!');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || (lang === 'fr' ? 'Erreur' : 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">
        {lang === 'fr' ? 'Établissement introuvable' : 'Venue not found'}
      </p>
      <button onClick={() => router.push('/restaurants')} className="btn-gold px-6 py-3">
        ← {lang === 'fr' ? 'Retour' : 'Back'}
      </button>
    </div>
  );

  const allImages = [restaurant.image, ...(restaurant.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-beige dark:bg-night pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/restaurants"
          className="flex items-center gap-2 text-sm text-night/40 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> {lang === 'fr' ? 'Tous les établissements' : 'All venues'}
        </Link>

        {/* Image gallery */}
        <div className="mb-8">
          <div className="relative h-64 md:h-[420px] rounded-3xl overflow-hidden bg-night-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={allImages[activeImg]} alt={restaurant.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-night text-xs font-bold rounded-full uppercase">
              {restaurantCategoryLabels[restaurant.category]?.[lang] || restaurant.category}
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-gold' : 'border-transparent'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-night dark:text-beige">{restaurant.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                {restaurant.rating ? (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="font-bold text-night dark:text-beige">{restaurant.rating}</span>
                    {restaurant.reviewCount != null && <span className="text-night/40 dark:text-beige/40 text-sm">({restaurant.reviewCount})</span>}
                  </div>
                ) : null}
                <PriceRange range={restaurant.priceRange} />
              </div>
            </div>

            {restaurant.description && (
              <p className="text-night/70 dark:text-beige/70 leading-relaxed">{restaurant.description}</p>
            )}

            {(restaurant.cuisine?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {(restaurant.cuisine as string[]).map(c => (
                  <span key={c} className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm font-semibold">{c}</span>
                ))}
              </div>
            )}

            <div className="space-y-3 py-4 border-t border-gold/10">
              <div className="flex items-start gap-3 text-sm text-night/70 dark:text-beige/70">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /> {restaurant.address}
              </div>
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 text-sm text-night/70 dark:text-beige/70 hover:text-gold transition-colors">
                  <Phone className="w-4 h-4 text-gold flex-shrink-0" /> {restaurant.phone}
                </a>
              )}
              {(restaurant.openingHours?.length ?? 0) > 0 && (
                <div className="flex items-start gap-3 text-sm text-night/70 dark:text-beige/70">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {restaurant.openingHours!.map((h, i) => (
                      <p key={i}>{typeof h === 'string' ? h : JSON.stringify(h)}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reservation form */}
          <div>
            <div className="bg-white dark:bg-[#141414] border border-gold/10 dark:border-white/10 rounded-2xl p-6 sticky top-28">
              <h3 className="font-display text-xl font-bold text-night dark:text-beige mb-1 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-gold" /> {lang === 'fr' ? 'Réserver une table' : 'Book a table'}
              </h3>
              <p className="text-xs text-night/40 dark:text-beige/40 mb-5">
                {lang === 'fr' ? 'Votre demande sera transmise directement à l\'établissement.' : 'Your request will be sent directly to the venue.'}
              </p>

              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-gold" />
                  <p className="font-semibold text-night dark:text-beige">
                    {lang === 'fr' ? 'Demande envoyée !' : 'Request sent!'}
                  </p>
                  <p className="text-sm text-night/50 dark:text-beige/50">
                    {lang === 'fr' ? "L'établissement vous contactera pour confirmer." : 'The venue will contact you to confirm.'}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={lang === 'fr' ? 'Nom complet *' : 'Full name *'}
                    required
                    className="w-full px-4 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50"
                  />
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder={lang === 'fr' ? 'Téléphone *' : 'Phone *'}
                    required
                    className="w-full px-4 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder={lang === 'fr' ? 'Email (optionnel)' : 'Email (optional)'}
                    className="w-full px-4 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige outline-none focus:border-gold/50"
                    />
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      required
                      className="w-full px-3 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl">
                    <Users className="w-4 h-4 text-gold flex-shrink-0" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={form.guests}
                      onChange={e => setForm(p => ({ ...p, guests: Number(e.target.value) }))}
                      className="w-full bg-transparent text-sm text-night dark:text-beige outline-none"
                    />
                    <span className="text-xs text-night/40 dark:text-beige/40 whitespace-nowrap">{lang === 'fr' ? 'personnes' : 'guests'}</span>
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder={lang === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)'}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-beige dark:bg-[#0A0A0A] border border-gold/15 dark:border-white/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gold text-night font-bold text-sm rounded-xl hover:bg-gold/85 transition-all disabled:opacity-50"
                  >
                    {submitting ? (lang === 'fr' ? 'Envoi...' : 'Sending...') : (lang === 'fr' ? 'Réserver' : 'Reserve')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
