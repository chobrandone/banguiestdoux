'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Utensils, Users, ShoppingBag,
  TrendingUp, MessageSquare, Clock, CheckCircle, XCircle, Loader2,
  Eye, BarChart2, ArrowUp, ArrowDown, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardStats, getOrders, getEvents } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────────── */
interface DashboardStats {
  totalEvents: number; totalRestaurants: number; totalUsers: number;
  totalOrders: number; totalRevenue: number; unreadMessages: number; pendingOrders: number;
}
interface Order { _id: string; customerName?: string; total: number; status: string; createdAt: string; }
interface EventStat { _id: string; title: string; rsvpCount?: number; createdAt: string; }
interface TopPage { path: string; views: number; }
interface DailyPoint { date: string; views: number; }
interface VisitStats {
  totalViews: number; prevViews: number; topPages: TopPage[]; daily: DailyPoint[];
}

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400', processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-white/10 text-beige/80', cancelled: 'bg-red-500/20 text-red-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', processing: 'En cours', completed: 'Complété',
  cancelled: 'Annulé', shipped: 'Expédié',
};
function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle size={13} className="text-beige/80" />;
  if (status === 'cancelled') return <XCircle size={13} className="text-red-400" />;
  if (status === 'pending')   return <Clock size={13} className="text-yellow-400" />;
  return <Loader2 size={13} className="text-blue-400" />;
}
function formatRelativeDate(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7)  return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function pctChange(curr: number, prev: number) {
  if (!prev) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}
