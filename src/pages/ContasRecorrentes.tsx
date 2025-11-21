import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Assinatura } from './types';
import { fmt, toNum } from '../../utils/helpers';

interface ContasRecorrentesProps {
  assinaturas: Assinatura[];
  openModal: (type: 'assinatura', item?: Assinatura) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

const ContasRecorrentes: React.FC<ContasRecorrentesProps> = ({
  assinaturas,
  openModal,
  onDelete,
  onToggle,
}) => {
  const totalAnual = assinaturas.reduce((acc, a) => {
    const valor = toNum(a.valor);
    return acc + (a.periodoCobranca === 'MENSAL' ? valor * 12 : valor);
  }, 0);

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Contas Recorrentes</h2>
        <button 
          onClick={() => openModal('assinatura')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">
        Insira suas contas fixas mensais ou anuais, como <strong>internet</strong>, <strong>assinaturas de streaming</strong> ou <strong>aluguel</strong>.
      </p>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Lista de Contas</h3>
        {assinaturas.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhuma conta recorrente registrada</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Adicione suas contas para vê-las aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assinaturas.slice().sort((a,b) => a.diaCobranca - b.diaCobranca).map((a, index) => (
              <div key={a.id} className="p-4 rounded-2xl border bg-white hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700/60 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-base text-slate-800 dark:text-slate-100">{a.nome}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span>Vence dia {a.diaCobranca}{a.periodoCobranca === 'ANUAL' ? `/${a.mesCobranca}` : ''}</span>
                      <span className="mx-2">•</span>
                      <span>{a.tipoPagamento}{a.cartaoNome && ` - ${a.cartaoNome}`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {fmt(toNum(a.valor))}
                    </div>
                    {a.tipo === 'ACORDO' && (
                      <div className="text-xs text-slate-500">
                        Parcela {a.parcelaAtual || 1} de {a.parcelasTotal || 1}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    {a.pagoEsteMes ? (
                      <button onClick={() => onToggle(a.id)} className="text-xs font-medium flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Pago
                      </button>
                    ) : (
                      <button onClick={() => onToggle(a.id)} className="text-xs font-medium px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Marcar como Pago
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openModal('assinatura', a)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja remover esta conta recorrente?')) {
                          onDelete(a.id);
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
            ))}
          </div>
        )}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-semibold text-right text-slate-700 dark:text-slate-300">
            Valor Total Anual de Contas Recorrentes: <span className="text-blue-600 dark:text-blue-400">{fmt(totalAnual)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContasRecorrentes;