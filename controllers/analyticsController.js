const supabase = require('../config/supabase');

/* ─── GET /api/analytics/dashboard ──────────────── */
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      eventsRes,
      restaurantsRes,
      articlesRes,
      productsRes,
      ordersRes,
      messagesRes,
      revenueRes,
      usersRes,
      galleryRes,
      talentsRes,
    ] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('restaurants').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id,total,status', { count: 'exact' }),
      supabase.from('messages').select('id,is_read', { count: 'exact' }),
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('gallery').select('id', { count: 'exact', head: true }),
      supabase.from('talents').select('id', { count: 'exact', head: true }),
    ]);

    const totalRevenue      = (revenueRes.data || []).reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders     = (ordersRes.data || []).filter(o => o.status === 'pending').length;
    const unreadMessages    = (messagesRes.data || []).filter(m => !m.is_read).length;

    /* Orders by status */
    const ordersByStatus = {};
    for (const o of (ordersRes.data || [])) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    }

    /* Monthly revenue (last 6 months) */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyData } = await supabase
      .from('orders')
      .select('total,created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', sixMonthsAgo.toISOString());

    const monthlyRevenue = {};
    for (const order of (monthlyData || [])) {
      const month = order.created_at.slice(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.total;
    }

    res.json({
      success: true,
      data: {
        counts: {
          events:      eventsRes.count      || 0,
          restaurants: restaurantsRes.count || 0,
          articles:    articlesRes.count    || 0,
          products:    productsRes.count    || 0,
          orders:      ordersRes.count      || 0,
          messages:    messagesRes.count    || 0,
          users:       usersRes.count       || 0,
          gallery:     galleryRes.count     || 0,
          talents:     talentsRes.count     || 0,
        },
        revenue: {
          total:   totalRevenue,
          monthly: monthlyRevenue,
        },
        orders: {
          pending: pendingOrders,
          byStatus: ordersByStatus,
        },
        messages: {
          unread: unreadMessages,
        },
      },
    });
  } catch (err) { next(err); }
};
