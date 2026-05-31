const Event = require('../models/Event');

/* ─── Build query helper ─────────────────────────── */
const buildQuery = (reqQuery) => {
  const query = {};
  if (reqQuery.category)  query.category  = reqQuery.category;
  if (reqQuery.featured === 'true') query.isFeatured = true;
  if (reqQuery.published !== 'false') query.isPublished = true;

  /* Upcoming filter */
  if (reqQuery.upcoming === 'true') query.date = { $gte: new Date() };

  /* Search */
  if (reqQuery.search) {
    query.$or = [
      { title:    { $regex: reqQuery.search, $options: 'i' } },
      { location: { $regex: reqQuery.search, $options: 'i' } },
    ];
  }
  return query;
};

/* ─── GET /api/events ────────────────────────────── */
exports.getEvents = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;
    /* Admin users get all events (inc. drafts) when all=true */
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const query = buildQuery({ ...req.query, ...(isAdmin && req.query.all === 'true' ? { published: 'false' } : {}) });

    const [events, total] = await Promise.all([
      Event.find(query).sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

/* ─── GET /api/events/:slug ──────────────────────── */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ $or: [{ slug: req.params.slug }, { _id: req.params.slug }] });
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

/* ─── POST /api/events ───────────────────────────── */
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: event, message: 'Événement créé' });
  } catch (err) { next(err); }
};

/* ─── PUT /api/events/:slug ──────────────────────── */
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.slug, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, data: event, message: 'Événement mis à jour' });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/events/:slug ───────────────────── */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.slug);
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, message: 'Événement supprimé' });
  } catch (err) { next(err); }
};

/* ─── POST /api/events/:id/rsvp ──────────────────── */
exports.rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });

    const alreadyRsvp = event.rsvpUsers.includes(req.user.id);
    if (alreadyRsvp) {
      event.rsvpUsers = event.rsvpUsers.filter(u => u.toString() !== req.user.id);
      event.rsvpCount = Math.max(0, event.rsvpCount - 1);
      await event.save();
      return res.json({ success: true, message: 'RSVP annulé', rsvpd: false });
    }

    if (event.capacity && event.rsvpCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Événement complet' });
    }

    event.rsvpUsers.push(req.user.id);
    event.rsvpCount += 1;
    await event.save();
    res.json({ success: true, message: 'RSVP confirmé !', rsvpd: true });
  } catch (err) { next(err); }
};
