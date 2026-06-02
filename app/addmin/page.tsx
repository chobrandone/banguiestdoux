'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  /* If already logged in as admin, go straight to dashboard */
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.replace('/admin');
      } else {
        setError("Accès refusé – droits administrateur requis");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-[#141414] border border-white/8 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h1 className="font-display text-2xl font-bold text-beige">
              BED <span className="text-gold">Admin</span>
            </h1>
            <p className="text-beige/40 text-sm mt-1">Espace administration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@banguiestdoux.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/25 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-beige placeholder:text-beige/25 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-beige/30 hover:text-beige/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold text-night font-semibold text-sm rounded-xl hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-beige/20 text-xs mt-6">
          Bangui est Doux © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
