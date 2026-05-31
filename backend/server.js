require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

/* ─── Connect to MongoDB ─────────────────────────── */
connectDB();

/* ─── Security & Performance ─────────────────────── */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ─── CORS ───────────────────────────────────────── */
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://banguiestdoux.com',
    'https://www.banguiestdoux.com',
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

/* ─── Body parsing ───────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ─── Rate limiting ──────────────────────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives de connexion.' },
});
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

/* ─── Static files ───────────────────────────────── */
app.use('/uploads', express.static('uploads'));

/* ─── Routes ─────────────────────────────────────── */
app.use('/api/auth',        require('./src/routes/auth'));
app.use('/api/events',      require('./src/routes/events'));
app.use('/api/restaurants', require('./src/routes/restaurants'));
app.use('/api/articles',    require('./src/routes/articles'));
app.use('/api/gallery',     require('./src/routes/gallery'));
app.use('/api/products',    require('./src/routes/products'));
app.use('/api/orders',      require('./src/routes/orders'));
app.use('/api/talents',     require('./src/routes/talents'));
app.use('/api/partners',    require('./src/routes/partners'));
app.use('/api/messages',    require('./src/routes/messages'));
app.use('/api/settings',    require('./src/routes/settings'));
app.use('/api/analytics',   require('./src/routes/analytics'));

/* ─── Health check ───────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bangui est Doux API is running 🌟',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ─── 404 ────────────────────────────────────────── */
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

/* ─── Error handler ──────────────────────────────── */
app.use(errorHandler);

/* ─── Start server ───────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌟 Bangui est Doux API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
