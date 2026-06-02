const supabase = require('../config/supabase');
const slugify  = require('slugify');

const makeSlug = (title) =>
  slugify(title, { lower: true, strict: true }) + '-' + Date.now();

const calcReadTime = (content = '') =>
  Math.max(1, Math.ceil(content.split(' ').length / 200));

/* ─── GET /api/articles ──────────────────────────── */
exports.getArticles = async (req, res, next) => {
  try {
    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 12;
    const from    = (page - 1) * limit;
    const to      = from + limit - 1;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    let query = supabase.from('articles')
      .select('*, profiles!articles_author_id_fkey(name,avatar)', { count: 'exact' });

    if (!isAdmin || req.query.all !== 'true') query = query.eq('is_published', true);
    if (req.query.category)            query = query.eq('category', req.query.category);
    if (req.query.featured === 'true') query = query.eq('is_featured', true);
    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,excerpt.ilike.%${req.query.search}%`);
    }

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── GET /api/articles/:slug ────────────────────── */
exports.getArticle = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(name,avatar)')
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Article introuvable' });

    /* Increment views */
    await supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id);

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── POST /api/articles ─────────────────────────── */
exports.createArticle = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      slug:      makeSlug(req.body.title),
      author_id: req.user.id,
      read_time: calcReadTime(req.body.content),
    };
    const { data, error } = await supabase.from('articles').insert(body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Article créé' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/articles/:id ──────────────────────── */
exports.updateArticle = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.content) body.read_time = calcReadTime(body.content);
    const { data, error } = await supabase.from('articles').update(body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Article introuvable' });
    res.json({ success: true, data, message: 'Article mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/articles/:id ───────────────────── */
exports.deleteArticle = async (req, res, next) => {
  try {
    const { error } = await supabase.from('articles').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Article introuvable' });
    res.json({ success: true, message: 'Article supprimé' });
  } catch (err) { next(err); }
};
