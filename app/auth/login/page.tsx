'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loggedUser = await login(form.email, form.password);
    setIsLoading(false);
    if (loggedUser) {
      const isAdmin = loggedUser.role === 'admin' || loggedUser.role === 'superadmin';
      router.push(isAdmin ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — visual */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200" alt="Bangui" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-night/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <Link href="/" className="text-white font-display text-4xl font-bold mb-4">
            Bangui<span className="text-gold"> est Doux</span>
          </Link>
          <p className="text-white/60 text-lg">{t('auth.tagline')}</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-beige dark:bg-night p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block font-display text-2xl font-bold text-night dark:text-beige mb-8">
            Bangui<span className="text-gold"> est Doux</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-night dark:text-beige mb-2">{t('auth.login')}</h1>
            <p className="text-night/50 dark:text-beige/50 text-sm">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="votre@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-night-50 rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-night/60 dark:text-beige/60 uppercase tracking-wider">{t('auth.password')}</label>
                <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">{t('auth.forgotPassword')}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-night-50 rounded-xl border border-gold/20 focus:border-gold outline-none text-sm text-night dark:text-beige"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-night/30 dark:text-beige/30 hover:text-night dark:hover:text-beige">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-gold w-full py-4 text-base mt-2">
              {isLoading
                ? <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                : <><span>{t('auth.login')}</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-night/50 dark:text-beige/50 mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/register" className="text-gold font-semibold hover:underline">{t('auth.register')}</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gold/10 rounded-xl border border-gold/20">
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">Accès démo admin</p>
            <p className="text-xs text-night/60 dark:text-beige/60">Email: admin@banguiestdoux.com</p>
            <p className="text-xs text-night/60 dark:text-beige/60">Mot de passe: Admin@2025!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
