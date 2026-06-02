const supabase = require('../config/supabase');

/* ─── POST /api/messages ─────────────────────────── */
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    const { data, error } = await supabase
      .from('messages').insert({ name, email, phone, subject, message }).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, data, message: 'Message envoyé avec succès !' });
  } catch (err) { next(err); }
};

/* ─── GET /api/messages (admin) ──────────────────── */
exports.getMessages = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase.from('messages').select('*', { count: 'exact' });
    if (req.query.unread === 'true') query = query.eq('is_read', false);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, pagination: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

/* ─── PUT /api/messages/:id/read ─────────────────── */
exports.markRead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('messages').update({ is_read: true }).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/messages/:id ───────────────────── */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (err) { next(err); }
};
