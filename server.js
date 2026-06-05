'use strict';
/**
 * Bangui est Doux — Unified Server
 * ──────────────────────────────────
 *  • /api/*  → Express REST API (routes/, middleware/, controllers/)
 *  • /*      → Next.js (app/, components/, public/)
 *
 * Hostinger hPanel: Startup File = server.js, Node.js ≥ 20
 * Local dev: npm run dev  (Next.js only, much faster)
 *            node server.js  (full stack, same as production)
 */
require('dotenv').config();

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const compression   = require('compression');
const rateLimit     = require('express-rate-limit');
const { parse }     = require('url');
const next          = require('next');

const errorHandler  = require('./middleware/errorHandler');

/* ─── Config ─────────────────────────────────────── */
const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

/* ─── Auto-build if .next is missing (production) ── */
if (!dev && !fs.existsSync(path.join(__dirname, '.next'))) {
  console.log('\n⚙️  .next build not found — running next build now...');
  console.log('   This happens on first deploy. Please wait ~2 minutes.\n');
  try {
    execSync('npm run build', {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'production' },
    });
    console.log('\n✅  Build complete — starting server.\n');
  } catch (buildErr) {
    console.error('\n❌  Build failed. Check logs above for details.');
    console.error('   Tip: make sure all required env vars are set in Hostinger.\n');
    process.exit(1);
  }
}

/* ═══════════════════════════════════════════════════
   1.  EXPRESS API  (mounted at /api)
═══════════════════════════════════════════════════ */
const api = express();

api.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
api.use(compression());
api.use(morgan(dev ? 'dev' : 'combined'));

api.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://banguiestdoux.com',
    'https://www.banguiestdoux.com',
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

api.use(express.json({ limit: '10mb' }));
api.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* Rate limiting */
api.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
}));
api.use('/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives de connexion.' },
}));

/* Routes */
api.use('/auth',        require('./routes/auth'));
api.use('/events',      require('./routes/events'));
api.use('/restaurants', require('./routes/restaurants'));
api.use('/articles',    require('./routes/articles'));
api.use('/gallery',     require('./routes/gallery'));
api.use('/products',    require('./routes/products'));
api.use('/orders',      require('./routes/orders'));
api.use('/talents',     require('./routes/talents'));
api.use('/partners',    require('./routes/partners'));
api.use('/messages',    require('./routes/messages'));
api.use('/settings',    require('./routes/settings'));
api.use('/analytics',   require('./routes/analytics'));

api.get('/health', (_req, res) => res.json({
  success: true,
  message: 'Bangui est Doux API running 🌟',
  database: 'Supabase PostgreSQL',
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

api.use(errorHandler);

/* ═══════════════════════════════════════════════════
   2.  NEXT.JS FRONTEND
═══════════════════════════════════════════════════ */
const nextApp = next({ dev });
const handle  = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = express();

    /* /api/* → Express API */
    server.use('/api', api);

    /* Everything else → Next.js */
    server.all('*', (req, res) => {
      try {
        return handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error('Next.js request error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`\n🌟 Bangui est Doux ready on port ${port} [${process.env.NODE_ENV}]`);
      console.log(`   Frontend : http://0.0.0.0:${port}`);
      console.log(`   API      : http://0.0.0.0:${port}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
