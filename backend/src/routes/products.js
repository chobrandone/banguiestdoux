const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const query = {};
    if (!isAdmin || req.query.all !== 'true') query.isActive = true;
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;
    if (req.query.limited === 'true') query.isLimited = true;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sort = req.query.sort === 'price_asc' ? 'price' : req.query.sort === 'price_desc' ? '-price' : '-createdAt';
    const [data, total] = await Promise.all([
      Product.find(query).sort(sort).skip((page-1)*limit).limit(limit),
      Product.countDocuments(query),
    ]);
    res.json({ success:true, data, pagination:{ total, page, limit, pages:Math.ceil(total/limit) } });
  } catch(e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const p = await Product.findOne({ $or:[{slug:req.params.slug},{_id:req.params.slug}], isActive:true });
    if (!p) return res.status(404).json({ success:false, message:'Produit introuvable' });
    res.json({ success:true, data:p });
  } catch(e) { next(e); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const p = await Product.create({ ...req.body, createdBy:req.user.id });
    res.status(201).json({ success:true, data:p });
  } catch(e) { next(e); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!p) return res.status(404).json({ success:false, message:'Produit introuvable' });
    res.json({ success:true, data:p });
  } catch(e) { next(e); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Produit supprimé' });
  } catch(e) { next(e); }
});

module.exports = router;
