const supabase = require('../config/supabase');

/* ─── GET /api/settings ──────────────────────────── */
exports.getSettings = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) return res.status(400).json({ success: false, message: error.message });

    /* Convert rows to a flat key-value object */
    const settings = {};
    for (const row of data) {
      settings[row.key] = row.value;
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

/* ─── PUT /api/settings ──────────────────────────── */
exports.updateSettings = async (req, res, next) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    res.json({ success: true, message: 'Paramètres mis à jour' });
  } catch (err) { next(err); }
};
