const express = require('express');
const router  = express.Router();
const Event    = require('../models/Event');
const Restaurant = require('../models/Restaurant');
const Order    = require('../models/Order');
const User     = require('../models/User');
const Message  = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const [
      totalEvents, totalRestaurants, totalUsers, totalOrders,
      totalRevenue, unreadMessages, pendingOrders,
    ] = await Promise.all([
      Event.countDocuments(),
      Restaurant.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match:{ paymentStatus:'paid' }}, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
      Message.countDocuments({ isRead:false }),
      Order.countDocuments({ status:'pending' }),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents, totalRestaurants, totalUsers, totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        unreadMessages, pendingOrders,
      },
    });
  } catch(e) { next(e); }
});

module.exports = router;
