'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-night flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-display font-bold text-night dark:text-beige mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-gray-500 dark:text-beige/50 mb-8 text-sm">
          Quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 transition-all"
          >
            Réessayer
          </button>
          <Link href="/"
            className="px-6 py-3 border border-gray-200 dark:border-white/10 text-night dark:text-beige font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
