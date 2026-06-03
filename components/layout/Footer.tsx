'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram, Facebook, Youtube, MapPin, Phone, Mail,
  Send, ArrowRight,
} from 'lucide-react';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/banguiestdoux', label: 'Instagram', color: 'hover:text-pink-400' },
  { icon: Facebook,  href: 'https://facebook.com/banguiestdoux', label: 'Facebook',  color: 'hover:text-blue-400'  },
  { icon: Youtube,   href: 'https://youtube.com/@banguiestdoux', label: 'YouTube',   color: 'hover:text-red-400'   },
  { icon: FaTiktok,  href: 'https://tiktok.com/@banguiestdoux',  label: 'TikTok',    color: 'hover:text-white'     },
  { icon: FaWhatsapp,href: 'https://wa.me/23672637171',          label: 'WhatsApp',  color: 'hover:text-green-400' },
];

/* Link lists — all labels use translation keys */
const footerLinks = {
  explore: [
    { labelKey: 'nav.events',      href: '/events'      },
    { labelKey: 'nav.restaurants', href: '/restaurants' },
    { labelKey: 'nav.cinema',      href: '/cinema'      },
    { labelKey: 'nav.discover',    href: '/discover'    },
    { labelKey: 'nav.talents',     href: '/talents'     },
    { labelKey: 'nav.gallery',     href: '/gallery'     },
  ],
  info: [
    { labelKey: 'nav.practical',          href: '/practical'            },
    { labelKey: 'footer.links.hotels',    href: '/practical#hotels'     },
    { labelKey: 'footer.links.transport', href: '/practical#transport'  },
    { labelKey: 'footer.links.safety',    href: '/practical#safety'     },
    { labelKey: 'footer.links.visa',      href: '/practical#airport'    },
  ],
  shop: [
    { labelKey: 'nav.shop',                    href: '/shop'                       },
    { labelKey: 'footer.links.tshirts',        href: '/shop?cat=t-shirts'         },
    { labelKey: 'footer.links.accessories',    href: '/shop?cat=accessories'      },
    { labelKey: 'footer.links.limitedEditions',href: '/shop?cat=limited-editions' },
  ],
  legal: [
    { labelKey: 'nav.contact',           href: '/contact'  },
    { labelKey: 'footer.links.legal',    href: '/legal'    },
    { labelKey: 'footer.links.privacy',  href: '/privacy'  },
    { labelKey: 'footer.links.terms',    href: '/terms'    },
    { labelKey: 'footer.links.partners', href: '/partners' },
  ],
};

const bottomLegalKeys = [
  { key: 'footer.links.legal',   href: '/legal'   },
  { key: 'footer.links.privacy', href: '/privacy' },
  { key: 'footer.links.terms',   href: '/terms'   },
];

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  const columns = [
    { titleKey: 'footer.columns.explore', links: footerLinks.explore },
    { titleKey: 'footer.columns.info',    links: footerLinks.info    },
    { titleKey: 'footer.columns.shop',    links: footerLinks.shop    },
    { titleKey: 'footer.columns.legal',   links: footerLinks.legal   },
  ];

  return (
    <footer className="bg-night dark:bg-black text-beige relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-gold opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="container-custom pt-16 pb-8 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-4">
              {/* Footer always has dark background → white logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dark.svg"
                alt="Bangui est Doux"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-beige/60 text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer.tagline')}
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mb-8">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-beige/20 text-beige/50 transition-all duration-300 hover:border-gold/50 hover:scale-110 ${color}`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
                Newsletter
              </p>
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-400"
                >
                  {t('footer.newsletter.subscribed')}
                </motion.p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('section.newsletter.placeholder')}
                    required
                    className="flex-1 bg-white/5 border border-beige/20 rounded-l-xl px-4 py-2.5 text-sm text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gold hover:bg-gold-300 text-night rounded-r-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map(({ titleKey, links }) => (
              <div key={titleKey}>
                <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-4">
                  {t(titleKey)}
                </h4>
                <ul className="space-y-2.5">
                  {links.map(({ labelKey, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-beige/50 hover:text-gold transition-colors duration-200 flex items-center gap-1 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-gold" />
                        {t(labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact strip */}
        <div className="border-t border-beige/10 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Mail,   text: 'banguiestdouxx@gmail.com',     href: 'mailto:banguiestdouxx@gmail.com' },
              { icon: Phone,  text: '+236 72 63 71 71',              href: 'tel:+23672637171'                },
              { icon: MapPin, textKey: 'footer.contact.location',    href: '/contact'                        },
            ].map(({ icon: Icon, text, textKey, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 text-sm text-beige/50 hover:text-gold transition-colors group"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full border border-beige/10 group-hover:border-gold/30 transition-colors">
                  <Icon className="w-4 h-4" />
                </span>
                {textKey ? t(textKey) : text}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-beige/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-beige/30">
            {t('footer.rights')}
          </p>
          <p className="text-xs text-beige/20">
            {t('footer.made')}
          </p>
          <div className="flex items-center gap-4">
            {bottomLegalKeys.map(({ key, href }) => (
              <Link key={key} href={href} className="text-xs text-beige/30 hover:text-gold transition-colors">
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
