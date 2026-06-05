'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, User, Phone, Mail, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Room { id: string; room_type: string; price_per_night: number; }
interface Hotel { id: string; name: string; slug: string; hotel_rooms: Room[]; }

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }

const today    = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export default function HotelBookPage() {
  const { slug }       = useParams<{ slug: string }>();
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const preselectedRoom = searchParams.get('room');

  const [hotel, setHotel]     = useState<Hotel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const [form, setForm] = useState({
    guest_name:  '',
    guest_email: '',
    guest_phone: '',
    check_in:    today,
    check_out:   tomorrow,
    room_id:     preselectedRoom || '',
    notes:       '',
  });

  useEffect(() => {
    fetch(`/api/hotels/${slug}`).then(r => r.json()).then(({ data }) => {
      setHotel(data);
      if (!form.room_id && data?.hotel_rooms?.[0]) {
        setForm(f => ({ ...f, room_id: data.hotel_rooms[0].id }));
      }
    });
  }, [slug]);

  const selectedRoom = hotel?.hotel_rooms?.find(r => r.id === form.room_id);
  const nights = form.check_in && form.check_out
    ? Math.max(0, Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
    : 0;
  const total = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !form.guest_phone) { toast.error('Nom et téléphone requis.'); return; }
    if (nights <= 0) { toast.error('Les dates sont invalides.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        hotel_id:   hotel?.id,
        hotel_name: hotel?.name,
        room_type:  selectedRoom?.room_type,
        total_price: total,
      };
      const res = await fetch('/api/hotel-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDone(true);
    } catch (err: unknown) {
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
        <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">Réservation envoyée !</h2>
        <p className="text-gray-500 dark:text-beige/50 text-sm mb-6">
          Votre demande pour <strong>{hotel?.name}</strong> a été reçue. Nous vous contacterons sous 24h pour confirmer.
        </p>
        <button onClick={() => router.push('/hotels')} className="btn-gold w-full py-3">
          Retour aux hôtels
        </button>
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

        <h1 className="font-display text-3xl font-bold text-night dark:text-beige mb-2">
          Réserver à {hotel?.name || '…'}
        </h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-8">Remplissez le formulaire — nous confirmons sous 24h.</p>

        <form onSubmit={submit} className="space-y-5">
          {/* Room select */}
          {hotel?.hotel_rooms && hotel.hotel_rooms.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">Chambre</label>
              <select value={form.room_id} onChange={set('room_id')} className={ic}>
                {hotel.hotel_rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.room_type} — {formatPrice(r.price_per_night)}/nuit</option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                <CalendarDays size={13} className="inline mr-1" />Arrivée
              </label>
              <input type="date" value={form.check_in} min={today} onChange={set('check_in')} className={ic} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                <CalendarDays size={13} className="inline mr-1" />Départ
              </label>
              <input type="date" value={form.check_out} min={form.check_in} onChange={set('check_out')} className={ic} required />
            </div>
          </div>

          {/* Summary */}
          {nights > 0 && selectedRoom && (
            <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-gold font-semibold">{nights} nuit{nights > 1 ? 's' : ''}</span>
              <span className="text-gray-600 dark:text-beige/60"> × {formatPrice(selectedRoom.price_per_night)} = </span>
              <span className="font-bold text-night dark:text-beige">{formatPrice(total)}</span>
            </div>
          )}

          {/* Guest info */}
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <User size={13} className="inline mr-1" />Nom complet *
            </label>
            <input value={form.guest_name} onChange={set('guest_name')} placeholder="Jean Dupont" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Phone size={13} className="inline mr-1" />Téléphone *
            </label>
            <input type="tel" value={form.guest_phone} onChange={set('guest_phone')} placeholder="+236 75 00 00 00" className={ic} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
              <Mail size={13} className="inline mr-1" />Email (optionnel)
            </label>
            <input type="email" value={form.guest_email} onChange={set('guest_email')} placeholder="votre@email.com" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">Notes / demandes spéciales</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              placeholder="Arrivée tardive, lit bébé, allergies…" className={`${ic} resize-none`} />
          </div>

          <button type="submit" disabled={submitting || nights <= 0}
            className="w-full py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {submitting ? <span className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full animate-spin" /> : '📅'}
            {submitting ? 'Envoi en cours…' : 'Confirmer la réservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
