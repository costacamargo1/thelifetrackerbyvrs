import React, { useMemo, useState } from 'react';

/** Tipos básicos */
type TipoPagamento = 'DÉBITO' | 'CRÉDITO';
type Periodo = 'MENSAL' | 'ANUAL';
type StatusObj =
  | 'IMEDIATO'
  | 'EM PROGRESSO'
  | 'DISTANTE'
  | 'QUITADO - EM PROGRESSO'
  | 'QUITADO - FINALIZADO';

interface Gasto {
  id: number;
  descricao: string;
  valor: string;           // mantemos string no form
  categoria: string;
  data: string;            // yyyy-mm-dd
  tipoPagamento: TipoPagamento;
  cartaoId: number | null;
  cartaoNome?: string | null;
}

interface Receita { id: number; descricao: string; valor: string; data: string; }
interface Divida { id: number; pessoa: string; valor: string; descricao: string; }
interface Assinatura {
  id: number;
  nome: string;
  valor: string;
  diaCobranca: number;
  tipo: 'ASSINATURA' | 'CONTRATO - ALUGUEL' | 'CONTRATO - PERSONALIZADO';
  categoriaPersonalizada?: string;
  tipoPagamento: TipoPagamento;
  cartaoId: number | null;
  cartaoNome?: string | null;
  periodoCobranca: Periodo;
}
interface Objetivo { id: number; nome: string; valorNecessario: string; valorAtual: number; status: StatusObj; }
interface Cartao { id: number; nome: string; limite: string; diaVencimento: number; padrao: boolean; }

/** Helpers */
const calcularGastosPorCategoria = (lista: Gasto[] = []) => {
  return lista.reduce((acc: Record<string, number>, g) => {
    const cat = (g?.categoria ?? 'OUTROS') as string;
    const v = parseFloat(g?.valor ?? '0') || 0;
    acc[cat] = (acc[cat] || 0) + v;
    return acc;
  }, {} as Record<string, number>);
};

const verificarAssinaturasProximas = (assinaturas: Assinatura[]) => {
  const hoje = new Date();
  return (assinaturas || []).filter((a) => {
    if (a?.periodoCobranca !== 'ANUAL') return false;
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), a?.diaCobranca ?? 1);
    if (data < hoje) data = new Date(hoje.getFullYear() + 1, hoje.getMonth(), a?.diaCobranca ?? 1);
    const diffDias = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 0 && diffDias <= 30;
  });
};

/** Componente principal */
export default function LifeTracker() {
  // Estados mínimos para não quebrar
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([
    { id: 1, nome: 'NUBANK', limite: '1000', diaVencimento: 10, padrao: true },
  ]);

  // Cálculos básicos e seguros
  const totalReceitas = useMemo(
    () => receitas.reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0),
    [receitas]
  );

  const gastosDebito = useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'DÉBITO')
                .reduce((acc, g) => acc + (parseFloat(g.valor) || 0), 0),
    [gastos]
  );

  const assinDebito = useMemo(
    () => assinaturas.filter(a => a.tipoPagamento === 'DÉBITO' && a.periodoCobranca === 'MENSAL')
                     .reduce((acc, a) => acc + (parseFloat(a.valor) || 0), 0),
    [assinaturas]
  );

  const saldo = useMemo(() => totalReceitas - gastosDebito - assinDebito, [totalReceitas, gastosDebito, assinDebito]);
  const porCategoria = useMemo(() => calcularGastosPorCategoria(gastos), [gastos]);
  const anuaisProximas = useMemo(() => verificarAssinaturasProximas(assinaturas), [assinaturas]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Life Tracker</h1>
        <span className="text-sm opacity-60">baseline carregada</span>
      </header>

      {/* Cards do dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl shadow bg-white">
          <div className="text-sm opacity-60">Saldo (Dinheiro)</div>
          <div className="text-2xl font-semibold">R$ {saldo.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl shadow bg-white">
          <div className="text-sm opacity-60">Gastos (Débito)</div>
          <div className="text-xl font-medium">R$ {gastosDebito.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl shadow bg-white">
          <div className="text-sm opacity-60">Receitas</div>
          <div className="text-xl font-medium">R$ {totalReceitas.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl shadow bg-white">
          <div className="text-sm opacity-60">Assinaturas (Débito / mês)</div>
          <div className="text-xl font-medium">R$ {assinDebito.toFixed(2)}</div>
        </div>
      </section>

      {/* Gastos por categoria */}
      <section className="p-4 rounded-2xl shadow bg-white">
        <h2 className="text-lg font-medium mb-3">Gastos por categoria</h2>
        {Object.keys(porCategoria).length === 0 ? (
          <p className="text-sm opacity-60">Sem lançamentos</p>
        ) : (
          <ul className="text-sm space-y-1">
            {Object.entries(porCategoria).map(([cat, total]) => (
              <li key={cat} className="flex justify-between">
                <span>{cat}</span>
                <span>R$ {total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Assinaturas anuais próximas */}
      <section className="p-4 rounded-2xl shadow bg-white">
        <h2 className="text-lg font-medium mb-3">Assinaturas anuais próximas (30 dias)</h2>
        {anuaisProximas.length === 0 ? (
          <p className="text-sm opacity-60">Nenhuma por agora</p>
        ) : (
          <ul className="text-sm list-disc pl-5">
            {anuaisProximas.map((a) => (
              <li key={a.id}>{a.nome} — dia {a.diaCobranca}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Dummy de inclusão rápida para testar */}
      <section className="p-4 rounded-2xl shadow bg-white">
        <h2 className="text-lg font-medium mb-3">Teste rápido de lançamento</h2>
        <button
          className="px-3 py-2 rounded-lg bg-black text-white text-sm"
          onClick={() => setReceitas(r => [...r, { id: Date.now(), descricao: 'Teste', valor: '100', data: new Date().toISOString().slice(0,10) }])}
        >
          + Receita R$ 100
        </button>
        <button
          className="ml-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
          onClick={() => setGastos(g => [...g, { id: Date.now(), descricao: 'Mercado', valor: '25', data: new Date().toISOString().slice(0,10), categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: null }])}
        >
          + Gasto (débito) R$ 25
        </button>
      </section>
    </div>
  );
}
