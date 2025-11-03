import React from 'react';

/** =========================
 * Tipos básicos
 * ========================= */
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
  valor: string;           // mantemos string nos forms
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

/** =========================
 * Helpers
 * ========================= */
const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

const toNum = (s: string | number | null | undefined) => {
  if (typeof s === 'number') return s;
  const v = parseFloat(String(s || '0').replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};

const isSameMonth = (isoDate: string, ref = new Date()) => {
  const d = new Date(isoDate);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

const calcularGastosPorCategoria = (lista: Gasto[] = []) => {
  return lista.reduce((acc: Record<string, number>, g) => {
    const cat = (g?.categoria ?? 'OUTROS') as string;
    const v = toNum(g?.valor);
    acc[cat] = (acc[cat] || 0) + v;
    return acc;
  }, {} as Record<string, number>);
};

const verificarAssinaturasAnuaisProximas = (assinaturas: Assinatura[]) => {
  const hoje = new Date();
  return (assinaturas || []).filter((a) => {
    if (a?.periodoCobranca !== 'ANUAL') return false;
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), a?.diaCobranca ?? 1);
    if (data < hoje) data = new Date(hoje.getFullYear() + 1, hoje.getMonth(), a?.diaCobranca ?? 1);
    const diffDias = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 0 && diffDias <= 30;
  });
};

const detectarCategoria = (descricao: string): string => {
  const d = (descricao || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '') // remove acentos
    .toLowerCase();

  const match = (palavras: string[]) => palavras.some(k => d.includes(k));

  if (match(['almoco','ifood','lanche','comida','salgado','doce','docinho','cafe','jantar','restaurante','padaria','mercado','pizza','hamburguer','acai','cerveja']))
    return 'ALIMENTAÇÃO';
  if (match(['uber','taxi','99','gasolina','onibus','metro','estacionamento','pedagio','passagem']))
    return 'TRANSPORTE';
  if (match(['cinema','teatro','show','festa','bar','jogo','game','passeio']))
    return 'LAZER';
  if (match(['farmacia','remedio','consulta','medico','dentista','exame','hospital','academia']))
    return 'SAÚDE';
  if (match(['luz','agua','internet','gas','iptu']))
    return 'MORADIA';
  if (match(['curso','faculdade','escola','livro','aula','treinamento']))
    return 'EDUCAÇÃO';
  if (match(['loja','roupa','sapato','shopping','presente','mercadolivre','amazon','shopee']))
    return 'COMPRAS';
  return 'IMPREVISTO';
};

/** =========================
 * Componente principal
 * ========================= */
