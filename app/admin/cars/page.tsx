'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Car, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import { supabase } from '@/lib/supabase';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

/* ── types ──────────────────────────────────────────────── */
interface CarItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  category: string;
  description: string | null;
  seats: number;
  price_per_day: number;
  cover_image: string | null;
  images: string[];
  features: string[];
  is_available: boolean;
  is_published: boolean;
  created_at: string;
}

type CarForm = {
  name: string; slug: string; brand: string; model: string; year: number | '';
  category: string; description: string; seats: number;
  price_per_day: number; cover_image: string; images: string[];
  features: string; is_available: boolean; is_published: boolean;
};

const CATEGORIES = [
  { value: 'sedan', label: 'Berline' },
  { value: 'suv', label: 'SUV' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'pickup', label: 'Pick-up' },
  { value: 'berline', label: 'Berline de luxe' },
];

const CAT_COLORS: Record<string, string> = {
  sedan: 'bg-blue-500/20 text-blue-400',
  suv: 'bg-green-500/20 text-green-400',
  minivan: 'bg-purple-500/20 text-purple-400',
  pickup: 'bg-orange-500/20 text-orange-400',
  berline: 'bg-gold/20 text-gold',
};

const EMPTY: CarForm = {
  name: '', slug: '', brand: '', model: '', year: '',
  category: 'sedan', description: '', seats: 5,
  price_per_day: 0, cover_image: '', images: ['', '', '', ''],
  features: '', is_available: true, is_published: true,
};

