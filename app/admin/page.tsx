'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Utensils, ShoppingBag, MessageSquare,
  TrendingUp, Eye, ArrowUpRight, ArrowDownRight,
  BarChart3, Clock, CheckCircle2, AlertCircle, Package,
  Phone, Mail,
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getOrders, getDashboardStats } from '@/lib/db';
import type { DashboardStats } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { useAuth }     from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const trafficData = [
  { month: 'Jan', visitors: 2400, pageviews: 8400 },
  { month: 'Fév', visitors: 1398, pageviews: 5200 },
  { month: 'Mar', visitors: 5800, pageviews: 18000 },
  { month: 'Avr', visitors: 3908, pageviews: 12000 },
  { month: 'Mai', visitors: 4800, pageviews: 15200 },
  { month: 'Jun', visitors: 6800, pageviews: 22000 },
  { month: 'Jul', visitors: 7200, pageviews: 24000 },
  { month: 'Aoû', visitors: 8900, pageviews: 29000 },
];

const eventData = [
  { name: 'Concerts', count: 8 },
  { name: 'Festivals', count: 3 },
  { name: 'Cinéma', count: 12 },
  { name: 'Pool Party', count: 5 },
  { name: 'Jazz', count: 4 },
  { name: 'Sports', count: 6 },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  confirmed:  'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  processing: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  shipped:    'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  delivered:  'bg-white/10 text-gray-700 dark:text-beige',
  cancelled:  'bg-red-500/15 text-red-600 dark:text-red-400',
};

const STATUS_LABELS_FR: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmé',
  processing: 'En cours',
  shipped:    'Expédié',
  delivered:  'Livré',
  cancelled:  'Annulé',
};

const STATUS_LABELS_EN: Record<string, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

interface Order {
  _id: string;
  customerName:  string;
  customerPhone: string;
  customerEmail: string;
  items: { name: string; quantity: number }[];
  total:    number;
  status:   string;
  createdAt: string;
  user?: { name: string; email: string };
}

