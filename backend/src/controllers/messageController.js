const Message = require('../models/Message');

/* ─── POST /api/messages ─────────────────────────── */
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Nom, email et message requis' });
    }
    const msg = await Message.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, data: msg, message: 'Message envoyé avec succès !' });
  } catch (err) { next(err); }
};

/* ─── GET /api/messages (admin) ─────────────────── */
exports.getMessages = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const query = {};
    if (req.query.unread === 'true') query.isRead = false;

    const [messages, total] = await Promise.all([
      Message.find(query).sort('-createdAt').skip(skip).limit(limit),
      Message.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

/* ─── PUT /api/messages/:id/read ────────────────── */
exports.markRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

/* ─── DELETE /api/messages/:id ──────────────────── */
exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (err) { next(err); }
};
