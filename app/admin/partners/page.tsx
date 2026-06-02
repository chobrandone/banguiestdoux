'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, Search, X, ExternalLink, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { deleteRow } from '@/lib/db';

interface Partner {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  category?: string;
  isFeatured: boolean;
  createdAt: string;
}

type FormData = {
  name: string;
  logo: string;
  website: string;
  category: string;
  isFeatured: boolean;
};

const EMPTY_FORM: FormData = {
  name: '',
  logo: '',
  website: '',
  category: 'sponsor',
  isFeatured: false,
};

const CATEGORIES = [
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'media', label: 'Média' },
  { value: 'institution', label: 'Institution' },
  { value: 'association', label: 'Association' },
  { value: 'other', label: 'Autre' },
];

const CATEGORY_COLORS: Record<string, string> = {
  sponsor: 'bg-gold/20 text-gold',
  media: 'bg-blue-500/20 text-blue-400',
  institution: 'bg-purple-500/20 text-purple-400',
  association: 'bg-green-500/20 text-green-400',
  other: 'bg-white/10 text-beige/50',
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-gold' : 'bg-white/10'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function PartnersAdminPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
  const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminToPartner = (row: any): Partner => ({
    _id:        String(row.id),
    name:       String(row.name || ''),
    logo:       row.logo || undefined,
    website:    row.website || undefined,
    category:   row.category || 'sponsor',
    isFeatured: Boolean(row.is_active),
    createdAt:  String(row.created_at || ''),
  });

  const buildRow = (f: FormData) => ({
    name:       f.name.trim(),
    logo:       f.logo || null,
    website:    f.website || null,
    category:   f.category,
    is_active:  f.isFeatured,
    sort_order: 0,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(200);
      if (error) throw error;
      setItems((data || []).map(adminToPartner));
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: Partner) => {
    setEditing(item);
    setForm({
      name: item.name,
      logo: item.logo || '',
      website: item.website || '',
      category: item.category || 'sponsor',
      isFeatured: item.isFeatured,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const row = buildRow(form);
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('partners')
          .update(row)
          .eq('id', editing._id)
          .select()
          .single();
        if (error) throw error;
        setItems(prev => prev.map(i => i._id === editing._id ? adminToPartner(data) : i));
        toast.success('Mis à jour !');
      } else {
        const { data, error } = await supabase
          .from('partners')
          .insert([row])
          .select()
          .single();
        if (error) throw error;
        setItems(prev => [...prev, adminToPartner(data)]);
        toast.success('Créé !');
      }
      closeModal();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    setDeleting(id);
    try {
      await deleteRow('partners', id);
      toast.success('Supprimé !');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleFeatured = async (item: Partner) => {
    const newVal = !item.isFeatured;
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: newVal })
        .eq('id', item._id);
      if (error) throw error;
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isFeatured: newVal } : i));
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    sponsors: items.filter(i => i.category === 'sponsor').length,
    media: items.filter(i => i.category === 'media').length,
    featured: items.filter(i => i.isFeatured).length,
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Partenaires</h1>
            <p className="text-sm text-beige/40 mt-0.5">Gérez les partenaires de la plateforme</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold text-night font-semibold rounded-xl hover:bg-gold/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Sponsors', value: stats.sponsors },
            { label: 'Médias', value: stats.media },
            { label: 'En vedette', value: stats.featured },
          ].map(s => (
            <div key={s.label} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
              <p className="text-2xl font-bold text-beige">{s.value}</p>
              <p className="text-xs text-beige/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-beige/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un partenaire..."
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-beige/40">
            <Building2 size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun partenaire trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#141414] border border-white/5 rounded-2xl p-5 group relative"
                >
                  {/* Logo */}
                  <div className="w-full h-28 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden mb-4">
                    {item.logo ? (
                      <img src={item.logo} alt={item.name} className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <span className="text-2xl font-bold text-beige/30">{getInitials(item.name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-beige leading-tight">{item.name}</p>
                      <button onClick={() => handleToggleFeatured(item)} className="flex-shrink-0">
                        <Star size={14} className={item.isFeatured ? 'fill-gold text-gold' : 'text-white/20'} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${CATEGORY_COLORS[item.category || 'other'] || 'bg-white/10 text-beige/50'}`}>
                        {getCategoryLabel(item.category || 'other')}
                      </span>
                      {item.website && (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-beige/30 hover:text-gold transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold text-beige">
                  {editing ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-beige/50 hover:text-beige transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className={lc}>Nom *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nom du partenaire"
                    className={ic}
                  />
                </div>

                <div>
                  <label className={lc}>Catégorie</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className={ic}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={lc}>URL du logo</label>
                  <input
                    value={form.logo}
                    onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
                    placeholder="https://..."
                    className={ic}
                  />
                  {form.logo && (
                    <div className="mt-2 rounded-xl overflow-hidden h-24 bg-white/5 flex items-center justify-center p-3">
                      <img src={form.logo} alt="Logo preview" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className={lc}>Site web</label>
                  <input
                    value={form.website}
                    onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://..."
                    className={ic}
                  />
                </div>

                <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
                  <div>
                    <p className={lc}>En vedette</p>
                    <p className="text-xs text-beige/30">Mettre en avant sur le site</p>
                  </div>
                  <Toggle value={form.isFeatured} onChange={v => setForm(p => ({ ...p, isFeatured: v }))} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm text-beige/50 hover:text-beige hover:border-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 rounded-xl bg-gold text-night font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
