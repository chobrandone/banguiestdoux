const express = require('express');
const router  = express.Router();
const { getDashboard } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin','superadmin'), getDashboard);

module.exports = router;
