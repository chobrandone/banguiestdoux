'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const partners = [
  { name: 'Bangui Rock Club',     logo: 'https://via.placeholder.com/160x60/30f824/0A0A0A?text=Rock+Club' },
  { name: "Restaurant M'",       logo: 'https://via.placeholder.com/160x60/30f824/0A0A0A?text=Restaurant+M' },
  { name: "L'Avenue",            logo: "https://via.placeholder.com/160x60/30f824/0A0A0A?text=L'Avenue" },
  { name: 'Ambassade de France', logo: 'https://via.placeholder.com/160x60/30f824/0A0A0A?text=Ambassade+FR' },
  { name: 'Air France',          logo: 'https://via.placeholder.com/160x60/30f824/0A0A0A?text=Air+France' },
  { name: 'TÎ-ï Festival',       logo: 'https://via.placeholder.com/160x60/30f824/0A0A0A?text=Ti-i+Festival' },
];

export default function PartnersSection() {
  const { } = useLanguage();

  return (
    <section className="py-16 bg-white dark:bg-night border-t border-b border-gold/10">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="label-editorial">Nos partenaires</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="opacity-40 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.logo} alt={partner.name} className="h-8 w-auto" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
