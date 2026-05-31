const express = require('express');
const router  = express.Router();
const Article = require('../models/Article');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const query = {};
    if (!isAdmin || req.query.all !== 'true') query.isPublished = true;
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;
    if (req.query.search) query.$or = [{ title: { $regex: req.query.search, $options: 'i' } }];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const [data, total] = await Promise.all([
      Article.find(query).populate('author','name avatar').sort('-publishedAt').skip((page-1)*limit).limit(limit),
      Article.countDocuments(query),
    ]);
    res.json({ success:true, data, pagination:{ total, page, limit, pages:Math.ceil(total/limit) } });
  } catch(e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const a = await Article.findOneAndUpdate(
      { $or:[{slug:req.params.slug},{_id:req.params.slug}], isPublished:true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author','name avatar');
    if (!a) return res.status(404).json({ success:false, message:'Article introuvable' });
    res.json({ success:true, data:a });
  } catch(e) { next(e); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const a = await Article.create({ ...req.body, author:req.user.id });
    res.status(201).json({ success:true, data:a });
  } catch(e) { next(e); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const a = await Article.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!a) return res.status(404).json({ success:false, message:'Article introuvable' });
    res.json({ success:true, data:a });
  } catch(e) { next(e); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Article supprimé' });
  } catch(e) { next(e); }
});

module.exports = router;