const quickActions = [
  { labelFr: 'Ajouter un événement', labelEn: 'Add an event',   href: '/admin/events/new',   icon: Calendar,    color: 'from-purple-600 to-purple-400' },
  { labelFr: 'Voir les commandes',   labelEn: 'View orders',    href: '/admin/orders',        icon: ShoppingBag, color: 'from-gold-600 to-gold-400' },
  { labelFr: 'Ajouter un article',   labelEn: 'Add an article', href: '/admin/articles/new', icon: BarChart3,   color: 'from-blue-600 to-blue-400' },
  { labelFr: 'Voir les messages',    labelEn: 'View messages',  href: '/admin/messages',     icon: MessageSquare, color: 'from-red-600 to-red-400' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [dbStats,    setDbStats]    = useState<DashboardStats | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getOrders({ limit: 10 }),
      getDashboardStats(),
    ]).then(([ordersData, statsData]) => {
      setOrders(ordersData);
      setDbStats(statsData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STATUS_LABELS = lang === 'fr' ? STATUS_LABELS_FR : STATUS_LABELS_EN;

  const orderStats = {
    total:     dbStats?.totalOrders ?? orders.length,
    pending:   dbStats?.pendingOrders ?? orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   dbStats?.totalRevenue ?? orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  const stats = [
    { labelKey: 'admin.dash.visitors',    value: '8,940',                                change: +23.5, icon: Eye,         color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    { labelKey: 'admin.dash.events',      value: String(dbStats?.totalEvents ?? '—'),     change: +12,   icon: Calendar,    color: 'text-gold',       bg: 'bg-gold/10'       },
    { labelKey: 'admin.dash.orders',      value: String(orderStats.total),                change: +34.2, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { labelKey: 'admin.dash.pending',     value: String(orderStats.pending),              change: 0,     icon: Package,     color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { labelKey: 'admin.dash.restaurants', value: String(dbStats?.totalRestaurants ?? '—'),change: +8,    icon: Utensils,    color: 'text-gold',  bg: 'bg-white/5'  },
    { labelKey: 'admin.dash.revenue',     value: formatPrice(orderStats.revenue, 'XAF'),  change: +15.7, icon: TrendingUp,  color: 'text-cyan-500',   bg: 'bg-cyan-500/10'   },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-8 text-gray-900 dark:text-beige">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-3xl font-bold mb-1">
          {t('admin.dash.greeting')}, {firstName} 👋
        </h2>
        <p className="text-gray-400 dark:text-beige/40 text-sm">
          {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ labelKey, value, change, icon: Icon, color, bg }, i) => (
          <motion.div
            key={labelKey}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none"
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-beige mb-0.5">{value}</div>
            <div className="text-xs text-gray-400 dark:text-beige/40 mb-2">{t(labelKey)}</div>
            {change !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-gold' : 'text-red-500'}`}>
                {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(change)}%
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 dark:text-beige/40 uppercase tracking-wider mb-4">
          {t('admin.dash.quickActions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ labelFr, labelEn, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className={`group flex items-center gap-3 p-4 bg-gradient-to-r ${color} bg-opacity-20 rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{lang === 'fr' ? labelFr : labelEn}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-beige">{t('admin.dash.traffic')}</h3>
              <p className="text-xs text-gray-400 dark:text-beige/40">
                {lang === 'fr' ? 'Visiteurs et pages vues' : 'Visitors and pageviews'}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" className="dark:[stroke:rgba(255,255,255,0.04)]" />
              <XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} className="text-gray-400 dark:text-beige/30" />
              <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} axisLine={false} tickLine={false} className="text-gray-400 dark:text-beige/30" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#111' }} />
              <Area type="monotone" dataKey="visitors"  stroke="#16a34a" fill="url(#colorVisitors)"  strokeWidth={2} name={lang === 'fr' ? 'Visiteurs' : 'Visitors'} />
              <Area type="monotone" dataKey="pageviews" stroke="#6366f1" fill="url(#colorPageviews)" strokeWidth={2} name={lang === 'fr' ? 'Pages vues' : 'Pageviews'} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <h3 className="font-semibold text-gray-900 dark:text-beige mb-1">
            {lang === 'fr' ? 'Événements' : 'Events'}
          </h3>
          <p className="text-xs text-gray-400 dark:text-beige/40 mb-6">
            {lang === 'fr' ? 'Par catégorie' : 'By category'}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventData} layout="vertical">
              <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 10 }} axisLine={false} tickLine={false} className="text-gray-400 dark:text-beige/30" />
              <YAxis dataKey="name" type="category" tick={{ fill: 'currentColor', fontSize: 10 }} axisLine={false} tickLine={false} width={60} className="text-gray-500 dark:text-beige/50" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#111' }} />
              <Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} name={lang === 'fr' ? 'Événements' : 'Events'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-beige flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" /> {t('admin.dash.recentOrders')}
          </h3>
          <Link href="/admin/orders" className="text-xs text-gold hover:text-gold/80 transition-colors">
            {t('admin.dash.seeAll')} →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-beige/10 mx-auto mb-2" />
            <p className="text-gray-400 dark:text-beige/30 text-sm">{t('admin.dash.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 8).map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-[#0A0A0A] rounded-xl hover:bg-gray-100 dark:hover:bg-white/2 transition-colors"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 dark:bg-beige/10 text-gray-600 dark:text-beige'}`}>
                  {order.status === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-beige truncate">
                      {order.customerName || order.user?.name || (lang === 'fr' ? 'Client' : 'Customer')}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {(order.customerPhone || order.customerEmail) && (
                      <span className="text-xs text-gray-400 dark:text-beige/40 flex items-center gap-1">
                        {order.customerPhone ? (
                          <><Phone className="w-3 h-3" />{order.customerPhone}</>
                        ) : (
                          <><Mail className="w-3 h-3" />{order.customerEmail}</>
                        )}
                      </span>
                    )}
                    <span className="text-xs text-gray-300 dark:text-beige/30">
                      {order.items.length} {lang === 'fr' ? `article${order.items.length > 1 ? 's' : ''}` : `item${order.items.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gold text-sm">{formatPrice(order.total, 'XAF')}</p>
                  <p className="text-[10px] text-gray-400 dark:text-beige/30">
                    {new Date(order.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
