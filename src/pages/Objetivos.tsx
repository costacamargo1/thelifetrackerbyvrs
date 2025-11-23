import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Goal, Minus, Star } from 'lucide-react';
import { Objetivo } from './types';
import { fmt, toNum } from '../../utils/helpers';
import { useObjetivos } from '../hooks/useObjetivos';
import { toast } from 'sonner';

interface ObjetivosProps {
  openModal: (type: 'objetivo', item?: Objetivo) => void;
}

const Objetivos: React.FC<ObjetivosProps> = ({ openModal }) => {
  const { objetivos, loading, error, deleteObjetivo, updateObjetivo } = useObjetivos();
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});

  if (loading) return <div>Carregando objetivos...</div>;
  if (error) return <div>Ocorreu um erro: {error.message}</div>;

  const handleManualAmountChange = (id: string, value: string) => {
    setManualAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateValor = async (id: string, amount: number) => {
    const objetivo = objetivos.find(o => o.id === id);
    if (!objetivo) return;

    const novoValor = objetivo.valor_atual + amount;
    const valorTotal = objetivo.valor_total;
    const valorAtual = Math.max(0, Math.min(novoValor, valorTotal));
    
    try {
      await updateObjetivo(id, { valor_atual: valorAtual });
      toast.success('Valor do objetivo atualizado!');
      setManualAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      toast.error('Erro ao atualizar valor.');
    }
  };

  const handleSetPrincipal = async (id: string) => {
    const currentPrincipal = objetivos.find(o => (o as any).isPrincipal); // Assuming isPrincipal exists
    
    try {
      const promises = [];
      if (currentPrincipal && currentPrincipal.id !== id) {
        promises.push(updateObjetivo(currentPrincipal.id, { is_principal: false } as any));
      }
      promises.push(updateObjetivo(id, { is_principal: true } as any));
      await Promise.all(promises);
      toast.success('Objetivo principal definido!');
    } catch (err) {
      toast.error('Erro ao definir objetivo principal.');
    }
  };

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Objetivos</h2>
        <button 
          onClick={() => openModal('objetivo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Objetivo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objetivos.length === 0 ? (
          <div className="col-span-full text-center py-12 px-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Goal size={40} className="mx-auto text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-4">Nenhum objetivo definido</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Crie seu primeiro objetivo para começar a economizar!</p>
          </div>
        ) : objetivos.map((o, index) => {
          const necessario = o.valor_total;
          const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valor_atual / necessario) * 100)) : 0;
          const quitado = o.status.startsWith('QUITADO');
          const progresso = quitado ? 100 : progressoBase;
          const isPrincipal = (o as any).is_principal;
          
          return (
            <div key={o.id} className={`p-6 rounded-2xl border flex flex-col ${isPrincipal ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm'} ${quitado ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-800 dark:border-slate-700/60'} animate-fadeInUp hover:shadow-xl transition-all duration-300`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {isPrincipal && <Star size={18} className="text-yellow-400 fill-current" />}
                  {o.titulo}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  o.status === 'IMEDIATO' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                  quitado ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}>{o.status.replace(' - ', ' ').toLowerCase()}</span>
              </div>
              
              <div className="flex-grow my-6 text-center">
                <div className="inline-block relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className={quitado ? "text-emerald-200 dark:text-emerald-900/50" : "text-slate-200 dark:text-slate-700"} />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - (progresso / 100))} className={quitado ? "text-emerald-500" : "text-blue-600"} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${quitado ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>{progresso}%</span>
                    </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(o.valor_atual)}</span> de <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(necessario)}</span>
                </p>
                {necessario > o.valor_atual && !quitado && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faltam {fmt(necessario - o.valor_atual)}</p>
                )}
              </div>

              {!quitado && (
                <div className="space-y-3 my-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleUpdateValor(o.id, 50)} className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors">+ R$ 50</button>
                    <button onClick={() => handleUpdateValor(o.id, 100)} className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors">+ R$ 100</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Valor" 
                      value={manualAmounts[o.id] || ''}
                      onChange={(e) => handleManualAmountChange(o.id, e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button onClick={() => handleUpdateValor(o.id, toNum(manualAmounts[o.id] || '0'))} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><Plus size={16} /></button>
                    <button onClick={() => handleUpdateValor(o.id, -toNum(manualAmounts[o.id] || '0'))} className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"><Minus size={16} /></button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`principal-${o.id}`} 
                    checked={isPrincipal || false} 
                    onChange={() => handleSetPrincipal(o.id)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700"
                  />
                  <label htmlFor={`principal-${o.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">Principal</label>
                </div>
                <div className="flex-grow" />
                <button
                  type="button"
                  onClick={() => openModal('objetivo', o)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja remover este objetivo?')) {
                      deleteObjetivo(o.id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-colors duration-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Objetivos;
