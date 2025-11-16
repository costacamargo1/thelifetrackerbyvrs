import React from 'react';
import { Assinatura, Cartao, TipoAssinatura, Periodo, TipoPagamento } from './types';
import { fmt, toNum } from '../../utils/helpers';

interface ContasRecorrentesProps {
  assinaturas: Assinatura[];
  cartoes: Cartao[];
  editingAssinaturaId: number | null;
  novaAssinatura: Assinatura;
  setNovaAssinatura: React.Dispatch<React.SetStateAction<Assinatura>>;
  adicionarAssinatura: (e: React.FormEvent) => void;
  salvarEdicaoAssinatura: (e: React.FormEvent) => void;
  cancelarEdicaoAssinatura: () => void;
  iniciarEdicaoAssinatura: (assinatura: Assinatura) => void;
  removerAssinatura: (id: number) => void;
  pagarParcelaAcordo: (id: number) => void;
  totalAnualAssinaturas: number;
}

const ContasRecorrentes: React.FC<ContasRecorrentesProps> = ({
  assinaturas,
  cartoes,
  editingAssinaturaId,
  novaAssinatura,
  setNovaAssinatura,
  adicionarAssinatura,
  salvarEdicaoAssinatura,
  cancelarEdicaoAssinatura,
  iniciarEdicaoAssinatura,
  removerAssinatura,
  pagarParcelaAcordo,
  totalAnualAssinaturas,
}) => {
  return (
    <section className="p-4 rounded-2xl glass-card space-y-4 animate-fadeInUp">
      <h2 className="text-lg font-medium">{editingAssinaturaId ? 'Alterar Conta Recorrente' : 'Adicionar Conta Recorrente'}</h2>
      <p className="text-sm opacity-70 -mt-2 mb-2">Insira suas contas fixas mensais ou anuais, como <strong>internet</strong>, <strong>assinaturas de streaming</strong> ou <strong>aluguel</strong>.</p>
      <form
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        onSubmit={editingAssinaturaId ? salvarEdicaoAssinatura : adicionarAssinatura}
        key={`assinatura-form-${editingAssinaturaId || 'novo'}`}
      >
        <div className="md:col-span-4">
          <label className="text-xs opacity-70">Nome</label>
          <input className="input-premium"
            value={novaAssinatura.nome}
            onChange={(e) => setNovaAssinatura({ ...novaAssinatura, nome: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs opacity-70">Valor {novaAssinatura.tipo === 'ACORDO' ? 'Total' : ''} (R$)</label>
          <input type="number" step="0.01" min="0" className="input-premium"
            value={novaAssinatura.valor}
            onChange={(e) => setNovaAssinatura({ ...novaAssinatura, valor: e.target.value })} />
        </div>
        <div className="md:col-span-3 grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs opacity-70">Dia</label>
            <input type="number" min="1" max="31" className="input-premium"
              value={novaAssinatura.diaCobranca || ''}
              onChange={(e) => setNovaAssinatura({ ...novaAssinatura, diaCobranca: Number(e.target.value) })} />
          </div>
          {novaAssinatura.periodoCobranca === 'ANUAL' && (
            <div>
              <label className="text-xs opacity-70">Mês</label>
              <select className="input-premium"
                value={novaAssinatura.mesCobranca}
                onChange={(e) => setNovaAssinatura({ ...novaAssinatura, mesCobranca: Number(e.target.value || 1) })}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
          {novaAssinatura.periodoCobranca === 'ANUAL' && (
            <div>
              <label className="text-xs opacity-70">Ano Adesão</label>
              <input type="number" min="2000" max="2100" className="input-premium"
                value={novaAssinatura.anoAdesao || new Date().getFullYear()} onChange={(e) => setNovaAssinatura({ ...novaAssinatura, anoAdesao: Number(e.target.value) })} />
            </div>
          )}
        </div>
        <div className="md:col-span-3">
          <label className="text-xs opacity-70">Tipo</label>
          <select
            className="input-premium"
            value={novaAssinatura.tipo}
            onChange={(e) => setNovaAssinatura({ ...novaAssinatura, tipo: e.target.value as TipoAssinatura })}
          >
            <option value="ASSINATURA">Assinatura</option>
            <option value="CONTRATO - ALUGUEL">Contrato - Aluguel</option>
            <option value="CONTRATO - PERSONALIZADO">Contrato - Personalizado</option>
            <option value="ACORDO">Acordo</option>
          </select>
        </div>
        {novaAssinatura.tipo === 'CONTRATO - PERSONALIZADO' && (
          <div className="md:col-span-3">
            <label className="text-xs opacity-70">Categoria do contrato</label>
            <input className="input-premium"
              value={novaAssinatura.categoriaPersonalizada || ''}
              onChange={(e) => setNovaAssinatura({ ...novaAssinatura, categoriaPersonalizada: e.target.value })} />
          </div>
        )}
        {novaAssinatura.tipo === 'ACORDO' && (
          <div className="md:col-span-2">
            <label className="text-xs opacity-70">Número de parcelas</label>
            <input
              type="number" min="1" className="input-premium"
              value={novaAssinatura.parcelasTotal || 1}
              onChange={(e) => setNovaAssinatura({ ...novaAssinatura, parcelasTotal: parseInt(e.target.value) || 1, parcelaAtual: editingAssinaturaId ? novaAssinatura.parcelaAtual : 1 })}
              placeholder="ex: 3"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="text-xs opacity-70">Periodicidade</label>
          <select
            className="input-premium"
            value={novaAssinatura.periodoCobranca}
            onChange={(e) => setNovaAssinatura({ ...novaAssinatura, periodoCobranca: e.target.value as Periodo })}>
            <option value="MENSAL">MENSAL</option>
            <option value="ANUAL">ANUAL</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs opacity-70">Pagamento</label>
          <select
            className="input-premium"
            value={novaAssinatura.tipoPagamento}
            onChange={(e) => setNovaAssinatura({
              ...novaAssinatura,
              tipoPagamento: e.target.value as TipoPagamento,
              cartaoId: e.target.value === 'CRÉDITO' ? (novaAssinatura.cartaoId || cartoes[0]?.id || null) : null
            })}>
            <option value="DÉBITO">DÉBITO</option>
            <option value="CRÉDITO">CRÉDITO</option>
          </select>
        </div>
        {novaAssinatura.tipoPagamento === 'CRÉDITO' && (
          <div className="md:col-span-3">
            <label className="text-xs opacity-70">Cartão</label>
            <select className="input-premium"
              value={novaAssinatura.cartaoId ?? ''}
              onChange={(e) => setNovaAssinatura({ ...novaAssinatura, cartaoId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Selecione...</option>
              {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        )}
        <div className="md:col-span-2 flex gap-2">
          <button className="px-3 py-3 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white text-sm w-full font-medium shadow
                                  dark:bg-emerald-600 dark:hover:bg-emerald-700">
            {editingAssinaturaId ? 'Salvar' : 'Adicionar'}
          </button>
          {editingAssinaturaId && (<button type="button" onClick={cancelarEdicaoAssinatura} className="px-3 py-2 rounded-lg bg-gray-200 text-sm dark:bg-slate-600">Cancelar</button>)}
        </div>
      </form>

      <div>
        <h3 className="text-sm font-medium mb-2">Lista de Contas Recorrentes</h3>
        {assinaturas.length === 0 ? (
          <p className="text-sm opacity-60">Sem registros</p>
        ) : (
          <div className="space-y-4">
            {assinaturas.slice().reverse().map((a, index) => (
              <div key={a.id} className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 animate-fadeInUp" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-base">{a.nome}</div>
                    <div className="text-sm opacity-70 mt-1 dark:text-gray-400">
                      {a.tipo === 'ACORDO' ? (
                        <span>
                          Parcela {a.parcelaAtual || 1} de {a.parcelasTotal || 1}
                        </span>
                      ) : (
                        <span>
                          Vence dia {a.diaCobranca} {a.periodoCobranca === 'ANUAL' ? `/ ${a.mesCobranca}` : ''}
                        </span>
                      )}
                      <span className="mx-2">•</span>
                      <span>{a.tipoPagamento}{a.cartaoNome && ` - ${a.cartaoNome}`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {fmt(toNum(a.valor))}
                    </div>
                    {a.tipo === 'ACORDO' && (
                      <div className="text-xs opacity-60">
                        Total: {fmt(toNum(a.valor) * (a.parcelasTotal || 1))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t dark:border-slate-700">
                  <button type="button" onClick={() => iniciarEdicaoAssinatura(a)} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                    Editar
                  </button>
                  <button type="button" onClick={() => removerAssinatura(a.id)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 transition dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                    Excluir
                  </button>
                  {a.tipo === 'ACORDO' && (a.parcelaAtual || 0) < (a.parcelasTotal || 1) && (
                    <button type="button" onClick={() => pagarParcelaAcordo(a.id)} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 transition dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Pagar Parcela</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg dark:bg-slate-700">
          <div className="text-sm font-semibold text-right">
            Valor Total Anual de Contas Recorrentes: {fmt(totalAnualAssinaturas)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContasRecorrentes;