'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Phone, Mail, Search, CheckCircle, Clock, XCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Reservation {
  id: string;
  restaurant_name: string;
  restaurant_phone: string | null;
  restaurant_email: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const STATUS_CFG = {
  pending:   { label: 'En attente', color: 'bg-yellow-500/15 text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmée',  color: 'bg-white/10 text-beige',           icon: CheckCircle },
  cancelled: { label: 'Annulée',    color: 'bg-red-500/15 text-red-400',       icon: XCircle },
};

function formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }

function toWhatsappLink(phone: string, text: string) {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function AdminRestaurantReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_reservations').select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: Reservation['status']) => {
    try {
      const { error } = await supabase.from('restaurant_reservations').update({ status }).eq('id', id);
      if (error) throw error;
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const shareSummary = (r: Reservation) => {
    const lines = [
      `📅 Nouvelle réservation — ${r.restaurant_name}`,
      `Client: ${r.guest_name}`,
      `Téléphone: ${r.guest_phone}`,
      r.guest_email ? `Email: ${r.guest_email}` : null,
      `Date: ${formatDate(r.reservation_date)} à ${r.reservation_time}`,
      `Personnes: ${r.guests}`,
      r.notes ? `Notes: ${r.notes}` : null,
    ].filter(Boolean).join('\n');
    return lines;
  };

  const filtered = items.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.guest_name?.toLowerCase().includes(q) || r.restaurant_name?.toLowerCase().includes(q) || r.guest_phone?.includes(q);
    const matchS = !statusFilter || r.status === statusFilter;
    return matchQ && matchS;
  });

  const stats = {
    total:     items.length,
    pending:   items.filter(r => r.status === 'pending').length,
    confirmed: items.filter(r => r.status === 'confirmed').length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-beige flex items-center gap-2"><CalendarCheck size={22} /> Réservations Restaurants & Nightlife</h1>
          <p className="text-sm text-beige/40 mt-0.5">Réservations de table reçues pour restaurants, bars, rooftops et cafés</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total',      value: stats.total,     color: 'text-beige' },
            { label: 'En attente', value: stats.pending,   color: 'text-yellow-400' },
            { label: 'Confirmées', value: stats.confirmed, color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-beige/40 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-beige/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par client, établissement, téléphone…"
              className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none focus:border-gold/50">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-beige/30">
            <CalendarCheck size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune réservation trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r, i) => {
              const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;
              const Icon = cfg.icon;
              const summary = shareSummary(r);
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                        <span className="text-xs text-beige/30">{formatDate(r.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-beige">{r.guest_name} — <span className="text-gold">{r.restaurant_name}</span></h3>
                      <div className="flex flex-wrap gap-3 text-xs text-beige/40 mt-1">
                        <span className="flex items-center gap-1"><CalendarCheck size={11} />{formatDate(r.reservation_date)} à {r.reservation_time} · {r.guests} pers.</span>
                        {r.guest_phone && <span className="flex items-center gap-1"><Phone size={11} />{r.guest_phone}</span>}
                        {r.guest_email && <span className="flex items-center gap-1"><Mail size={11} />{r.guest_email}</span>}
                      </div>
                      {r.notes && <p className="text-xs text-beige/30 italic mt-1">&quot;{r.notes}&quot;</p>}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Share to the registered restaurant's WhatsApp / email */}
                      <div className="flex gap-2">
                        {r.restaurant_phone ? (
                          <a
                            href={toWhatsappLink(r.restaurant_phone, summary)}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/15 text-[#25D366] text-xs font-bold rounded-lg hover:bg-[#25D366]/25 transition-all"
                          >
                            <Share2 size={12} /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-[10px] text-beige/20 px-2 py-1.5">Pas de tél. resto</span>
                        )}
                        {r.restaurant_email && (
                          <a
                            href={`mailto:${r.restaurant_email}?subject=${encodeURIComponent('Nouvelle réservation — ' + r.restaurant_name)}&body=${encodeURIComponent(summary)}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 text-gold text-xs font-bold rounded-lg hover:bg-gold/25 transition-all"
                          >
                            <Mail size={12} /> Email
                          </a>
                        )}
                      </div>

                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(r.id, 'confirmed')}
                            className="px-3 py-1.5 bg-gold text-night text-xs font-bold rounded-lg hover:bg-gold/85 transition-all">
                            Confirmer
                          </button>
                          <button onClick={() => updateStatus(r.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-all">
                            Annuler
                          </button>
                        </div>
                      )}
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
