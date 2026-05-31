const express = require('express');
const router  = express.Router();
const Restaurant = require('../models/Restaurant');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const query = {};
    if (!isAdmin || req.query.all !== 'true') query.isPublished = true;
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;
    if (req.query.search) query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
    const page  = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const [data, total] = await Promise.all([
      Restaurant.find(query).sort('-rating').skip((page-1)*limit).limit(limit),
      Restaurant.countDocuments(query),
    ]);
    res.json({ success:true, data, pagination:{ total, page, limit, pages:Math.ceil(total/limit) } });
  } catch(e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ $or:[{slug:req.params.slug},{_id:req.params.slug}] });
    if (!r) return res.status(404).json({ success:false, message:'Restaurant introuvable' });
    res.json({ success:true, data:r });
  } catch(e) { next(e); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const r = await Restaurant.create({ ...req.body, createdBy:req.user.id });
    res.status(201).json({ success:true, data:r });
  } catch(e) { next(e); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!r) return res.status(404).json({ success:false, message:'Restaurant introuvable' });
    res.json({ success:true, data:r });
  } catch(e) { next(e); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const r = await Restaurant.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success:false, message:'Restaurant introuvable' });
    res.json({ success:true, message:'Restaurant supprimé' });
  } catch(e) { next(e); }
});

/* Add review */
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ success:false, message:'Restaurant introuvable' });
    const already = r.reviews.find(rv => rv.user?.toString() === req.user.id);
    if (already) return res.status(400).json({ success:false, message:'Vous avez déjà laissé un avis' });
    r.reviews.push({ user:req.user.id, rating:req.body.rating, comment:req.body.comment });
    await r.save();
    res.status(201).json({ success:true, data:r });
  } catch(e) { next(e); }
});

module.exports = router;
