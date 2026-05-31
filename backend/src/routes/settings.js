const express = require('express');
const router  = express.Router();
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const settings = await Setting.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ success: true, data: obj });
  } catch(e) { next(e); }
});

router.put('/', protect, authorize('admin','superadmin'), async (req, res, next) => {
  try {
    const updates = Object.entries(req.body);
    await Promise.all(updates.map(([key, value]) => Setting.set(key, value)));
    res.json({ success: true, message: 'Paramètres mis à jour' });
  } catch(e) { next(e); }
});

module.exports = router;
