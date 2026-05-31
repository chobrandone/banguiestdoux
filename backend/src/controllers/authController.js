const User = require('../models/User');
const { validationResult } = require('express-validator');

/* ─── Helper: send token response ───────────────── */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedToken();
  const userResponse = {
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    avatar:user.avatar,
    token,
  };
  res.status(statusCode).json({ success: true, data: userResponse });
};

/* ─── POST /api/auth/register ───────────────────── */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

/* ─── POST /api/auth/login ──────────────────────── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Compte désactivé' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

/* ─── GET /api/auth/me ──────────────────────────── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

/* ─── PUT /api/auth/profile ─────────────────────── */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

/* ─── PUT /api/auth/password ────────────────────── */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

/* ─── POST /api/auth/logout ─────────────────────── */
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Déconnecté avec succès' });
};

/* ─── GET /api/auth/users (admin) ───────────────── */
exports.getUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const total = await User.countDocuments();
    const users = await User.find().sort('-createdAt').skip(skip).limit(limit);
    res.json({ success: true, data: users, pagination: { total, page, limit, pages: Math.ceil(total/limit) } });
  } catch (err) { next(err); }
};
