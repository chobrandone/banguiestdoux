'use client';

/**
 * Tracks page views by posting to /api/analytics on every route change.
 * Import and call this once inside a client component in the root layout.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // Fire-and-forget — never block the page
    fetch('/api/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path: pathname }),
    }).catch(() => { /* silent */ });
  }, [pathname]);
}
