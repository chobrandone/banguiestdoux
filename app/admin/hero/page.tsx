'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, GalleryHorizontal, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/admin/ImageUpload';

interface Slide {
  id: string;
  image: string;
  title: string;
  title_fr: string;
  subtitle: string;
  subtitle_fr: string;
  sort_order: number;
  is_active: boolean;
}

type FormData = {
  image: string; titleFr: string; title: string; subtitleFr: string; subtitle: string; isActive: boolean;
};

const EMPTY_FORM: FormData = { image: '', titleFr: '', title: '', subtitleFr: '', subtitle: '', isActive: true };

const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-gold' : 'bg-white/10'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function AdminHeroPage() {
  const [items,   setItems]   = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form,    setForm]    = useState<FormData>(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item: Slide) => {
    setEditing(item);
    setForm({
      image: item.image, titleFr: item.title_fr || '', title: item.title || '',
      subtitleFr: item.subtitle_fr || '', subtitle: item.subtitle || '', isActive: item.is_active,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const buildRow = (f: FormData) => ({
    image: f.image, title: f.title || null, title_fr: f.titleFr || null,
    subtitle: f.subtitle || null, subtitle_fr: f.subtitleFr || null, is_active: f.isActive,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { toast.error('Une image est requise'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data, error } = await supabase.from('hero_slides').update(buildRow(form)).eq('id', editing.id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i.id === editing.id ? data : i));
        toast.success('Mis à jour !');
      } else {
        const { data, error } = await supabase.from('hero_slides').insert([{ ...buildRow(form), sort_order: items.length }]).select().single();
        if (error) throw error;
        setItems(prev => [...prev, data]);
        toast.success('Slide ajoutée !');
      }
      closeModal();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette image du carrousel ?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Supprimée');
    } catch {
      toast.error('Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (item: Slide) => {
    const newVal = !item.is_active;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: newVal } : i));
    try {
      const { error } = await supabase.from('hero_slides').update({ is_active: newVal }).eq('id', item.id);
      if (error) throw error;
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !newVal } : i));
      toast.error('Erreur');
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    try {
      await Promise.all(reordered.map((item, i) =>
        supabase.from('hero_slides').update({ sort_order: i }).eq('id', item.id)
      ));
    } catch {
      toast.error('Erreur de réorganisation');
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige flex items-center gap-2"><GalleryHorizontal size={22} /> Carrousel page d&apos;accueil</h1>
            <p className="text-sm text-beige/40 mt-0.5">Gérez les images de fond qui défilent sur la page d&apos;accueil</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold text-night font-semibold rounded-xl hover:bg-gold/90 transition-colors text-sm">
            <Plus size={16} /> Ajouter une image
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-beige/40">
            <GalleryHorizontal size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Aucune image. Le site affichera une image par défaut.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="flex flex-col gap-1 text-beige/30">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-20 hover:text-gold"><GripVertical size={14} className="rotate-180" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="disabled:opacity-20 hover:text-gold"><GripVertical size={14} /></button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="w-28 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-beige truncate">{item.title_fr || item.title || '—'}</p>
                    <p className="text-xs text-beige/40 truncate">{item.subtitle_fr || item.subtitle || ''}</p>
                  </div>
                  <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${item.is_active ? 'bg-gold/20 text-gold' : 'bg-beige/10 text-beige/40'}`}>
                    {item.is_active ? 'Actif' : 'Masqué'}
                  </button>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/30 hover:text-gold hover:bg-gold/10 transition-all"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold text-beige">{editing ? 'Modifier la slide' : 'Nouvelle slide'}</h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-beige/50 hover:text-beige transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <ImageUpload bucket="hero-slides" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} label="Image de fond *" />
                <div><label className={lc}>Titre (Français)</label><input value={form.titleFr} onChange={e => setForm(p => ({ ...p, titleFr: e.target.value }))} placeholder="Le meilleur de Bangui" className={ic} /></div>
                <div><label className={lc}>Titre (English)</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="The Best of Bangui" className={ic} /></div>
                <div><label className={lc}>Sous-titre (Français)</label><input value={form.subtitleFr} onChange={e => setForm(p => ({ ...p, subtitleFr: e.target.value }))} className={ic} /></div>
                <div><label className={lc}>Sous-titre (English)</label><input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} className={ic} /></div>
                <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
                  <span className="text-sm text-beige/70">Visible sur le site</span>
                  <Toggle value={form.isActive} onChange={v => setForm(p => ({ ...p, isActive: v }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm text-beige/50 hover:text-beige hover:border-white/20 transition-colors">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-gold text-night font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-50">
                    {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter'}
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
