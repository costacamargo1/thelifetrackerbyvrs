// src/components/AuthModal.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Github,
  Apple,
  Chrome,
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'login', label: 'Entrar' },
  { id: 'signup', label: 'Cadastrar' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    authLoading,
    authError,
  } = useAuth();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/painel');
    }
  }, [user, navigate]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(name, email, password);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleChangeTab = (tab: TabId) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md px-4">
        {/* Card */}
        <div className="glass-card glass-card-hover rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                LifeTracker
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-50">
                Acesse sua conta
              </h2>
              <p className="text-xs text-slate-400">
                Organize seu presente, projete seu futuro.
              </p>
            </div>
            <button
              onClick={closeAuthModal}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-400 transition hover:border-slate-500 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex rounded-xl bg-slate-800/80 p-1 text-xs font-medium text-slate-400">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleChangeTab(tab.id)}
                  className={`flex-1 rounded-lg py-1.5 transition ${
                    active
                      ? 'bg-slate-950 text-slate-50 shadow-sm'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Social login */}
          <div className="mb-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => signInWithProvider('google')}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-emerald-500/70 hover:text-emerald-300"
            >
              <Chrome className="h-4 w-4" />
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={() => signInWithProvider('github')}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-emerald-500/70 hover:text-emerald-300"
            >
              <Github className="h-4 w-4" />
              <span>Continuar com GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signInWithProvider('apple')}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-emerald-500/70 hover:text-emerald-300"
            >
              <Apple className="h-4 w-4" />
              <span>Continuar com Apple</span>
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-700/80" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
              ou com e-mail
            </span>
            <div className="h-px flex-1 bg-slate-700/80" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === 'signup' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">
                  Nome
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm focus-within:border-emerald-500/80">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                E-mail
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm focus-within:border-emerald-500/80">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
                  placeholder="voce@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Senha
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm focus-within:border-emerald-500/80">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="mt-1 flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading
                ? 'Processando...'
                : activeTab === 'login'
                ? 'Entrar'
                : 'Criar conta'}
            </button>

            {activeTab === 'login' && (
              <p className="pt-1 text-center text-[11px] text-slate-500">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => handleChangeTab('signup')}
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Cadastre-se
                </button>
              </p>
            )}

            {activeTab === 'signup' && (
              <p className="pt-1 text-center text-[11px] text-slate-500">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => handleChangeTab('login')}
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Entrar
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
