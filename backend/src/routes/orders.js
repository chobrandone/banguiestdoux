const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/emailService');

/* ─── POST /api/orders — Create order (guests + users) ─ */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { items, shippingAddress, customerName, customerPhone, customerEmail } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Panier vide' });
    }

    /* Guest orders require contact info */
    if (!req.user) {
      if (!customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Nom, téléphone et email sont requis pour la commande',
        });
      }
    }

    /* Calculate totals + validate stock */
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit introuvable' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuffisant pour ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product:  product._id,
        name:     product.name,
        price:    product.price,
        quantity: item.quantity,
        size:     item.size,
        color:    item.color,
        image:    product.images?.[0],
      });
    }

    const shippingCost = subtotal >= 50000 ? 0 : 5000;
    const total        = subtotal + shippingCost;

    const orderData = {
      items:          orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      customerName:   customerName  || req.user?.name,
      customerPhone:  customerPhone || req.user?.phone,
      customerEmail:  customerEmail || req.user?.email,
    };
    if (req.user) orderData.user = req.user.id;

    const order = await Order.create(orderData);

    /* Decrement stock */
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    /* Send confirmation email (non-blocking) */
    const emailAddr = customerEmail || req.user?.email;
    const emailName = customerName  || req.user?.name || 'Client';
    if (emailAddr) {
      sendOrderConfirmation({
        name:        emailName,
        email:       emailAddr,
        orderId:     order._id,
        items:       orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        shippingCost,
        total,
      }).catch(() => {});
    }

    res.status(201).json({ success: true, data: order, message: 'Commande créée avec succès !' });
  } catch (e) { next(e); }
});

/* ─── GET /api/orders/me — My orders ─────────────────── */
router.get('/me', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('items.product', 'name images');
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
});

/* ─── GET /api/orders — All orders (admin) ──────────── */
router.get('/', protect, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .populate('user', 'name email')
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});

/* ─── GET /api/orders/:id — Single order (admin) ─────── */
router.get('/:id', protect, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

/* ─── PUT /api/orders/:id/status — Update status (admin) */
router.put('/:id/status', protect, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const update = {
      status: req.body.status,
      ...(req.body.status === 'delivered' && { deliveredAt: new Date() }),
    };
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

module.exports = router;
