'use strict';
/**
 * db.js — Supabase admin client (service-role key)
 *
 * Re-exports the singleton from config/supabase.js.
 * Import this anywhere in the backend:
 *   const supabase = require('./db');   // from root
 *   const supabase = require('../db');  // from routes/ controllers/ etc.
 */
module.exports = require('./config/supabase');
