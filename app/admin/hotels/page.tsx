'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Star, Hotel, ChevronDown, ChevronUp,
  BedDouble, DollarSign, Users, Eye, EyeOff,
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
interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  stars: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  cover_image: string | null;
  images: string[];
  amenities: string[];
  is_published: boolean;
  created_at: string;
}

interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
}

type HotelForm = {
  name: string; slug: string; description: string; address: string;
  neighborhood: string; stars: number; phone: string; email: string;
  website: string; cover_image: string; images: string[];
  amenities: string; is_published: boolean;
};

type RoomForm = {
  room_type: string; description: string; price_per_night: number;
  capacity: number; amenities: string; images: string[]; is_available: boolean;
};

const EMPTY_HOTEL: HotelForm = {
  name: '', slug: '', description: '', address: '', neighborhood: '',
  stars: 3, phone: '', email: '', website: '', cover_image: '',
  images: ['', '', '', '', ''], amenities: '', is_published: true,
};

const EMPTY_ROOM: RoomForm = {
  room_type: '', description: '', price_per_night: 0,
  capacity: 2, amenities: '', images: ['', ''], is_available: true,
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

/* ── StarPicker ─────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-5 h-5 transition-colors ${n <= value ? 'text-gold fill-gold' : 'text-beige/20'}`} />
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Room sub-panel (per hotel)
══════════════════════════════════════════════════════════ */
function RoomsPanel({ hotelId }: { hotelId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RoomForm>(EMPTY_ROOM);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const sb = supabase;
      const { data, error } = await sb.from('hotel_rooms').select('*').eq('hotel_id', hotelId).order('created_at');
      if (error) throw error;
      setRooms(data || []);
    } catch {
      toast.error('Erreur chargement chambres');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openCreate = () => { setEditingRoom(null); setForm(EMPTY_ROOM); setShowForm(true); };
  const openEdit = (r: Room) => {
    setEditingRoom(r);
    setForm({
      room_type: r.room_type,
      description: r.description || '',
      price_per_night: r.price_per_night,
      capacity: r.capacity,
      amenities: (r.amenities || []).join(', '),
      images: r.images?.length ? [...r.images, '', ''].slice(0, 2) : ['', ''],
      is_available: r.is_available,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingRoom(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_type) { toast.error('Type de chambre requis'); return; }
    setSaving(true);
    try {
      const sb = supabase;
      const row = {
        hotel_id: hotelId,
        room_type: form.room_type,
        description: form.description || null,
        price_per_night: form.price_per_night,
        capacity: form.capacity,
        amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: form.images.filter(Boolean),
        is_available: form.is_available,
      };
      if (editingRoom) {
        const { data, error } = await sb.from('hotel_rooms').update(row).eq('id', editingRoom.id).select().single();
        if (error) throw error;
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? data : r));
        toast.success('Chambre mise à jour !');
      } else {
        const { data, error } = await sb.from('hotel_rooms').insert([row]).select().single();
        if (error) throw error;
        setRooms(prev => [...prev, data]);
        toast.success('Chambre créée !');
      }
      closeForm();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette chambre ?')) return;
    try {
      const sb = supabase;
      const { error } = await sb.from('hotel_rooms').delete().eq('id', id);
      if (error) throw error;
      setRooms(prev => prev.filter(r => r.id !== id));
      toast.success('Chambre supprimée');
    } catch { toast.error('Erreur'); }
  };

  const fld = (key: keyof RoomForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({
      ...prev,
      [key]: (key === 'price_per_night' || key === 'capacity') ? Number(e.target.value) : e.target.value,
    }));

  return (
    <div className="mt-2 px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-beige/40 uppercase tracking-wider">
          {loading ? '…' : `${rooms.length} chambre${rooms.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-xs font-semibold rounded-lg hover:bg-gold/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter une chambre
        </button>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center"><div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /></div>
      ) : rooms.length === 0 ? (
        <p className="text-center text-beige/30 text-sm py-6">Aucune chambre. Ajoutez la première !</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map(r => (
            <div key={r.id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 flex gap-3">
              {r.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gold/5 flex items-center justify-center flex-shrink-0">
                  <BedDouble className="w-5 h-5 text-gold/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-beige text-sm truncate">{r.room_type}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-beige/50 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />{r.price_per_night.toLocaleString('fr-FR')} XAF/nuit
                  </span>
                  <span className="text-xs text-beige/50 flex items-center gap-1">
                    <Users className="w-3 h-3" />{r.capacity}
                  </span>
                </div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.is_available ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {r.is_available ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(r)} className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-gold hover:bg-gold/10 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="font-display text-lg font-bold text-beige">
                  {editingRoom ? 'Modifier la chambre' : 'Nouvelle chambre'}
                </h3>
                <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-beige/40 hover:text-beige">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className={lc}>Type de chambre *</label>
                  <input value={form.room_type} onChange={fld('room_type')} required placeholder="Standard, Deluxe, Suite…" className={ic} />
                </div>
                <div>
                  <label className={lc}>Description</label>
                  <textarea value={form.description} onChange={fld('description')} rows={2} className={ic + ' resize-none'} placeholder="Description de la chambre…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lc}>Prix / nuit (XAF)</label>
                    <input type="number" value={form.price_per_night} onChange={fld('price_per_night')} min="0" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Capacité (pers.)</label>
                    <input type="number" value={form.capacity} onChange={fld('capacity')} min="1" max="10" className={ic} />
                  </div>
                </div>
                <div>
                  <label className={lc}>Équipements (séparés par virgule)</label>
                  <input value={form.amenities} onChange={fld('amenities')} placeholder="WiFi, Climatisation, TV…" className={ic} />
                </div>
                <div className="space-y-3">
                  <label className={lc}>Photos (max 2)</label>
                  {form.images.slice(0, 2).map((img, idx) => (
                    <ImageUpload
                      key={idx}
                      bucket="hotel-photos"
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
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                  <span className="text-sm text-beige/70">Disponible à la réservation</span>
                  <Toggle value={form.is_available} onChange={v => setForm(p => ({ ...p, is_available: v }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />}
                    {saving ? 'Enregistrement…' : editingRoom ? 'Mettre à jour' : 'Créer la chambre'}
                  </button>
                  <button type="button" onClick={closeForm} className="px-6 py-3 border border-white/10 text-beige/60 text-sm rounded-xl hover:bg-white/5">
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

/* ══════════════════════════════════════════════════════════
   Main Hotels Page
══════════════════════════════════════════════════════════ */
export default function AdminHotelsPage() {
  const [items, setItems] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [search, setSearch] = useState('');
  const [starsFilter, setStarsFilter] = useState<number | 'all'>('all');
  const [form, setForm] = useState<HotelForm>(EMPTY_HOTEL);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const sb = supabase;
      const { data, error } = await sb
        .from('hotels')
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

  const openCreate = () => { setEditing(null); setForm(EMPTY_HOTEL); setShowModal(true); };
  const openEdit = (item: Hotel) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      address: item.address || '',
      neighborhood: item.neighborhood || '',
      stars: item.stars,
      phone: item.phone || '',
      email: item.email || '',
      website: item.website || '',
      cover_image: item.cover_image || '',
      images: item.images?.length
        ? [...item.images, '', '', '', '', ''].slice(0, 5)
        : ['', '', '', '', ''],
      amenities: (item.amenities || []).join(', '),
      is_published: item.is_published,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const sb = supabase;
      const row = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        stars: form.stars,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        cover_image: form.cover_image || null,
        images: form.images.filter(Boolean),
        amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        is_published: form.is_published,
      };
      if (editing) {
        const { data, error } = await sb.from('hotels').update(row).eq('id', editing.id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(i => i.id === editing.id ? data : i));
        toast.success('Hôtel mis à jour !');
      } else {
        const { data, error } = await sb.from('hotels').insert([row]).select().single();
        if (error) throw error;
        setItems(prev => [data, ...prev]);
        toast.success('Hôtel créé !');
      }
      closeModal();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet hôtel et toutes ses chambres ?')) return;
    try {
      const sb = supabase;
      const { error } = await sb.from('hotels').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      if (expandedHotel === id) setExpandedHotel(null);
      toast.success('Hôtel supprimé');
    } catch { toast.error('Erreur'); }
  };

  const togglePublished = async (id: string, current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_published: !current } : i));
    try {
      const sb = supabase;
      const { error } = await sb.from('hotels').update({ is_published: !current }).eq('id', id);
      if (error) throw error;
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, is_published: current } : i));
      toast.error('Erreur');
    }
  };

  const fld = (key: keyof HotelForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = key === 'stars' ? Number(e.target.value) : e.target.value;
      setForm(prev => ({
        ...prev,
        [key]: val,
        ...(key === 'name' ? { slug: slugify(e.target.value) } : {}),
      }));
    };

  const visible = items.filter(i => {
    if (starsFilter !== 'all' && i.stars !== starsFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) &&
        !(i.neighborhood || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    published: items.filter(i => i.is_published).length,
    avg_stars: items.length ? (items.reduce((s, i) => s + i.stars, 0) / items.length).toFixed(1) : '—',
  };

  return (
    <div className="space-y-6 text-beige">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Hôtels</h2>
          <p className="text-beige/40 text-sm">{items.length} hôtel{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: 'Total', v: stats.total },
          { l: 'Publiés', v: stats.published },
          { l: 'Étoiles moy.', v: stats.avg_stars },
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
            placeholder="Rechercher par nom ou quartier…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50"
          />
        </div>
        <select
          value={starsFilter}
          onChange={e => setStarsFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none"
        >
          <option value="all">Toutes étoiles</option>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-[#141414] border border-white/5 rounded-2xl py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-[#141414] border border-white/5 rounded-2xl py-16 text-center">
            <Hotel className="w-10 h-10 text-beige/10 mx-auto mb-2" />
            <p className="text-beige/30 text-sm">
              {items.length === 0 ? 'Aucun hôtel. Créez le premier !' : 'Aucun résultat.'}
            </p>
          </div>
        ) : (
          visible.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden"
            >
              {/* Hotel row */}
              <div className="flex items-center gap-4 p-4">
                {item.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gold/5 flex items-center justify-center flex-shrink-0">
                    <Hotel className="w-6 h-6 text-gold/30" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-beige truncate">{item.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: item.stars }).map((_, s) => (
                        <Star key={s} className="w-3 h-3 text-gold fill-gold" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-beige/40 mt-0.5">{item.neighborhood || item.address || '—'}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublished(item.id, item.is_published)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${item.is_published ? 'bg-green-500/15 text-green-400' : 'bg-beige/5 text-beige/30'}`}
                  >
                    {item.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.is_published ? 'Publié' : 'Brouillon'}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/30 hover:text-gold hover:bg-gold/10 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedHotel(prev => prev === item.id ? null : item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-beige/30 hover:text-beige hover:bg-white/5 transition-all"
                  >
                    {expandedHotel === item.id
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rooms panel */}
              <AnimatePresence>
                {expandedHotel === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <RoomsPanel hotelId={item.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Hotel Create/Edit Modal */}
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
                  {editing ? "Modifier l'hôtel" : 'Nouvel hôtel'}
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
                    <input value={form.name} onChange={fld('name')} required placeholder="Hôtel Oubangui…" className={ic} />
                  </div>

                  {/* Slug */}
                  <div className="md:col-span-2">
                    <label className={lc}>Slug (URL)</label>
                    <input value={form.slug} onChange={fld('slug')} placeholder="hotel-oubangui" className={ic} />
                  </div>

                  {/* Stars */}
                  <div>
                    <label className={lc}>Étoiles</label>
                    <StarPicker value={form.stars} onChange={n => setForm(p => ({ ...p, stars: n }))} />
                  </div>

                  {/* Neighborhood */}
                  <div>
                    <label className={lc}>Quartier</label>
                    <input value={form.neighborhood} onChange={fld('neighborhood')} placeholder="Centre-ville, Gobongo…" className={ic} />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className={lc}>Adresse</label>
                    <input value={form.address} onChange={fld('address')} placeholder="Avenue des Martyrs, Bangui" className={ic} />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={lc}>Description</label>
                    <textarea value={form.description} onChange={fld('description')} rows={3} placeholder="Description de l'hôtel…" className={ic + ' resize-none'} />
                  </div>

                  {/* Phone / Email */}
                  <div>
                    <label className={lc}>Téléphone</label>
                    <input value={form.phone} onChange={fld('phone')} placeholder="+236 …" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Email</label>
                    <input type="email" value={form.email} onChange={fld('email')} placeholder="contact@hotel.cf" className={ic} />
                  </div>

                  {/* Website */}
                  <div className="md:col-span-2">
                    <label className={lc}>Site web</label>
                    <input value={form.website} onChange={fld('website')} placeholder="https://…" className={ic} />
                  </div>

                  {/* Cover image */}
                  <div className="md:col-span-2">
                    <ImageUpload
                      bucket="hotel-photos"
                      value={form.cover_image}
                      onChange={url => setForm(p => ({ ...p, cover_image: url }))}
                      label="Photo de couverture"
                    />
                  </div>

                  {/* Gallery images */}
                  <div className="md:col-span-2">
                    <label className={lc}>Galerie (max 5 photos)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.images.slice(0, 5).map((img, idx) => (
                        <ImageUpload
                          key={idx}
                          bucket="hotel-photos"
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

                  {/* Amenities */}
                  <div className="md:col-span-2">
                    <label className={lc}>Équipements (séparés par virgule)</label>
                    <input
                      value={form.amenities}
                      onChange={fld('amenities')}
                      placeholder="Piscine, WiFi, Restaurant, Salle de conf…"
                      className={ic}
                    />
                  </div>

                  {/* Published */}
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl md:col-span-2">
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
                    {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : "Créer l'hôtel"}
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
