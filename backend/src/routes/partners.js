const express = require('express');
const router  = express.Router();
const mongoose= require('mongoose');
const { protect, authorize } = require('../middleware/auth');

const partnerSchema = new mongoose.Schema({ name: String, logo: String, website: String, category: String, isFeatured: { type: Boolean, default: false } }, { timestamps: true });
const Partner = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);

router.get('/',    async (req, res, next) => { try { const data = await Partner.find(); res.json({ success:true, data }); } catch(e) { next(e); } });
router.post('/',   protect, authorize('admin','superadmin'), async (req, res, next) => { try { const p = await Partner.create(req.body); res.status(201).json({ success:true, data:p }); } catch(e) { next(e); } });
router.put('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => { try { const p = await Partner.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json({ success:true, data:p }); } catch(e) { next(e); } });
router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res, next) => { try { await Partner.findByIdAndDelete(req.params.id); res.json({ success:true }); } catch(e) { next(e); } });

module.exports = router;
