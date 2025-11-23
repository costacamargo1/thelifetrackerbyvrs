import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Receita } from './types';
import { fmt } from '../../utils/helpers';
import { useReceitas } from '../hooks/useReceitas';

interface ReceitasProps {
  openModal: (type: 'receita', item?: Receita) => void;
}

const Receitas: React.FC<ReceitasProps> = ({
  openModal,
}) => {
  const { receitas, loading, error, deleteReceita } = useReceitas();

  if (loading) {
    return <div>Carregando receitas...</div>;
  }

  if (error) {
    return <div>Ocorreu um erro ao carregar as receitas: {error.message}</div>
  }

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Minhas Receitas</h2>
        <button 
          onClick={() => openModal('receita')}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Nova Receita
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Últimas receitas</h3>
        {receitas.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhuma receita registrada</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Comece adicionando uma nova receita para ver seus registros aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receitas.map((r, index) => (
              <div key={r.id} className="p-4 rounded-2xl border bg-white hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700/60 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-slate-800 dark:text-slate-100 truncate">{r.descricao}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="capitalize">{r.categoria?.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        + {fmt(r.valor)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openModal('receita', r)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja remover esta receita?')) {
                            deleteReceita(r.id);
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
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Receitas;