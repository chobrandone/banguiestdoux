'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Instagram, Facebook, Youtube } from 'lucide-react';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await messagesAPI.send({ email, subject: 'Newsletter Subscription', message: 'Subscribe' });
      setSubscribed(true);
      toast.success('Merci pour votre abonnement !');
    } catch {
      toast.error('Erreur. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920"
          alt="Bangui"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/80 to-night/95" />
      </div>

      <div className="relative z-10 py-20 md:py-32">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px bg-gold" />
              <span className="label-editorial">Rejoignez la communauté</span>
              <div className="w-12 h-px bg-gold" />
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold text-beige mb-4">
              {t('section.newsletter.title')}
            </h2>
            <p className="text-beige/60 text-lg mb-10 max-w-xl mx-auto">
              {t('section.newsletter.subtitle')}
            </p>

            {/* Newsletter form */}
            {subscribed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Vous êtes abonné(e) ! Merci.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('section.newsletter.placeholder')}
                  required
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-beige/20 rounded-xl px-5 py-3.5 text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold/60 text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold px-6 gap-2 flex-shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t('section.newsletter.cta')}
                </button>
              </form>
            )}

            <p className="text-beige/30 text-xs mt-4">
              Pas de spam. Désinscription possible à tout moment.
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-16 pt-12 border-t border-beige/10"
          >
            <p className="text-beige/40 text-sm uppercase tracking-widest mb-6">{t('footer.follow')}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', followers: '8.2K' },
                { icon: Facebook,  href: 'https://facebook.com', label: 'Facebook',  followers: '5.1K' },
                { icon: Youtube,   href: 'https://youtube.com',  label: 'YouTube',   followers: '2.4K' },
                { icon: FaTiktok,  href: 'https://tiktok.com',   label: 'TikTok',    followers: '12K'  },
                { icon: FaWhatsapp,href: 'https://wa.me/23672637171', label: 'WhatsApp', followers: '' },
              ].map(({ icon: Icon, href, label, followers }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-gold/10 border border-beige/10 hover:border-gold/30 rounded-xl transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-beige/50 group-hover:text-gold transition-colors" />
                  <div className="text-left">
                    <div className="text-beige/70 text-sm font-semibold group-hover:text-beige transition-colors">{label}</div>
                    {followers && <div className="text-beige/30 text-xs">{followers} followers</div>}
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '50+',   label: 'Événements / mois',    icon: '🎉' },
              { value: '30+',   label: 'Restaurants référencés', icon: '🍽️' },
              { value: '100+',  label: 'Articles publiés',      icon: '📰' },
              { value: '10K+',  label: 'Membres communauté',   icon: '👥' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-display text-3xl font-bold text-gold mb-1">{value}</div>
                <div className="text-beige/40 text-xs uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
