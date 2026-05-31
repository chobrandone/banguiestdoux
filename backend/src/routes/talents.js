const express = require('express');
const router  = express.Router();
const Talent  = require('../models/Talent');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const query = {};
    if (!isAdmin || req.query.all !== 'true') query.isPublished = true;
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;
    const [data, total] = await Promise.all([
      Talent.find(query).sort('-createdAt').limit(parseInt(req.query.limit)||20),
      Talent.countDocuments(query),
    ]);
    res.json({ success:true, data, pagination:{ total } });
  } catch(e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const t = await Talent.findOne({ $or:[{slug:req.params.slug},{_id:req.params.slug}] });
    if (!t) return res.status(404).json({ success:false, message:'Introuvable' });
    res.json({ success:true, data:t });
  } catch(e) { next(e); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const t = await Talent.create({ ...req.body, createdBy:req.user.id });
    res.status(201).json({ success:true, data:t });
  } catch(e) { next(e); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const t = await Talent.findByIdAndUpdate(req.params.id, req.body, { new:true });
    res.json({ success:true, data:t });
  } catch(e) { next(e); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    await Talent.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Supprimé' });
  } catch(e) { next(e); }
});

module.exports = router;
