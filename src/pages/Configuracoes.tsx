import React from 'react';
import CategoryManager from '../components/CategoryManager';
import { useConfiguracoes } from '../hooks/useConfiguracoes';

const Configuracoes: React.FC = () => {
  const { configuracoes, updateConfiguracoes, loading } = useConfiguracoes();

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <section className="space-y-8 animate-fadeInUp">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personalize a aparência e o comportamento do seu LifeTracker.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna de Configurações Gerais */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700/60 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Geral</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tema</label>
              <select
                id="theme"
                value={configuracoes?.tema || 'light'}
                onChange={(e) => updateConfiguracoes({ tema: e.target.value as 'light' | 'dark' })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Moeda</label>
              <select
                id="currency"
                value={configuracoes?.moeda || 'BRL'}
                onChange={(e) => updateConfiguracoes({ moeda: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coluna de Gerenciamento de Categorias */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700/60 shadow-sm">
          <CategoryManager />
        </div>
      </div>
    </section>
  );
};

export default Configuracoes;