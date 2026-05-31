'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Star, X, Calendar, MapPin } from 'lucide-react';
import { eventsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Event {
  _id: string; title: string; category: string; date: string; time?: string;
  location: string; address?: string; description?: string; image?: string;
  ticketPrice?: number; isFree: boolean; isFeatured: boolean; isPublished: boolean;
  capacity?: number; rsvpCount?: number; createdAt: string;
}
type EventForm = { title:string; category:string; date:string; time:string; location:string; address:string; description:string; image:string; ticketPrice:number; isFree:boolean; isFeatured:boolean; isPublished:boolean; capacity:number };

const CATS = [
  { value:'concerts',fr:'Concerts' }, { value:'festivals',fr:'Festivals' },
  { value:'cinema',fr:'Cinéma' }, { value:'pool-parties',fr:'Pool Parties' },
  { value:'jazz-nights',fr:'Jazz Nights' }, { value:'sports',fr:'Sports' },
  { value:'exhibitions',fr:'Expositions' }, { value:'restaurant-openings',fr:'Ouvertures Restos' },
  { value:'theatre',fr:'Théâtre' }, { value:'art',fr:'Art' }, { value:'other',fr:'Autre' },
];
const CAT_COLORS: Record<string, string> = {
  concerts:'bg-purple-500/20 text-purple-400', festivals:'bg-pink-500/20 text-pink-400',
  cinema:'bg-blue-500/20 text-blue-400', 'pool-parties':'bg-cyan-500/20 text-cyan-400',
  'jazz-nights':'bg-yellow-500/20 text-yellow-400', sports:'bg-green-500/20 text-green-400',
  exhibitions:'bg-orange-500/20 text-orange-400', art:'bg-rose-500/20 text-rose-400',
};
const EMPTY: EventForm = { title:'', category:'concerts', date:'', time:'', location:'', address:'', description:'', image:'', ticketPrice:0, isFree:false, isFeatured:false, isPublished:true, capacity:0 };
const ic = 'w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all';
const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-gold' : 'bg-white/10'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function AdminEventsPage() {
  const [items,     setItems]     = useState<Event[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Event | null>(null);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [form,      setForm]      = useState<EventForm>(EMPTY);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const { data } = await eventsAPI.getAllAdmin({ limit: '200' }); setItems(data.data); }
    catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (item: Event) => {
    setEditing(item);
    setForm({ title:item.title, category:item.category, date:item.date?.slice(0,10)||'', time:item.time||'', location:item.location, address:item.address||'', description:item.description||'', image:item.image||'', ticketPrice:item.ticketPrice||0, isFree:item.isFree, isFeatured:item.isFeatured, isPublished:item.isPublished, capacity:item.capacity||0 });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) { toast.error('Titre, date et lieu requis'); return; }
    setSaving(true);
    try {
      if (editing) { await eventsAPI.update(editing._id, form); toast.success('Mis à jour !'); }
      else { await eventsAPI.create(form); toast.success('Événement créé !'); }
      fetchItems(); closeModal();
    } catch (err: unknown) { toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try { await eventsAPI.delete(id); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Supprimé'); }
    catch { toast.error('Erreur'); }
  };

  const toggleField = async (id: string, field: string, value: boolean) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, [field]: value } : i));
    try { await eventsAPI.update(id, { [field]: value }); }
    catch { setItems(prev => prev.map(i => i._id === id ? { ...i, [field]: !value } : i)); toast.error('Erreur'); }
  };

  const fld = (key: keyof EventForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: (key==='ticketPrice'||key==='capacity') ? Number(e.target.value) : e.target.value }));

  const visible = items.filter(i => {
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = { total:items.length, published:items.filter(i=>i.isPublished).length, upcoming:items.filter(i=>new Date(i.date)>=new Date()).length, featured:items.filter(i=>i.isFeatured).length };

  return (
    <div className="space-y-6 text-beige">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold">Événements</h2><p className="text-beige/40 text-sm">{items.length} événements</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{l:'Total',v:stats.total},{l:'Publiés',v:stats.published},{l:'À venir',v:stats.upcoming},{l:'Vedette',v:stats.featured}].map(({ l, v }) => (
          <div key={l} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
            <p className="text-2xl font-bold text-beige">{v}</p>
            <p className="text-xs text-beige/40">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige/30" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50" />
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige outline-none">
          <option value="all">Toutes catégories</option>
          {CATS.map(c => <option key={c.value} value={c.value}>{c.fr}</option>)}
        </select>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center"><Calendar className="w-10 h-10 text-beige/10 mx-auto mb-2" /><p className="text-beige/30 text-sm">{items.length===0?'Aucun événement. Créez le premier !':'Aucun résultat.'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                {['Événement','Catégorie','Date','Prix','Statut','Vedette','Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((item, i) => (
                  <motion.tr key={item._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-gold/50" /></div>
                        )}
                        <div>
                          <p className="font-semibold text-beige text-sm">{item.title}</p>
                          <p className="text-xs text-beige/40 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[item.category]||'bg-beige/10 text-beige/60'}`}>
                        {CATS.find(c=>c.value===item.category)?.fr||item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-beige/60 text-xs whitespace-nowrap">{new Date(item.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}</td>
                    <td className="px-4 py-3.5"><span className="text-sm font-semibold text-beige">{item.isFree?'Gratuit':item.ticketPrice?formatPrice(item.ticketPrice,'XAF'):'—'}</span></td>
                    <td className="px-4 py-3.5">
                      <button onClick={()=>toggleField(item._id,'isPublished',!item.isPublished)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${item.isPublished?'bg-green-500/15 text-green-400':'bg-beige/10 text-beige/40'}`}>
                        {item.isPublished?'Publié':'Brouillon'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={()=>toggleField(item._id,'isFeatured',!item.isFeatured)}>
                        <Star className={`w-4 h-4 transition-colors ${item.isFeatured?'text-gold fill-gold':'text-beige/20'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-gold hover:bg-gold/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>handleDelete(item._id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="font-display text-xl font-bold text-beige">{editing?'Modifier l\'événement':'Nouvel événement'}</h3>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-beige/40 hover:text-beige"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className={lc}>Titre *</label><input value={form.title} onChange={fld('title')} required placeholder="Nom de l'événement" className={ic} /></div>
                  <div><label className={lc}>Catégorie</label><select value={form.category} onChange={fld('category')} className={ic}>{CATS.map(c=><option key={c.value} value={c.value}>{c.fr}</option>)}</select></div>
                  <div><label className={lc}>Date *</label><input type="date" value={form.date} onChange={fld('date')} required className={ic} /></div>
                  <div><label className={lc}>Heure</label><input type="time" value={form.time} onChange={fld('time')} className={ic} /></div>
                  <div><label className={lc}>Lieu *</label><input value={form.location} onChange={fld('location')} required placeholder="Nom du lieu" className={ic} /></div>
                  <div className="md:col-span-2"><label className={lc}>Adresse</label><input value={form.address} onChange={fld('address')} placeholder="Adresse complète, Bangui" className={ic} /></div>
                  <div className="md:col-span-2"><label className={lc}>Description</label><textarea value={form.description} onChange={fld('description')} rows={3} placeholder="Description de l'événement..." className={ic+' resize-none'} /></div>
                  <div className="md:col-span-2">
                    <label className={lc}>Image (URL)</label>
                    <input value={form.image} onChange={fld('image')} placeholder="https://images.unsplash.com/..." className={ic} />
                    {form.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image} alt="" className="mt-2 h-28 w-full object-cover rounded-xl" onError={e=>(e.currentTarget.style.display='none')} />
                    )}
                  </div>
                  <div><label className={lc}>Prix (XAF)</label><input type="number" value={form.ticketPrice} onChange={fld('ticketPrice')} min="0" className={ic} /></div>
                  <div><label className={lc}>Capacité (0 = illimitée)</label><input type="number" value={form.capacity} onChange={fld('capacity')} min="0" className={ic} /></div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl"><span className="text-sm text-beige/70">Entrée gratuite</span><Toggle value={form.isFree} onChange={v=>setForm(p=>({...p,isFree:v}))} /></div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl"><span className="text-sm text-beige/70">En vedette</span><Toggle value={form.isFeatured} onChange={v=>setForm(p=>({...p,isFeatured:v}))} /></div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl md:col-span-2"><span className="text-sm text-beige/70">Publié (visible sur le site)</span><Toggle value={form.isPublished} onChange={v=>setForm(p=>({...p,isPublished:v}))} /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving&&<div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />}
                    {saving?'Enregistrement...':editing?'Mettre à jour':'Créer l\'événement'}
                  </button>
                  <button type="button" onClick={closeModal} className="px-6 py-3 border border-white/10 text-beige/60 text-sm rounded-xl hover:bg-white/5">Annuler</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
