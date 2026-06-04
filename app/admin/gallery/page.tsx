'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, Search, X, ImageIcon, Video, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { getGallery, deleteRow, toGalleryItem } from '@/lib/db';
import ImageUpload from '@/components/admin/ImageUpload';

interface GalleryItem {
  _id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
}

type FormData = {
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  category: string;
  isFeatured: boolean;
};

const EMPTY_FORM: FormData = {
  title: '',
  type: 'image',
  url: '',
  thumbnail: '',
  category: 'events',
  isFeatured: false,
};

const CATEGORIES = [
  { value: 'events', label: 'Événements' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'food', label: 'Gastronomie' },
  { value: 'culture', label: 'Culture' },
  { value: 'art', label: 'Art' },
  { value: 'sports', label: 'Sports' },
];

const CATEGORY_COLORS: Record<string, string> = {
  events: 'bg-blue-500/20 text-blue-400',
  nightlife: 'bg-pink-500/20 text-pink-400',
  food: 'bg-orange-500/20 text-orange-400',
  culture: 'bg-purple-500/20 text-purple-400',
  art: 'bg-rose-500/20 text-rose-400',
  sports: 'bg-white/10 text-beige/80',
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

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
  const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGallery({ limit: 200 });
      setItems(data);
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

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      url: item.url,
      thumbnail: item.thumbnail || '',
      category: item.category,
      isFeatured: item.isFeatured,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const buildRow = (f: FormData) => ({
    title: f.title || null, type: f.type, url: f.url,
    thumbnail: f.thumbnail || null, category: f.category,
    is_featured: f.isFeatured, tags: [],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data, error } = await supabase.from('gallery').update(buildRow(form)).eq('id', editing._id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i._id === editing._id ? toGalleryItem(data) : i));
        toast.success('Mis à jour !');
      } else {
        const { data, error } = await supabase.from('gallery').insert([buildRow(form)]).select().single();
        if (error) throw error;
        setItems(prev => [toGalleryItem(data), ...prev]);
        toast.success('Créé !');
      }
      closeModal();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    setDeleting(id);
    try {
      await deleteRow('gallery', id);
      toast.success('Supprimé !');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      const { error } = await supabase.from('gallery').update({ is_featured: !item.isFeatured }).eq('id', item._id);
      if (error) throw error;
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isFeatured: !i.isFeatured } : i));
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    images: items.filter(i => i.type === 'image').length,
    videos: items.filter(i => i.type === 'video').length,
    featured: items.filter(i => i.isFeatured).length,
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;
  const getPreview = (item: GalleryItem) => item.type === 'image' ? item.url : (item.thumbnail || '');

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Galerie</h1>
            <p className="text-sm text-beige/40 mt-0.5">Gérez les images et vidéos de la plateforme</p>
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
            { label: 'Images', value: stats.images },
            { label: 'Vidéos', value: stats.videos },
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
            placeholder="Rechercher dans la galerie..."
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-beige/40">
            <Film size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun élément trouvé</p>
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
                  className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden group"
                >
                  {/* Preview */}
                  <div className="relative h-44 bg-white/5">
                    {getPreview(item) ? (
                      <img
                        src={getPreview(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.type === 'video' ? (
                          <Video size={32} className="text-beige/20" />
                        ) : (
                          <ImageIcon size={32} className="text-beige/20" />
                        )}
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${item.type === 'video' ? 'bg-purple-500/80 text-white' : 'bg-black/60 text-white'}`}>
                        {item.type === 'video' ? 'Vidéo' : 'Image'}
                      </span>
                    </div>
                    {/* Featured star */}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
                    >
                      <Star size={14} className={item.isFeatured ? 'fill-gold text-gold' : 'text-white/60'} />
                    </button>
                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-beige truncate">{item.title}</p>
                    <div className="mt-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${CATEGORY_COLORS[item.category] || 'bg-white/10 text-beige/50'}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
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
                  {editing ? 'Modifier l\'élément' : 'Ajouter un élément'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-beige/50 hover:text-beige transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className={lc}>Titre *</label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Titre de l'élément"
                    className={ic}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(p => ({ ...p, type: e.target.value as 'image' | 'video' }))}
                      className={ic}
                    >
                      <option value="image">Image</option>
                      <option value="video">Vidéo</option>
                    </select>
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
                </div>

                {form.type === 'image' ? (
                  <ImageUpload
                    bucket="gallery"
                    value={form.url}
                    onChange={url => setForm(p => ({ ...p, url }))}
                    label="Image *"
                    maxSize={10 * 1024 * 1024}
                  />
                ) : (
                  <div>
                    <label className={lc}>URL de la vidéo *</label>
                    <input
                      required
                      value={form.url}
                      onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                      placeholder="https://..."
                      className={ic}
                    />
                  </div>
                )}

                {form.type === 'video' && (
                  <ImageUpload
                    bucket="gallery"
                    value={form.thumbnail}
                    onChange={url => setForm(p => ({ ...p, thumbnail: url }))}
                    label="Miniature de la vidéo"
                    maxSize={10 * 1024 * 1024}
                  />
                )}

                <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
                  <div>
                    <p className={lc}>En vedette</p>
                    <p className="text-xs text-beige/30">Mettre en avant</p>
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
