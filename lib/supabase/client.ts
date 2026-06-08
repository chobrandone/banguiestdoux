/**
 * Browser (client-component) Supabase client
 * Uses createBrowserClient from @supabase/ssr for proper cookie-based sessions.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // JWT anon key is required for auth.signInWithPassword to work
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
               process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
  return createBrowserClient(url, key);
}

/** Singleton for use inside client components */
export const supabaseBrowser = createClient();
