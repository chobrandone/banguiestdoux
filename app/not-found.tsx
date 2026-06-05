import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page introuvable — Bangui est Doux' };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-night flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-display font-bold text-gold mb-4">404</p>
        <h1 className="text-2xl font-display font-bold text-night dark:text-beige mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 dark:text-beige/50 mb-8 text-sm leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Retournez à l'accueil pour explorer le meilleur de Bangui.
        </p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 transition-all">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
