import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Conditions d\'utilisation — Bangui est Doux' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 lg:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gold hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="font-display text-4xl font-bold text-night dark:text-beige mb-2">Conditions d'utilisation</h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-gray-700 dark:text-beige/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Acceptation des conditions</h2>
            <p>En accédant et en utilisant le site Bangui est Doux, vous acceptez d'être lié par les présentes conditions d'utilisation.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Utilisation du service</h2>
            <p>Bangui est Doux est une plateforme de découverte et de réservation dédiée à la ville de Bangui, République Centrafricaine. Vous vous engagez à utiliser ce service de manière légale et respectueuse.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Réservations</h2>
            <p>Les réservations effectuées via la plateforme sont des demandes soumises à confirmation. Bangui est Doux se réserve le droit d'annuler toute réservation en cas d'indisponibilité ou de force majeure. Le paiement s'effectue directement auprès du prestataire.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Responsabilité</h2>
            <p>Bangui est Doux agit comme intermédiaire entre les utilisateurs et les prestataires (hôtels, loueurs de voitures). Nous ne sommes pas responsables de la qualité des services fournis par les prestataires tiers.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Modification des conditions</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Contact</h2>
            <p>Pour toute question concernant ces conditions : <a href="mailto:contact@banguiestdoux.com" className="text-gold hover:underline">contact@banguiestdoux.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
