'use client';

import { Plane, Car, Shield, Hotel, Phone, CreditCard, Syringe, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const sections = [
  {
    id: 'airport', icon: Plane, title: 'Aéroport & Vols', color: 'bg-blue-500',
    items: [
      { q: 'Aéroport principal', a: "Aéroport International Bangui M'Poko (BGF)" },
      { q: 'Compagnies aériennes', a: 'Air France, Ethiopian Airlines, Kenya Airways, Camair-Co, Asky' },
      { q: 'Vols directs depuis Paris', a: 'Oui, vols directs Paris CDG – Bangui avec Air France' },
      { q: 'Durée du vol Paris–Bangui', a: 'Environ 8 heures' },
    ],
  },
  {
    id: 'visa', icon: Info, title: 'Visa & Entrée', color: 'bg-gold',
    items: [
      { q: 'Visa obligatoire', a: "Oui, le visa est obligatoire pour la plupart des nationalités" },
      { q: 'Obtenir un visa', a: "Ambassade de RCA dans votre pays ou visa à l'arrivée (selon nationalité)" },
      { q: 'Durée de validité', a: 'Généralement 30 jours, renouvelable sur place' },
      { q: 'Documents requis', a: "Passeport valide 6 mois, formulaire, photo, billets, vaccin fièvre jaune" },
    ],
  },
  {
    id: 'transport', icon: Car, title: 'Transport', color: 'bg-orange-500',
    items: [
      { q: 'Taxis', a: "Taxis jaunes disponibles en ville. Négocier le prix avant le trajet." },
      { q: 'Moto-taxis', a: "Très répandus, rapides et économiques pour se déplacer en ville" },
      { q: 'Location de voiture', a: "Disponible à l'aéroport et dans les grands hôtels. Recommandé avec chauffeur." },
      { q: 'Chauffeurs privés', a: "Contactez-nous via WhatsApp pour recommandations de chauffeurs fiables" },
    ],
  },
  {
    id: 'safety', icon: Shield, title: 'Sécurité', color: 'bg-red-500',
    items: [
      { q: 'Numéro d\'urgence', a: '117 (Police), 1220 (POMPIERS), 1221 (SAMU)' },
      { q: 'Conseils de sécurité', a: "Restez dans les quartiers fréquentés, évitez les déplacements nocturnes seul(e)" },
      { q: 'Ambassade de France', a: '+236 21 61 30 00 – Avenue Boganda, Bangui' },
      { q: 'Hôpital principal', a: "Hôpital Communautaire de Bangui, Complexe Pédiatrique" },
    ],
  },
  {
    id: 'health', icon: Syringe, title: 'Santé', color: 'bg-teal-500',
    items: [
      { q: 'Vaccins recommandés', a: "Fièvre jaune (obligatoire), Hépatite A & B, Typhoïde, Méningite" },
      { q: 'Paludisme', a: "Risque élevé. Emportez traitement préventif et répulsifs anti-moustiques." },
      { q: 'Eau potable', a: "Boire uniquement de l'eau en bouteille ou filtrée" },
      { q: 'Pharmacies', a: "Pharmacie Centrale (Centre-ville), Pharmacie Amitié, Pharmacie Malimaka" },
    ],
  },
  {
    id: 'money', icon: CreditCard, title: 'Argent & Monnaie', color: 'bg-yellow-500',
    items: [
      { q: 'Monnaie', a: "Franc CFA (XAF) – 1 EUR ≈ 655 XAF" },
      { q: 'Cartes bancaires', a: "Acceptées dans les grands hôtels et restaurants. Cash recommandé ailleurs." },
      { q: 'Distributeurs', a: "Ecobank, BSCA (Banque Sahélo-Saharienne pour l'Investissement)" },
      { q: 'Change', a: "Bureaux de change en centre-ville. Évitez les changeurs informels." },
    ],
  },
  {
    id: 'hotels', icon: Hotel, title: 'Hébergement', color: 'bg-purple-500',
    items: [
      { q: 'Hôtels de luxe', a: "Ledger Plaza Bangui (ex-Sofitel) – le plus haut de gamme de la ville" },
      { q: 'Hôtels mid-range', a: "Hôtel Oubangui, Hôtel du Centre, Hôtel Safaris" },
      { q: 'Airbnb & appartements', a: "Disponibles via Airbnb dans les quartiers résidentiels" },
      { q: 'Réservation', a: "Réservez à l'avance pendant les événements majeurs" },
    ],
  },
  {
    id: 'phone', icon: Phone, title: 'Téléphonie', color: 'bg-indigo-500',
    items: [
      { q: 'Opérateurs', a: "Orange RCA, Telecel, Azur" },
      { q: 'Couverture', a: "Bonne couverture 3G/4G en centre-ville" },
      { q: 'SIM touriste', a: "Disponible à l'aéroport et dans les boutiques opérateurs" },
      { q: 'Internet', a: "Fibre disponible dans les hôtels, WiFi dans les restaurants et cafés" },
    ],
  },
];

export default function PracticalPage() {
  const { t } = useLanguage();

  return (
    <>
      <div className="relative h-64 bg-night overflow-hidden flex items-end pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920" alt="Aéroport" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-24 lg:pt-28">
          <span className="label-editorial">{t('practical.guide')}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">{t('practical.title')}</h1>
          <p className="text-beige/60 mt-2">{t('practical.subtitle')}</p>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen py-16">
        <div className="container-custom">
          {/* Quick nav */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-16">
            {sections.map(({ id, icon: Icon, title, color }) => (
              <a key={id} href={`#${id}`} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-night-50 rounded-2xl hover:shadow-card-hover transition-all group text-center">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-night dark:text-beige group-hover:text-gold transition-colors line-clamp-2">{title}</span>
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map(({ id, icon: Icon, title, color, items }) => (
              <div key={id} id={id} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-night dark:text-beige">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(({ q, a }) => (
                    <div key={q} className="bg-white dark:bg-night-50 rounded-2xl p-5">
                      <h4 className="font-semibold text-sm text-gold mb-1">{q}</h4>
                      <p className="text-sm text-night/70 dark:text-beige/70">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Emergency box */}
          <div className="mt-16 bg-red-500/10 border border-red-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500 text-white">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-night dark:text-beige">{t('practical.emergency')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Police', number: '117' },
                { label: 'Pompiers', number: '1220' },
                { label: 'SAMU', number: '1221' },
                { label: 'Ambassade FR', number: '+236 21 61 30 00' },
              ].map(({ label, number }) => (
                <div key={label} className="bg-white dark:bg-night-50 rounded-xl p-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-night/40 dark:text-beige/40 mb-1">{label}</div>
                  <a href={`tel:${number}`} className="text-xl font-bold text-red-500">{number}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
