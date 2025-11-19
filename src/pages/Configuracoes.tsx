import React, { useState } from 'react';
import { Category, Configuracoes as ConfiguracoesType } from './types';
import CategoryManager from '../components/CategoryManager';

interface ConfiguracoesProps {
  configuracoes: ConfiguracoesType;
  setConfiguracoes: React.Dispatch<React.SetStateAction<ConfiguracoesType>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const Configuracoes: React.FC<ConfiguracoesProps> = ({
  configuracoes,
  setConfiguracoes,
  categories,
  setCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'categorias'>('geral');

  return (
    <section className="p-4 rounded-2xl glass-card space-y-6 animate-fadeInUp">
      <h2 className="text-lg font-medium">Configurações</h2>

      {/* Navegação das Abas */}
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('geral')}
            className={`${
              activeTab === 'geral'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`${
              activeTab === 'categorias'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Categorias
          </button>
        </nav>
      </div>

      {activeTab === 'geral' && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn" onSubmit={(e) => { e.preventDefault(); alert('Configurações salvas!'); }}>
          <div className="space-y-4">
            <h3 className="font-medium">Crédito</h3>
            <label className="block"><span className="text-xs opacity-70">Alerta (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.credito.alerta} onChange={(e) => setConfiguracoes({ ...configuracoes, credito: { ...configuracoes.credito, alerta: e.target.value } })} /></label>
            <label className="block"><span className="text-xs opacity-70">Crítico (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.credito.critico} onChange={(e) => setConfiguracoes({ ...configuracoes, credito: { ...configuracoes.credito, critico: e.target.value } })} /></label>
            <label className="block"><span className="text-xs opacity-70">Positivo (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.credito.positivo} onChange={(e) => setConfiguracoes({ ...configuracoes, credito: { ...configuracoes.credito, positivo: e.target.value } })} /></label>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Saldo</h3>
            <label className="block"><span className="text-xs opacity-70">Alerta (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.saldo.alerta} onChange={(e) => setConfiguracoes({ ...configuracoes, saldo: { ...configuracoes.saldo, alerta: e.target.value } })} /></label>
            <label className="block"><span className="text-xs opacity-70">Crítico (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.saldo.critico} onChange={(e) => setConfiguracoes({ ...configuracoes, saldo: { ...configuracoes.saldo, critico: e.target.value } })} /></label>
            <label className="block"><span className="text-xs opacity-70">Positivo (R$)</span><input type="number" min="0" className="input-premium" value={configuracoes.saldo.positivo} onChange={(e) => setConfiguracoes({ ...configuracoes, saldo: { ...configuracoes.saldo, positivo: e.target.value } })} /></label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow dark:bg-emerald-600 dark:hover:bg-emerald-700">Salvar Configurações</button>
          </div>
        </form>
      )}

      {activeTab === 'categorias' && (
        <div className="animate-fadeIn">
          <CategoryManager categories={categories} setCategories={setCategories} />
        </div>
      )}
    </section>
  );
};

export default Configuracoes;