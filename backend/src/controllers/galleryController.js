const supabase = require('../config/supabase');

/* ─── GET /api/gallery ───────────────────────────── */
exports.getGallery = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase.from('gallery').select('*', { count: 'exact' });

    if (req.query.type)            query = query.eq('type', req.query.type);
    if (req.query.category)        query = query.eq('category', req.query.category);
    if (req.query.featured === 'true') query = query.eq('is_featured', true);
    if (req.query.event_id)        query = query.eq('event_id', req.query.event_id);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── POST /api/gallery ──────────────────────────── */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const body = { ...req.body, uploaded_by: req.user.id };
    const { data, error } = await supabase.from('gallery').insert(body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Média ajouté' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/gallery/:id ───────────────────────── */
exports.updateGalleryItem = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('gallery').update(req.body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Média introuvable' });
    res.json({ success: true, data, message: 'Média mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/gallery/:id ────────────────────── */
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const { error } = await supabase.from('gallery').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Média introuvable' });
    res.json({ success: true, message: 'Média supprimé' });
  } catch (err) { next(err); }
};
