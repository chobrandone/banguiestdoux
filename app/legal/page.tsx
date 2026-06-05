import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Mentions légales — Bangui est Doux' };

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gold hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="font-display text-4xl font-bold text-night dark:text-beige mb-2">Mentions légales</h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-10">Dernière mise à jour : juin 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-beige/70">
          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Éditeur du site</h2>
            <p>Le site <strong>banguiestdoux.com</strong> est édité par <strong>Bangui est Doux</strong>, entreprise basée à Bangui, République Centrafricaine.</p>
            <p className="mt-2">Contact : <a href="mailto:contact@banguiestdoux.com" className="text-gold hover:underline">contact@banguiestdoux.com</a></p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Hébergement</h2>
            <p>Le site est hébergé par <strong>Hostinger</strong>, 61 Lordou Vironos Street, 6023 Larnaca, Chypre.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Propriété intellectuelle</h2>
            <p>L'ensemble des contenus publiés sur ce site (textes, images, vidéos, logos) sont la propriété exclusive de Bangui est Doux, sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Responsabilité</h2>
            <p>Bangui est Doux s'efforce de maintenir des informations exactes et à jour sur ce site. Toutefois, nous ne pouvons garantir l'exhaustivité ou l'exactitude de toutes les informations publiées.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Droit applicable</h2>
            <p>Le présent site est soumis au droit de la République Centrafricaine. Tout litige relatif à son utilisation sera soumis à la juridiction compétente de Bangui.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
