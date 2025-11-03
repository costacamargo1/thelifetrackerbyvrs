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
interface Gasto { // ... (sem alterações na interface)
  id: number;
  descricao: string;
  valor: string;           // mantemos string nos forms
  categoria: string;
  data: string;            // yyyy-mm-dd
  tipoPagamento: TipoPagamento;
  cartaoId: number | null; // Será `number` para crédito, `null` para débito
  cartaoNome?: string | null;
}

interface Receita { id: number; descricao: string; valor: string; data: string; }
interface Divida { id: number; pessoa: string; valor: string; descricao: string; }
interface Assinatura {
  id: number;
  nome: string;
  valor: string;
  diaCobranca: number;
  mesCobranca?: number;
  anoAdesao?: number;
  tipo: 'ASSINATURA' | 'CONTRATO - ALUGUEL' | 'CONTRATO - PERSONALIZADO';
  categoriaPersonalizada?: string;
  tipoPagamento: TipoPagamento;
  cartaoId: number | null;
  cartaoNome?: string | null;
  periodoCobranca: Periodo;
}
interface Objetivo { id: number; nome: string; valorNecessario: string; valorAtual: number; status: StatusObj; }
interface Cartao { id: number; nome: string; limite: string; diaVencimento: number; }
interface Configuracoes {
  credito: {
    alerta: string;
    critico: string;
    positivo: string;
  };
  saldo: {
    alerta: string;
    critico: string;
    positivo: string;
  };
}


/** =========================
 * Helpers
 * ========================= */
const getCorCartao = (nomeCartao: string): { bg: string; text: string } => {
  const nome = (nomeCartao || '').toLowerCase();

  if (nome.includes('nubank')) return { bg: 'bg-purple-600', text: 'text-white' };
  if (nome.includes('santander')) return { bg: 'bg-red-600', text: 'text-white' };
  if (nome.includes('caixa')) return { bg: 'bg-blue-700', text: 'text-white' };
  if (nome.includes('inter')) return { bg: 'bg-orange-500', text: 'text-white' };
  if (nome.includes('bradesco')) return { bg: 'bg-red-700', text: 'text-white' };
  if (nome.includes('itau') || nome.includes('itaú')) return { bg: 'bg-orange-400', text: 'text-black' };
  if (nome.includes('c6')) return { bg: 'bg-gray-800', text: 'text-white' };
  if (nome.includes('bb') || nome.includes('brasil')) return { bg: 'bg-yellow-400', text: 'text-blue-800' };

  return { bg: 'bg-gray-200', text: 'text-black' };
};
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

const calcularProximoVencimentoMensal = (assinatura: Assinatura): { dias: number; ehProximo: boolean } | null => {
  if (assinatura.periodoCobranca !== 'MENSAL') {
    return null;
  }

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const diaCobranca = assinatura.diaCobranca;

  let diasRestantes;
  if (diaCobranca >= diaHoje) {
    diasRestantes = diaCobranca - diaHoje;
  } else {
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    diasRestantes = (ultimoDiaDoMes - diaHoje) + diaCobranca;
  }

  return { dias: diasRestantes, ehProximo: diasRestantes <= 10 };
};

const calcularProximoVencimentoAnual = (assinatura: Assinatura): { data: Date; dias: number; meses: number; texto: string; ehProximo: boolean } | null => {
  if (assinatura.periodoCobranca !== 'ANUAL' || !assinatura.mesCobranca || !assinatura.anoAdesao) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let proximoVencimento = new Date(hoje.getFullYear(), assinatura.mesCobranca - 1, assinatura.diaCobranca);
  if (proximoVencimento < hoje) {
    proximoVencimento.setFullYear(hoje.getFullYear() + 1);
  }

  const diffTime = proximoVencimento.getTime() - hoje.getTime();
  const diffDiasTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let meses = 0;
  let dias = diffDiasTotal;

  if (diffDiasTotal > 30) {
    meses = Math.floor(diffDiasTotal / 30.44); // Média de dias no mês
    dias = Math.round(diffDiasTotal % 30.44);
  }

  let texto = '';
  if (meses > 0) texto += `${meses} mes${meses > 1 ? 'es' : ''}`;
  if (dias > 0) texto += `${texto ? ' e ' : ''}${dias} dia${dias > 1 ? 's' : ''}`;
  if (!texto) texto = 'hoje';
  else texto = `em ${texto}`;

  return { data: proximoVencimento, dias: diffDiasTotal, meses, texto, ehProximo: diffDiasTotal <= 30 };
};

