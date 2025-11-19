import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Receita } from './types';
import { fmt, toNum } from '../../utils/helpers';

interface ReceitasProps {
  receitas: Receita[];
  editingReceitaId: number | null;
  novaReceita: Receita;
  setNovaReceita: React.Dispatch<React.SetStateAction<Receita>>;
  adicionarReceita: (e: React.FormEvent) => void;
  salvarEdicaoReceita: (e: React.FormEvent) => void;
  cancelarEdicaoReceita: () => void;
  iniciarEdicaoReceita: (receita: Receita) => void;
  removerReceita: (id: number) => void;
}

const Receitas: React.FC<ReceitasProps> = ({
  receitas,
  editingReceitaId,
  novaReceita,
  setNovaReceita,
  adicionarReceita,
  salvarEdicaoReceita,
  cancelarEdicaoReceita,
  iniciarEdicaoReceita,
  removerReceita,
}) => {
  return (
    <section className="p-4 rounded-2xl glass-card space-y-4 animate-fadeInUp">
      <h2 className="text-lg font-medium mb-2">{editingReceitaId ? 'Alterar Receita' : 'Lançar Receita'}</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        onSubmit={editingReceitaId ? salvarEdicaoReceita : adicionarReceita}
        key={`receita-form-${editingReceitaId || 'novo'}`}
      >
        <div className="md:col-span-5">
          <label className="block text-xs opacity-70 mb-1">Descrição</label>
          <input
            className="input-premium"
            value={novaReceita.descricao}
            onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
            placeholder="Ex: Salário, Freelance"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Valor (R$)</label>
          <input type="number" step="0.01" min="0" className="input-premium"
            value={novaReceita.valor}
            onChange={(e) => setNovaReceita({ ...novaReceita, valor: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Data</label>
          <input type="date" className="input-premium"
            value={novaReceita.data}
            onChange={(e) => setNovaReceita({ ...novaReceita, data: e.target.value })} />
        </div>
        <div className="md:col-span-3 flex gap-2 items-center">
          <button className="w-[100px] px-4 py-3 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow
                                  dark:bg-emerald-600 dark:hover:bg-emerald-700">
            {editingReceitaId ? 'Salvar' : 'Adicionar'}
          </button>
          {editingReceitaId && (
            <button type="button" onClick={cancelarEdicaoReceita} className="px-3 py-3 rounded-lg bg-gray-200 text-sm dark:bg-slate-600">Cancelar</button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-sm font-medium mb-2">Últimas receitas</h3>
        {receitas.length === 0 ? (
          <p className="text-sm opacity-60">Sem lançamentos</p>
        ) : (
          <div className="space-y-2">
            {receitas.slice().reverse().map((r, index) => (
              <div key={r.id} className="p-3 rounded-lg border bg-white hover:shadow-sm transition dark:bg-slate-800 dark:border-slate-700 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{r.descricao}</div>
                    <div className="text-xs opacity-60 mt-0.5 dark:text-gray-400">
                      {new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-semibold text-sm whitespace-nowrap text-green-600 dark:text-green-400">
                        {fmt(toNum(r.valor))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => iniciarEdicaoReceita(r)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/50"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja remover esta receita?')) {
                            removerReceita(r.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900/50"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
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