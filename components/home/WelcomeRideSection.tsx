'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Phone, User, CalendarDays, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WelcomeRideSection() {
  // Start with empty strings to match SSR — fill in after mount
  const [form, setForm] = useState({
    renter_name: '', renter_phone: '', start_date: '', end_date: '',
    pickup_time: '09:00',
    pickup_location: "Aéroport de Bangui M'Poko", notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);

  // Set real dates only on the client after hydration
  useEffect(() => {
    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setForm(f => ({ ...f, start_date: today, end_date: tomorrow }));
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.renter_name || !form.renter_phone) { toast.error('Nom et téléphone requis'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/car-rentals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          car_name:     'À attribuer',
          is_welcome_ride: true,
          service_type: 'pickup',
          end_date:     form.start_date,   // same-day pickup
          total_price:  0,
          status:       'pending',
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const ic = 'w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-beige placeholder:text-beige/40 outline-none focus:border-gold transition-all';

  return (
    <section className="bg-night py-20 px-4 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-gold opacity-40" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="label-editorial mb-3">Bienvenue à Bangui</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-beige mb-4 leading-tight">
              Votre trajet d'accueil <span className="text-gold">offert</span> 🎉
            </h2>
            <p className="text-beige/60 text-lg leading-relaxed mb-6">
              Arrivez à Bangui l'esprit tranquille. Réservez votre transfert depuis l'aéroport
              M'Poko et soyez accueilli en grande pompe.
            </p>
            <div className="space-y-3 mb-8">
              {['Transfert aéroport vers votre hôtel', 'Chauffeur professionnel et ponctuel', 'Réservation gratuite — payez à la prise en charge'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-beige/70">
                  <CheckCircle size={16} className="text-gold flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
            <Link href="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gold/30 text-gold rounded-2xl hover:bg-gold hover:text-night font-semibold text-sm transition-all">
              Voir tous nos véhicules <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Right — quick form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
            {done ? (
              <div className="bg-white/5 border border-gold/20 rounded-3xl p-10 text-center">
                <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-gold" />
                </div>
                <h3 className="font-display text-2xl font-bold text-beige mb-2">Trajet réservé !</h3>
                <p className="text-beige/50 text-sm">Notre équipe vous contactera pour confirmer les détails de votre accueil.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Car size={20} className="text-gold" />
                  <h3 className="font-bold text-beige">Réserver mon trajet d'accueil</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-beige/50 mb-1 flex items-center gap-1"><CalendarDays size={11} />Date d'arrivée</label>
                    <input type="date" value={form.start_date} min={form.start_date || ''} onChange={set('start_date')} className={ic} required />
                  </div>
                  <div>
                    <label className="text-xs text-beige/50 mb-1 flex items-center gap-1"><Clock size={11} />Heure d'arrivée</label>
                    <input type="time" value={form.pickup_time} onChange={set('pickup_time')} className={ic} required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-beige/50 mb-1 block">N° de vol / remarques</label>
                  <input placeholder="Ex: Vol AF123, 3 passagers…" value={form.notes} onChange={set('notes')} className={ic} />
                </div>

                <div>
                  <label className="text-xs text-beige/50 mb-1 flex items-center gap-1"><User size={11} /> Votre nom *</label>
                  <input value={form.renter_name} onChange={set('renter_name')} placeholder="Jean Dupont" className={ic} required />
                </div>
                <div>
                  <label className="text-xs text-beige/50 mb-1 flex items-center gap-1"><Phone size={11} /> Téléphone *</label>
                  <input type="tel" value={form.renter_phone} onChange={set('renter_phone')} placeholder="+236 75 00 00 00" className={ic} required />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm">
                  {submitting
                    ? <span className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                    : <Car size={16} />}
                  {submitting ? 'Envoi…' : 'Réserver mon trajet gratuit'}
                </button>
                <p className="text-[11px] text-beige/30 text-center">Paiement uniquement à la prise en charge</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
