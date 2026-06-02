const supabase = require('../config/supabase');

/* ─── Verify Supabase JWT & load profile ─────────── */
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Non autorisé – token manquant' });
  }

  const token = header.split(' ')[1];

  try {
    /* Verify JWT with Supabase */
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }

    /* Fetch profile (role, is_active, etc.) */
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(401).json({ success: false, message: 'Profil introuvable' });
    }

    if (!profile.is_active) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    req.user = { ...user, ...profile };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Erreur d\'authentification' });
  }
};

/* ─── Restrict to roles ────────────────────────────── */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Le rôle '${req.user.role}' n'est pas autorisé pour cette action`,
    });
  }
  next();
};

/* ─── Optional auth ────────────────────────────────── */
exports.optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        req.user = profile ? { ...user, ...profile } : user;
      }
    } catch {}
  }
  next();
};
