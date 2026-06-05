import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Handshake, TrendingUp, Globe, Star } from 'lucide-react';

export const metadata: Metadata = { title: 'Partenaires — Bangui est Doux' };

const benefits = [
  { icon: Globe,      title: 'Visibilité maximale',     desc: 'Votre établissement présenté à des milliers de visiteurs et résidents de Bangui.' },
  { icon: TrendingUp, title: 'Plus de réservations',    desc: 'Recevez des demandes de réservation directement via notre plateforme.' },
  { icon: Star,       title: 'Image de marque premium', desc: 'Associez votre nom à Bangui est Doux, référence lifestyle de la capitale.' },
  { icon: Handshake,  title: 'Accompagnement dédié',    desc: 'Une équipe à votre écoute pour optimiser votre présence sur la plateforme.' },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-night pt-28 pb-20">
      {/* Hero */}
      <div className="bg-night text-beige py-16 px-4 text-center">
        <p className="label-editorial mb-3">Partenaires</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Devenez partenaire</h1>
        <p className="text-beige/60 max-w-xl mx-auto">
          Rejoignez l'écosystème Bangui est Doux et donnez une visibilité exceptionnelle à votre établissement ou service.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 bg-gray-50 dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="font-bold text-night dark:text-beige mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-beige/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Who can partner */}
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-4">Qui peut nous rejoindre ?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Hôtels & Résidences', 'Restaurants & Bars', 'Agences de location', 'Organisateurs d\'événements', 'Artistes & Talents', 'Marques & Entreprises'].map(cat => (
              <span key={cat} className="px-4 py-2 bg-gold/10 border border-gold/20 text-gold rounded-full text-sm font-medium">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-night dark:bg-[#141414] rounded-3xl p-10 text-center border border-white/5">
          <h2 className="font-display text-2xl font-bold text-beige mb-3">Prêt à vous lancer ?</h2>
          <p className="text-beige/60 mb-6 max-w-md mx-auto">
            Contactez-nous pour discuter d'un partenariat adapté à vos besoins et votre budget.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 transition-all">
            Nous contacter <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
