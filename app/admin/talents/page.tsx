'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, Search, X, UserCircle, Instagram, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { getTalents, deleteRow, toTalent } from '@/lib/db';

interface Talent {
  _id: string;
  name: string;
  title?: string;
  category: string;
  bio?: string;
  image?: string;
  instagram?: string;
  facebook?: string;
  videoUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

type FormData = {
  name: string;
  title: string;
  category: string;
  bio: string;
  image: string;
  instagram: string;
  facebook: string;
  videoUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
};

const EMPTY_FORM: FormData = {
  name: '',
  title: '',
  category: 'artist',
  bio: '',
  image: '',
  instagram: '',
  facebook: '',
  videoUrl: '',
  isFeatured: false,
  isPublished: true,
};

const CATEGORIES = [
  { value: 'artist', label: 'Artiste' },
  { value: 'musician', label: 'Musicien' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'influencer', label: 'Influenceur' },
  { value: 'athlete', label: 'Athlète' },
  { value: 'creator', label: 'Créateur' },
  { value: 'chef', label: 'Chef' },
  { value: 'other', label: 'Autre' },
];

const CATEGORY_COLORS: Record<string, string> = {
  artist: 'bg-pink-500/20 text-pink-400',
  musician: 'bg-purple-500/20 text-purple-400',
  entrepreneur: 'bg-blue-500/20 text-blue-400',
  influencer: 'bg-rose-500/20 text-rose-400',
  athlete: 'bg-white/10 text-beige/80',
  creator: 'bg-cyan-500/20 text-cyan-400',
  chef: 'bg-orange-500/20 text-orange-400',
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

export default function TalentsAdminPage() {
  const [items, setItems] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Talent | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
  const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTalents({ all: true, limit: 200 });
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

  const openEdit = (item: Talent) => {
    setEditing(item);
    setForm({
      name: item.name,
      title: item.title || '',
      category: item.category,
      bio: item.bio || '',
      image: item.image || '',
      instagram: item.instagram || '',
      facebook: item.facebook || '',
      videoUrl: item.videoUrl || '',
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const buildRow = (f: FormData) => ({
    name: f.name, title: f.title || null,
    slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: f.category, bio: f.bio || null,
    image: f.image || null, instagram: f.instagram || null,
    facebook: f.facebook || null, video_url: f.videoUrl || null,
    is_featured: f.isFeatured, is_published: f.isPublished,
    gallery: [], tags: [],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data, error } = await supabase.from('talents').update(buildRow(form)).eq('id', editing._id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i._id === editing._id ? toTalent(data) : i));
        toast.success('Mis à jour !');
      } else {
        const { data, error } = await supabase.from('talents').insert([buildRow(form)]).select().single();
        if (error) throw error;
        setItems(prev => [toTalent(data), ...prev]);
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
    if (!confirm('Supprimer ce talent ?')) return;
    setDeleting(id);
    try {
      await deleteRow('talents', id);
      toast.success('Supprimé !');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (item: Talent, field: 'isPublished' | 'isFeatured') => {
    const dbCol = field === 'isPublished' ? 'is_published' : 'is_featured';
    try {
      const { error } = await supabase.from('talents').update({ [dbCol]: !item[field] }).eq('id', item._id);
      if (error) throw error;
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, [field]: !i[field] } : i));
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    published: items.filter(i => i.isPublished).length,
    categories: new Set(items.map(i => i.category)).size,
    featured: items.filter(i => i.isFeatured).length,
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Talents</h1>
            <p className="text-sm text-beige/40 mt-0.5">Gérez les personnalités de la plateforme</p>
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
            { label: 'Publiés', value: stats.published },
            { label: 'Catégories', value: stats.categories },
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
            placeholder="Rechercher un talent..."
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-beige/40">
              <UserCircle size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun talent trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Photo</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Catégorie</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Réseaux</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Vedette</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filtered.map(item => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-beige/60">{item.name[0]?.toUpperCase()}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-beige">{item.name}</p>
                          {item.title && <p className="text-xs text-beige/40 mt-0.5">{item.title}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[item.category] || 'bg-white/10 text-beige/50'}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.instagram && (
                              <a href={`https://instagram.com/${item.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                                className="text-pink-400/60 hover:text-pink-400 transition-colors">
                                <Instagram size={15} />
                              </a>
                            )}
                            {item.facebook && (
                              <a href={item.facebook} target="_blank" rel="noopener noreferrer"
                                className="text-blue-400/60 hover:text-blue-400 transition-colors">
                                <Facebook size={15} />
                              </a>
                            )}
                            {!item.instagram && !item.facebook && (
                              <span className="text-beige/20 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Toggle value={item.isPublished} onChange={() => handleToggle(item, 'isPublished')} />
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(item, 'isFeatured')}>
                            <Star size={18} className={item.isFeatured ? 'fill-gold text-gold' : 'text-white/20'} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-beige/40 hover:text-beige transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deleting === item._id}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-beige/40 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                  {editing ? 'Modifier le talent' : 'Ajouter un talent'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-beige/50 hover:text-beige transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Nom *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nom complet"
                      className={ic}
                    />
                  </div>

                  <div>
                    <label className={lc}>Titre / Profession</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: Artiste peintre"
                      className={ic}
                    />
                  </div>

                  <div className="col-span-2">
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

                  <div className="col-span-2">
                    <label className={lc}>Biographie</label>
                    <textarea
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Présentation du talent..."
                      rows={3}
                      className={`${ic} resize-none`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={lc}>URL de la photo</label>
                    <input
                      value={form.image}
                      onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                      placeholder="https://..."
                      className={ic}
                    />
                    {form.image && (
                      <div className="mt-2 w-16 h-16 rounded-full overflow-hidden bg-white/5">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={lc}>Instagram</label>
                    <input
                      value={form.instagram}
                      onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                      placeholder="@handle"
                      className={ic}
                    />
                  </div>

                  <div>
                    <label className={lc}>Facebook</label>
                    <input
                      value={form.facebook}
                      onChange={e => setForm(p => ({ ...p, facebook: e.target.value }))}
                      placeholder="https://facebook.com/..."
                      className={ic}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={lc}>URL Vidéo</label>
                    <input
                      value={form.videoUrl}
                      onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/... ou https://..."
                      className={ic}
                    />
                  </div>

                  <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
                    <div>
                      <p className={lc}>En vedette</p>
                      <p className="text-xs text-beige/30">Mettre en avant</p>
                    </div>
                    <Toggle value={form.isFeatured} onChange={v => setForm(p => ({ ...p, isFeatured: v }))} />
                  </div>

                  <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
                    <div>
                      <p className={lc}>Publié</p>
                      <p className="text-xs text-beige/30">Visible sur le site</p>
                    </div>
                    <Toggle value={form.isPublished} onChange={v => setForm(p => ({ ...p, isPublished: v }))} />
                  </div>
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
