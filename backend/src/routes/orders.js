const express = require('express');
const router  = express.Router();
const {
  createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.post('/',    optionalAuth, createOrder);
router.get('/me',   protect, getMyOrders);
router.get('/',     protect, authorize('admin','superadmin'), getOrders);
router.get('/:id',  protect, authorize('admin','superadmin'), getOrder);
router.put('/:id/status', protect, authorize('admin','superadmin'), updateOrderStatus);

module.exports = router;
