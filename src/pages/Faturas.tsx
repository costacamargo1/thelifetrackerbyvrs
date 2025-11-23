import React, { useState } from 'react';
import { useCartoes } from '../hooks/useCartoes';
import { useFaturas, useFaturaTransacoes } from '../hooks/useFaturas';
import { fmt } from '../../utils/helpers';
import CardIcon from '../components/CardIcon';
import { Fatura } from './types';

const Faturas: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

  const { cartoes, loading: cartoesLoading, error: cartoesError } = useCartoes();
  const { faturas, loading: faturasLoading, error: faturasError } = useFaturas(selectedCardId || undefined);
  const { transacoes, loading: transacoesLoading, error: transacoesError } = useFaturaTransacoes(selectedFatura?.id || undefined);

  // Define a default card selection
  useState(() => {
    if (cartoes.length > 0 && !selectedCardId) {
      setSelectedCardId(cartoes[0].id);
    }
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCardId(e.target.value);
    setSelectedFatura(null); // Reset fatura selection
  };
  
  const totalFaturas = faturas.reduce((acc, f) => acc + f.valor_total, 0);

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Faturas dos Cartões</h2>
        {cartoesLoading ? <p>Carregando cartões...</p> : (
            <select 
                onChange={handleCardChange} 
                value={selectedCardId || ''}
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
            <option value="" disabled>Selecione um cartão</option>
            {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        )}
      </div>

      {cartoesError && <p className="text-red-500">Erro ao carregar cartões.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Faturas */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Faturas</h3>
            {faturasLoading && <p>Carregando faturas...</p>}
            {faturasError && <p className="text-red-500">Erro ao carregar faturas.</p>}
            <div className="space-y-2">
                {faturas.map(f => (
                    <div 
                        key={f.id} 
                        onClick={() => setSelectedFatura(f)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedFatura?.id === f.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium">
                                {new Date(f.ano, f.mes -1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                            <span className={`font-bold ${f.paga ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(f.valor_total)}</span>
                        </div>
                         {f.paga && <span className="text-xs text-emerald-600">Fatura Paga</span>}
                    </div>
                ))}
            </div>
             <div className="mt-4 border-t dark:border-slate-700 pt-2 text-right">
                <span className="font-semibold">Total: {fmt(totalFaturas)}</span>
            </div>
        </div>

        {/* Coluna de Lançamentos */}
        <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Lançamentos da Fatura</h3>
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 min-h-[400px]">
                {transacoesLoading && <p>Carregando lançamentos...</p>}
                {transacoesError && <p className="text-red-500">Erro ao carregar lançamentos.</p>}
                {!selectedFatura && <div className="text-center pt-10 text-slate-500">Selecione uma fatura para ver os detalhes.</div>}
                
                {selectedFatura && transacoes.length > 0 && (
                    <div className="space-y-2">
                    {transacoes.map(t => (
                        <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <div>
                                <div className="truncate max-w-[200px] sm:max-w-xs">{t.descricao}</div>
                                <div className="text-xs opacity-60">
                                    {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    {t.parcelas > 1 && ` (Parc. ${t.parcela_atual}/${t.parcelas})`}
                                </div>
                            </div>
                            <div className="font-medium whitespace-nowrap">{fmt(t.valor)}</div>
                        </div>
                    ))}
                     </div>
                )}

                 {selectedFatura && !transacoesLoading && transacoes.length === 0 && (
                     <div className="text-center pt-10 text-slate-500">Nenhum lançamento para esta fatura.</div>
                 )}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Faturas;