function labelPath(p: string) {
  if (p === '/') return 'Accueil';
  return p.replace(/\//g, ' / ').replace(/^\//, '').replace(/-/g, ' ');
}

/* ─── Mini bar chart (CSS-only, no recharts dep) ──────────────── */
function SparkBar({ daily }: { daily: DailyPoint[] }) {
  const max = Math.max(...daily.map(d => d.views), 1);
  const last7 = daily.slice(-7);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {last7.map(d => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.date}: ${d.views}`}>
          <div
            className="w-full rounded-t bg-gold/60 hover:bg-gold transition-colors"
            style={{ height: `${Math.max(2, Math.round((d.views / max) * 40))}px` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Page component ──────────────────────────────────────────── */
export default function AnalyticsAdminPage() {
  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [visits,       setVisits]       = useState<VisitStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topEvents,    setTopEvents]    = useState<EventStat[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [visitRange,   setVisitRange]   = useState<7 | 30>(30);

  const fetchVisits = useCallback(async (range: number) => {
    try {
      const res  = await fetch(`/api/analytics?range=${range}`);
      const data = await res.json() as VisitStats;
      setVisits(data);
    } catch { /* silently ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dbStats, orders, events] = await Promise.all([
        getDashboardStats(),
        getOrders({ limit: 5 }),
        getEvents({ limit: 5 }),
      ]);
      if (dbStats) setStats({
        totalEvents:      dbStats.totalEvents,
        totalRestaurants: dbStats.totalRestaurants,
        totalUsers:       dbStats.totalUsers,
        totalOrders:      dbStats.totalOrders,
        totalRevenue:     dbStats.totalRevenue,
        unreadMessages:   dbStats.unreadMessages,
        pendingOrders:    dbStats.pendingOrders,
      });
      setRecentOrders(orders.map(o => ({
        _id: o._id, customerName: o.customerName, total: o.total,
        status: o.status, createdAt: o.createdAt,
      })));
      setTopEvents(events.map(e => ({ _id: e._id, title: e.title, rsvpCount: e.rsvpCount, createdAt: e.createdAt })));
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); fetchVisits(visitRange); }, [fetchData, fetchVisits, visitRange]);

  const statCards = stats ? [
    { label:'Événements',    value:stats.totalEvents,                    icon:CalendarDays,  color:'from-purple-500/20 to-purple-600/10 border-purple-500/20', iconColor:'text-purple-400' },
    { label:'Restaurants',   value:stats.totalRestaurants,               icon:Utensils,      color:'from-orange-500/20 to-orange-600/10 border-orange-500/20', iconColor:'text-orange-400' },
    { label:'Utilisateurs',  value:stats.totalUsers,                     icon:Users,         color:'from-blue-500/20   to-blue-600/10   border-blue-500/20',   iconColor:'text-blue-400'   },
    { label:'Commandes',     value:stats.totalOrders,                    icon:ShoppingBag,   color:'from-white/15  to-white/5  border-white/10',  iconColor:'text-beige/80'  },
    { label:'Revenus',       value:formatPrice(stats.totalRevenue,'XAF'), icon:TrendingUp,    color:'from-gold/20       to-gold/5         border-gold/20',       iconColor:'text-gold',       isLarge:true },
    { label:'Messages n.l.', value:stats.unreadMessages,                 icon:MessageSquare, color:'from-cyan-500/20   to-cyan-600/10   border-cyan-500/20',   iconColor:'text-cyan-400'   },
  ] : [];

  const visitDelta = visits ? pctChange(visits.totalViews, visits.prevViews) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-beige">Tableau de bord</h1>
          <p className="text-sm text-beige/40 mt-0.5">Vue d&apos;ensemble de la plateforme Bangui est Doux</p>
        </div>

        {/* Pending orders alert */}
        {stats?.pendingOrders > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
            <Clock size={18} className="text-yellow-400" />
            <p className="text-sm text-yellow-400 font-semibold">
              {stats.pendingOrders} commande{stats.pendingOrders > 1 ? 's' : ''} en attente
            </p>
          </div>
        )}

        {/* ── Website visit stats ───────────────────────────────── */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gold" />
              <h2 className="text-sm font-semibold text-beige">Visites du site</h2>
            </div>
            <div className="flex gap-1">
              {([7, 30] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setVisitRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${visitRange === r ? 'bg-gold text-night' : 'bg-white/5 text-beige/40 hover:text-beige'}`}
                >
                  {r}j
                </button>
              ))}
            </div>
          </div>

          {!visits ? (
            <div className="flex items-center gap-2 text-beige/30 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Chargement…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total views card */}
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-beige/50 text-xs">
                    <Eye size={12} /> Vues totales
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${visitDelta >= 0 ? 'text-beige/80' : 'text-red-400'}`}>
                    {visitDelta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(visitDelta)}%
                  </div>
                </div>
                <p className="text-3xl font-bold text-beige">{visits.totalViews.toLocaleString('fr-FR')}</p>
                <p className="text-[10px] text-beige/30 mt-0.5">vs période précédente</p>
              </div>

              {/* 7-day sparkline */}
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-beige/50 text-xs mb-3">
                  <BarChart2 size={12} /> 7 derniers jours
                </div>
                <SparkBar daily={visits.daily} />
                <p className="text-[10px] text-beige/30 mt-2">
                  {visits.daily.slice(-7).reduce((s, d) => s + d.views, 0)} vues cette semaine
                </p>
              </div>

              {/* Top pages */}
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <p className="text-xs text-beige/50 mb-2 flex items-center gap-1.5"><TrendingUp size={12} /> Pages les plus visitées</p>
                <div className="space-y-1.5">
                  {visits.topPages.slice(0, 5).map((p, i) => {
                    const maxV = visits.topPages[0]?.views || 1;
                    return (
                      <div key={p.path} className="flex items-center gap-2">
                        <span className="text-[10px] text-beige/30 w-3">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] text-beige/70 truncate capitalize">{labelPath(p.path)}</span>
                            <span className="text-[11px] font-semibold text-beige ml-2 flex-shrink-0">{p.views}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold/50 rounded-full" style={{ width: `${(p.views / maxV) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {visits.topPages.length === 0 && <p className="text-[11px] text-beige/30">Aucune donnée</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Platform stats cards ──────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-8 w-16 bg-white/5 rounded-lg mb-2" />
                <div className="h-4 w-24 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-gradient-to-br ${card.color} border rounded-2xl p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.iconColor}`}>
                    <card.icon size={20} />
                  </div>
                </div>
                <p className={`font-bold text-beige ${card.isLarge ? 'text-xl' : 'text-3xl'}`}>{card.value}</p>
                <p className="text-xs text-beige/40 mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Bottom section ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-beige">Commandes récentes</h2>
            </div>
            {recentOrders.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-beige/30 text-sm">Aucune commande</div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map(order => (
                  <div key={order._id} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={order.status} />
                      <div>
                        <p className="text-sm font-medium text-beige">{order.customerName || 'Client'}</p>
                        <p className="text-xs text-beige/30 mt-0.5">{formatRelativeDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-white/10 text-beige/50'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-sm font-semibold text-beige">{formatPrice(order.total, 'XAF')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent events */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-beige">Derniers événements</h2>
            </div>
            {topEvents.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-beige/30 text-sm">Aucun événement</div>
            ) : (
              <div className="divide-y divide-white/5">
                {topEvents.map((event, i) => (
                  <motion.div key={event._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <CalendarDays size={14} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-beige truncate max-w-[200px]">{event.title}</p>
                        <p className="text-xs text-beige/30 mt-0.5">{formatRelativeDate(event.createdAt)}</p>
                      </div>
                    </div>
                    {!!event.rsvpCount && event.rsvpCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-beige/50">
                        <Users size={12} /> <span>{event.rsvpCount}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