const CATEGORIAS_GASTO = ['ALIMENTAÇÃO', 'TRANSPORTE', 'LAZER', 'SAÚDE', 'MORADIA', 'EDUCAÇÃO', 'COMPRAS', 'IMPREVISTO', 'OUTROS'] as const;

const detectarCategoria = (descricao: string): typeof CATEGORIAS_GASTO[number] => {
  const d = (descricao || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const match = (palavras: string[]) => palavras.some(k => d.includes(k));
  if (d.startsWith('imprevisto')) return 'IMPREVISTO';
  if (match(['almoco','ifood','lanche','comida','salgado','doce','docinho','cafe','jantar','restaurante','padaria','mercado','pizza','hamburguer','acai','cerveja'])) return 'ALIMENTAÇÃO';
  if (match(['uber','taxi','99','gasolina','onibus','metro','estacionamento','pedagio','passagem'])) return 'TRANSPORTE';
  if (match(['cinema','teatro','show','festa','bar','jogo','game','passeio'])) return 'LAZER';
  if (match(['farmacia','remedio','consulta','medico','dentista','exame','hospital','academia'])) return 'SAÚDE';
  if (match(['luz','agua','internet','gas','iptu'])) return 'MORADIA';
  if (match(['curso','faculdade','escola','livro','aula','treinamento'])) return 'EDUCAÇÃO';
  if (match(['loja','roupa','sapato','shopping','presente','mercadolivre','amazon','shopee'])) return 'COMPRAS';
  return 'OUTROS';
};
// ---------------------------------

const SUGESTOES_BANCOS = ['NUBANK', 'SANTANDER', 'CAIXA', 'C6', 'ITAÚ', 'BRADESCO', 'INTER', 'BANCO DO BRASIL'];

/** =========================
 * Componente principal
 * ========================= */
export default function LifeTracker() {
  // Abas
  const [tab, setTab] = React.useState<'dashboard' | 'gastos' | 'receitas' | 'assinaturas' | 'objetivos' | 'cartoes' | 'dividas' | 'configuracoes'>('dashboard');

  // Modais e ordenação de listas
  const [showMensaisModal, setShowMensaisModal] = React.useState(false);
  const [mensaisSort, setMensaisSort] = React.useState<'nome' | 'valor' | 'vencimento'>('vencimento');
  const [mensaisQuery, setMensaisQuery] = React.useState('');
  const [showCreditoMesModal, setShowCreditoMesModal] = React.useState(false);

  // Estados
  const [gastos, setGastos] = React.useState<Gasto[]>([]);
  const [receitas, setReceitas] = React.useState<Receita[]>([]);
  const [assinaturas, setAssinaturas] = React.useState<Assinatura[]>([]);
  const [objetivos, setObjetivos] = React.useState<Objetivo[]>([]);
  const [cartoes, setCartoes] = React.useState<Cartao[]>([]);
  const [dividas, setDividas] = React.useState<Divida[]>([]);
  const [configuracoes, setConfiguracoes] = React.useState<Configuracoes>({
    credito: { alerta: '2500', critico: '1000', positivo: '5000' },
    saldo: { alerta: '500', critico: '100', positivo: '2000' },
  });
  // --- Edição de cartões ---
  const [editingCardId, setEditingCardId] = React.useState<number | null>(null);
  const [editCardDraft, setEditCardDraft] = React.useState<Cartao | null>(null);
  // --- Edição de gastos e receitas ---
  const [editingGastoId, setEditingGastoId] = React.useState<number | null>(null);
  const [editingReceitaId, setEditingReceitaId] = React.useState<number | null>(null);
  const [editingAssinaturaId, setEditingAssinaturaId] = React.useState<number | null>(null);
  // --- Sugestões de cartões ---
  const [sugestoesCartao, setSugestoesCartao] = React.useState<string[]>([]);
  const [sugestaoAtivaIndex, setSugestaoAtivaIndex] = React.useState(-1);


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
      return prev.map(x => x.id === editCardDraft.id ? { ...editCardDraft } : x);
    });
    setEditingCardId(null);
    setEditCardDraft(null);
  };

  const deleteCard = (id: number) => {
    const toDelete = cartoes.find(c => c.id == id);
    if (!toDelete) return;
    if (!window.confirm(`Remover o cartão "${toDelete.nome}"? Seus gastos antigos permanecem, apenas deixam de apontar para este cartão.`)) return;

    // Remover cartão e, se era padrão, definir o primeiro restante como padrão
        setCartoes(prev => {
          return prev.filter(c => c.id !== id);
        });

    // Para não quebrar referências: zera cartaoId dos gastos que apontavam para ele (mantém cartaoNome como histórico)
    setGastos(prev => prev.map(g => g.cartaoId === id ? { ...g, cartaoId: null } : g));
    // Também para assinaturas
    setAssinaturas(prev => prev.map(a => a.cartaoId === id ? { ...a, cartaoId: null } : a));
  };


  // Forms
  const [novoGasto, setNovoGasto] = React.useState<Gasto>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
    categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null
  });

  const [novaReceita, setNovaReceita] = React.useState<Receita>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10)
  });

  const [novaAssinatura, setNovaAssinatura] = React.useState<Assinatura>({
    id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
    categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear()
  });

  const [novoObjetivo, setNovoObjetivo] = React.useState<Objetivo>({
    id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO'
  } as unknown as Objetivo);

  const [novoCartao, setNovoCartao] = React.useState<Omit<Cartao, 'id'>>({ nome: '', limite: '', diaVencimento: 1 });

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
    setCartoes(load<Cartao[]>('cartoes', []));
    setDividas(load<Divida[]>('dividas', []));
    setConfiguracoes(load<Configuracoes>('configuracoes', {
      credito: { alerta: '2500', critico: '1000', positivo: '5000' },
      saldo: { alerta: '500', critico: '100', positivo: '2000' },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => { localStorage.setItem('gastos', JSON.stringify(gastos)); }, [gastos]);
  React.useEffect(() => { localStorage.setItem('receitas', JSON.stringify(receitas)); }, [receitas]);
  React.useEffect(() => { localStorage.setItem('assinaturas', JSON.stringify(assinaturas)); }, [assinaturas]);
  React.useEffect(() => { localStorage.setItem('objetivos', JSON.stringify(objetivos)); }, [objetivos]);
  React.useEffect(() => { localStorage.setItem('cartoes', JSON.stringify(cartoes)); }, [cartoes]);
  React.useEffect(() => { localStorage.setItem('dividas', JSON.stringify(dividas)); }, [dividas]);
  React.useEffect(() => { localStorage.setItem('configuracoes', JSON.stringify(configuracoes)); }, [configuracoes]);

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
    [totalLimite, gastosCreditoMes] // gastosCreditoMes já inclui assinaturas
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
  const anuaisTodos = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'ANUAL'), [assinaturas]);
  const anuaisProximas = React.useMemo(() => anuaisTodos.filter(a => {
    const vencimento = calcularProximoVencimentoAnual(a);
    return vencimento?.ehProximo ?? false;
  }), [anuaisTodos]);

  // Assinaturas anuais que vencem no mês atual
  const anuaisVencendoMes = React.useMemo(() => anuaisTodos.filter(a => {
    const vencimento = calcularProximoVencimentoAnual(a);
    return vencimento ? isSameMonth(vencimento.data.toISOString()) : false;
  }), [anuaisTodos]);


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

  const totalAssinAnualMesCorrente = React.useMemo(
    () => anuaisVencendoMes.reduce((acc, a) => acc + toNum(a.valor), 0),
    [anuaisVencendoMes]
  );

  const totalAssinAnualMesCorrenteCredito = React.useMemo(
    () => anuaisVencendoMes.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((acc, a) => acc + toNum(a.valor), 0),
    [anuaisVencendoMes]
  );

  const totalAnualAssinaturas = React.useMemo(() => {
    return assinaturas.reduce((acc, a) => {
      return acc + (toNum(a.valor) * (a.periodoCobranca === 'MENSAL' ? 12 : 1));
    }, 0);
  }, [assinaturas]);

  // --- BLOCO PREVISAO_MES CORRIGIDO ---
  const previsaoMes = React.useMemo(() => ({
    aluguel: totalAluguelMensal,
    assinaturas: totalAssinMensal + totalAssinAnualMesCorrente,
    credito: gastosCreditoMes + totalAssinAnualMesCorrenteCredito,
    total: totalAluguelMensal + totalAssinMensal + totalAssinAnualMesCorrente + gastosCreditoMes
  }), [totalAluguelMensal, totalAssinMensal, gastosCreditoMes, totalAssinAnualMesCorrente, totalAssinAnualMesCorrenteCredito]);
  // ------------------------------------

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
    const now = new Date();
    const gastosList = gastos
      .filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data))
      .map(g => ({
        id: `gasto-${g.id}`,
        tipo: 'gasto' as const,
        data: g.data,
        descricao: g.descricao,
        valor: toNum(g.valor),
        cartaoId: g.cartaoId,
        cartaoNome: g.cartaoNome ?? cartoes.find(c => c.id === g.cartaoId)?.nome ?? 'Não encontrado'
      }));

    const assinList = assinMensais
      .filter(a => a.tipoPagamento === 'CRÉDITO')
      .map(a => ({
        id: `assinatura-${a.id}`,
        tipo: 'assinatura' as const,
        data: new Date(now.getFullYear(), now.getMonth(), a.diaCobranca ?? 1),
        descricao: a.nome + ' (assinatura)',
        valor: toNum(a.valor),
        cartaoId: a.cartaoId,
        cartaoNome: cartoes.find(c => c.id === a.cartaoId)?.nome ?? 'Não encontrado'
      }));

    return [...gastosList, ...assinList].sort((a, b) => (new Date(a.data)).getTime() - (new Date(b.data)).getTime());
  }, [gastos, assinMensais, cartoes]);

  // Resumo por cartão (mês atual)
  const creditByCard = React.useMemo(() => {
    const map = new Map<number, number>();
    creditGastosMesList.forEach(x => {
      const id = x.cartaoId;
      if (!id) return;
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

  // --- BLOCO DE CÓDIGO CORROMPIDO REMOVIDO DAQUI ---

  // Ações
  const adicionarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoGasto.tipoPagamento === 'CRÉDITO' && !novoGasto.cartaoId) {
      alert('Por favor, selecione um cartão para o gasto de crédito.');
      return;
    }
    const cartaoNome = novoGasto.tipoPagamento === 'CRÉDITO'
      ? (cartoes.find(c => c.id === novoGasto.cartaoId)?.nome ?? null)
      : null;

    setGastos(g => [...g, {
      ...novoGasto,
      id: Date.now(),
      cartaoId: novoGasto.tipoPagamento === 'CRÉDITO' ? novoGasto.cartaoId : null,
      cartaoNome
    }]);

    setNovoGasto({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null
    });
  };

  const iniciarEdicaoGasto = (gasto: Gasto) => {
    setEditingGastoId(gasto.id);
    setNovoGasto({ ...gasto });
  };

  const cancelarEdicaoGasto = () => {
    setEditingGastoId(null);
    setNovoGasto({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null
    });
  };

  const salvarEdicaoGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações neste gasto?')) return;
    setGastos(gastos => gastos.map(g => g.id === editingGastoId ? { ...novoGasto, id: g.id } : g));
    cancelarEdicaoGasto();
  };

  const iniciarEdicaoReceita = (receita: Receita) => {
    setEditingReceitaId(receita.id);
    setNovaReceita({ ...receita });
  };

  const cancelarEdicaoReceita = () => {
    setEditingReceitaId(null);
    setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
  };

  const salvarEdicaoReceita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações nesta receita?')) return;
    setReceitas(receitas => receitas.map(r => r.id === editingReceitaId ? { ...novaReceita, id: r.id } : r));
    cancelarEdicaoReceita();
  };

  const removerGasto = (id: number) => {
    setGastos(g => g.filter(gasto => gasto.id !== id));
  };

  const removerReceita = (id: number) => {
    setReceitas(r => r.filter(receita => receita.id !== id));
  };

  const iniciarEdicaoAssinatura = (assinatura: Assinatura) => {
    setEditingAssinaturaId(assinatura.id);
    setNovaAssinatura({ ...assinatura });
  };

  const cancelarEdicaoAssinatura = () => {
    setEditingAssinaturaId(null);
    setNovaAssinatura({ id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA', categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear() });
  };

  const salvarEdicaoAssinatura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações nesta assinatura?')) return;
    setAssinaturas(assinaturas => assinaturas.map(a => a.id === editingAssinaturaId ? { ...novaAssinatura, id: a.id } : a));
    cancelarEdicaoAssinatura();
  };

  const adicionarReceita = (e: React.FormEvent) => {
    e.preventDefault();
    setReceitas(r => [...r, { ...novaReceita, id: Date.now() }]);
    setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
  };

  const adicionarCartao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartao.nome.trim() || !novoCartao.limite) return;
    // Garante que o nome seja capitalizado para consistência
    const cartaoFinal = { ...novoCartao, nome: novoCartao.nome.trim().toUpperCase(), id: Date.now() };
    setCartoes(prev => [...prev, cartaoFinal]);
    setSugestoesCartao([]);
    setNovoCartao({ nome: '', limite: '', diaVencimento: 1 });
  };

  const adicionarAssinatura = (e: React.FormEvent) => {
    e.preventDefault();
    setAssinaturas(a => [...a, {
      ...novaAssinatura,
      id: Date.now(),
      cartaoNome: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? (cartoes.find(c => c.id === novaAssinatura.cartaoId)?.nome ?? null)
        : null,
      cartaoId: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? novaAssinatura.cartaoId
        : null
    }]);
    setNovaAssinatura({
      id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
      categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear()
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
  
  const getCorValor = (valor: number, config: Configuracoes['credito'] | Configuracoes['saldo']) => {
    const critico = toNum(config.critico);
    const alerta = toNum(config.alerta);
    const positivo = toNum(config.positivo);
    if (valor <= critico) return 'text-red-600';
    if (valor <= alerta) return 'text-orange-500';
    if (valor >= positivo) return 'text-green-600';
    return ''; // Cor padrão (preto)
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
          <TabButton id="configuracoes">Configurações</TabButton>
        </div>
      </header>

      {tab === 'dashboard' && (
        <>
          {/* Cards do dashboard */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Saldo (Dinheiro)</div>
              <div className={`text-2xl font-semibold ${getCorValor(saldo, configuracoes.saldo)}`}>{fmt(saldo)}</div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white">
              <div className="text-sm opacity-60">Crédito Disponível</div>
              <div className={`text-xl font-semibold ${getCorValor(creditoDisponivel, configuracoes.credito)}`}>
                {fmt(creditoDisponivel)}
              </div>
              <div className="text-xs opacity-60">Total de {fmt(totalLimite)}</div>
              {cartoes.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {creditByCard.map(({ cartao, disponivel }) => (
                    <li key={cartao.id} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${getCorCartao(cartao.nome).bg}`}></span>
                      <span className="flex-1 truncate">{cartao.nome}</span>
                      <span className="font-medium">{fmt(disponivel)}</span>
                    </li>
                  ))}
                </ul>
              )}
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
          
          {/* Assinaturas anuais */}
          <section className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-lg font-medium mb-3">Assinaturas anuais</h2>
            {anuaisTodos.length === 0 ? (
              <p className="text-sm opacity-60">Nenhuma assinatura anual.</p>
            ) : (
              <ul className="text-sm divide-y">
                {anuaisTodos.map(a => {
                  const vencimento = calcularProximoVencimentoAnual(a);
                  if (!vencimento) return null;

                  return (
                    <li key={a.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {vencimento.ehProximo && <span className="mr-2" title="Vencimento próximo!">⚠️</span>}
                          {a.nome}
                        </div>
                        <div className="opacity-60 text-xs">                          
                          Vence dia {String(a.diaCobranca).padStart(2,'0')}{a.mesCobranca ? `/${String(a.mesCobranca).padStart(2,'0')}`: ''} • {a.tipoPagamento}
                          {a.cartaoId ? ` • ${cartoes.find(c => c.id === a.cartaoId)?.nome ?? ''}` : ''}
                        </div>
                      </div>
                      <div className={`font-semibold ${vencimento.ehProximo ? 'text-red-600' : ''}`}>{fmt(toNum(a.valor))} • {vencimento.texto}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Objetivos */}
          <section className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-lg font-medium mb-3">Objetivos</h2>
            {objetivos.length === 0 ? (
              <p className="text-sm opacity-60">Nenhum objetivo cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objetivos.map(o => {
                  const necessario = toNum(o.valorNecessario);
                  const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valorAtual / necessario) * 100)) : 0;
                  const progresso = (o.status === 'QUITADO - EM PROGRESSO' || o.status === 'QUITADO - FINALIZADO') ? 100 : progressoBase;
                  const quitado = o.status.startsWith('QUITADO');
                  return (
                    <div key={o.id} className={`p-3 rounded-xl border ${quitado ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-sm">{o.nome}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${quitado ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>{o.status}</div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">Meta: {fmt(necessario)}</div>
                      <div className="h-2 bg-gray-200 rounded mt-2">
                        <div className={`h-2 rounded ${quitado ? 'bg-green-500' : 'bg-black'}`} style={{ width: `${progresso}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div>{fmt(o.valorAtual)}</div>
                        <div>{progresso}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </>
      )}

      {tab === 'gastos' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">{editingGastoId ? 'Alterar Gasto' : 'Lançar Gasto'}</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            onSubmit={editingGastoId ? salvarEdicaoGasto : adicionarGasto}
            key={`gasto-form-${editingGastoId || 'novo'}`}
          >
            <div className="md:col-span-4">
              <label className="text-xs opacity-70">Descrição</label>
              <input
                className="w-full p-2 border rounded-lg"
                value={novoGasto.descricao}
                onChange={(e) => {
                  const desc = e.target.value;
                  const catAuto = detectarCategoria(desc);
                  setNovoGasto({ ...novoGasto, descricao: desc, categoria: catAuto });
                }}
                placeholder="ex: almoço ifood"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full p-2 border rounded-lg"
                value={novoGasto.valor}
                onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs opacity-70">Pagamento</label>
              <select
                className="w-full p-2 border rounded-lg"
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
              <div className="md:col-span-3">
                <label className="text-xs opacity-70">Cartão</label>
                <select
                  required
                  className="w-full p-2 border rounded-lg"
                  value={novoGasto.cartaoId ?? ''}
                  onChange={(e) => setNovoGasto({ ...novoGasto, cartaoId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Selecione...</option>
                  {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Categoria</label>
              <select className="w-full p-2 border rounded-lg"
                value={novoGasto.categoria}
                onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
                {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Data</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg"
                value={novoGasto.data}
                onChange={(e) => setNovoGasto({ ...novoGasto, data: e.target.value })}
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">
                {editingGastoId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingGastoId && (
                <button type="button" onClick={cancelarEdicaoGasto} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
              )}
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
                    <th className="text-right pr-4">Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.slice().reverse().map(g => (
                    <tr key={g.id} className="border-t">
                      <td className="py-2 pr-2">{g.data}</td>
                      <td>{g.descricao}</td>
                      <td>{g.categoria}</td>
                      <td>{g.tipoPagamento}{g.cartaoNome ? ` · ${g.cartaoNome}` : ''}</td>
                      <td className="text-right pr-4">{fmt(toNum(g.valor))}</td>
                      <td className="flex gap-2">
                        <button type="button" onClick={() => iniciarEdicaoGasto(g)} className="text-xs text-blue-600 hover:underline">Alterar</button>
                        <button type="button" onClick={() => removerGasto(g.id)} className="text-xs text-red-600 hover:underline">Remover</button>
                      </td>
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
          <h2 className="text-lg font-medium">{editingReceitaId ? 'Alterar Receita' : 'Lançar Receita'}</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            onSubmit={editingReceitaId ? salvarEdicaoReceita : adicionarReceita}
            key={`receita-form-${editingReceitaId || 'novo'}`}
          >
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
            <div className="flex gap-2">
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm">
                {editingReceitaId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingReceitaId && (
                <button type="button" onClick={cancelarEdicaoReceita} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
              )}
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium mb-2">Últimas receitas</h3>
            {receitas.length === 0 ? (
              <p className="text-sm opacity-60">Sem lançamentos</p>
            ) : (
              <ul className="text-sm space-y-1">
                {receitas.slice().reverse().map(r => (
                  <li key={r.id} className="flex justify-between items-center border-t py-2">
                    <div>{r.data} · {r.descricao}</div>
                    <div className="flex items-center gap-4">
                      <span>{fmt(toNum(r.valor))}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => iniciarEdicaoReceita(r)} className="text-xs text-blue-600 hover:underline">Alterar</button>
                        <button type="button" onClick={() => removerReceita(r.id)} className="text-xs text-red-600 hover:underline">Remover</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === 'assinaturas' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-4">
          <h2 className="text-lg font-medium">{editingAssinaturaId ? 'Alterar Assinatura/Contrato' : 'Adicionar Assinatura/Contrato'}</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            onSubmit={editingAssinaturaId ? salvarEdicaoAssinatura : adicionarAssinatura}
            key={`assinatura-form-${editingAssinaturaId || 'novo'}`}
          >
            <div className="md:col-span-4">
              <label className="text-xs opacity-70">Nome</label>
              <input className="w-full p-2 border rounded-lg"
                value={novaAssinatura.nome}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, nome: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full p-2 border rounded-lg"
                value={novaAssinatura.valor}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, valor: e.target.value })} />
            </div>
            <div className="md:col-span-3 grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs opacity-70">Dia</label>
                <input type="number" min="1" max="31" className="w-full p-2 border rounded-lg"
                  value={novaAssinatura.diaCobranca}
                  onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, diaCobranca: Number(e.target.value || 1) })} />
              </div>
              {novaAssinatura.periodoCobranca === 'ANUAL' && (
                <div>
                  <label className="text-xs opacity-70">Mês</label>
                  <select className="w-full p-2 border rounded-lg"
                    value={novaAssinatura.mesCobranca}
                    onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, mesCobranca: Number(e.target.value || 1) })}>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              {novaAssinatura.periodoCobranca === 'ANUAL' && (
                <div>
                  <label className="text-xs opacity-70">Ano Adesão</label>
                  <input type="number" min="2000" max="2100" className="w-full p-2 border rounded-lg"
                    value={novaAssinatura.anoAdesao} onChange={(e) => setNovaAssinatura({ ...novaAssinatura, anoAdesao: Number(e.target.value) })} />
                </div>
              )}
            </div>
            <div className="md:col-span-3">
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
              <div className="md:col-span-3">
                <label className="text-xs opacity-70">Categoria do contrato</label>
                <input className="w-full p-2 border rounded-lg"
                  value={novaAssinatura.categoriaPersonalizada || ''}
                  onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, categoriaPersonalizada: e.target.value })} />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Periodicidade</label>
              <select className="w-full p-2 border rounded-lg"
                value={novaAssinatura.periodoCobranca}
                onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, periodoCobranca: e.target.value as Periodo })}>
                <option value="MENSAL">MENSAL</option>
                <option value="ANUAL">ANUAL</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Pagamento</label>
              <select className="w-full p-2 border rounded-lg"
                value={novaAssinatura.tipoPagamento}
                onChange={(e)=>setNovaAssinatura({
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
                <select className="w-full p-2 border rounded-lg"
                  value={novaAssinatura.cartaoId ?? ''}
                  onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, cartaoId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Selecione...</option>
                  {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-2 flex gap-2">
              <button className="px-3 py-2 rounded-lg bg-black text-white text-sm w-full">
                {editingAssinaturaId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingAssinaturaId && (
                <button type="button" onClick={cancelarEdicaoAssinatura} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
              )}
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
                    <th>Vencimento</th>
                    <th>Tipo</th>
                    <th>Período</th>
                    <th>Pagamento</th>
                    <th className="text-right">Valor Anual</th>
                  </tr>
                </thead>
                <tbody>
                  {assinaturas.slice().reverse().map(a => (
                    <tr key={a.id} className="border-t text-sm">
                      <td className="py-2">
                        {a.periodoCobranca === 'MENSAL' && calcularProximoVencimentoMensal(a)?.ehProximo && <span className="mr-2" title="Vencimento próximo!">⚠️</span>}
                        {a.periodoCobranca === 'ANUAL' && calcularProximoVencimentoAnual(a)?.ehProximo && <span className="mr-2" title="Vencimento próximo!">⚠️</span>}
                        {a.nome}
                      </td>
                      <td>{fmt(toNum(a.valor))}</td>
                      <td>{a.periodoCobranca === 'ANUAL' ? `${String(a.diaCobranca).padStart(2,'0')}/${String(a.mesCobranca).padStart(2,'0')}` : `Dia ${a.diaCobranca}`}</td>
                      <td>{a.tipo}{a.categoriaPersonalizada ? ` · ${a.categoriaPersonalizada}` : ''}</td>
                      <td>{a.periodoCobranca}</td>
                      <td>{a.tipoPagamento}{a.cartaoNome ? ` · ${a.cartaoNome}` : ''}</td>
                      <td className="text-right">{fmt(toNum(a.valor) * (a.periodoCobranca === 'MENSAL' ? 12 : 1))}</td>
                      <td className="pl-4 w-px">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => iniciarEdicaoAssinatura(a)} className="text-xs text-blue-600 hover:underline">Alterar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 text-right font-semibold">
              Valor Total Anual de Assinaturas: {fmt(totalAnualAssinaturas)}
            </div>
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
            <div className="relative">
              <label className="text-xs opacity-70">Nome</label>
              <input className="w-full p-2 border rounded-lg"
                value={novoCartao.nome}
                onChange={(e) => {
                  const valor = e.target.value;
                  setNovoCartao({ ...novoCartao, nome: valor.toUpperCase() });
                  if (valor.trim()) {
                    const sugestoes = SUGESTOES_BANCOS.filter(b => b.startsWith(valor.toUpperCase()));
                    setSugestoesCartao(sugestoes);
                    setSugestaoAtivaIndex(sugestoes.length > 0 ? 0 : -1);
                  } else {
                    setSugestoesCartao([]);
                  }
                }}
                onBlur={() => setTimeout(() => setSugestoesCartao([]), 150)}
                onKeyDown={(e) => {
                  if (sugestoesCartao.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSugestaoAtivaIndex(prev => (prev + 1) % sugestoesCartao.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSugestaoAtivaIndex(prev => (prev - 1 + sugestoesCartao.length) % sugestoesCartao.length);
                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                      if (sugestaoAtivaIndex > -1) {
                        e.preventDefault();
                        setNovoCartao(c => ({...c, nome: sugestoesCartao[sugestaoAtivaIndex]}));
                        setSugestoesCartao([]);
                      }
                    } else if (e.key === 'Escape') {
                      setSugestoesCartao([]);
                    }
                  }
                }}
                 />
              {sugestoesCartao.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {sugestoesCartao.map((s, index) => <li key={s} className={`p-2 cursor-pointer ${sugestaoAtivaIndex === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onMouseDown={() => { setNovoCartao(c => ({...c, nome: s})); setSugestoesCartao([]); }}>{s}</li>)}
                </ul>
              )}
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
            <div className="font-medium flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full inline-block ${getCorCartao(c.nome).bg}`}></span>
              {c.nome}
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

      {tab === 'configuracoes' && (
        <section className="p-4 rounded-2xl shadow bg-white space-y-6">
          <h2 className="text-lg font-medium">Configurações</h2>

          <div className="p-4 border rounded-xl">
            <h3 className="font-medium mb-2">Cores do Dashboard</h3>
            <p className="text-sm opacity-70 mb-4">Defina os valores para que os indicadores de "Saldo" e "Crédito Disponível" mudem de cor.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-2">Saldo (Dinheiro)</h4>
                <div className="space-y-2">
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-orange-500">laranja</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.saldo.alerta} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, alerta: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-red-600">vermelho</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.saldo.critico} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, critico: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-green-600">verde</b> acima de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.saldo.positivo} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, positivo: e.target.value } }))} />
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Crédito Disponível</h4>
                <div className="space-y-2">
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-orange-500">laranja</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.credito.alerta} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, alerta: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-red-600">vermelho</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.credito.critico} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, critico: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-green-600">verde</b> acima de (R$):</span>
                    <input type="number" step="0.01" className="p-2 border rounded-lg" value={configuracoes.credito.positivo} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, positivo: e.target.value } }))} />
                  </label>
                </div>
              </div>
            </div>
          </div>
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
                          <td className="py-1">
                            {calcularProximoVencimentoMensal(a)?.ehProximo && (
                              <span className="mr-2" title="Vencimento próximo!">⚠️</span>
                            )}
                            {a.nome}
                          </td>
                          <td>{fmt(toNum(a.valor))}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${a.cartaoNome ?? ''}` : ''}</td>
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
                          <td>{fmt(toNum(a.valor))}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${a.cartaoNome ?? ''}` : ''}</td>
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
                        <td className="py-1">{l.data.toString().startsWith('Invalid') ? l.data.toString() : (new Date(l.data)).toLocaleDateString()}</td>
                        <td>{l.descricao}</td>
                        <td>
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full inline-block ${getCorCartao(l.cartaoNome || '').bg}`}></span>
                            {l.cartaoNome}
                          </span>
                        </td>
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
                        <div className="opacity-60">Limite {fmt(toNum(r.cartao.limite))}</div>
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