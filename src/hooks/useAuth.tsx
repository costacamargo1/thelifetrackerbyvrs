// src/hooks/useAuth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../auth/supabaseClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authLoading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  signInWithProvider: (
    provider: 'google' | 'github' | 'apple'
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  };

  // LOGIN EMAIL
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message ?? 'Erro ao entrar');
    } finally {
      setAuthLoading(false);
    }
  };

  // CADASTRO EMAIL
  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/painel`,
        },
      });

      if (error) throw error;

      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message ?? 'Erro ao cadastrar');
    } finally {
      setAuthLoading(false);
    }
  };

  // LOGIN SOCIAL
  const signInWithProvider = async (
    provider: 'google' | 'github' | 'apple'
  ) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/painel`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message ?? 'Erro no login social');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    authLoading,
    authError,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
