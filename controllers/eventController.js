const supabase = require('../config/supabase');
const slugify  = require('slugify');

const makeSlug = (title) =>
  slugify(title, { lower: true, strict: true }) + '-' + Date.now();

/* ─── GET /api/events ────────────────────────────── */
exports.getEvents = async (req, res, next) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 12;
    const from     = (page - 1) * limit;
    const to       = from + limit - 1;
    const isAdmin  = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    let query = supabase.from('events').select('*', { count: 'exact' });

    if (!isAdmin || req.query.all !== 'true') {
      query = query.eq('is_published', true);
    }
    if (req.query.category)           query = query.eq('category', req.query.category);
    if (req.query.featured === 'true') query = query.eq('is_featured', true);
    if (req.query.upcoming === 'true') query = query.gte('event_date', new Date().toISOString());
    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,location.ilike.%${req.query.search}%`);
    }

    const { data, error, count } = await query
      .order('event_date', { ascending: true })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({
      success: true,
      data,
      pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

/* ─── GET /api/events/:slug ──────────────────────── */
exports.getEvent = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── POST /api/events ───────────────────────────── */
exports.createEvent = async (req, res, next) => {
  try {
    const body = { ...req.body };
    body.slug       = makeSlug(body.title);
    body.is_free    = !body.ticket_price || Number(body.ticket_price) === 0;
    body.created_by = req.user.id;

    const { data, error } = await supabase.from('events').insert(body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Événement créé' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/events/:id ────────────────────────── */
exports.updateEvent = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.ticket_price !== undefined) {
      body.is_free = Number(body.ticket_price) === 0;
    }

    const { data, error } = await supabase
      .from('events').update(body).eq('id', req.params.id).select().single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, data, message: 'Événement mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/events/:id ─────────────────────── */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, message: 'Événement supprimé' });
  } catch (err) { next(err); }
};

/* ─── POST /api/events/:id/rsvp ──────────────────── */
exports.rsvpEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;

    /* Check existing RSVP */
    const { data: existing } = await supabase
      .from('event_rsvps').select('id').eq('event_id', eventId).eq('user_id', userId).single();

    const { data: event } = await supabase.from('events').select('rsvp_count,capacity').eq('id', eventId).single();
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });

    if (existing) {
      /* Un-RSVP */
      await supabase.from('event_rsvps').delete().eq('id', existing.id);
      await supabase.from('events').update({ rsvp_count: Math.max(0, event.rsvp_count - 1) }).eq('id', eventId);
      return res.json({ success: true, message: 'RSVP annulé', rsvpd: false });
    }

    if (event.capacity && event.rsvp_count >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Événement complet' });
    }

    await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId });
    await supabase.from('events').update({ rsvp_count: event.rsvp_count + 1 }).eq('id', eventId);

    res.json({ success: true, message: 'RSVP confirmé !', rsvpd: true });
  } catch (err) { next(err); }
};
