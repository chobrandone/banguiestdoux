const supabase = require('../config/supabase');

/* ─── GET /api/partners ──────────────────────────── */
exports.getPartners = async (req, res, next) => {
  try {
    let query = supabase.from('partners').select('*');
    if (req.query.category) query = query.eq('category', req.query.category);
    const { data, error } = await query.eq('is_active', true).order('sort_order');
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── POST /api/partners ─────────────────────────── */
exports.createPartner = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('partners').insert(req.body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Partenaire ajouté' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/partners/:id ──────────────────────── */
exports.updatePartner = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('partners').update(req.body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Partenaire introuvable' });
    res.json({ success: true, data, message: 'Partenaire mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/partners/:id ───────────────────── */
exports.deletePartner = async (req, res, next) => {
  try {
    const { error } = await supabase.from('partners').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Partenaire introuvable' });
    res.json({ success: true, message: 'Partenaire supprimé' });
  } catch (err) { next(err); }
};
