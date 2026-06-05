'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, User, Phone, Mail, MapPin, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CarItem { id: string; name: string; slug: string; price_per_day: number; cover_image: string; }

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }
const today    = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export default function CarRentPage() {
  const { slug }      = useParams<{ slug: string }>();
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const isWelcomeRide = searchParams.get('welcome') === '1';

  const [car, setCar]         = useState<CarItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const [form, setForm] = useState({
    renter_name:     '',
    renter_email:    '',
    renter_phone:    '',
    start_date:      today,
    end_date:        tomorrow,
    pickup_location: isWelcomeRide ? 'Aéroport de Bangui M\'Poko' : 'Bangui',
    notes:           '',
    is_welcome_ride: isWelcomeRide,
  });

  useEffect(() => {
    if (slug === 'welcome') return; // welcome ride without specific car
    fetch(`/api/cars/${slug}`).then(r => r.json()).then(({ data }) => setCar(data));
  }, [slug]);

  const days = Math.max(0, Math.round(
    (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000
  ));
  const total = car ? car.price_per_day * days : 0;
  const set   = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.renter_name || !form.renter_phone) { toast.error('Nom et téléphone requis.'); return; }
    if (days <= 0) { toast.error('Les dates sont invalides.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        car_id:      car?.id || null,
        car_name:    car?.name || 'Véhicule à définir',
        total_price: total,
        days,
      };
      const res = await fetch('/api/car-rentals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDone(true);
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center">
        <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">
          {isWelcomeRide ? 'Bienvenue à Bangui !' : 'Réservation envoyée !'}
        </h2>
        <p className="text-gray-500 dark:text-beige/50 text-sm mb-6">
          {isWelcomeRide
            ? 'Votre trajet de bienvenue a été enregistré. Notre équipe vous contactera pour confirmer.'
            : `Votre demande de location a été reçue. Nous vous contacterons sous 24h.`}
        </p>
        <button onClick={() => router.push('/cars')} className="btn-gold w-full py-3">Retour aux véhicules</button>
      </motion.div>
    </div>
  );

  const ic = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm text-night dark:text-beige outline-none focus:border-gold transition-all';

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>

        {isWelcomeRide && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold/20 rounded-2xl">
            <p className="text-gold font-bold text-sm">🎉 Trajet de bienvenue à Bangui</p>
            <p className="text-xs text-gray-600 dark:text-beige/60 mt-1">Réservez votre transfert depuis l'aéroport. Notre équipe vous accueillera !</p>
          </div>
        )}

        <h1 className="font-display text-3xl font-bold text-night dark:text-beige mb-2">
          {isWelcomeRide ? 'Réserver votre trajet d\'accueil' : `Louer · ${car?.name || '…'}`}
        </h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-8">Nous confirmons votre réservation sous 24h.</p>

        <form onSubmit={submit} className="space-y-5">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                <CalendarDays size={13} className="inline mr-1" />Date de début
              </label>
              <input type="date" value={form.start_date} min={today} onChange={set('start_date')} className={ic} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                <CalendarDays size={13} className="inline mr-1" />Date de fin
              </label>
              <input type="date" value={form.end_date} min={form.start_date} onChange={set('end_date')} className={ic} required />
            </div>
          </div>

          {/* Summary */}
          {days > 0 && car && (
            <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-gold font-semibold">{days} jour{days > 1 ? 's' : ''}</span>
              <span className="text-gray-600 dark:text-beige/60"> × {formatPrice(car.price_per_day)} = </span>
              <span className="font-bold text-night dark:text-beige">{formatPrice(total)}</span>
            </div>
          )}

          {/* Pickup */}
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <MapPin size={13} className="inline mr-1" />Lieu de prise en charge
            </label>
            <input value={form.pickup_location} onChange={set('pickup_location')}
              placeholder="Ex: Aéroport M'Poko, Hôtel XYZ…" className={ic} />
          </div>

          {/* Renter info */}
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <User size={13} className="inline mr-1" />Nom complet *
            </label>
            <input value={form.renter_name} onChange={set('renter_name')} placeholder="Jean Dupont" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Phone size={13} className="inline mr-1" />Téléphone *
            </label>
            <input type="tel" value={form.renter_phone} onChange={set('renter_phone')} placeholder="+236 75 00 00 00" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Mail size={13} className="inline mr-1" />Email (optionnel)
            </label>
            <input type="email" value={form.renter_email} onChange={set('renter_email')} placeholder="votre@email.com" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              placeholder="Nombre de passagers, bagages, vol d'arrivée…"
              className={`${ic} resize-none`} />
          </div>

          <button type="submit" disabled={submitting || days <= 0}
            className="w-full py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {submitting ? <span className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full animate-spin" /> : '🚗'}
            {submitting ? 'Envoi en cours…' : isWelcomeRide ? 'Réserver mon trajet d\'accueil' : 'Confirmer la location'}
          </button>
        </form>
      </div>
    </div>
  );
}
