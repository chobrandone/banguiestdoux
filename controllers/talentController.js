const supabase = require('../config/supabase');
const slugify  = require('slugify');

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true }) + '-' + Date.now();

/* ─── GET /api/talents ───────────────────────────── */
exports.getTalents = async (req, res, next) => {
  try {
    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 12;
    const from    = (page - 1) * limit;
    const to      = from + limit - 1;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    let query = supabase.from('talents').select('*', { count: 'exact' });

    if (!isAdmin || req.query.all !== 'true') query = query.eq('is_published', true);
    if (req.query.category)            query = query.eq('category', req.query.category);
    if (req.query.featured === 'true') query = query.eq('is_featured', true);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── GET /api/talents/:slug ─────────────────────── */
exports.getTalent = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Talent introuvable' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── POST /api/talents ──────────────────────────── */
exports.createTalent = async (req, res, next) => {
  try {
    const body = { ...req.body, slug: makeSlug(req.body.name), created_by: req.user.id };
    const { data, error } = await supabase.from('talents').insert(body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Talent créé' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/talents/:id ───────────────────────── */
exports.updateTalent = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('talents').update(req.body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Talent introuvable' });
    res.json({ success: true, data, message: 'Talent mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/talents/:id ────────────────────── */
exports.deleteTalent = async (req, res, next) => {
  try {
    const { error } = await supabase.from('talents').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Talent introuvable' });
    res.json({ success: true, message: 'Talent supprimé' });
  } catch (err) { next(err); }
};
