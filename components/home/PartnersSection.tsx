'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPartners } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Partner } from '@/types';

const seedPartners: Partner[] = [
  { _id:'1', name: 'Bangui Rock Club',     logo: 'https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=Rock+Club',     isFeatured: true },
  { _id:'2', name: "Restaurant M'",        logo: "https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=Restaurant+M'", isFeatured: true },
  { _id:'3', name: "L'Avenue",             logo: "https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=L'Avenue",      isFeatured: true },
  { _id:'4', name: 'Ambassade de France',  logo: 'https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=Ambassade+FR',  isFeatured: true },
  { _id:'5', name: 'Air France',           logo: 'https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=Air+France',    isFeatured: true },
  { _id:'6', name: 'TÎ-ï Festival',        logo: 'https://via.placeholder.com/160x60/C9A84C/0A0A0A?text=Ti-i+Festival', isFeatured: true },
];

export default function PartnersSection() {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    getPartners()
      .then((data) => setPartners(data.length ? data : seedPartners))
      .catch(() => setPartners(seedPartners));
  }, []);

  const displayPartners = partners.length ? partners : seedPartners;

  return (
    <section className="py-16 bg-white dark:bg-night border-t border-b border-gold/10">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="label-editorial">{t('partners.title')}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {displayPartners.map((partner, i) => (
            <motion.div
              key={partner._id}
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