export default function LifeTracker() {
  // Abas
  const [tab, setTab] = React.useState<'dashboard' | 'gastos' | 'receitas' | 'assinaturas' | 'objetivos' | 'cartoes' | 'dividas'>('dashboard');

  // Modais e ordenação de listas
  const [showMensaisModal, setShowMensaisModal] = React.useState(false);
  const [mensaisSort, setMensaisSort] = React.useState<'nome' | 'valor' | 'vencimento'>('vencimento');
  const [mensaisQuery, setMensaisQuery] = React.useState('');
  const [showCreditoMesModal, setShowCreditoMesModal] = React.useState(false);
  const now = new Date();

  // Estados
  const [gastos, setGastos] = React.useState<Gasto[]>([]);
  const [receitas, setReceitas] = React.useState<Receita[]>([]);
  const [assinaturas, setAssinaturas] = React.useState<Assinatura[]>([]);
  const [objetivos, setObjetivos] = React.useState<Objetivo[]>([]);
  const [cartoes, setCartoes] = React.useState<Cartao[]>([
    { id: 1, nome: 'NUBANK', limite: '1000', diaVencimento: 10, padrao: true },
  ]);
  const [dividas, setDividas] = React.useState<Divida[]>([]);
  // --- Edição de cartões ---
  const [editingCardId, setEditingCardId] = React.useState<number | null>(null);
  const [editCardDraft, setEditCardDraft] = React.useState<Cartao | null>(null);

  const startEditCard = (c: Cartao) => {
    setEditingCardId(c.id);
    setEditCardDraft({ ...c });
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardDraft(null);
  };

  const saveEditCard = () => {
    if (!editCardDraft) return;
    setCartoes(prev => {
      // Se marcar como padrão, desmarca os demais
      const base = editCardDraft.padrao ? prev.map(x => ({ ...x, padrao: false })) : prev;
      return base.map(x => x.id === editCardDraft.id ? { ...editCardDraft } : x);
    });
    setEditingCardId(null);
    setEditCardDraft(null);
  };

  const setDefaultCard = (id: number) => {
    setCartoes(prev => prev.map(c => ({ ...c, padrao: c.id === id })));
  };

  const deleteCard = (id: number) => {
    const toDelete = cartoes.find(c => c.id == id);
    if (!toDelete) return;
    if (!window.confirm(`Remover o cartão "${toDelete.nome}"? Seus gastos antigos permanecem, apenas deixam de apontar para este cartão.`)) return;

    // Remover cartão e, se era padrão, definir o primeiro restante como padrão
    setCartoes(prev => {
      const rest = prev.filter(c => c.id !== id);
      if (toDelete.padrao && rest.length > 0) {
        // marca o primeiro como padrão
        rest[0] = { ...rest[0], padrao: true };
      }
      return rest;
    });

    // Para não quebrar referências: zera cartaoId dos gastos que apontavam para ele (mantém cartaoNome como histórico)
    setGastos(prev => prev.map(g => g.cartaoId === id ? { ...g, cartaoId: null } : g));
    // Também para assinaturas
    setAssinaturas(prev => prev.map(a => a.cartaoId === id ? { ...a, cartaoId: null } : a));
  };


  // Forms
  const [novoGasto, setNovoGasto] = React.useState<Gasto>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
    categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: null, cartaoNome: null
  });

  const [novaReceita, setNovaReceita] = React.useState<Receita>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10)
  });

  const [novaAssinatura, setNovaAssinatura] = React.useState<Assinatura>({
    id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
    categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: null, cartaoNome: null, periodoCobranca: 'MENSAL'
  });

  const [novoObjetivo, setNovoObjetivo] = React.useState<Objetivo>({
    id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO'
  } as unknown as Objetivo);

  const [novoCartao, setNovoCartao] = React.useState<Cartao>({
    id: 0, nome: '', limite: '', diaVencimento: 1, padrao: false
  });

  const [novaDivida, setNovaDivida] = React.useState<Divida>({
    id: 0, pessoa: '', valor: '', descricao: ''
  });

  // Persistência (localStorage)
  React.useEffect(() => {
    const load = <T,>(k: string, fallback: T) => {
      try { const s = localStorage.getItem(k); return s ? JSON.parse(s) as T : fallback; }
      catch { return fallback; }
    };
    setGastos(load<Gasto[]>('gastos', []));
    setReceitas(load<Receita[]>('receitas', []));
    setAssinaturas(load<Assinatura[]>('assinaturas', []));
    setObjetivos(load<Objetivo[]>('objetivos', []));
    setCartoes(load<Cartao[]>('cartoes', cartoes));
    setDividas(load<Divida[]>('dividas', []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => { localStorage.setItem('gastos', JSON.stringify(gastos)); }, [gastos]);
  React.useEffect(() => { localStorage.setItem('receitas', JSON.stringify(receitas)); }, [receitas]);
  React.useEffect(() => { localStorage.setItem('assinaturas', JSON.stringify(assinaturas)); }, [assinaturas]);
  React.useEffect(() => { localStorage.setItem('objetivos', JSON.stringify(objetivos)); }, [objetivos]);
  React.useEffect(() => { localStorage.setItem('cartoes', JSON.stringify(cartoes)); }, [cartoes]);
  React.useEffect(() => { localStorage.setItem('dividas', JSON.stringify(dividas)); }, [dividas]);

  // Derivados
  const totalReceitas = React.useMemo(
    () => receitas.reduce((acc, r) => acc + toNum(r.valor), 0),
    [receitas]
  );

  const gastosDebito = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'DÉBITO').reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const gastosCredito = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'CRÉDITO').reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const gastosCreditoMes = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data)).reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const totalLimite = React.useMemo(
    () => cartoes.reduce((acc, c) => acc + toNum(c.limite), 0),
    [cartoes]
  );

  const creditoDisponivel = React.useMemo(
    () => Math.max(0, totalLimite - gastosCreditoMes),
    [totalLimite, gastosCreditoMes]
  );

  const gastosTotal = React.useMemo(
    () => gastosCredito + gastosDebito,
    [gastosCredito, gastosDebito]
  );

  const assinDebitoMensal = React.useMemo(
    () => assinaturas.filter(a => a.tipoPagamento === 'DÉBITO' && a.periodoCobranca === 'MENSAL')
                     .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const saldo = React.useMemo(
    () => totalReceitas - gastosDebito - assinDebitoMensal,
    [totalReceitas, gastosDebito, assinDebitoMensal]
  );

  const porCategoria = React.useMemo(() => calcularGastosPorCategoria(gastos), [gastos]);
  const anuaisProximas = React.useMemo(() => verificarAssinaturasAnuaisProximas(assinaturas), [assinaturas]);
  const anuaisTodos = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'ANUAL'), [assinaturas]);

  const totalAssinMensal = React.useMemo(
    () => assinaturas
      .filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ASSINATURA')
      .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const totalAluguelMensal = React.useMemo(
    () => assinaturas.filter(a => a.tipo === 'CONTRATO - ALUGUEL' && a.periodoCobranca === 'MENSAL')
                     .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const previsaoMes = React.useMemo(() => {
    // Assinaturas pagas no CRÉDITO (mensais) contam na previsão do cartão do mês
    const assinaturasCredito = assinaturas
      .filter(a => a.periodoCobranca === 'MENSAL' && a.tipoPagamento === 'CRÉDITO')
      .reduce((s, a) => s + toNum(a.valor), 0);

    const creditoPrev = gastosCreditoMes + assinaturasCredito;

    return {
      
// Listas derivadas para modais
  const assinMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ASSINATURA'), [assinaturas]);
  const alugueisMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'CONTRATO - ALUGUEL'), [assinaturas]);

  // Assinaturas mensais pagas no crédito também contam como gasto de crédito do mês
  const assinaturasCreditoMensal = React.useMemo(
    () => assinMensais.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((s, a) => s + toNum(a.valor), 0),
    [assinMensais]
  );

  // Lista detalhada de gastos de crédito do mês (gastos + assinaturas mensais no crédito)
  const creditGastosMesList = React.useMemo(() => {
    const gastosList = gastos
      .filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data))
      .map(g => ({
        id: g.id,
        tipo: 'gasto' as const,
        data: g.data,
        descricao: g.descricao,
        valor: toNum(g.valor),
        cartaoId: g.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? 0),
        cartaoNome: g.cartaoNome ?? cartoes.find(c => c.id === g.cartaoId)?.nome ?? cartoes.find(c => c.padrao)?.nome ?? ''
      }));

    const assinList = assinMensais
      .filter(a => a.tipoPagamento === 'CRÉDITO')
      .map(a => ({
        id: 100000 + a.id,
        tipo: 'assinatura' as const,
        data: new Date(now.getFullYear(), now.getMonth(), a.diaCobranca ?? 1),
        descricao: a.nome + ' (assinatura)',
        valor: toNum(a.valor),
        cartaoId: a.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? 0),
        cartaoNome: cartoes.find(c => c.id === a.cartaoId)?.nome ?? cartoes.find(c => c.padrao)?.nome ?? ''
      }));

    return [...gastosList, ...assinList].sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [gastos, assinMensais, cartoes]);

  // Resumo por cartão (mês atual)
  const creditByCard = React.useMemo(() => {
    const map = new Map<number, number>();
    creditGastosMesList.forEach(x => {
      const id = x.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? 0);
      map.set(id, (map.get(id) ?? 0) + x.valor);
    });
    return cartoes.map(c => ({
      cartao: c,
      usado: map.get(c.id) ?? 0,
      disponivel: Math.max(0, toNum(c.limite) - (map.get(c.id) ?? 0))
    }));
  }, [creditGastosMesList, cartoes]);

  // Ordenação e filtro da lista de assinaturas mensais
  const mensaisList = React.useMemo(() => {
    const q = mensaisQuery.trim().toLowerCase();
    const base = assinMensais.filter(a => a.nome.toLowerCase().includes(q));
    const sort = [...base].sort((a, b) => {
      if (mensaisSort === 'nome') return a.nome.localeCompare(b.nome);
      if (mensaisSort === 'valor') return toNum(a.valor) - toNum(b.valor);
      // vencimento
      return (a.diaCobranca ?? 0) - (b.diaCobranca ?? 0);
    });
    return sort;
  }, [assinMensais, mensaisQuery, mensaisSort]);
    aluguel: totalAluguelMensal,
    assinaturas: totalAssinMensal,
    credito: gastosCreditoMes,
    total: totalAluguelMensal + totalAssinMensal + gastosCreditoMes
  }), [totalAluguelMensal, totalAssinMensal, gastosCreditoMes]);

  // Ações
  const adicionarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    const catAuto = detectarCategoria(novoGasto.descricao);
    const cartaoNome = novoGasto.tipoPagamento === 'CRÉDITO'
      ? (cartoes.find(c => c.id === (novoGasto.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? 0)))?.nome ?? null)
      : null;

    setGastos(g => [...g, {
      ...novoGasto,
      id: Date.now(),
      categoria: catAuto || novoGasto.categoria || 'OUTROS',
      cartaoId: novoGasto.tipoPagamento === 'CRÉDITO'
        ? (novoGasto.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? null))
        : null,
      cartaoNome
    }]);

    setNovoGasto({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: null, cartaoNome: null
    });
  };

  const adicionarReceita = (e: React.FormEvent) => {
    e.preventDefault();
    setReceitas(r => [...r, { ...novaReceita, id: Date.now() }]);
    setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
  };

  const adicionarCartao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartao.nome || !novoCartao.limite) return;
    setCartoes(prev => {
      const base = novoCartao.padrao ? prev.map(c => ({ ...c, padrao: false })) : prev;
      return [...base, { ...novoCartao, id: Date.now() }];
    });
    setNovoCartao({ id: 0, nome: '', limite: '', diaVencimento: 1, padrao: false });
  };

  const adicionarAssinatura = (e: React.FormEvent) => {
    e.preventDefault();
    setAssinaturas(a => [...a, {
      ...novaAssinatura,
      id: Date.now(),
      cartaoNome: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? (cartoes.find(c => c.id === (novaAssinatura.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? 0)))?.nome ?? null)
        : null,
      cartaoId: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? (novaAssinatura.cartaoId ?? (cartoes.find(c => c.padrao)?.id ?? null))
        : null
    }]);
    setNovaAssinatura({
      id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
      categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: null, cartaoNome: null, periodoCobranca: 'MENSAL'
    });
  };

  const adicionarObjetivo = (e: React.FormEvent) => {
    e.preventDefault();
    setObjetivos(o => [...o, { ...novoObjetivo, id: Date.now(), valorAtual: novoObjetivo.valorAtual || 0 }]);
    setNovoObjetivo({ id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO' } as unknown as Objetivo);
  };

  const atualizarObjetivoValor = (id: number, delta: number) => {
    setObjetivos(list => list.map(o => o.id === id ? { ...o, valorAtual: Math.max(0, o.valorAtual + delta) } : o));
  };

  const alterarStatusObjetivo = (id: number, status: StatusObj) => {
    setObjetivos(list => list.map(o => o.id === id ? { ...o, status } : o));
  };

  const adicionarDivida = (e: React.FormEvent) => {
    e.preventDefault();
    setDividas(d => [...d, { ...novaDivida, id: Date.now() }]);
    setNovaDivida({ id: 0, pessoa: '', valor: '', descricao: '' });
  };

  // UI helpers
  const TabButton: React.FC<{ id: typeof tab; children: React.ReactNode }> = ({ id, children }) => (
    <button
      className={`px-3 py-2 rounded-xl text-sm ${tab === id ? 'bg-black text-white' : 'bg-white text-black border'}`}
      onClick={() => setTab(id)}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Life Tracker</h1>
        <div className="flex gap-2">
          <TabButton id="dashboard">Dashboard</TabButton>
          <TabButton id="gastos">Gastos</TabButton>
          <TabButton id="receitas">Receitas</TabButton>
          <TabButton id="assinaturas">Assinaturas/Contratos</TabButton>
          <TabButton id="objetivos">Objetivos</TabButton>
          <TabButton id="cartoes">Cartões</TabButton>
          <TabButton id="dividas">Dívidas</TabButton>
        </div>
      </header>

      {tab === 'dashboard' && (
        <>
          {/* Cards do dashboard */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Saldo (Dinheiro)</div>
              <div className="text-2xl font-semibold">{fmt(saldo)}</div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Crédito Disponível</div>
              <div className="text-xl font-medium">
                {fmt(creditoDisponivel)} <span className="opacity-60">/ {fmt(totalLimite)}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Gastos (Crédito)</div>
              <div className="text-xl font-medium">{fmt(gastosCredito)}</div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Gastos (Dinheiro)</div>
              <div className="text-xl font-medium">{fmt(gastosDebito)}</div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Gastos (Total)</div>
              <div className="text-xl font-medium">{fmt(gastosTotal)}</div>
            </div>
          </section>

          {/* Previsão do mês */}
          <section className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-lg font-medium mb-3">Previsão de Gastos (este mês)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 border">
                <div className="opacity-60">Aluguel</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.aluguel)}</div>
              </div>
              <button type="button" onClick={() => setShowMensaisModal(true)} className="p-3 rounded-xl bg-gray-50 border text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition">
                <div className="opacity-60">Assinaturas Mensais</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.assinaturas)}</div>
              </button>
              <button type="button" onClick={() => setShowCreditoMesModal(true)} className="p-3 rounded-xl bg-gray-50 border text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition">
                <div className="opacity-60">Gastos em Crédito (mês)</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.credito)}</div>
              </button>
              <div className="p-3 rounded-xl bg-gray-900 text-white">
                <div className="opacity-80">TOTAL PREVISTO</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.total)}</div>
              </div>
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
                    <span>{fmt(total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Alertas anuais */}
          
          {/* Assinaturas anuais */}
          <section className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-lg font-medium mb-3">Assinaturas anuais</h2>
            {anuaisTodos.length === 0 ? (
              <p className="text-sm opacity-60">Nenhuma assinatura anual cadastrada</p>
            ) : (
              <ul className="text-sm divide-y">
                {anuaisTodos.map(a => {
                  const dias = diasAteProximaCobranca(a);
                  const critico = dias <= 30;
                  return (
                    <li key={a.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.nome}</div>
                        <div className="opacity-60">
                          Vence dia {a.diaCobranca?.toString().padStart(2, '0')} • {a.tipoPagamento}
                          {a.cartaoId ? ` • ${cartoes.find(c => c.id === a.cartaoId)?.nome ?? ''}` : ''}
                        </div>
                      </div>
                      <div className={`font-semibold ${critico ? 'text-red-600' : ''}`}>{fmt(a.valor)}{critico ? ` • em ${dias} dias` : ''}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

        </>
      )}

      {tab === 'gastos' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Lançar gasto</h2>
          <form className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end" onSubmit={adicionarGasto}>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Descrição</label>
              <input
                className="w-full p-2 border rounded-lg"
                value={novoGasto.descricao}
                onChange={(e) => setNovoGasto({ ...novoGasto, descricao: e.target.value })}
                placeholder="ex: almoço ifood"
              />
              {novoGasto.descricao && (
                <p className="text-xs mt-1 text-green-700">
                  Categoria detectada: <b>{detectarCategoria(novoGasto.descricao)}</b>
                </p>
              )}
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full p-2 border rounded-lg"
                value={novoGasto.valor}
                onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Data</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg"
                value={novoGasto.data}
                onChange={(e) => setNovoGasto({ ...novoGasto, data: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Pagamento</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={novoGasto.tipoPagamento}
                onChange={(e) => setNovoGasto({
                  ...novoGasto,
                  tipoPagamento: e.target.value as TipoPagamento,
                  cartaoId: e.target.value === 'CRÉDITO' ? (cartoes.find(c => c.padrao)?.id ?? null) : null
                })}
              >
                <option value="DÉBITO">DÉBITO (PIX/Dinheiro/à vista)</option>
                <option value="CRÉDITO">CRÉDITO (cartão)</option>
              </select>
            </div>
            {novoGasto.tipoPagamento === 'CRÉDITO' && (
              <div>
                <label className="text-xs opacity-70">Cartão</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={novoGasto.cartaoId ?? ''}
                  onChange={(e) => setNovoGasto({ ...novoGasto, cartaoId: e.target.value ? Number(e.target.value) : null })}
                >
                  {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}{c.padrao ? ' (padrão)' : ''}</option>)}
                </select>
              </div>
            )}
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium mb-2">Últimos gastos</h3>
            {gastos.length === 0 ? (
              <p className="text-sm opacity-60">Sem lançamentos</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left opacity-60">
                    <th className="py-2">Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Pagamento</th>
                    <th className="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.slice().reverse().map(g => (
                    <tr key={g.id} className="border-t">
                      <td className="py-2">{g.data}</td>
                      <td>{g.descricao}</td>
                      <td>{g.categoria}</td>
                      <td>{g.tipoPagamento}{g.cartaoNome ? ` · ${g.cartaoNome}` : ''}</td>
                      <td className="text-right">{fmt(toNum(g.valor))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {tab === 'receitas' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Lançar receita</h2>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end" onSubmit={adicionarReceita}>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Descrição</label>
              <input
                className="w-full p-2 border rounded-lg"
                value={novaReceita.descricao}
                onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
                placeholder="ex: salário"
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full p-2 border rounded-lg"
                value={novaReceita.valor}
                onChange={(e) => setNovaReceita({ ...novaReceita, valor: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Data</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg"
                value={novaReceita.data}
                onChange={(e) => setNovaReceita({ ...novaReceita, data: e.target.value })}
              />
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium mb-2">Últimas receitas</h3>
            {receitas.length === 0 ? (
              <p className="text-sm opacity-60">Sem lançamentos</p>
            ) : (
              <ul className="text-sm space-y-1">
                {receitas.slice().reverse().map(r => (
                  <li key={r.id} className="flex justify-between border-t py-2">
                    <span>{r.data} · {r.descricao}</span>
                    <span>{fmt(toNum(r.valor))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === 'assinaturas' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Assinaturas e Contratos</h2>
          <form className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end" onSubmit={adicionarAssinatura}>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Nome</label>
              <input className="w-full p-2 border rounded-lg"
                value={novaAssinatura.nome}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full p-2 border rounded-lg"
                value={novaAssinatura.valor}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, valor: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Dia de cobrança</label>
              <input type="number" min="1" max="28" className="w-full p-2 border rounded-lg"
                value={novaAssinatura.diaCobranca}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, diaCobranca: Number(e.target.value || 1) })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Tipo</label>
              <select className="w-full p-2 border rounded-lg"
                value={novaAssinatura.tipo}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, tipo: e.target.value as Assinatura['tipo'] })}>
                <option>ASSINATURA</option>
                <option>CONTRATO - ALUGUEL</option>
                <option>CONTRATO - PERSONALIZADO</option>
              </select>
            </div>
            {novaAssinatura.tipo === 'CONTRATO - PERSONALIZADO' && (
              <div>
                <label className="text-xs opacity-70">Categoria do contrato</label>
                <input className="w-full p-2 border rounded-lg"
                  value={novaAssinatura.categoriaPersonalizada || ''}
                  onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, categoriaPersonalizada: e.target.value })} />
              </div>
            )}
            <div>
              <label className="text-xs opacity-70">Periodicidade</label>
              <select className="w-full p-2 border rounded-lg"
                value={novaAssinatura.periodoCobranca}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, periodoCobranca: e.target.value as Periodo })}>
                <option value="MENSAL">MENSAL</option>
                <option value="ANUAL">ANUAL</option>
              </select>
            </div>
            <div>
              <label className="text-xs opacity-70">Pagamento</label>
              <select className="w-full p-2 border rounded-lg"
                value={novaAssinatura.tipoPagamento}
                onChange={(e)=>setNovaAssinatura({
                  ...novaAssinatura,
                  tipoPagamento: e.target.value as TipoPagamento,
                  cartaoId: e.target.value === 'CRÉDITO' ? (cartoes.find(c => c.padrao)?.id ?? null) : null
                })}>
                <option value="DÉBITO">DÉBITO</option>
                <option value="CRÉDITO">CRÉDITO</option>
              </select>
            </div>
            {novaAssinatura.tipoPagamento === 'CRÉDITO' && (
              <div>
                <label className="text-xs opacity-70">Cartão</label>
                <select className="w-full p-2 border rounded-lg"
                  value={novaAssinatura.cartaoId ?? ''}
                  onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, cartaoId: e.target.value ? Number(e.target.value) : null })}>
                  {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}{c.padrao ? ' (padrão)' : ''}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-7">
              <button className="px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium mb-2">Lista</h3>
            {assinaturas.length === 0 ? (
              <p className="text-sm opacity-60">Sem registros</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left opacity-60">
                    <th className="py-2">Nome</th>
                    <th>Valor</th>
                    <th>Dia</th>
                    <th>Tipo</th>
                    <th>Período</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {assinaturas.slice().reverse().map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="py-2">{a.nome}</td>
                      <td>{fmt(toNum(a.valor))}</td>
                      <td>{a.diaCobranca}</td>
                      <td>{a.tipo}{a.categoriaPersonalizada ? ` · ${a.categoriaPersonalizada}` : ''}</td>
                      <td>{a.periodoCobranca}</td>
                      <td>{a.tipoPagamento}{a.cartaoNome ? ` · ${a.cartaoNome}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {tab === 'objetivos' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Objetivos</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={adicionarObjetivo}>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Nome</label>
              <input className="w-full p-2 border rounded-lg"
                value={novoObjetivo.nome}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor necessário (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full p-2 border rounded-lg"
                value={String(novoObjetivo.valorNecessario || '')}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, valorNecessario: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Status</label>
              <select className="w-full p-2 border rounded-lg"
                value={novoObjetivo.status}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, status: e.target.value as StatusObj })}>
                <option>IMEDIATO</option>
                <option>EM PROGRESSO</option>
                <option>DISTANTE</option>
                <option>QUITADO - EM PROGRESSO</option>
                <option>QUITADO - FINALIZADO</option>
              </select>
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objetivos.length === 0 ? (
              <p className="text-sm opacity-60">Sem objetivos</p>
            ) : objetivos.map(o => {
              const necessario = toNum(o.valorNecessario);
              const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valorAtual / necessario) * 100)) : 0;
              const progresso = (o.status === 'QUITADO - EM PROGRESSO') ? 100 : progressoBase;
              const quitado = o.status.startsWith('QUITADO');
              return (
                <div key={o.id} className={`p-4 rounded-2xl border ${quitado ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{o.nome}</div>
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={o.status}
                      onChange={(e)=>alterarStatusObjetivo(o.id, e.target.value as StatusObj)}
                    >
                      <option>IMEDIATO</option>
                      <option>EM PROGRESSO</option>
                      <option>DISTANTE</option>
                      <option>QUITADO - EM PROGRESSO</option>
                      <option>QUITADO - FINALIZADO</option>
                    </select>
                  </div>
                  <div className="text-sm opacity-70 mt-1">Meta: {fmt(necessario)}</div>
                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div className={`h-2 rounded ${quitado ? 'bg-green-600' : 'bg-black'}`} style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div>Acumulado: {fmt(o.valorAtual)}</div>
                    <div>{progresso}%</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="px-2 py-1 bg-gray-900 text-white rounded" onClick={()=>atualizarObjetivoValor(o.id, 50)} type="button">+ R$50</button>
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={()=>atualizarObjetivoValor(o.id, -50)} type="button">- R$50</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'cartoes' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Cartões de Crédito</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={adicionarCartao}>
            <div>
              <label className="text-xs opacity-70">Nome</label>
              <input className="w-full p-2 border rounded-lg"
                value={novoCartao.nome}
                onChange={(e)=>setNovoCartao({ ...novoCartao, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Limite (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full p-2 border rounded-lg"
                value={novoCartao.limite}
                onChange={(e)=>setNovoCartao({ ...novoCartao, limite: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Dia de vencimento</label>
              <input type="number" min="1" max="28" className="w-full p-2 border rounded-lg"
                value={novoCartao.diaVencimento}
                onChange={(e)=>setNovoCartao({ ...novoCartao, diaVencimento: Number(e.target.value || 1) })} />
            </div>
            <div className="flex items-center gap-2">
              <input id="cart-padrao" type="checkbox"
                checked={novoCartao.padrao} onChange={(e)=>setNovoCartao({ ...novoCartao, padrao: e.target.checked })} />
              <label htmlFor="cart-padrao" className="text-xs">Definir como padrão</label>
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

        
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {cartoes.length === 0 ? (
      <p className="text-sm opacity-60">Nenhum cartão</p>
    ) : cartoes.map(c => {
      const usadoMes = gastos.filter(g => g.tipoPagamento === 'CRÉDITO' && g.cartaoId === c.id && isSameMonth(g.data))
                             .reduce((acc, g) => acc + toNum(g.valor), 0);
      const disp = Math.max(0, toNum(c.limite) - usadoMes);
      const isEditing = editingCardId === c.id;

      if (isEditing && editCardDraft) {
        return (
          <div key={c.id} className="p-4 rounded-2xl border bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Editar cartão</div>
              <span className="text-xs opacity-60">#{c.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex flex-col">
                <span className="opacity-60">Nome</span>
                <input className="p-2 border rounded"
                  value={editCardDraft.nome}
                  onChange={(e)=>setEditCardDraft({ ...(editCardDraft as Cartao), nome: e.target.value })} />
              </label>
              <label className="flex flex-col">
                <span className="opacity-60">Limite (R$)</span>
                <input type="number" min="0" step="0.01" className="p-2 border rounded"
                  value={editCardDraft.limite}
                  onChange={(e)=>setEditCardDraft({ ...(editCardDraft as Cartao), limite: e.target.value })} />
              </label>
              <label className="flex flex-col">
                <span className="opacity-60">Dia de vencimento</span>
                <input type="number" min="1" max="28" className="p-2 border rounded"
                  value={editCardDraft.diaVencimento}
                  onChange={(e)=>setEditCardDraft({ ...(editCardDraft as Cartao), diaVencimento: Number(e.target.value || 1) })} />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={!!editCardDraft.padrao}
                  onChange={(e)=>setEditCardDraft({ ...(editCardDraft as Cartao), padrao: e.target.checked })} />
                <span className="opacity-70">Definir como padrão</span>
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" className="px-3 py-2 rounded bg-black text-white text-xs" onClick={saveEditCard}>Salvar</button>
              <button type="button" className="px-3 py-2 rounded bg-gray-200 text-xs" onClick={cancelEditCard}>Cancelar</button>
            </div>
          </div>
        );
      }

      return (
        <div key={c.id} className="p-4 rounded-2xl border bg-white">
          <div className="flex items-center justify-between">
            <div className="font-medium">{c.nome}</div>
            <div className="flex items-center gap-2">
              {c.padrao && <span className="text-xs px-2 py-1 rounded bg-black text-white">padrão</span>}
              {!c.padrao && (
                <button type="button" className="text-xs underline" onClick={()=>setDefaultCard(c.id)}>definir padrão</button>
              )}
            </div>
          </div>
          <div className="text-sm opacity-70 mt-1">Venc.: dia {c.diaVencimento}</div>
          <div className="mt-2 text-sm">Limite: {fmt(toNum(c.limite))}</div>
          <div className="mt-1 text-sm">Usado (mês): {fmt(usadoMes)}</div>
          <div className="mt-1 text-sm">Disponível: {fmt(disp)}</div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="px-2 py-1 rounded bg-gray-900 text-white text-xs" onClick={()=>startEditCard(c)}>Editar</button>
            <button type="button" className="px-2 py-1 rounded bg-red-600 text-white text-xs" onClick={()=>deleteCard(c.id)}>Remover</button>
          </div>
        </div>
      );
    })}
  </div>
        </section>
      )}

      {tab === 'dividas' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">Dívidas — Quem me deve</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={adicionarDivida}>
            <div>
              <label className="text-xs opacity-70">Pessoa</label>
              <input className="w-full p-2 border rounded-lg"
                value={novaDivida.pessoa}
                onChange={(e)=>setNovaDivida({ ...novaDivida, pessoa: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full p-2 border rounded-lg"
                value={novaDivida.valor}
                onChange={(e)=>setNovaDivida({ ...novaDivida, valor: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Descrição</label>
              <input className="w-full p-2 border rounded-lg"
                value={novaDivida.descricao}
                onChange={(e)=>setNovaDivida({ ...novaDivida, descricao: e.target.value })} />
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">Adicionar</button>
            </div>
          </form>

          {dividas.length === 0 ? (
            <p className="text-sm opacity-60">Sem dívidas registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left opacity-60">
                  <th className="py-2">Pessoa</th>
                  <th>Descrição</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dividas.slice().reverse().map(d => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2">{d.pessoa}</td>
                    <td>{d.descricao}</td>
                    <td className="text-right">{fmt(toNum(d.valor))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Modal: Assinaturas Mensais */}
      {showMensaisModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMensaisModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Assinaturas Mensais</h3>
              <button className="px-3 py-1 rounded bg-black text-white" onClick={() => setShowMensaisModal(false)} type="button">Fechar</button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={mensaisQuery} onChange={e=>setMensaisQuery(e.target.value)} placeholder="Buscar por nome..." className="border rounded px-2 py-1 flex-1" />
              <select value={mensaisSort} onChange={e=>setMensaisSort(e.target.value as any)} className="border rounded px-2 py-1">
                <option value="vencimento">Ordenar por vencimento</option>
                <option value="nome">Ordenar por nome</option>
                <option value="valor">Ordenar por valor</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Assinaturas</div>
                {mensaisList.length === 0 ? <p className="text-sm opacity-60">Nenhuma</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {mensaisList.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">{a.nome}</td>
                          <td>{fmt(a.valor)}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${cartoes.find(c=>c.id===a.cartaoId)?.nome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(mensaisList.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
              <div>
                <div className="font-medium mb-2">Contratos (Aluguel)</div>
                {alugueisMensais.length === 0 ? <p className="text-sm opacity-60">Nenhum</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {alugueisMensais.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">{a.nome}</td>
                          <td>{fmt(a.valor)}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${cartoes.find(c=>c.id===a.cartaoId)?.nome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(alugueisMensais.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gastos em Crédito (mês) */}
      {showCreditoMesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreditoMesModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Gastos em Crédito (mês)</h3>
              <button className="px-3 py-1 rounded bg-black text-white" onClick={() => setShowCreditoMesModal(false)} type="button">Fechar</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <table className="w-full text-sm">
                  <thead className="text-left opacity-60">
                    <tr><th>Data</th><th>Descrição</th><th>Cartão</th><th>Valor</th></tr>
                  </thead>
                  <tbody>
                    {creditGastosMesList.map(l => (
                      <tr key={l.id} className="border-t">
                        <td className="py-1">{l.data.toLocaleDateString()}</td>
                        <td>{l.descricao}</td>
                        <td>{l.cartaoNome}</td>
                        <td>{fmt(l.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:col-span-1">
                <div className="font-medium mb-2">Resumo por cartão</div>
                <ul className="text-sm space-y-2">
                  {creditByCard.map(r => (
                    <li key={r.cartao.id} className="p-2 rounded border flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.cartao.nome}</div>
                        <div className="opacity-60">Limite {fmt(r.cartao.limite)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fmt(r.usado)}</div>
                        <div className="opacity-60">Restante {fmt(r.disponivel)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
      {/* Modal: Assinaturas Mensais */}
      {showMensaisModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMensaisModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Assinaturas Mensais</h3>
              <button className="px-3 py-1 rounded bg-black text-white" onClick={() => setShowMensaisModal(false)} type="button">Fechar</button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={mensaisQuery} onChange={e=>setMensaisQuery(e.target.value)} placeholder="Buscar por nome..." className="border rounded px-2 py-1 flex-1" />
              <select value={mensaisSort} onChange={e=>setMensaisSort(e.target.value as any)} className="border rounded px-2 py-1">
                <option value="vencimento">Ordenar por vencimento</option>
                <option value="nome">Ordenar por nome</option>
                <option value="valor">Ordenar por valor</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Assinaturas</div>
                {mensaisList.length === 0 ? <p className="text-sm opacity-60">Nenhuma</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {mensaisList.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">{a.nome}</td>
                          <td>{fmt(a.valor)}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${cartoes.find(c=>c.id===a.cartaoId)?.nome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(mensaisList.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
              <div>
                <div className="font-medium mb-2">Contratos (Aluguel)</div>
                {alugueisMensais.length === 0 ? <p className="text-sm opacity-60">Nenhum</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {alugueisMensais.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">{a.nome}</td>
                          <td>{fmt(a.valor)}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${cartoes.find(c=>c.id===a.cartaoId)?.nome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(alugueisMensais.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gastos em Crédito (mês) */}
      {showCreditoMesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreditoMesModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Gastos em Crédito (mês)</h3>
              <button className="px-3 py-1 rounded bg-black text-white" onClick={() => setShowCreditoMesModal(false)} type="button">Fechar</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <table className="w-full text-sm">
                  <thead className="text-left opacity-60">
                    <tr><th>Data</th><th>Descrição</th><th>Cartão</th><th>Valor</th></tr>
                  </thead>
                  <tbody>
                    {creditGastosMesList.map(l => (
                      <tr key={l.id} className="border-t">
                        <td className="py-1">{l.data.toLocaleDateString()}</td>
                        <td>{l.descricao}</td>
                        <td>{l.cartaoNome}</td>
                        <td>{fmt(l.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:col-span-1">
                <div className="font-medium mb-2">Resumo por cartão</div>
                <ul className="text-sm space-y-2">
                  {creditByCard.map(r => (
                    <li key={r.cartao.id} className="p-2 rounded border flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.cartao.nome}</div>
                        <div className="opacity-60">Limite {fmt(r.cartao.limite)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fmt(r.usado)}</div>
                        <div className="opacity-60">Restante {fmt(r.disponivel)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

