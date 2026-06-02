const supabase = require('../config/supabase');

/* ─── POST /api/auth/register ───────────────────── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Email déjà utilisé'
        : error.message;
      return res.status(400).json({ success: false, message: msg });
    }

    /* Fetch profile created by trigger */
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    res.status(201).json({ success: true, data: { ...data.user, ...profile }, message: 'Compte créé' });
  } catch (err) { next(err); }
};

/* ─── POST /api/auth/login ──────────────────────── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    /* Fetch profile for role info */
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    if (!profile?.is_active) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    /* Update last_login */
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

    res.json({
      success: true,
      data: {
        id:           data.user.id,
        email:        data.user.email,
        name:         profile.name,
        role:         profile.role,
        avatar:       profile.avatar,
        access_token: data.session.access_token,
        refresh_token:data.session.refresh_token,
        expires_at:   data.session.expires_at,
        token:        data.session.access_token, // compatibility alias
      },
    });
  } catch (err) { next(err); }
};

/* ─── GET /api/auth/me ──────────────────────────── */
exports.getMe = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', req.user.id).single();
    res.json({ success: true, data: { ...req.user, ...profile } });
  } catch (err) { next(err); }
};

/* ─── PUT /api/auth/profile ─────────────────────── */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update({ name, phone, avatar })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ─── PUT /api/auth/password ────────────────────── */
exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (6 caractères min)' });
    }
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password: newPassword });
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Mot de passe mis à jour' });
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
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({
      success: true,
      data,
      pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

/* ─── PUT /api/auth/users/:id/role (superadmin) ─── */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user','admin','superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }
    const { data, error } = await supabase
      .from('profiles').update({ role }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, data, message: 'Rôle mis à jour' });
  } catch (err) { next(err); }
};
