const supabase = require('../config/supabase');
const slugify  = require('slugify');

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true }) + '-' + Date.now();

/* ─── GET /api/restaurants ───────────────────────── */
exports.getRestaurants = async (req, res, next) => {
  try {
    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 12;
    const from    = (page - 1) * limit;
    const to      = from + limit - 1;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    let query = supabase.from('restaurants').select('*', { count: 'exact' });

    if (!isAdmin || req.query.all !== 'true') query = query.eq('is_published', true);
    if (req.query.category)            query = query.eq('category', req.query.category);
    if (req.query.featured === 'true') query = query.eq('is_featured', true);
    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,address.ilike.%${req.query.search}%`);
    }

    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── GET /api/restaurants/:slug ─────────────────── */
exports.getRestaurant = async (req, res, next) => {
  try {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .single();

    if (error || !restaurant) return res.status(404).json({ success: false, message: 'Restaurant introuvable' });

    /* Fetch menu items and reviews */
    const [menuRes, reviewRes] = await Promise.all([
      supabase.from('restaurant_menu_items').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('restaurant_reviews').select('*, profiles(name,avatar)').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false }),
    ]);

    res.json({ success: true, data: { ...restaurant, menu: menuRes.data || [], reviews: reviewRes.data || [] } });
  } catch (err) { next(err); }
};

/* ─── POST /api/restaurants ──────────────────────── */
exports.createRestaurant = async (req, res, next) => {
  try {
    const body = { ...req.body, slug: makeSlug(req.body.name), created_by: req.user.id };
    const { data, error } = await supabase.from('restaurants').insert(body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Restaurant créé' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/restaurants/:id ───────────────────── */
exports.updateRestaurant = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('restaurants').update(req.body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Restaurant introuvable' });
    res.json({ success: true, data, message: 'Restaurant mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/restaurants/:id ────────────────── */
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const { error } = await supabase.from('restaurants').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Restaurant introuvable' });
    res.json({ success: true, message: 'Restaurant supprimé' });
  } catch (err) { next(err); }
};

/* ─── POST /api/restaurants/:id/review ───────────── */
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Note entre 1 et 5 requise' });
    }

    const { data: review, error } = await supabase.from('restaurant_reviews')
      .insert({ restaurant_id: req.params.id, user_id: req.user.id, rating, comment })
      .select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    /* Recalculate rating */
    const { data: allReviews } = await supabase
      .from('restaurant_reviews').select('rating').eq('restaurant_id', req.params.id);
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from('restaurants')
      .update({ rating: Math.round(avg * 10) / 10, review_count: allReviews.length })
      .eq('id', req.params.id);

    res.status(201).json({ success: true, data: review, message: 'Avis ajouté' });
  } catch (err) { next(err); }
};
