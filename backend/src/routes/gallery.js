const express = require('express');
const router  = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.type)     query.type = req.query.type;
    if (req.query.featured === 'true') query.isFeatured = true;
    const page  = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const [data, total] = await Promise.all([
      Gallery.find(query).sort('-createdAt').skip((page-1)*limit).limit(limit),
      Gallery.countDocuments(query),
    ]);
    res.json({ success:true, data, pagination:{ total, page, limit, pages:Math.ceil(total/limit) } });
  } catch(e) { next(e); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const item = await Gallery.create({ ...req.body, uploadedBy:req.user.id });
    res.status(201).json({ success:true, data:item });
  } catch(e) { next(e); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new:true });
    res.json({ success:true, data:item });
  } catch(e) { next(e); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Supprimé' });
  } catch(e) { next(e); }
});

module.exports = router;
