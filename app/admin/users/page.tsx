'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ShieldCheck, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface UserRecord {
  _id: string;
  name: string;
  email?: string;
  role: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

type FilterRole = 'all' | 'admin' | 'user';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatLastLogin(dateStr?: string) {
  if (!dateStr) return 'Jamais';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);

  if (mins < 60) return `Il y a ${mins || 1} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return formatDate(dateStr);
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'superadmin') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-gold/20 text-gold">
      <ShieldCheck size={11} />
      Super Admin
    </span>
  );
  if (role === 'admin') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
      <Shield size={11} />
      Admin
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-white/10 text-beige/50">
      <User size={11} />
      Utilisateur
    </span>
  );
}

const ROLE_FILTER_LABELS: [FilterRole, string][] = [
  ['all', 'Tous'],
  ['admin', 'Admins'],
  ['user', 'Utilisateurs'],
];

export default function UsersAdminPage() {
  const [items, setItems] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems((data || []).map((row: any): UserRecord => ({
        _id:       String(row.id),
        name:      String(row.name || 'Anonyme'),
        email:     row.email || undefined,
        role:      String(row.role || 'user'),
        phone:     row.phone || undefined,
        isActive:  Boolean(row.is_active),
        lastLogin: row.last_login || undefined,
        createdAt: String(row.created_at || ''),
      })));
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && (u.role === 'admin' || u.role === 'superadmin')) ||
      (roleFilter === 'user' && u.role === 'user');
    return matchSearch && matchRole;
  });

  const stats = {
    total: items.length,
    admins: items.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    active: items.filter(u => u.isActive).length,
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500/30 text-blue-400',
      'bg-purple-500/30 text-purple-400',
      'bg-pink-500/30 text-pink-400',
      'bg-white/15 text-beige',
      'bg-orange-500/30 text-orange-400',
      'bg-cyan-500/30 text-cyan-400',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-beige">Utilisateurs</h1>
            <p className="text-sm text-beige/40 mt-0.5">Liste des utilisateurs inscrits</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total utilisateurs', value: stats.total, icon: Users },
            { label: 'Administrateurs', value: stats.admins, icon: Shield },
            { label: 'Comptes actifs', value: stats.active, icon: User },
          ].map(s => (
            <div key={s.label} className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <s.icon size={18} className="text-beige/40" />
              </div>
              <div>
                <p className="text-2xl font-bold text-beige">{s.value}</p>
                <p className="text-xs text-beige/40 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-beige/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {ROLE_FILTER_LABELS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setRoleFilter(val)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  roleFilter === val
                    ? 'bg-gold text-night'
                    : 'bg-[#141414] border border-white/10 text-beige/50 hover:text-beige'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-beige/40 text-sm">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-beige/40">
              <Users size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Rôle</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Téléphone</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Actif</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Dernière connexion</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider">Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filtered.map(user => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(user.name)}`}>
                              {user.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-beige">{user.name}</p>
                              {user.email && <p className="text-xs text-beige/40 mt-0.5">{user.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-3 text-sm text-beige/50">
                          {user.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-white' : 'bg-red-400'}`} />
                            <span className={`text-xs font-medium ${user.isActive ? 'text-beige' : 'text-red-400'}`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-beige/50">
                          {formatLastLogin(user.lastLogin)}
                        </td>
                        <td className="px-4 py-3 text-sm text-beige/50">
                          {formatDate(user.createdAt)}
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
    </div>
  );
}
