'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate a short delay then show confirmation
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-night flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>

        {sent ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-3xl p-10 text-center">
            <div className="w-14 h-14 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">Email envoyé !</h2>
            <p className="text-gray-500 dark:text-beige/50 text-sm mb-6">
              Si un compte existe avec <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
            </p>
            <Link href="/auth/login" className="btn-gold px-6 py-3 w-full block text-center">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-3xl p-8">
            <h1 className="font-display text-2xl font-bold text-night dark:text-beige mb-1">Mot de passe oublié</h1>
            <p className="text-sm text-gray-400 dark:text-beige/40 mb-6">
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-night dark:text-beige mb-1.5">
                  <Mail size={13} className="inline mr-1" />Adresse email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm text-night dark:text-beige outline-none focus:border-gold transition-all"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gold text-night font-bold rounded-xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" /> : <Mail size={15} />}
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
