'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, RefreshCw, User, Phone, Mail,
  Clock, CheckCircle2, XCircle, Truck, Package, Eye,
} from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  _id: string;
  customerName:  string;
  customerPhone: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number; size?: string; color?: string }[];
  subtotal:    number;
  shippingCost:number;
  total:       number;
  status:      OrderStatus;
  paymentStatus: string;
  createdAt:   string;
  user?: { name: string; email: string };
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'En attente',  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',  icon: Clock         },
  confirmed:  { label: 'Confirmé',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',        icon: CheckCircle2  },
  processing: { label: 'En cours',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/20',  icon: Package       },
  shipped:    { label: 'Expédié',    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',   icon: Truck         },
  delivered:  { label: 'Livré',      color: 'bg-green-500/15 text-green-400 border-green-500/20',     icon: CheckCircle2  },
  cancelled:  { label: 'Annulé',     color: 'bg-red-500/15 text-red-400 border-red-500/20',            icon: XCircle       },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function AdminOrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (filter !== 'all') params.status = filter;
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.data);
    } catch {
      toast.error('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      if (selected?._id === orderId) setSelected(prev => prev ? { ...prev, status } : null);
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const visible = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.customerName  || '').toLowerCase().includes(q) ||
      (o.customerEmail || '').toLowerCase().includes(q) ||
      (o.customerPhone || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  return (
    <div className="space-y-6 text-beige">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Commandes</h2>
          <p className="text-beige/40 text-sm">{orders.length} commandes au total</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-beige/70 hover:text-beige hover:bg-white/10 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,                        color: 'text-beige'       },
          { label: 'En attente', value: stats.pending,                      color: 'text-yellow-400'  },
          { label: 'Livrées',    value: stats.delivered,                    color: 'text-green-400'   },
          { label: 'Revenus',    value: formatPrice(stats.revenue, 'XAF'),  color: 'text-gold'        },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#141414] border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-beige/40 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/30 outline-none focus:border-gold/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', ...STATUS_FLOW, 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filter === s
                  ? 'bg-gold/20 text-gold border-gold/30'
                  : 'bg-white/5 text-beige/50 border-white/10 hover:text-beige hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'Tous' : STATUS_CONFIG[s as OrderStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-beige/10 mx-auto mb-2" />
            <p className="text-beige/30 text-sm">Aucune commande</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['#ID', 'Client', 'Articles', 'Total', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-beige/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((order, i) => {
                  const sc = STATUS_CONFIG[order.status];
                  const StatusIcon = sc.icon;
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gold">#{order._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-beige text-xs">{order.customerName || order.user?.name || '—'}</p>
                          <p className="text-beige/40 text-[10px]">{order.customerEmail || order.user?.email || '—'}</p>
                          <p className="text-beige/40 text-[10px]">{order.customerPhone || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-beige/70">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-beige">{formatPrice(order.total, 'XAF')}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-beige/40 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelected(order)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-beige/30 hover:text-gold hover:bg-gold/10 transition-all"
                            title="Voir les détails"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value={order.status}
                              disabled={updating === order._id}
                              onChange={e => updateStatus(order._id, e.target.value as OrderStatus)}
                              className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-1.5 py-1 text-beige/60 outline-none cursor-pointer disabled:opacity-50"
                            >
                              {STATUS_FLOW.map(s => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                              ))}
                              <option value="cancelled">Annuler</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-[#141414] border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-beige">
                Commande <span className="text-gold">#{selected._id.slice(-8).toUpperCase()}</span>
              </h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-beige/40 hover:text-beige transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="bg-[#0A0A0A] rounded-2xl p-4 mb-4 space-y-2">
              <p className="text-xs font-semibold text-beige/40 uppercase tracking-wider mb-3">Informations client</p>
              <div className="flex items-center gap-2 text-sm">
                <User  className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-beige">{selected.customerName || selected.user?.name || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-beige">{selected.customerPhone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail  className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-beige">{selected.customerEmail || selected.user?.email || '—'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="bg-[#0A0A0A] rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-beige/40 uppercase tracking-wider mb-3">Articles commandés</p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-beige/80">{item.name} × {item.quantity}{item.size ? ` (${item.size})` : ''}</span>
                    <span className="font-semibold text-beige">{formatPrice(item.price * item.quantity, 'XAF')}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-2 space-y-1 text-xs text-beige/50">
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{selected.shippingCost > 0 ? formatPrice(selected.shippingCost, 'XAF') : 'Gratuite'}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gold">
                    <span>Total</span>
                    <span>{formatPrice(selected.total, 'XAF')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status update */}
            {selected.status !== 'delivered' && selected.status !== 'cancelled' && (
              <div>
                <p className="text-xs font-semibold text-beige/40 uppercase tracking-wider mb-3">Mettre à jour le statut</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FLOW.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected._id, s)}
                      disabled={selected.status === s || updating === selected._id}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        selected.status === s
                          ? STATUS_CONFIG[s].color
                          : 'bg-white/5 text-beige/50 border-white/10 hover:bg-white/10 hover:text-beige'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                  <button
                    onClick={() => updateStatus(selected._id, 'cancelled')}
                    disabled={updating === selected._id}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-40"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
