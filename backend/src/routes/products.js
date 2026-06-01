const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getProducts)
  .post(protect, authorize('admin','superadmin'), createProduct);

router.route('/:slug')
  .get(getProduct)
  .put(protect, authorize('admin','superadmin'), updateProduct)
  .delete(protect, authorize('admin','superadmin'), deleteProduct);

module.exports = router;
