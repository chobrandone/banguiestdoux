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

const footerLinks = {
  explore: [
    { label: 'Événements',        href: '/events'      },
    { label: 'Restaurants',       href: '/restaurants' },
    { label: 'Cinéma & Culture',  href: '/cinema'      },
    { label: 'Découvrir Bangui',  href: '/discover'    },
    { label: 'Talents',           href: '/talents'     },
    { label: 'Galerie',           href: '/gallery'     },
  ],
  info: [
    { label: 'Infos Pratiques',   href: '/practical'       },
    { label: 'Hôtels & Séjours',  href: '/practical#hotels'},
    { label: 'Transport',         href: '/practical#transport' },
    { label: 'Sécurité',          href: '/practical#safety'},
    { label: 'Visa & Aéroport',   href: '/practical#airport' },
  ],
  shop: [
    { label: 'Boutique',          href: '/shop'               },
    { label: 'T-Shirts',          href: '/shop?cat=t-shirts'  },
    { label: 'Accessoires',       href: '/shop?cat=accessories' },
    { label: 'Éditions Limitées', href: '/shop?cat=limited-editions' },
  ],
  legal: [
    { label: 'Contact',           href: '/contact'      },
    { label: 'Mentions légales',  href: '/legal'        },
    { label: 'Confidentialité',   href: '/privacy'      },
    { label: 'CGV',               href: '/terms'        },
    { label: 'Partenaires',       href: '/partners'     },
  ],
};

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

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
              <span className="font-display text-3xl font-bold">
                Bangui<span className="text-gold"> est Doux</span>
              </span>
            </Link>
            <p className="text-beige/60 text-sm leading-relaxed mb-6 max-w-xs">
              La référence lifestyle de Bangui. Événements, restaurants, culture et nightlife en République Centrafricaine.
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
                  ✓ Merci ! Vous êtes abonné(e).
                </motion.p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email"
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
            {[
              { title: 'Explorer',          links: footerLinks.explore },
              { title: 'Infos pratiques',   links: footerLinks.info    },
              { title: 'Boutique',          links: footerLinks.shop    },
              { title: 'Informations',      links: footerLinks.legal   },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-beige/50 hover:text-gold transition-colors duration-200 flex items-center gap-1 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-gold" />
                        {label}
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
              { icon: Mail,   text: 'banguiestdouxx@gmail.com',  href: 'mailto:banguiestdouxx@gmail.com' },
              { icon: Phone,  text: '+236 72 63 71 71',          href: 'tel:+23672637171' },
              { icon: MapPin, text: 'Bangui, République Centrafricaine', href: '/contact' },
            ].map(({ icon: Icon, text, href }) => (
              <a
                key={text}
                href={href}
                className="flex items-center gap-3 text-sm text-beige/50 hover:text-gold transition-colors group"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full border border-beige/10 group-hover:border-gold/30 transition-colors">
                  <Icon className="w-4 h-4" />
                </span>
                {text}
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
            Fait avec ♥ à Bangui
          </p>
          <div className="flex items-center gap-4">
            {['Mentions légales', 'Confidentialité', 'CGV'].map((item) => (
              <Link key={item} href="/legal" className="text-xs text-beige/30 hover:text-gold transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
