'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6)       { toast.error('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      // For now, registration redirects to login — full implementation requires backend
      toast.success('Compte créé ! Connectez-vous maintenant.');
      router.push('/auth/login');
    } catch {
      toast.error('Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const ic = 'w-full pl-11 pr-4 py-3.5 bg-white dark:bg-night-50 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-night dark:text-beige outline-none focus:border-gold transition-all placeholder:text-gray-300 dark:placeholder:text-beige/25';

  return (
    <div className="min-h-screen bg-white dark:bg-night flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-beige/50 hover:text-gold mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>

        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-night dark:text-beige">Créer un compte</h1>
            <p className="text-sm text-gray-400 dark:text-beige/40 mt-1">Rejoignez la communauté Bangui est Doux</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-beige/30" />
              <input value={form.name} onChange={set('name')} placeholder="Nom complet" required className={ic} />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-beige/30" />
              <input type="email" value={form.email} onChange={set('email')} placeholder="Email" required className={ic} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-beige/30" />
              <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                placeholder="Mot de passe (6 car. min.)" required className={`${ic} pr-11`} />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-beige/30" />
              <input type={show ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                placeholder="Confirmer le mot de passe" required className={ic} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gold text-night font-bold rounded-xl hover:bg-gold/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2">
              {loading && <span className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />}
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 dark:text-beige/40 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-gold font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
