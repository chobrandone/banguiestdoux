const supabase = require('../config/supabase');

/* ─── POST /api/orders ───────────────────────────── */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items, shippingAddress, subtotal, shippingCost, total,
      customerName, customerPhone, customerEmail, guestEmail,
      paymentMethod, promoCode, discount, notes,
    } = req.body;

    if (!items?.length) return res.status(400).json({ success: false, message: 'Panier vide' });

    /* Validate stock for each product */
    for (const item of items) {
      const { data: product } = await supabase
        .from('products').select('stock,name').eq('id', item.product_id).single();
      if (!product) return res.status(400).json({ success: false, message: `Produit ${item.name} introuvable` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuffisant pour ${product.name}` });
      }
    }

    /* Create order */
    const { data: order, error } = await supabase.from('orders').insert({
      user_id:          req.user?.id || null,
      customer_name:    customerName,
      customer_phone:   customerPhone,
      customer_email:   customerEmail,
      guest_email:      guestEmail,
      shipping_address: shippingAddress,
      subtotal,
      shipping_cost:    shippingCost || 0,
      total,
      payment_method:   paymentMethod || 'stripe',
      promo_code:       promoCode,
      discount,
      notes,
    }).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    /* Insert order items */
    const orderItems = items.map(item => ({
      order_id:   order.id,
      product_id: item.product_id,
      name:       item.name,
      price:      item.price,
      quantity:   item.quantity,
      size:       item.size,
      color:      item.color,
      image:      item.image,
    }));

    await supabase.from('order_items').insert(orderItems);

    /* Decrease stock */
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
      await supabase.from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.product_id);
    }

    res.status(201).json({ success: true, data: order, message: 'Commande créée' });
  } catch (err) { next(err); }
};

/* ─── GET /api/orders (admin) ────────────────────── */
exports.getOrders = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase.from('orders').select('*, order_items(*)', { count: 'exact' });

    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── GET /api/orders/me ─────────────────────────── */
exports.getMyOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── GET /api/orders/:id ────────────────────────── */
exports.getOrder = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders').select('*, order_items(*)').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── PUT /api/orders/:id/status (admin) ─────────── */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, trackingNumber } = req.body;
    const updates = {};
    if (status)          updates.status           = status;
    if (paymentStatus)   updates.payment_status   = paymentStatus;
    if (trackingNumber)  updates.tracking_number  = trackingNumber;
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data, message: 'Commande mise à jour' });
  } catch (err) { next(err); }
};
