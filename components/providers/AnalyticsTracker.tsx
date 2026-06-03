'use client';

import { usePageView } from '@/hooks/usePageView';

/** Invisible component — just fires a page-view beacon on every route change. */
export default function AnalyticsTracker() {
  usePageView();
  return null;
}
