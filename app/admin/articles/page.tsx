'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, Search, X, ImageIcon, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { getArticles, deleteRow, toArticle } from '@/lib/db';

interface Article {
  _id: string;
  title: string;
  category: string;
  excerpt?: string;
  content?: string;
  image?: string;
  isFeatured: boolean;
  isPublished: boolean;
  views?: number;
  readTime?: number;
  createdAt: string;
}

type FormData = {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  isFeatured: boolean;
  isPublished: boolean;
};

const EMPTY_FORM: FormData = {
  title: '',
  category: 'news',
  excerpt: '',
  content: '',
  image: '',
  isFeatured: false,
  isPublished: true,
};

const CATEGORIES = [
  { value: 'news', label: 'Actualités' },
  { value: 'culture', label: 'Culture' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'gastronomy', label: 'Gastronomie' },
  { value: 'travel', label: 'Voyage' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'interview', label: 'Interview' },
  { value: 'guide', label: 'Guide' },
  { value: 'other', label: 'Autre' },
];

const CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-500/20 text-blue-400',
  culture: 'bg-purple-500/20 text-purple-400',
  nightlife: 'bg-pink-500/20 text-pink-400',
  gastronomy: 'bg-orange-500/20 text-orange-400',
  travel: 'bg-cyan-500/20 text-cyan-400',
  lifestyle: 'bg-white/10 text-beige/80',
  interview: 'bg-yellow-500/20 text-yellow-400',
  guide: 'bg-teal-500/20 text-teal-400',
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

export default function ArticlesAdminPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
  const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticles({ all: true, limit: 200 });
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

  const openEdit = (item: Article) => {
    setEditing(item);
    setForm({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt || '',
      content: item.content || '',
      image: item.image || '',
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
    title: f.title,
    slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    excerpt: f.excerpt, content: f.content,
    category: f.category, image: f.image || null,
    is_featured: f.isFeatured, is_published: f.isPublished,
    gallery: [], tags: [],
    read_time: Math.max(1, Math.ceil(f.content.split(' ').length / 200)),
    views: 0, published_at: new Date().toISOString(),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data, error } = await supabase.from('articles').update(buildRow(form)).eq('id', editing._id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i._id === editing._id ? toArticle(data) : i));
        toast.success('Mis à jour !');
      } else {
        const { data, error } = await supabase.from('articles').insert([buildRow(form)]).select().single();
        if (error) throw error;
        setItems(prev => [toArticle(data), ...prev]);
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
    if (!confirm('Supprimer cet article ?')) return;
    setDeleting(id);
    try {
      await deleteRow('articles', id);
      toast.success('Supprimé !');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (item: Article, field: 'isPublished' | 'isFeatured') => {
    const dbCol = field === 'isPublished' ? 'is_published' : 'is_featured';
    try {
      const { error } = await supabase.from('articles').update({ [dbCol]: !item[field] }).eq('id', item._id);
      if (error) throw error;
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, [field]: !i[field] } : i));
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.excerpt || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalViews = items.reduce((sum, i) => sum + (i.views || 0), 0);

  const stats = {
    total: items.length,
    published: items.filter(i => i.isPublished).length,
    views: totalViews,
    featured: items.filter(i => i.isFeatured).length,
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Articles</h1>
            <p className="text-sm text-beige/40 mt-0.5">Gérez le contenu éditorial de la plateforme</p>
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
            { label: 'Total vues', value: stats.views.toLocaleString() },
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
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-beige/40">
              <ImageIcon size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun article trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Titre</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Catégorie</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Vues</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Lecture</th>
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
                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                              <ImageIcon size={16} className="text-beige/20" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-beige">{item.title}</p>
                          {item.excerpt && (
                            <p className="text-xs text-beige/40 mt-0.5 max-w-[240px] truncate">
                              {item.excerpt.slice(0, 60)}{item.excerpt.length > 60 ? '...' : ''}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[item.category] || 'bg-white/10 text-beige/50'}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-beige/60">
                            <Eye size={13} />
                            <span>{(item.views || 0).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-beige/60">
                            <Clock size={13} />
                            <span>{item.readTime ? `${item.readTime} min` : '—'}</span>
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
                  {editing ? 'Modifier l\'article' : 'Ajouter un article'}
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
                    placeholder="Titre de l'article"
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
                  <label className={lc}>Extrait</label>
                  <textarea
                    value={form.excerpt}
                    onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="Résumé court de l'article..."
                    rows={2}
                    className={`${ic} resize-none`}
                  />
                </div>

                <div>
                  <label className={lc}>Contenu</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Contenu complet de l'article..."
                    rows={6}
                    className={`${ic} resize-none`}
                  />
                </div>

                <div>
                  <label className={lc}>URL de l&apos;image</label>
                  <input
                    value={form.image}
                    onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://..."
                    className={ic}
                  />
                  {form.image && (
                    <div className="mt-2 rounded-xl overflow-hidden h-32 bg-white/5">
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
