const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  const msg =
    '❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — ' +
    'set these in your Hostinger hPanel → Node.js → Environment Variables';
  console.error(msg);
  throw new Error(msg);
}

/**
 * Admin client — uses SERVICE ROLE key, bypasses RLS.
 * Only use on the server side / backend.
 */
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
