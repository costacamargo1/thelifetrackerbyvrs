import React from 'react';
import { Gasto, Cartao, TipoPagamento, Category } from './types';
import { fmt, toNum, detectarCategoria, SUGESTOES_GLOBAIS, SUGESTOES_DESCRICAO, CATEGORIAS_GASTO, capitalize } from '../../utils/helpers';
import { IconComponent } from '../components/CategoryIcon';

interface GastosProps {
  gastos: Gasto[];
  categories: Category[];
  cartoes: Cartao[];
  editingGastoId: number | null;
  novoGasto: Gasto;
  setNovoGasto: React.Dispatch<React.SetStateAction<Gasto>>;
  sugestoesDescricao: string[];
  setSugestoesDescricao: React.Dispatch<React.SetStateAction<string[]>>;
  sugestaoDescricaoAtivaIndex: number;
  setSugestaoDescricaoAtivaIndex: React.Dispatch<React.SetStateAction<number>>;
  adicionarGasto: (e: React.FormEvent) => void;
  salvarEdicaoGasto: (e: React.FormEvent) => void;
  cancelarEdicaoGasto: () => void;
  iniciarEdicaoGasto: (gasto: Gasto) => void;
  removerGasto: (id: number) => void;
}

const Gastos: React.FC<GastosProps> = ({
  gastos,
  categories,
  cartoes,
  editingGastoId,
  novoGasto,
  setNovoGasto,
  sugestoesDescricao,
  setSugestoesDescricao,
  sugestaoDescricaoAtivaIndex,
  setSugestaoDescricaoAtivaIndex,
  adicionarGasto,
  salvarEdicaoGasto,
  cancelarEdicaoGasto,
  iniciarEdicaoGasto,
  removerGasto,
}) => {
  return (
    <section className="p-4 rounded-sm glass-card space-y-4 animate-fadeInUp">
      <h2 className="text-lg font-medium mb-2">{editingGastoId ? 'Alterar Gasto' : 'Lançar Gasto'}</h2>
      <form className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        onSubmit={editingGastoId ? salvarEdicaoGasto : adicionarGasto}
        key={`gasto-form-${editingGastoId || 'novo'}`}>
        <div className="md:col-span-4 relative">
          <label className="block text-xs opacity-70 mb-1">Descrição</label>
          <input
            className="input-premium"
            value={novoGasto.descricao}
            onChange={(e) => {
              const desc = e.target.value;
              const catAuto = detectarCategoria(desc);
              setNovoGasto({ ...novoGasto, descricao: desc, categoria: catAuto });

              if (desc.trim().length >= 2) {
                const filtradas = SUGESTOES_GLOBAIS
                  .filter(s => s.toLowerCase().includes(desc.toLowerCase()))
                  .slice(0, 8);
                setSugestoesDescricao(filtradas);
                setSugestaoDescricaoAtivaIndex(filtradas.length > 0 ? 0 : -1);
              } else {
                setSugestoesDescricao([]);
              }
            }}
            onBlur={() => setTimeout(() => setSugestoesDescricao([]), 200)}
            onKeyDown={(e) => {
              if (sugestoesDescricao.length > 0 && e.key !== 'Tab') {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSugestaoDescricaoAtivaIndex(prev => (prev + 1) % sugestoesDescricao.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSugestaoDescricaoAtivaIndex(prev => (prev - 1 + sugestoesDescricao.length) % sugestoesDescricao.length);
                } else if (e.key === 'Enter' && sugestaoDescricaoAtivaIndex > -1) {
                  e.preventDefault();
                  const sugestaoSelecionada = sugestoesDescricao[sugestaoDescricaoAtivaIndex];
                  if (sugestaoSelecionada) {
                    const catAuto = detectarCategoria(sugestaoSelecionada);
                    setNovoGasto({ ...novoGasto, descricao: sugestaoSelecionada, categoria: catAuto });
                    setSugestoesDescricao([]);
                  }
                } else if (e.key === 'Escape') {
                  setSugestoesDescricao([]);
                }
              }
            }}
            onFocus={() => {
              if (!novoGasto.descricao.trim() && sugestoesDescricao.length === 0) {
                const sugestoesCategoria = SUGESTOES_DESCRICAO[novoGasto.categoria] || [];
                setSugestoesDescricao(sugestoesCategoria.slice(0, 8));
                setSugestaoDescricaoAtivaIndex(0);
              }
            }}
            placeholder="Ex: Supermercado, Uber, Netflix..."
          />
          {sugestoesDescricao.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto dark:bg-slate-700 dark:border-slate-600">
              {sugestoesDescricao.map((s, index) => (
                <li
                  key={s}
                  className={`p-2 cursor-pointer text-sm ${sugestaoDescricaoAtivaIndex === index ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-400' : 'hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  onMouseDown={() => {
                    if (s) {
                      const catAuto = detectarCategoria(s);
                      setNovoGasto({ ...novoGasto, descricao: s, categoria: catAuto });
                      setSugestoesDescricao([]);
                    }
                  }}
                  onMouseEnter={() => setSugestaoDescricaoAtivaIndex(index)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Valor (R$)</label>
          <input
            type="number" step="0.01" min="0" className="input-premium w-full"
            value={novoGasto.valor}
            onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Pagamento</label>
          <select
            className="input-premium"
            value={novoGasto.tipoPagamento}
            onChange={(e) => {
              const tipo = e.target.value as TipoPagamento;
              setNovoGasto({ ...novoGasto, tipoPagamento: tipo, cartaoId: tipo === 'CRÉDITO' ? (novoGasto.cartaoId || cartoes[0]?.id || null) : null });
            }}
          >
            <option value="DÉBITO">DÉBITO (PIX/Dinheiro/à vista)</option>
            <option value="CRÉDITO">CRÉDITO (cartão)</option>
          </select>
        </div>
        {novoGasto.tipoPagamento === 'CRÉDITO' && (
          <div className="md:col-span-2">
            <label className="block text-xs opacity-70 mb-1">Cartão</label>
            <select
              required className="input-premium"
              value={novoGasto.cartaoId ?? ''}
              onChange={(e) => setNovoGasto({ ...novoGasto, cartaoId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione...</option>
              {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        )}
        {novoGasto.tipoPagamento === 'CRÉDITO' && (
          <div>
            <label className="block text-xs opacity-70 mb-1">Parcelas</label>
            <input
              type="number" min="1" max="24"
              disabled={!!editingGastoId}
              className="input-premium disabled:opacity-50"
              value={novoGasto.parcelasTotal || 1}
              onChange={(e) => setNovoGasto({ ...novoGasto, parcelasTotal: Number(e.target.value) || 1 })}
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Categoria</label>
          <select
            className="input-premium"
            value={novoGasto.categoria}
            onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
            {categories.filter(c => c.type === 'despesa').map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs opacity-70 mb-1">Data</label>
          <input
            type="date"
            className="input-premium"
            value={novoGasto.data}
            onChange={(e) => setNovoGasto({ ...novoGasto, data: e.target.value })}
          />
        </div>
        <div className="flex gap-2 items-center">
          <button className="w-[200px] px-4 py-2.5 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow
                                  dark:bg-emerald-600 dark:hover:bg-emerald-700">
            {editingGastoId ? 'Salvar' : 'Adicionar'}
          </button>
          {editingGastoId && (
            <button type="button" onClick={cancelarEdicaoGasto} className="px-3 py-2.5 rounded-lg bg-gray-200 text-sm dark:bg-slate-600">Cancelar</button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-sm font-medium mb-2">Últimos gastos</h3>
        {gastos.length === 0 ? (
          <p className="text-sm opacity-60">Sem lançamentos</p>
        ) : (
          <div className="space-y-2">
            {gastos.slice().reverse().map((g, index) => {
              const category = categories.find(c => c.name === g.categoria);
              const iconName = category?.icon || 'QuestionMarkCircleIcon';

              return (<div key={g.id} className="p-3 rounded-lg border bg-white hover:shadow-sm transition dark:bg-slate-800 dark:border-slate-700 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconComponent iconName={iconName} className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{g.descricao}</span>
                        {g.parcelasTotal && g.parcelasTotal > 1 && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex-shrink-0 dark:bg-blue-900 dark:text-blue-300">
                            {g.parcelaAtual}/{g.parcelasTotal}
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-60 mt-0.5 flex items-center gap-2 flex-wrap dark:text-gray-400">
                        <span>{new Date(g.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{g.categoria}</span>
                        <span>•</span>
                        <span>{g.tipoPagamento}{g.cartaoNome && ` - ${g.cartaoNome}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-semibold text-sm whitespace-nowrap">
                        {fmt(toNum(g.valor))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => iniciarEdicaoGasto(g)}
                        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja remover este gasto?')) {
                            removerGasto(g.id);
                          }
                        }}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 transition dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                        title="Excluir"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </section>
  );
};

export default Gastos;