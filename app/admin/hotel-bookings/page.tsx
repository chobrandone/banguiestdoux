'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Phone, Mail, Search, CheckCircle, Clock, XCircle, Hotel } from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  id: string; hotel_name: string; room_type: string;
  guest_name: string; guest_email: string; guest_phone: string;
  check_in: string; check_out: string; nights: number;
  total_price: number; status: string; notes: string; created_at: string;
}

const STATUS_CFG = {
  pending:   { label: 'En attente',  color: 'bg-yellow-500/15 text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmée',   color: 'bg-white/10 text-beige',           icon: CheckCircle },
  cancelled: { label: 'Annulée',     color: 'bg-red-500/15 text-red-400',       icon: XCircle },
};

function formatPrice(p: number) { return new Intl.NumberFormat('fr-FR').format(p) + ' XAF'; }
function formatDate(d: string)  { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function HotelBookingsPage() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hotel-bookings');
      const { data } = await res.json();
      setBookings(data || []);
    } catch { toast.error('Erreur de chargement'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/hotel-bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      toast.success('Statut mis à jour');
      fetchData();
    } catch { toast.error('Erreur'); }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.guest_name?.toLowerCase().includes(q) || b.hotel_name?.toLowerCase().includes(q) || b.guest_phone?.includes(q);
    const matchS = !statusFilter || b.status === statusFilter;
    return matchQ && matchS;
  });

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue:   bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-beige flex items-center gap-2"><Hotel size={22} /> Réservations Hôtel</h1>
          <p className="text-sm text-beige/40 mt-0.5">Toutes les demandes de réservation reçues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',      value: stats.total,              color: 'text-beige'       },
            { label: 'En attente', value: stats.pending,            color: 'text-yellow-400'  },
            { label: 'Confirmées', value: stats.confirmed,          color: 'text-gold'        },
            { label: 'Revenus',    value: formatPrice(stats.revenue),color: 'text-gold'       },
          ].map(s => (
            <div key={s.label} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-beige/40 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-beige/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, hôtel, téléphone…"
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

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-beige/30">
            <Hotel size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune réservation trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b, i) => {
              const cfg = STATUS_CFG[b.status as keyof typeof STATUS_CFG] || STATUS_CFG.pending;
              const Icon = cfg.icon;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-[#141414] border border-white/5 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                        <span className="text-xs text-beige/30">{formatDate(b.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-beige">{b.guest_name}</h3>
                      <p className="text-sm text-beige/50">{b.hotel_name} · {b.room_type}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-beige/40 mt-1">
                        <span className="flex items-center gap-1"><CalendarDays size={11} />
                          {formatDate(b.check_in)} → {formatDate(b.check_out)} ({b.nights} nuit{b.nights > 1 ? 's' : ''})
                        </span>
                        {b.guest_phone && <span className="flex items-center gap-1"><Phone size={11} />{b.guest_phone}</span>}
                        {b.guest_email && <span className="flex items-center gap-1"><Mail size={11} />{b.guest_email}</span>}
                      </div>
                      {b.notes && <p className="text-xs text-beige/30 italic mt-1">"{b.notes}"</p>}
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      {b.total_price > 0 && (
                        <p className="font-bold text-gold text-lg">{formatPrice(b.total_price)}</p>
                      )}
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(b.id, 'confirmed')}
                            className="px-3 py-1.5 bg-gold text-night text-xs font-bold rounded-lg hover:bg-gold/85 transition-all">
                            Confirmer
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')}
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
