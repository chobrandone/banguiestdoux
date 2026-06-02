'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

/* ─── Types ──────────────────────────────────────── */
export interface AuthUser extends Profile {
  email: string;
  access_token: string;
}

interface AuthContextType {
  user:            AuthUser | null;
  session:         Session | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  isAdmin:         boolean;
  login:    (email: string, password: string) => Promise<AuthUser | null>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout:   () => Promise<void>;
  updateUser: (u: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, isLoading: true,
  isAuthenticated: false, isAdmin: false,
  login: async () => null,
  register: async () => false,
  logout: async () => {},
  updateUser: () => {},
});

/* ─── Helpers ────────────────────────────────────── */
async function fetchProfile(uid: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles').select('*').eq('id', uid).single();
  return data;
}

function buildAuthUser(sbUser: SupabaseUser, profile: Profile, token: string): AuthUser {
  return { ...profile, email: sbUser.email!, access_token: token };
}

/* ─── Provider ───────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [session,   setSession]   = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ─── Restore session on mount ──────────────────── */
  useEffect(() => {
    /* Get existing session */
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s) {
        const profile = await fetchProfile(s.user.id);
        if (profile) {
          setUser(buildAuthUser(s.user, profile, s.access_token));
          setSession(s);
        }
      }
      setIsLoading(false);
    });

    /* Listen for auth changes (login, logout, token refresh) */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (s) {
          const profile = await fetchProfile(s.user.id);
          if (profile) {
            setUser(buildAuthUser(s.user, profile, s.access_token));
          }
          setSession(s);
        } else {
          setUser(null);
          setSession(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* ─── Login ──────────────────────────────────────── */
  const login = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error('Identifiants incorrects');
        return null;
      }

      const profile = await fetchProfile(data.user.id);
      if (!profile?.is_active) {
        await supabase.auth.signOut();
        toast.error('Compte désactivé');
        return null;
      }

      const authUser = buildAuthUser(data.user, profile!, data.session.access_token);
      setUser(authUser);
      setSession(data.session);
      toast.success('Bienvenue !');
      return authUser;
    } catch {
      toast.error('Erreur de connexion');
      return null;
    }
  }, []);

  /* ─── Register ───────────────────────────────────── */
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        toast.error(error.message.includes('already')
          ? 'Email déjà utilisé'
          : error.message);
        return false;
      }

      /* If email confirmation is disabled, session is returned immediately */
      if (data.session) {
        const profile = await fetchProfile(data.user!.id);
        if (profile) {
          setUser(buildAuthUser(data.user!, profile, data.session.access_token));
          setSession(data.session);
        }
        toast.success('Compte créé !');
      } else {
        toast.success('Vérifiez votre email pour confirmer votre compte.');
      }
      return true;
    } catch {
      toast.error('Erreur lors de la création du compte');
      return false;
    }
  }, []);

  /* ─── Logout ─────────────────────────────────────── */
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.success('Déconnecté');
  }, []);

  /* ─── Update local user state ────────────────────── */
  const updateUser = useCallback((u: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...u } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