/* ── Toggle ─────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════
   Main Cars Page
══════════════════════════════════════════════════════════ */
export default function AdminCarsPage() {
  const [items, setItems] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CarItem | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [form, setForm] = useState<CarForm>(EMPTY);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const sb = supabase;
      const { data, error } = await sb
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: CarItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      model: item.model,
      year: item.year ?? '',
      category: item.category,
      description: item.description || '',
      seats: item.seats,
      price_per_day: item.price_per_day,
      cover_image: item.cover_image || '',
      images: item.images?.length
        ? [...item.images, '', '', '', ''].slice(0, 4)
        : ['', '', '', ''],
      features: (item.features || []).join(', '),
      is_available: item.is_available,
      is_published: item.is_published,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand) { toast.error('Nom et marque requis'); return; }
    setSaving(true);
    try {
      const sb = supabase;
      const row = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        brand: form.brand,
        model: form.model || null,
        year: form.year !== '' ? Number(form.year) : null,
        category: form.category,
        description: form.description || null,
        seats: form.seats,
        price_per_day: form.price_per_day,
        cover_image: form.cover_image || null,
        images: form.images.filter(Boolean),
        features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        is_available: form.is_available,
        is_published: form.is_published,
      };
      if (editing) {
        const { data, error } = await sb.from('cars').update(row).eq('id', editing.id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i.id === editing.id ? data : i));
        toast.success('Voiture mise à jour !');
      } else {
        const { data, error } = await sb.from('cars').insert([row]).select().single();
        if (error) throw error;
        setItems(prev => [data, ...prev]);
        toast.success('Voiture créée !');
      }
      closeModal();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette voiture ?')) return;
    try {
      const sb = supabase;
      const { error } = await sb.from('cars').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Voiture supprimée');
    } catch { toast.error('Erreur'); }
  };

  const toggleField = async (id: string, col: 'is_available' | 'is_published', current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [col]: !current } : i));
    try {
      const sb = supabase;
      const { error } = await sb.from('cars').update({ [col]: !current }).eq('id', id);
      if (error) throw error;
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, [col]: current } : i));
      toast.error('Erreur');
    }
  };

  const fld = (key: keyof CarForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const numKeys = ['seats', 'price_per_day', 'year'];
      const val = numKeys.includes(key) ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
      setForm(prev => ({
        ...prev,
        [key]: val,
        ...(key === 'name' ? { slug: slugify(e.target.value) } : {}),
      }));
    };

  const visible = items.filter(i => {
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (availFilter === 'available' && !i.is_available) return false;
    if (availFilter === 'unavailable' && i.is_available) return false;
    const q = search.toLowerCase();
    if (q && !i.name.toLowerCase().includes(q) && !i.brand.toLowerCase().includes(q) && !i.model.toLowerCase().includes(q)) return false;
    return true;
  });

  const stats = {
    total: items.length,
    available: items.filter(i => i.is_available).length,
    published: items.filter(i => i.is_published).length,
    avg_price: items.length
      ? Math.round(items.reduce((s, i) => s + i.price_per_day, 0) / items.length).toLocaleString('fr-FR')
      : '—',
  };

  return (
    <div className="space-y-6 text-beige">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Voitures</h2>
          <p className="text-beige/40 text-sm">{items.length} voiture{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Total', v: stats.total },
          { l: 'Disponibles', v: stats.available },
          { l: 'Publiées', v: stats.published },
          { l: 'Prix moy. (XAF)', v: stats.avg_price },
        ].map(({ l, v }) => (
          <div key={l} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
            <p className="text-2xl font-bold text-beige">{v}</p>
            <p className="text-xs text-beige/40">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, marque, modèle…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none"
        >
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={availFilter}
          onChange={e => setAvailFilter(e.target.value as typeof availFilter)}
          className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none"
        >
          <option value="all">Toutes dispos</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">Indisponibles</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-[#141414] border border-white/5 rounded-2xl py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-2xl py-16 text-center">
          <Car className="w-10 h-10 text-beige/10 mx-auto mb-2" />
          <p className="text-beige/30 text-sm">
            {items.length === 0 ? 'Aucune voiture. Créez la première !' : 'Aucun résultat.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden group"
            >
              {/* Cover */}
              <div className="relative h-40 bg-[#0A0A0A]">
                {item.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-12 h-12 text-beige/10" />
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[item.category] || 'bg-beige/10 text-beige/60'}`}>
                    {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                  </span>
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-gold/30 text-white hover:text-gold transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div>
                  <p className="font-semibold text-beige text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-beige/40 mt-0.5">
                    {item.brand} {item.model} {item.year ? `· ${item.year}` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gold font-bold text-sm">{item.price_per_day.toLocaleString('fr-FR')}</span>
                    <span className="text-beige/40 text-xs"> XAF/j</span>
                  </div>
                  <span className="text-beige/50 text-xs">{item.seats} places</span>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => toggleField(item.id, 'is_available', item.is_available)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${item.is_available ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-beige/5 text-beige/30 hover:bg-beige/10'}`}
                  >
                    {item.is_available ? 'Disponible' : 'Indispo'}
                  </button>
                  <button
                    onClick={() => toggleField(item.id, 'is_published', item.is_published)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${item.is_published ? 'text-beige/60 hover:text-beige bg-white/5' : 'text-beige/20 hover:text-beige/50 bg-white/2'}`}
                    title={item.is_published ? 'Publié' : 'Brouillon'}
                  >
                    {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="font-display text-xl font-bold text-beige">
                  {editing ? 'Modifier la voiture' : 'Nouvelle voiture'}
                </h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-beige/40 hover:text-beige"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className={lc}>Nom *</label>
                    <input value={form.name} onChange={fld('name')} required placeholder="Toyota Land Cruiser Premium…" className={ic} />
                  </div>

                  {/* Slug */}
                  <div className="md:col-span-2">
                    <label className={lc}>Slug (URL)</label>
                    <input value={form.slug} onChange={fld('slug')} placeholder="toyota-land-cruiser" className={ic} />
                  </div>

                  {/* Brand / Model */}
                  <div>
                    <label className={lc}>Marque *</label>
                    <input value={form.brand} onChange={fld('brand')} required placeholder="Toyota, Mercedes…" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Modèle</label>
                    <input value={form.model} onChange={fld('model')} placeholder="Land Cruiser, C-Class…" className={ic} />
                  </div>

                  {/* Year / Category */}
                  <div>
                    <label className={lc}>Année</label>
                    <input type="number" value={form.year} onChange={fld('year')} min="1990" max="2030" placeholder="2023" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Catégorie</label>
                    <select value={form.category} onChange={fld('category')} className={ic}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={lc}>Description</label>
                    <textarea value={form.description} onChange={fld('description')} rows={3} placeholder="Description du véhicule…" className={ic + ' resize-none'} />
                  </div>

                  {/* Seats / Price */}
                  <div>
                    <label className={lc}>Nombre de places</label>
                    <input type="number" value={form.seats} onChange={fld('seats')} min="1" max="12" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Prix / jour (XAF)</label>
                    <input type="number" value={form.price_per_day} onChange={fld('price_per_day')} min="0" className={ic} />
                  </div>

                  {/* Cover image */}
                  <div className="md:col-span-2">
                    <ImageUpload
                      bucket="car-photos"
                      value={form.cover_image}
                      onChange={url => setForm(p => ({ ...p, cover_image: url }))}
                      label="Photo principale"
                    />
                  </div>

                  {/* Gallery images */}
                  <div className="md:col-span-2">
                    <label className={lc}>Photos supplémentaires (max 4)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.images.slice(0, 4).map((img, idx) => (
                        <ImageUpload
                          key={idx}
                          bucket="car-photos"
                          value={img}
                          onChange={url => {
                            const next = [...form.images];
                            next[idx] = url;
                            setForm(prev => ({ ...prev, images: next }));
                          }}
                          label={`Photo ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="md:col-span-2">
                    <label className={lc}>Caractéristiques (séparées par virgule)</label>
                    <input
                      value={form.features}
                      onChange={fld('features')}
                      placeholder="Climatisation, GPS, 4x4, Bluetooth…"
                      className={ic}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                    <span className="text-sm text-beige/70">Disponible à la location</span>
                    <Toggle value={form.is_available} onChange={v => setForm(p => ({ ...p, is_available: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                    <span className="text-sm text-beige/70">Publié (visible sur le site)</span>
                    <Toggle value={form.is_published} onChange={v => setForm(p => ({ ...p, is_published: v }))} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />}
                    {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer la voiture'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-white/10 text-beige/60 text-sm rounded-xl hover:bg-white/5"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
