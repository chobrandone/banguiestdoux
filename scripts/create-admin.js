#!/usr/bin/env node
/**
 * Bangui est Doux — Admin Account Seed
 * ─────────────────────────────────────
 * Creates (or resets) the superadmin account in Supabase Auth + profiles.
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * Required env vars (set in .env or Hostinger hPanel):
 *   NEXT_PUBLIC_SUPABASE_URL        or  SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL     (default: banguiestdouxx@gmail.com)
 *   ADMIN_PASSWORD  (required — no default for security)
 *   ADMIN_NAME      (default: Admin BED)
 */

'use strict';

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email    = process.env.ADMIN_EMAIL    || 'banguiestdouxx@gmail.com';
const password = process.env.ADMIN_PASSWORD;
const name     = process.env.ADMIN_NAME     || 'Admin BED';

if (!url || !key) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}
if (!password) {
  console.error('❌ ADMIN_PASSWORD is required (set it in .env or pass as env var)');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🔧 Creating admin account: ${email}`);

  /* ── 1. Check if user already exists ────────────────────────────── */
  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingUser = existing?.users?.find(u => u.email === email);

  let userId;

  if (existingUser) {
    /* Update password only */
    console.log(`   User exists (${existingUser.id}) — resetting password…`);
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });
    if (error) { console.error('❌ Password reset failed:', error.message); process.exit(1); }
    userId = existingUser.id;
    console.log('   ✅ Password updated');
  } else {
    /* Create new user */
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) { console.error('❌ User creation failed:', error.message); process.exit(1); }
    userId = data.user.id;
    console.log(`   ✅ Auth user created (${userId})`);
  }

  /* ── 2. Upsert profile with superadmin role ───────────────────────── */
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, name, role: 'superadmin', is_active: true }, { onConflict: 'id' });

  if (profileError) {
    console.error('❌ Profile upsert failed:', profileError.message);
    process.exit(1);
  }
  console.log('   ✅ Profile set to superadmin');

  /* ── 3. Confirm ─────────────────────────────────────────────────── */
  console.log('\n✅ Admin account ready!');
  console.log(`   Email:    ${email}`);
  console.log(`   Role:     superadmin`);
  console.log(`   Login at: /addmin\n`);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
