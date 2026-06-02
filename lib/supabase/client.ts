/**
 * Browser (client-component) Supabase client
 * Uses createBrowserClient from @supabase/ssr for proper cookie-based sessions.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

/** Singleton for use inside client components */
export const supabaseBrowser = createClient();
