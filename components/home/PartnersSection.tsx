'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPartners } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Partner } from '@/types';

// Fallback partners shown when DB has no data
// Uses CSS text badges instead of unreliable external placeholder images
const seedPartners: Partner[] = [
  { _id:'1', name: 'Bangui Rock Club',    logo: '', isFeatured: true },
  { _id:'2', name: "Restaurant M'",       logo: '', isFeatured: true },
  { _id:'3', name: "L'Avenue",            logo: '', isFeatured: true },
  { _id:'4', name: 'Ambassade de France', logo: '', isFeatured: true },
  { _id:'5', name: 'Air France',          logo: '', isFeatured: true },
  { _id:'6', name: 'TÎ-ï Festival',       logo: '', isFeatured: true },
];

function PartnerLogo({ logo, name }: { logo: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (!logo || imgError) {
    // CSS text badge fallback — always renders, never breaks
    return (
      <div className="px-5 py-2.5 rounded-xl border border-gold/20 bg-gold/5 text-sm font-bold text-night dark:text-beige tracking-wide whitespace-nowrap">
        {name}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      className="h-8 w-auto max-w-[140px] object-contain"
      onError={() => setImgError(true)}
    />
  );
}

export default function PartnersSection() {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>(seedPartners);

  useEffect(() => {
    getPartners()
      .then((data) => { if (data.length) setPartners(data); })
      .catch(() => { /* keep seed */ });
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-night border-t border-b border-gold/10">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="label-editorial">{t('partners.title')}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {partners.map((partner, i) => (
            <motion.div
              key={partner._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              <PartnerLogo logo={partner.logo} name={partner.name} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
