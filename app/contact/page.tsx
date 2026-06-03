'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Facebook, Youtube } from 'lucide-react';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSent(true);
      toast.success(t('contact.sent'));
    } catch {
      toast.error(t('general.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="relative h-56 bg-night overflow-hidden flex items-end pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920" alt="Contact" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-20">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige">{t('contact.title')}</h1>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info column */}
            <div className="lg:col-span-4">
              <span className="label-editorial mb-3 block">{t('contact.contactUs')}</span>
              <h2 className="font-display text-3xl font-bold text-night dark:text-beige mb-6">{t('contact.response')}</h2>
              <p className="text-night/60 dark:text-beige/60 text-sm leading-relaxed mb-8">
                {t('contact.description')}
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: Mail,       labelKey: 'contact.email',     value: 'banguiestdouxx@gmail.com',         href: 'mailto:banguiestdouxx@gmail.com' },
                  { icon: Phone,      labelKey: 'contact.telephone', value: '+236 72 63 71 71',                 href: 'tel:+23672637171' },
                  { icon: FaWhatsapp, labelKey: 'contact.whatsapp',  value: '+236 72 63 71 71',                 href: 'https://wa.me/23672637171' },
                  { icon: MapPin,     labelKey: 'contact.address',   value: 'Bangui, République Centrafricaine', href: '#map' },
                ].map(({ icon: Icon, labelKey, value, href }) => (
                  <a key={labelKey} href={href} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-night transition-all">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-night/40 dark:text-beige/40">{t(labelKey)}</div>
                      <div className="text-sm font-semibold text-night dark:text-beige group-hover:text-gold transition-colors">{value}</div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gold font-bold mb-4">{t('footer.follow')}</p>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Instagram, href:'https://instagram.com', color:'hover:text-pink-400' },
                    { icon: Facebook,  href:'https://facebook.com',  color:'hover:text-blue-400' },
                    { icon: Youtube,   href:'https://youtube.com',   color:'hover:text-red-400'  },
                    { icon: FaTiktok,  href:'https://tiktok.com',    color:'hover:text-white'    },
                  ].map(({ icon: Icon, href, color }) => (
                    <a key={href} href={href} target="_blank" rel="noreferrer"
                      className={`w-9 h-9 flex items-center justify-center rounded-full border border-night/20 dark:border-beige/20 text-night/50 dark:text-beige/50 transition-all ${color} hover:border-gold/50 hover:scale-110`}>
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-night-50 rounded-3xl p-8 md:p-10 shadow-card">
                {sent ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10"
                  >
                    <CheckCircle2 className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">{t('contact.sent')}</h3>
                    <p className="text-night/50 dark:text-beige/50 text-sm">{t('contact.thankYou')}</p>
                    <button onClick={() => setSent(false)} className="btn-gold mt-6 px-6">{t('contact.sendAnother')}</button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('contact.name')}</label>
                        <input name="name" required value={form.name} onChange={handleChange}
                          className="w-full px-4 py-3 bg-beige dark:bg-night rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('contact.email')}</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange}
                          className="w-full px-4 py-3 bg-beige dark:bg-night rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('contact.phone')}</label>
                        <input name="phone" value={form.phone} onChange={handleChange}
                          className="w-full px-4 py-3 bg-beige dark:bg-night rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('contact.subject')}</label>
                        <select name="subject" value={form.subject} onChange={handleChange}
                          className="w-full px-4 py-3 bg-beige dark:bg-night rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige">
                          <option value="">{t('contact.subjectChoose')}</option>
                          <option>{t('contact.sub.partnership')}</option>
                          <option>{t('contact.sub.event')}</option>
                          <option>{t('contact.sub.advertising')}</option>
                          <option>{t('contact.sub.press')}</option>
                          <option>{t('contact.sub.other')}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('contact.message')}</label>
                      <textarea name="message" required rows={6} value={form.message} onChange={handleChange}
                        className="w-full px-4 py-3 bg-beige dark:bg-night rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige resize-none" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">
                      {loading ? <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      {t('contact.send')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
