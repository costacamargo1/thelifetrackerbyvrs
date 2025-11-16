import React from 'react';
import { Cartao } from './types';
import { fmt, toNum, SUGESTOES_BANCOS } from '../../utils/helpers';

interface CartoesProps {
  cartoes: Cartao[];
  novoCartao: { nome: string; limite: string; diaVencimento: number; diaFechamento: number; };
  setNovoCartao: React.Dispatch<React.SetStateAction<{ nome: string; limite: string; diaVencimento: number; diaFechamento: number; }>>;
  adicionarCartao: (e: React.FormEvent) => void;
  sugestoesCartao: string[];
  setSugestoesCartao: React.Dispatch<React.SetStateAction<string[]>>;
  sugestaoAtivaIndex: number;
  setSugestaoAtivaIndex: React.Dispatch<React.SetStateAction<number>>;
  editingCardId: number | null;
  editCardDraft: Cartao | null;
  setEditCardDraft: React.Dispatch<React.SetStateAction<Cartao | null>>;
  startEditCard: (cartao: Cartao) => void;
  cancelEditCard: () => void;
  saveEditCard: () => void;
  deleteCard: (id: number) => void;
  getDadosCartao: (nome: string) => { bg: string; text: string; imagem: string | null };
}

const Cartoes: React.FC<CartoesProps> = ({
  cartoes,
  novoCartao,
  setNovoCartao,
  adicionarCartao,
  sugestoesCartao,
  setSugestoesCartao,
  sugestaoAtivaIndex,
  setSugestaoAtivaIndex,
  editingCardId,
  editCardDraft,
  setEditCardDraft,
  startEditCard,
  cancelEditCard,
  saveEditCard,
  deleteCard,
  getDadosCartao,
}) => {
  return (
    <section className="p-4 rounded-2xl glass-card space-y-4 animate-fadeInUp">
      <h2 className="text-lg font-medium">Cartões de Crédito</h2>
      <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={adicionarCartao}>
        <div className="relative">
          <label className="block text-xs opacity-70 mb-1">Nome</label>
          <input className="input-premium"
            value={novoCartao.nome}
            onChange={(e) => {
              const valor = e.target.value;
              setNovoCartao({ ...novoCartao, nome: valor.toUpperCase() });
              if (valor.trim()) {
                const sugestoes = SUGESTOES_BANCOS.filter(b => b.toLowerCase().startsWith(valor.toLowerCase()));
                setSugestoesCartao(sugestoes);
                setSugestaoAtivaIndex(sugestoes.length > 0 ? 0 : -1);
              } else {
                setSugestoesCartao([]);
              }
            }}
            onBlur={() => setTimeout(() => setSugestoesCartao([]), 150)}
            onKeyDown={(e) => {
              if (sugestoesCartao.length > 0) {
                if (e.key === 'ArrowDown') { e.preventDefault(); setSugestaoAtivaIndex(prev => (prev + 1) % sugestoesCartao.length); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setSugestaoAtivaIndex(prev => (prev - 1 + sugestoesCartao.length) % sugestoesCartao.length); }
                else if (e.key === 'Enter' || e.key === 'Tab') {
                  if (sugestaoAtivaIndex > -1) {
                    e.preventDefault();
                    if (sugestoesCartao[sugestaoAtivaIndex]) { setNovoCartao(c => ({ ...c, nome: sugestoesCartao[sugestaoAtivaIndex] ?? '' })); }
                    setSugestoesCartao([]);
                  }
                } else if (e.key === 'Escape') { setSugestoesCartao([]); }
              }
            }}
          />
          {sugestoesCartao.length > 0 && novoCartao.nome.trim() && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto dark:bg-slate-700 dark:border-slate-600">
              {sugestoesCartao.map((s, index) => <li key={s} className={`p-2 cursor-pointer ${sugestaoAtivaIndex === index ? 'bg-gray-200 dark:bg-slate-600' : 'hover:bg-gray-100 dark:hover:bg-slate-600'}`} onMouseDown={() => { setNovoCartao(c => ({ ...c, nome: s })); setSugestoesCartao([]); }}>{s}</li>)}
            </ul>
          )}
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs opacity-70 mb-1">Limite (R$)</label>
          <input type="number" step="0.01" min="0" className="input-premium" value={novoCartao.limite} onChange={(e) => setNovoCartao({ ...novoCartao, limite: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs opacity-70 mb-1">Dia de vencimento</label>
          <input type="number" min="1" max="28" className="input-premium" value={novoCartao.diaVencimento || ''} onChange={(e) => setNovoCartao({ ...novoCartao, diaVencimento: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs opacity-70 mb-1">Dia de fechamento</label>
          <input type="number" min="1" max="31" className="input-premium" value={novoCartao.diaFechamento || ''} onChange={(e) => setNovoCartao({ ...novoCartao, diaFechamento: Number(e.target.value) })} />
        </div>
        <div>
          <button className="w-[100px] px-3 py-3 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors">Adicionar</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cartoes.length === 0 ? (
          <p className="text-sm opacity-60">Nenhum cartão</p>
        ) : cartoes.map(c => {
          const dadosCartao = getDadosCartao(c.nome);
          const isEditing = editingCardId === c.id;
          if (isEditing && editCardDraft) {
            return (
              <div key={c.id} className="p-4 rounded-2xl border-2 border-blue-400 bg-white dark:bg-slate-800 space-y-3 animate-fadeInUp">
                <div className="relative">
                  <label className="block text-xs opacity-70 mb-1">Nome</label>
                  <input className="input-premium" value={editCardDraft.nome} onChange={(e) => setEditCardDraft({ ...editCardDraft, nome: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-xs opacity-70 mb-1">Limite (R$)</label>
                  <input type="number" step="0.01" min="0" className="input-premium" value={editCardDraft.limite} onChange={(e) => setEditCardDraft({ ...editCardDraft, limite: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs opacity-70 mb-1">Dia de vencimento</label>
                    <input type="number" min="1" max="28" className="input-premium" value={editCardDraft.diaVencimento || ''} onChange={(e) => setEditCardDraft({ ...editCardDraft, diaVencimento: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs opacity-70 mb-1">Dia de fechamento</label>
                    <input type="number" min="1" max="31" className="input-premium" value={editCardDraft.diaFechamento || ''} onChange={(e) => setEditCardDraft({ ...editCardDraft, diaFechamento: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveEditCard} className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow dark:bg-emerald-600 dark:hover:bg-emerald-700">Salvar</button>
                  <button type="button" onClick={cancelEditCard} className="px-3 py-2 rounded-lg bg-gray-200 text-sm dark:bg-slate-600">Cancelar</button>
                </div>
              </div>
            );
          }
          return (
            <div key={c.id} className="p-4 rounded-2xl flex flex-col glass-card glass-card-hover animate-fadeInUp" style={{ animationDelay: `${cartoes.findIndex(card => card.id === c.id) * 50}ms` }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {dadosCartao.imagem && <img src={dadosCartao.imagem} alt={c.nome} className="w-12 h-8 object-contain rounded-md" />}
                  <h3 className="font-semibold text-base">{c.nome}</h3>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="opacity-70">Limite:</span>
                    <span className="font-medium">{fmt(toNum(c.limite))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Fecha dia:</span>
                    <span className="font-medium">{c.diaFechamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Vence dia:</span>
                    <span className="font-medium">{c.diaVencimento}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => startEditCard(c)} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                  Editar
                </button>
                <button type="button" onClick={() => deleteCard(c.id)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 transition dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
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

export default Cartoes;