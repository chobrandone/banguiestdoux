'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Search, FileSpreadsheet, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { exportToExcel, timestampedFilename } from '@/lib/exportExcel';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function AdminNewsletterPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers').select('*')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet abonné ?')) return;
    try {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Supprimé');
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = items.filter(i => {
    const matchQ = !search || i.email.toLowerCase().includes(search.toLowerCase());
    const created = new Date(i.created_at).getTime();
    const matchFrom = !dateFrom || created >= new Date(dateFrom).getTime();
    const matchTo = !dateTo || created <= new Date(dateTo).getTime() + 86400000;
    return matchQ && matchFrom && matchTo;
  });

  const handleExport = () => {
    const rows = filtered.map(i => ({
      'Email': i.email,
      'Date d\'inscription': formatDate(i.created_at),
    }));
    exportToExcel([{ name: 'Newsletter', rows }], timestampedFilename('newsletter_abonnes'));
    toast.success('Export Excel généré');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-beige flex items-center gap-2"><Mail size={22} /> Newsletter</h1>
            <p className="text-sm text-beige/40 mt-0.5">{items.length} abonné{items.length !== 1 ? 's' : ''} au total</p>
          </div>
          <button onClick={handleExport} disabled={filtered.length === 0} className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-sm text-gold hover:bg-gold/20 transition-all disabled:opacity-50">
            <FileSpreadsheet size={16} /> Exporter Excel
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-beige/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email…"
              className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50" />
          </div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none focus:border-gold/50" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none focus:border-gold/50" />
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Mail className="w-10 h-10 text-beige/10 mx-auto mb-2" /><p className="text-beige/30 text-sm">Aucun abonné</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5">
                  {['Email', 'Date d\'inscription', ''].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((item, i) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3.5 text-beige font-medium">{item.email}</td>
                      <td className="px-4 py-3.5 text-beige/50 text-xs whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
