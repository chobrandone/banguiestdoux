'use strict';
/**
 * Bangui est Doux — Minimal Production Server
 * Pure Next.js — no Express layer to crash.
 * All API routes live in app/api/ (Next.js native).
 */

// Load env vars: .env.production is committed to git, always available
require('dotenv').config({ path: require('path').join(__dirname, '.env.production') });
require('dotenv').config(); // also try .env for local dev

const { createServer } = require('http');
const { parse }         = require('url');
const next              = require('next');

const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`\n⚙  Starting Bangui est Doux [${dev ? 'dev' : 'production'}] on port ${port}`);

const app    = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, '0.0.0.0', () => {
      console.log(`\n🌟  Ready → http://0.0.0.0:${port}\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
