'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, User, Phone, Mail, MapPin, ChevronLeft, CheckCircle, Car, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

interface CarItem { id: string; name: string; slug: string; price_per_day: number; cover_image: string; }

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }

function CarRentPageInner() {
  const { slug }      = useParams<{ slug: string }>();
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const isWelcomeRide = searchParams.get('welcome') === '1';

  const [car, setCar]               = useState<CarItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);

  const [form, setForm] = useState({
    service_type:    'rent' as 'rent' | 'pickup',  // rent = multi-day, pickup = point-to-point
    renter_name:     '',
    renter_email:    '',
    renter_phone:    '',
    start_date:      '',
    end_date:        '',
    pickup_time:     '09:00',
    pickup_location: isWelcomeRide ? "Aéroport de Bangui M'Poko" : 'Bangui',
    notes:           '',
    is_welcome_ride: isWelcomeRide,
  });

  // Set today/tomorrow only after hydration
  useEffect(() => {
    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setForm(f => ({ ...f, start_date: today, end_date: tomorrow }));
  }, []);

  useEffect(() => {
    if (!slug || slug === 'welcome') return;
    fetch(`/api/cars/${slug}`)
      .then(r => r.json())
      .then(({ data }) => { if (data) setCar(data); })
      .catch(() => {});
  }, [slug]);

  // For pickup service, end_date = start_date (same-day trip)
  const isPickup  = form.service_type === 'pickup';
  const days      = isPickup ? 1 : Math.max(0, Math.round(
    (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000
  ));
  const total     = car && !isPickup ? car.price_per_day * days : 0;

  const set       = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const setServiceType = (v: 'rent' | 'pickup') => {
    setForm(f => ({
      ...f,
      service_type: v,
      // Pickup = same day; rent = multi-day
      end_date: v === 'pickup' ? f.start_date : f.end_date,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.renter_name || !form.renter_phone) { toast.error('Nom et téléphone requis.'); return; }
    if (!isPickup && days <= 0) { toast.error('Les dates de location sont invalides.'); return; }
    setSubmitting(true);
    try {
      // Build payload — strip 'days' (generated column), add service fields
      const payload = {
        car_id:          car?.id || null,
        car_name:        car?.name || 'Véhicule à définir',
        renter_name:     form.renter_name,
        renter_email:    form.renter_email,
        renter_phone:    form.renter_phone,
        start_date:      form.start_date,
        end_date:        isPickup ? form.start_date : form.end_date,
        pickup_time:     form.pickup_time,
        pickup_location: form.pickup_location,
        service_type:    form.service_type,
        is_welcome_ride: form.is_welcome_ride,
        total_price:     total,
        notes:           form.notes,
        status:          'pending',
      };
      const res  = await fetch('/api/car-rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center">
        <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">
          {isWelcomeRide ? 'Bienvenue à Bangui !' : 'Demande envoyée !'}
        </h2>
        <p className="text-gray-500 dark:text-beige/50 text-sm mb-6">
          {isPickup
            ? 'Votre demande de trajet a été reçue. Nous confirmeons sous peu.'
            : isWelcomeRide
              ? 'Votre trajet de bienvenue a été enregistré. Notre équipe vous contactera bientôt.'
              : 'Votre demande de location a été reçue. Nous vous contacterons sous 24h.'}
        </p>
        <button onClick={() => router.push('/cars')} className="btn-gold w-full py-3">
          Retour aux véhicules
        </button>
      </motion.div>
    </div>
  );

  const ic  = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm text-night dark:text-beige outline-none focus:border-gold transition-all';

  return (
    <div className="min-h-screen bg-white dark:bg-night pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> Retour
        </button>

        {isWelcomeRide && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold/20 rounded-2xl">
            <p className="text-gold font-bold text-sm">🎉 Trajet de bienvenue à Bangui</p>
            <p className="text-xs text-gray-600 dark:text-beige/60 mt-1">
              Transfert depuis l'aéroport — notre équipe vous accueillera !
            </p>
          </div>
        )}

        <h1 className="font-display text-3xl font-bold text-night dark:text-beige mb-1">
          {isWelcomeRide ? "Réserver votre trajet d'accueil" : `${car?.name || 'Véhicule'}`}
        </h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-8">Confirmation sous 24h — paiement à la prise en charge.</p>

        <form onSubmit={submit} className="space-y-6">

          {/* ── Service type selector ── */}
          {!isWelcomeRide && (
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-2">
                Type de service
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'rent',   icon: Car,   label: 'Location de véhicule',   sub: 'Louez pour plusieurs jours' },
                  { value: 'pickup', icon: Truck,  label: 'Pickup / Livraison',      sub: 'Trajet ponctuel ou livraison' },
                ].map(({ value, icon: Icon, label, sub }) => (
                  <button key={value} type="button" onClick={() => setServiceType(value as 'rent' | 'pickup')}
                    className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left ${
                      form.service_type === value
                        ? 'border-gold bg-gold/8'
                        : 'border-gray-200 dark:border-white/10 hover:border-gold/40'
                    }`}>
                    <Icon size={20} className={form.service_type === value ? 'text-gold' : 'text-gray-400 dark:text-beige/40'} />
                    <span className="text-sm font-bold text-night dark:text-beige">{label}</span>
                    <span className="text-xs text-gray-400 dark:text-beige/40">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Dates & time ── */}
          <div className="space-y-3">
            <div className={`grid gap-4 ${isPickup ? 'grid-cols-2' : 'grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                  <CalendarDays size={13} className="inline mr-1" />
                  {isPickup ? 'Date du trajet' : 'Date de début'}
                </label>
                <input type="date" value={form.start_date} min={new Date().toISOString().split('T')[0]}
                  onChange={set('start_date')} className={ic} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                  <Clock size={13} className="inline mr-1" />Heure de prise en charge
                </label>
                <input type="time" value={form.pickup_time} onChange={set('pickup_time')} className={ic} required />
              </div>
            </div>

            {/* End date — only for rent */}
            {!isPickup && (
              <div>
                <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                  <CalendarDays size={13} className="inline mr-1" />Date de fin
                </label>
                <input type="date" value={form.end_date} min={form.start_date}
                  onChange={set('end_date')} className={ic} required />
              </div>
            )}
          </div>

          {/* Price summary — rent mode */}
          {!isPickup && days > 0 && car && (
            <div className="bg-gold/8 border border-gold/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-gold font-semibold">{days} jour{days > 1 ? 's' : ''}</span>
              <span className="text-gray-600 dark:text-beige/60"> × {formatPrice(car.price_per_day)} = </span>
              <span className="font-bold text-night dark:text-beige">{formatPrice(total)}</span>
            </div>
          )}

          {/* Pickup location */}
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <MapPin size={13} className="inline mr-1" />Lieu de prise en charge
            </label>
            <input value={form.pickup_location} onChange={set('pickup_location')}
              placeholder="Ex: Aéroport M'Poko, Hôtel XYZ, Quartier…" className={ic} />
          </div>

          {/* Renter info */}
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <User size={13} className="inline mr-1" />Nom complet *
            </label>
            <input value={form.renter_name} onChange={set('renter_name')}
              placeholder="Jean Dupont" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Phone size={13} className="inline mr-1" />Téléphone *
            </label>
            <input type="tel" value={form.renter_phone} onChange={set('renter_phone')}
              placeholder="+236 75 00 00 00" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Mail size={13} className="inline mr-1" />Email (optionnel)
            </label>
            <input type="email" value={form.renter_email} onChange={set('renter_email')}
              placeholder="votre@email.com" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              Notes / instructions
            </label>
            <textarea value={form.notes} onChange={set('notes') as React.ChangeEventHandler<HTMLTextAreaElement>}
              rows={3} placeholder={isPickup
                ? 'Adresse de destination, nombre de passagers, bagages…'
                : 'Arrivée tardive, allergies, demandes spéciales…'}
              className={`${ic} resize-none`} />
          </div>

          <button type="submit" disabled={submitting || (!isPickup && days <= 0)}
            className="w-full py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {submitting
              ? <span className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full animate-spin" />
              : isPickup ? <Truck size={17} /> : <Car size={17} />}
            {submitting ? 'Envoi…' : isPickup ? 'Réserver ce trajet' : isWelcomeRide ? "Réserver mon trajet d'accueil" : 'Confirmer la location'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CarRentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-night flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <CarRentPageInner />
    </Suspense>
  );
}
