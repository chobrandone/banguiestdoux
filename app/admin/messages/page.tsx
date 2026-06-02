'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Mail, MailOpen, Phone, ExternalLink, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMessages, markMessageRead, deleteMessage } from '@/lib/db';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type FilterTab = 'all' | 'unread';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesAdminPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMessages({ limit: 100 });
      setItems(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    // Auto-mark as read when opening
    if (!msg.isRead) {
      handleMarkRead(msg._id);
    }
  };

  const handleMarkRead = async (id: string) => {
    setMarking(id);
    try {
      await markMessageRead(id);
      setItems(prev => prev.map(i => i._id === id ? { ...i, isRead: true } : i));
      if (selected?._id === id) {
        setSelected(prev => prev ? { ...prev, isRead: true } : null);
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setMarking(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    setDeleting(id);
    try {
      await deleteMessage(id);
      toast.success('Supprimé !');
      setItems(prev => prev.filter(i => i._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = items.filter(msg => {
    const matchSearch = msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      (msg.subject || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'unread' && !msg.isRead);
    return matchSearch && matchFilter;
  });

  const unreadCount = items.filter(i => !i.isRead).length;

  const stats = {
    total: items.length,
    unread: unreadCount,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Messages</h1>
            <p className="text-sm text-beige/40 mt-0.5">Messages reçus via le formulaire de contact</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#141414] border border-white/5 rounded-xl px-4 py-2">
              <span className="text-sm text-beige/60">{stats.total} messages</span>
            </div>
            {stats.unread > 0 && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-4 py-2">
                <span className="text-sm text-blue-400 font-semibold">{stats.unread} non lus</span>
              </div>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[600px]">
          {/* Left panel */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
            {/* Search + filter */}
            <div className="p-4 border-b border-white/5 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-beige/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
                />
              </div>
              <div className="flex gap-2">
                {([['all', 'Tous'], ['unread', 'Non lus']] as [FilterTab, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filter === val
                        ? 'bg-gold text-night'
                        : 'bg-white/5 text-beige/50 hover:text-beige'
                    }`}
                  >
                    {label}
                    {val === 'unread' && unreadCount > 0 && (
                      <span className="ml-1.5 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-beige/40 text-sm">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-beige/40">
                  <MessageSquare size={28} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucun message</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map(msg => (
                    <motion.button
                      key={msg._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleSelect(msg)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-white/[0.03] transition-colors ${
                        selected?._id === msg._id ? 'bg-white/[0.05]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {!msg.isRead ? (
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-transparent" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${msg.isRead ? 'text-beige/60' : 'text-beige font-semibold'}`}>
                              {msg.name}
                            </p>
                            <span className="text-[11px] text-beige/30 flex-shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          {msg.subject && (
                            <p className={`text-xs mt-0.5 truncate ${msg.isRead ? 'text-beige/40' : 'text-beige/70'}`}>
                              {msg.subject}
                            </p>
                          )}
                          <p className="text-xs text-beige/30 truncate mt-0.5">{msg.message}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-beige/30">
                <Mail size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez un message</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Message header */}
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-gold">{selected.name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-beige">{selected.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <a
                              href={`mailto:${selected.email}`}
                              className="text-xs text-beige/50 hover:text-gold transition-colors flex items-center gap-1"
                            >
                              <Mail size={11} />
                              {selected.email}
                            </a>
                            {selected.phone && (
                              <span className="text-xs text-beige/50 flex items-center gap-1">
                                <Phone size={11} />
                                {selected.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!selected.isRead && (
                          <button
                            onClick={() => handleMarkRead(selected._id)}
                            disabled={marking === selected._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                          >
                            <MailOpen size={13} />
                            Marquer lu
                          </button>
                        )}
                        <a
                          href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Votre message')}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-beige/60 hover:text-beige text-xs font-semibold hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink size={13} />
                          Répondre
                        </a>
                        <button
                          onClick={() => handleDelete(selected._id)}
                          disabled={deleting === selected._id}
                          className="p-1.5 rounded-xl hover:bg-red-500/20 text-beige/40 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subject + date */}
                  <div className="px-6 py-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-beige/30 uppercase tracking-wider mb-1">Sujet</p>
                        <p className="text-sm font-medium text-beige">
                          {selected.subject || 'Aucun sujet'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-beige/30 uppercase tracking-wider mb-1">Reçu le</p>
                        <p className="text-xs text-beige/50">{formatFullDate(selected.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-xs text-beige/30 uppercase tracking-wider mb-3">Message</p>
                    <div className="bg-[#0A0A0A] rounded-2xl p-5">
                      <p className="text-sm text-beige/80 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
