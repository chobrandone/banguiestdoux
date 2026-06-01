const express = require('express');
const router  = express.Router();
const {
  getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant, addReview,
} = require('../controllers/restaurantController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getRestaurants)
  .post(protect, authorize('admin','superadmin'), createRestaurant);

router.route('/:slug')
  .get(getRestaurant)
  .put(protect, authorize('admin','superadmin'), updateRestaurant)
  .delete(protect, authorize('admin','superadmin'), deleteRestaurant);

router.post('/:id/review', protect, addReview);

module.exports = router;
