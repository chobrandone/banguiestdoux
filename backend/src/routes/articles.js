const express = require('express');
const router  = express.Router();
const {
  getArticles, getArticle, createArticle, updateArticle, deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getArticles)
  .post(protect, authorize('admin','superadmin'), createArticle);

router.route('/:slug')
  .get(getArticle)
  .put(protect, authorize('admin','superadmin'), updateArticle)
  .delete(protect, authorize('admin','superadmin'), deleteArticle);

module.exports = router;
