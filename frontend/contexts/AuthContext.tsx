'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/utils';
import type { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => null,
  register: async () => false,
  logout: () => {},
  updateUser: () => {},
});

/* ─── Dev-mode demo admin (no backend needed) ──── */
const DEMO_ADMIN: User = {
  _id:       'demo-admin-001',
  name:      'Super Admin',
  email:     'admin@banguiestdoux.com',
  role:      'superadmin',
  token:     'demo-token',
  createdAt: new Date().toISOString(),
};
const DEMO_PASSWORD = 'Admin@2025!';

const isNetworkError = (err: unknown) => {
  const e = err as { code?: string; response?: unknown };
  return !e.response;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ─── Restore session on mount ──────────────────── */
  useEffect(() => {
    const savedUser  = storage.get('bed_user') as User | null;
    const savedToken = storage.get('bed_token') as string | null;

    if (savedUser && savedToken) {
      setUser(savedUser);
      authAPI.me()
        .then(({ data }) => setUser(data.data))
        .catch((err) => {
          /* Keep session alive when backend is unreachable */
          if (!isNetworkError(err)) {
            storage.remove('bed_user');
            storage.remove('bed_token');
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      const { data } = await authAPI.login({ email, password });
      const userData: User = data.data;
      storage.set('bed_token', userData.token);
      storage.set('bed_user', userData);
      setUser(userData);
      toast.success('Bienvenue !');
      return userData;
    } catch (err: unknown) {
      /* ── Dev fallback: allow demo credentials offline ── */
      if (isNetworkError(err) && process.env.NODE_ENV === 'development') {
        if (email === DEMO_ADMIN.email && password === DEMO_PASSWORD) {
          storage.set('bed_token', DEMO_ADMIN.token);
          storage.set('bed_user', DEMO_ADMIN);
          setUser(DEMO_ADMIN);
          toast.success('Bienvenue (mode démo) !');
          return DEMO_ADMIN;
        }
      }
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (isNetworkError(err) ? 'Serveur inaccessible – vérifiez que le backend est démarré' : 'Erreur de connexion');
      toast.error(msg);
      return null;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authAPI.register({ name, email, password });
      const userData: User = data.data;
      storage.set('bed_token', userData.token);
      storage.set('bed_user', userData);
      setUser(userData);
      toast.success('Compte créé !');
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      toast.error(msg);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    storage.remove('bed_token');
    storage.remove('bed_user');
    setUser(null);
    toast.success('Déconnecté');
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    storage.set('bed_user', u);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
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
