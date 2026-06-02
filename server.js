// Hostinger / Passenger-compatible Next.js server
'use strict';

const { createServer } = require('http');
const { parse }        = require('url');
const next             = require('next');

const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

// Do NOT pass hostname — let Passenger/the OS bind on all interfaces
const app    = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Request error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`> Ready on port ${port} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
  });
