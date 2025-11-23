import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Gasto, Categoria } from './types';
import { fmt } from '../../utils/helpers';
import { IconComponent } from '../components/CategoryIcon';
import { useGastos } from '../hooks/useGastos';

interface GastosProps {
  categorias: Categoria[];
  openModal: (type: 'gasto', item?: Gasto) => void;
}

const Gastos: React.FC<GastosProps> = ({
  categorias,
  openModal,
}) => {
  const { gastos, loading, error, deleteGasto } = useGastos();

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Gastos</h2>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors" disabled>
            <Plus size={20} />
            Novo Gasto
          </button>
        </div>
        <div>Carregando gastos...</div>
      </section>
    );
  }

  if (error) {
    return <div>Ocorreu um erro ao carregar os gastos: {error.message}</div>
  }

  const parcelamentosAtivos = gastos.filter(g => g.parcelasTotal && g.parcelasTotal > 1);

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Gastos</h2>
        <button 
          onClick={() => openModal('gasto')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 gap-y-8">
        {/* Coluna de Últimos Gastos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Últimos gastos</h3>
          {gastos.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum gasto registrado</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Comece adicionando um novo gasto para ver seus registros aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gastos.map((g, index) => {
                const category = categorias.find(c => c.nome === g.categoria);
                const iconName = category?.icone || 'QuestionMarkCircleIcon';
                const cartaoNome = g.cartaoNome || '';

                return (<div key={g.id} className="p-4 rounded-2xl border bg-white hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700/60 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700/80">
                        <IconComponent iconName={iconName} className="w-6 h-6 text-slate-500 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-slate-800 dark:text-slate-100 truncate">{g.descricao}</span>
                          {g.parcelasTotal && g.parcelasTotal > 1 && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex-shrink-0 dark:bg-blue-500/10 dark:text-blue-400 font-medium">
                              {g.parcelaAtual}/{g.parcelasTotal}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{new Date(g.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="capitalize">{g.categoria?.toLowerCase()}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>{g.metodo_pagamento}{cartaoNome && ` - ${cartaoNome}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          - {fmt(g.valor)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal('gasto', g)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja remover este gasto?')) {
                              deleteGasto(g.id);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>)
              })}
            </div>
          )}
        </div>

        {/* Coluna de Parcelamentos Ativos */}
        <div className="space-y-4 lg:pl-8 lg:border-l lg:border-slate-200 lg:dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Parcelamentos Ativos</h3>
          {parcelamentosAtivos.length > 0 ? (
            <div className="space-y-3">
              {parcelamentosAtivos.map((g) => {
                const remainingMonths = (g.parcelasTotal || 0) - (g.parcelaAtual || 0);
                const endDate = new Date(g.data);
                endDate.setMonth(endDate.getMonth() + remainingMonths);
                const endDateFormatted = endDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                return (
                  <div key={`parcela-${g.id}`} className="px-4 py-3 rounded-2xl border bg-white hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700/60">
                    <div className="grid grid-cols-4 items-center gap-4 text-sm">
                      <div className="col-span-2 font-semibold text-slate-800 dark:text-slate-100 truncate" title={g.descricao}>
                        {g.descricao}
                      </div>
                      <div className="text-center">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-500/10 dark:text-blue-400 font-medium">
                          {g.parcelaAtual}/{g.parcelasTotal}
                        </span>
                      </div>
                      <div className="text-right font-medium text-slate-700 dark:text-slate-200">
                        {fmt(g.valor)}
                      </div>
                      <div className="col-span-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Finaliza em: <span className="font-medium">{endDateFormatted}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum parcelamento ativo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Gastos com parcelas aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gastos;