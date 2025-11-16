import React from 'react';
import { Objetivo, StatusObj } from './types';
import { fmt, toNum } from '../../utils/helpers';

interface ObjetivosProps {
  objetivos: Objetivo[];
  novoObjetivo: Objetivo;
  setNovoObjetivo: React.Dispatch<React.SetStateAction<Objetivo>>;
  adicionarObjetivo: (e: React.FormEvent) => void;
  alterarStatusObjetivo: (id: number, status: StatusObj) => void;
  atualizarObjetivoValor: (id: number, delta: number) => void;
  removerObjetivo: (id: number) => void;
  valorAdicionarObjetivo: Record<number, string>;
  setValorAdicionarObjetivo: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  adicionarValorObjetivo: (id: number) => void;
  retirarValorObjetivo: (id: number) => void;
}

const Objetivos: React.FC<ObjetivosProps> = ({
  objetivos,
  novoObjetivo,
  setNovoObjetivo,
  adicionarObjetivo,
  alterarStatusObjetivo,
  atualizarObjetivoValor,
  removerObjetivo,
  valorAdicionarObjetivo,
  setValorAdicionarObjetivo,
  adicionarValorObjetivo,
  retirarValorObjetivo,
}) => {
  return (
    <section className="p-4 rounded-2xl glass-card space-y-4 animate-fadeInUp">
      <h2 className="text-lg font-medium">Objetivos</h2>
      <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        onSubmit={adicionarObjetivo}>
        <div className="md:col-span-2">
          <label className="text-xs opacity-70">Nome</label>
          <input className="input-premium"
            value={novoObjetivo.nome}
            onChange={(e) => setNovoObjetivo({ ...novoObjetivo, nome: e.target.value })} />
        </div>
        <div>
          <label className="text-xs opacity-70">Valor necessário (R$)</label>
          <input type="number" step="0.01" min="0" className="input-premium"
            value={String(novoObjetivo.valorNecessario || '')}
            onChange={(e) => setNovoObjetivo({ ...novoObjetivo, valorNecessario: e.target.valueAsNumber > 0 ? e.target.value : '' })} />
        </div>
        <div>
          <label className="text-xs opacity-70">Status</label>
          <select className="input-premium"
            value={novoObjetivo.status}
            onChange={(e) => setNovoObjetivo({ ...novoObjetivo, status: e.target.value as StatusObj })}>
            <option>IMEDIATO</option>
            <option>EM PROGRESSO</option>
            <option>DISTANTE</option>
            <option>QUITADO - EM PROGRESSO</option>
            <option>QUITADO - FINALIZADO</option>
          </select>
        </div>
        <div>
          <button className="w-[100px] px-3 py-3 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow dark:bg-emerald-600 dark:hover:bg-emerald-700">Adicionar</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objetivos.length === 0 ? (
          <p className="text-sm opacity-60">Sem objetivos</p>
        ) : objetivos.map((o, index) => {
          const necessario = toNum(o.valorNecessario);
          const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valorAtual / necessario) * 100)) : 0;
          const progresso = (o.status === 'QUITADO - EM PROGRESSO' || o.status === 'QUITADO - FINALIZADO') ? 100 : progressoBase;
          const quitado = o.status.startsWith('QUITADO');
          return (
            <div key={o.id} className={`p-4 rounded-xl border ${quitado ? 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-700' : 'bg-white dark:bg-slate-800 dark:border-slate-700'} animate-fadeInUp space-y-3`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="font-medium text-base">{o.nome}</div>
                <select
                  value={o.status}
                  onChange={(e) => alterarStatusObjetivo(o.id, e.target.value as StatusObj)}
                  className={`text-xs p-1 rounded border-none outline-none ${quitado ? 'bg-green-200 text-green-800' : 'bg-gray-200 dark:bg-slate-600'}`}
                >
                  <option>IMEDIATO</option>
                  <option>EM PROGRESSO</option>
                  <option>DISTANTE</option>
                  <option>QUITADO - EM PROGRESSO</option>
                  <option>QUITADO - FINALIZADO</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <div>{fmt(o.valorAtual)} / <span className="opacity-70">{fmt(necessario)}</span></div>
                  <div className="font-semibold">{progresso}%</div>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-slate-600 rounded-full mt-1">
                  <div className={`h-2.5 rounded-full ${quitado ? 'bg-green-500' : 'bg-emerald-500'}`} style={{ width: `${progresso}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-700">
                <input
                  type="number"
                  placeholder="Valor"
                  className="input-premium p-1.5 text-sm w-24"
                  value={valorAdicionarObjetivo[o.id] || ''}
                  onChange={(e) => setValorAdicionarObjetivo(prev => ({ ...prev, [o.id]: e.target.value }))}
                />
                <button onClick={() => adicionarValorObjetivo(o.id)} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 transition dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">
                  Adicionar
                </button>
                <button onClick={() => retirarValorObjetivo(o.id)} className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800 hover:bg-orange-200 transition dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900">
                  Retirar
                </button>
                <button onClick={() => atualizarObjetivoValor(o.id, 50)} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                  +50
                </button>
                <button onClick={() => atualizarObjetivoValor(o.id, 100)} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                  +100
                </button>
                <div className="flex-grow" />
                <button onClick={() => removerObjetivo(o.id)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 transition dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                  Excluir
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