import React from 'react';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';
import { Cartao, Gasto } from './types';
import CreditCardVisual from '../components/CreditCardVisual';
import { fmt, toNum } from '../../utils/helpers';

interface CartoesProps {
  cartoes: Cartao[];
  gastos: Gasto[];
  gastosNoPeriodo: { [cardId: number]: number }; // New prop
  openModal: (type: 'cartao', item?: Cartao) => void;
  onDelete: (id: number) => void;
  onSetPrincipal: (id: number) => void;
}

const Cartoes: React.FC<CartoesProps> = ({
  cartoes,
  // Remove `gastos` from destructuring as it's no longer directly used for `gastosDoCartao` calculation here
  gastosNoPeriodo, // Use the new prop
  openModal,
  onDelete,
  onSetPrincipal,
}) => {
  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Cartões</h2>
        <button 
          onClick={() => openModal('cartao')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cartoes.length === 0 ? (
          <div className="col-span-full text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum cartão cadastrado</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Adicione um novo cartão de crédito para começar.</p>
          </div>
        ) : cartoes.map((c, index) => {
            // Use the pre-calculated value from gastosNoPeriodo
            const gastosDoCartao = gastosNoPeriodo[c.id] || 0;
            const limiteNum = toNum(c.limite);
            const disponivel = limiteNum - gastosDoCartao;
            const disponivelPercent = limiteNum > 0 ? Math.max(0, Math.min(100, (disponivel / limiteNum) * 100)) : 0;
            const gastoPercent = limiteNum > 0 ? Math.max(0, Math.min(100, (gastosDoCartao / limiteNum) * 100)) : 0;

            return (
              <div key={c.id} className="space-y-4 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="relative">
                  <CreditCardVisual {...c} gastos={gastosDoCartao} />
                  {c.isPrincipal && (
                    <div className="absolute top-3 right-3 bg-yellow-400 p-1.5 rounded-full shadow-lg">
                      <Star size={16} className="text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Limite total</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">{fmt(limiteNum)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gasto no período</p>
                      <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">{fmt(gastosDoCartao)}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Disponível ({disponivelPercent.toFixed(0)}%)</span>
                      <span>{fmt(disponivel)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-700"
                        style={{ width: `${gastoPercent}%` }}
                        title={`Gasto ${gastoPercent.toFixed(0)}%`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id={`principal-card-${c.id}`}
                      checked={c.isPrincipal || false}
                      onChange={() => onSetPrincipal(c.id)}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700"
                    />
                    <label htmlFor={`principal-card-${c.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">Principal</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openModal('cartao', c)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja remover este cartão?')) {
                          onDelete(c.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
        })}
      </div>
    </section>
  );
};

export default Cartoes;
