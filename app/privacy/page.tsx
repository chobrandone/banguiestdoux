import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Politique de confidentialité — Bangui est Doux' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-sm text-gold hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="font-display text-4xl font-bold text-night dark:text-beige mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-400 dark:text-beige/40 mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-gray-700 dark:text-beige/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Données collectées</h2>
            <p>Nous collectons uniquement les informations que vous nous fournissez volontairement : nom, adresse email, numéro de téléphone lors de réservations ou via le formulaire de contact.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Traiter vos demandes de réservation (hôtel, voiture)</li>
              <li>Répondre à vos messages</li>
              <li>Vous envoyer des confirmations par email</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Conservation des données</h2>
            <p>Vos données sont conservées pendant la durée nécessaire à la finalité pour laquelle elles ont été collectées, et au maximum 3 ans après votre dernière interaction avec nous.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Vos droits</h2>
            <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à :</p>
            <a href="mailto:contact@banguiestdoux.com" className="text-gold hover:underline font-semibold">contact@banguiestdoux.com</a>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-night dark:text-beige mb-3">Cookies</h2>
            <p>Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
