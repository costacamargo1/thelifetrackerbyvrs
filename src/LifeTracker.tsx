  import React, { useState, useEffect, useMemo, useCallback } from 'react';
  import { LayoutDashboard, TrendingDown, TrendingUp, Repeat, CreditCard, Receipt, Calendar, Settings, Sun, Moon, Goal, ChevronsLeft, ChevronsRight } from 'lucide-react';
  import { Gasto, Receita, Assinatura, Objetivo, Cartao, Configuracoes as ConfiguracoesType, TipoPagamento, StatusObj, Periodo } from './pages/types';
  import Gastos from './pages/Gastos';
  import Receitas from './pages/Receitas'; 
  import ContasRecorrentes from './pages/ContasRecorrentes';
  import Objetivos from './pages/Objetivos';
  import Cartoes from './pages/Cartoes'; // Keep this line
  import Faturas from './pages/Faturas';
  import ResumoAnual from './pages/ResumoAnual';
  import Configuracoes from './pages/Configuracoes';
  import Sidebar from './components/Sidebar';
  import { fmt, toNum, detectarCategoria, SUGESTOES_GLOBAIS, SUGESTOES_DESCRICAO, CATEGORIAS_GASTO, SUGESTOES_BANCOS } from '../utils/helpers';
  import LifeTrackerIconOnly from "./components/LifeTrackerIconOnly";

  import NubankIcon from './components/assets/icons/card-nubank.svg';
  import ItauIcon from './components/assets/icons/card-itau.svg';
  import BradescoIcon from './components/assets/icons/card-bradesco.svg';
  import BBIcon from './components/assets/icons/card-bb.svg';
  import CaixaIcon from './components/assets/icons/card-caixa.svg';
  import SantanderIcon from './components/assets/icons/card-santander.svg';
  import C6Icon from './components/assets/icons/card-c6.svg';


  /** =========================
   * Helpers
   * ========================= */
  const getDadosCartao = (nomeCartao: string): { bg: string; text: string; imagem: string | null } => {
    const nome = (nomeCartao || '').toLowerCase();

    if (nome.includes('nubank')) return { bg: 'bg-purple-600', text: 'text-white', imagem: NubankIcon };
    if (nome.includes('santander')) return { bg: 'bg-red-600', text: 'text-white', imagem: SantanderIcon };
    if (nome.includes('caixa')) return { bg: 'bg-blue-700', text: 'text-white', imagem: CaixaIcon };
    if (nome.includes('inter')) return { bg: 'bg-orange-500', text: 'text-white', imagem: null /* InterIcon */ }; // Adicionar import do Inter se existir
    if (nome.includes('bradesco')) return { bg: 'bg-red-700', text: 'text-white', imagem: BradescoIcon };
    if (nome.includes('itau') || nome.includes('itaú')) return { bg: 'bg-orange-400', text: 'text-black', imagem: ItauIcon };
    if (nome.includes('c6')) return { bg: 'bg-gray-800', text: 'text-white', imagem: C6Icon };
    if (nome.includes('bb') || nome.includes('brasil')) return { bg: 'bg-yellow-400', text: 'text-blue-800', imagem: BBIcon };

    return { bg: 'bg-gray-200', text: 'text-black', imagem: null };
  };

  export const getCorProgresso = (percent: number) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 75) return 'bg-yellow-500';
    if (percent < 90) return 'bg-orange-500';
    return 'bg-red-600';
  };
  // ... (restante das funções auxiliares: getCorTextoProgresso, fmt, toNum, isSameMonth, etc.) ...
  const getCorTextoProgresso = (percent: number) => {
    if (percent < 50) return 'text-green-600';
    if (percent < 75) return 'text-yellow-600';
    if (percent < 90) return 'text-orange-600';
    return 'text-red-600';
  };


  const isSameMonth = (isoDate: string, ref = new Date()) => {
    // CORRIGIDO: Lógica de data mais robusta para evitar problemas de fuso
    if (!isoDate || isoDate.length < 10) return false; 
    const d = new Date(isoDate + 'T12:00:00'); // Adiciona hora do meio-dia
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  };

  const isPreviousMonth = (isoDate: string, ref = new Date()) => {
    if (!isoDate || isoDate.length < 10) return false;
    const d = new Date(isoDate + 'T12:00:00');
    const prevMonthRef = new Date(ref);
    prevMonthRef.setMonth(ref.getMonth() - 1);
  
    return d.getFullYear() === prevMonthRef.getFullYear() && d.getMonth() === prevMonthRef.getMonth();
  };

  const calcularGastosPorCategoria = (lista: Gasto[] = []) => {
    return lista.reduce((acc: Record<string, number>, g) => {
      const cat = (g?.categoria ?? 'OUTROS') as string;
      const v = toNum(g?.valor);
      acc[cat] = (acc[cat] || 0) + v;
      return acc;
    }, {} as Record<string, number>);
  };

  const calcularProximoVencimentoAnual = (assinatura: Assinatura) => {
    if (assinatura.periodoCobranca !== 'ANUAL') return null;

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1; // Mês de 1 a 12
    const diaAtual = hoje.getDate();

    let anoVencimento = anoAtual;
    // Se o mês de cobrança já passou ou é o mês atual e o dia de cobrança já passou
    if (assinatura.mesCobranca! < mesAtual || (assinatura.mesCobranca === mesAtual && assinatura.diaCobranca! < diaAtual)) {
      anoVencimento++;
    }

    const dataVencimento = new Date(anoVencimento, assinatura.mesCobranca! - 1, assinatura.diaCobranca!);
    const diffDias = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    return {
      data: dataVencimento,
      ehProximo: diffDias <= 30 && diffDias >= 0, // Considera próximo se for nos próximos 30 dias
      texto: `em ${diffDias} dias`,
    };
  };

  /** =========================
   * Componente principal
   * ========================= */

  // Define as props que o LifeTracker receberá do App.tsx
  interface LifeTrackerProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
  }

  // Renomeado de 'export default function LifeTracker...'
  const LifeTracker: React.FC<LifeTrackerProps> = ({ darkMode, toggleDarkMode }) => {
    // Abas
    const [tab, setTab] = React.useState<'dashboard' | 'gastos' | 'receitas' | 'contas-recorrentes' | 'objetivos' | 'cartoes' | 'dividas' | 'faturas' | 'configuracoes' | 'resumo-anual'>('dashboard');

    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    React.useEffect(() => {
    // Mobile = telas menores que 640px (breakpoint do Tailwind)
    if (window.innerWidth < 640) {
      setIsSidebarCollapsed(true);
    }
  }, []);
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
    const [configuracoes, setConfiguracoes] = React.useState<ConfiguracoesType>({
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
    // --- Faturas ---
    const [mesFatura, setMesFatura] = React.useState(new Date());
    const [buscaFatura, setBuscaFatura] = React.useState('');
    const [anoResumo, setAnoResumo] = React.useState(new Date().getFullYear());

    const [valorAdicionarObjetivo, setValorAdicionarObjetivo] = React.useState<Record<number, string>>({});
    const [sugestaoAtivaIndex, setSugestaoAtivaIndex] = React.useState(-1);
    const [sugestoesDescricao, setSugestoesDescricao] = React.useState<string[]>([]);
    const [sugestaoDescricaoAtivaIndex, setSugestaoDescricaoAtivaIndex] = React.useState(-1);


    const startEditCard = (c: Cartao) => {
      setEditingCardId(c.id);
      setEditCardDraft({ ...c });
    };

    const cancelEditCard = () => {
      setEditingCardId(null);
      setEditCardDraft(null);
    };

  const saveEditCard = () => {
    if (!editCardDraft || editCardDraft.id === undefined) return;
    
    const updatedCartoes = cartoes.map(x => {
      if (x.id === editCardDraft.id) {
        return {
          id: editCardDraft.id,
          nome: editCardDraft.nome ?? "",
          limite: editCardDraft.limite ?? "0",
          // CORRIGIDO: Acessa 'diaFechamento' diretamente, pois corrigimos a interface
          diaFechamento: editCardDraft.diaFechamento ?? 1, 
          diaVencimento: editCardDraft.diaVencimento ?? 1 
        };
      }
      return x;
    });
    
    setCartoes(updatedCartoes);
    setEditingCardId(null);
    setEditCardDraft(null);
  };

    const deleteCard = (id: number) => {
      const toDelete = cartoes.find(c => c.id == id);
      if (!toDelete) return;
      if (!window.confirm(`Remover o cartão "${toDelete.nome}"? Seus gastos antigos permanecem, apenas deixam de apontar para este cartão.`)) return;

      // Remover cartão e, se era padrão, definir o primeiro restante como padrão
      setCartoes((prev: Cartao[]) => prev.filter((x: Cartao) => x.id !== id));

      // Para não quebrar referências: zera cartaoId dos gastos que apontavam para ele (mantém cartaoNome como histórico)
      setGastos(prev => prev.map(g => g.cartaoId === id ? { ...g, cartaoId: null } : g));
      // Também para assinaturas
      setAssinaturas(prev => prev.map(a => a.cartaoId === id ? { ...a, cartaoId: null } : a));
    };

    const removerAssinatura = (id: number): void => {
      const assinaturaParaRemover = assinaturas.find(a => a.id === id);

      if (!assinaturaParaRemover) return;
      
      // Adicionado confirm
      if (!window.confirm(`Tem certeza que deseja remover a assinatura "${assinaturaParaRemover.nome}"?`)) {
        return;
      }

      // Se for um aluguel pago, remove também o gasto correspondente para estornar o valor.
      if (assinaturaParaRemover.tipo === 'CONTRATO - ALUGUEL' && assinaturaParaRemover.pagoEsteMes) {
        const descricaoGastoAluguel = `Pagamento Aluguel: ${assinaturaParaRemover.nome}`;
        setGastos(prevGastos => prevGastos.filter(g => 
          !(g.descricao === descricaoGastoAluguel && g.categoria === 'MORADIA' && isSameMonth(g.data))
        ));
      }

      setAssinaturas(prev => prev.filter(a => a.id !== id));
    };

    const pagarParcelaAcordo = (id: number): void => {
      setAssinaturas((prev: Assinatura[]) =>
        prev.map((a: Assinatura) => {
          if (a.id === id && a.tipo === 'ACORDO') {
            const proximaParcela = (a.parcelaAtual ?? 0) + 1;
            return { ...a, parcelaAtual: proximaParcela };
          }
          return a;
        })
      );
    };

    // Forms
    
    const [novoGasto, setNovoGasto] = React.useState<Gasto>({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
      parcelasTotal: 1
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

    interface NovoCartaoDraft {
      nome: string;
      limite: string;
      diaVencimento: number; 
      diaFechamento: number; 
    }
    // CORRIGIDO: Removida a segunda definição de NovoCartaoDraft

    const [novoCartao, setNovoCartao] = React.useState<NovoCartaoDraft>({
      nome: '',
      limite: '',
      diaVencimento: 1, 
      diaFechamento: 1, 
    });


    // Persistência (localStorage)
    React.useEffect(() => {
      const load = <T,>(k: string, fallback: T) => {
        try { const s = localStorage.getItem(k); return s ? JSON.parse(s) as T : fallback; }
        catch { return fallback; }
      };
      setGastos(load<Gasto[]>('ltf_gastos', []));
      setReceitas(load<Receita[]>('ltf_receitas', []));
      setAssinaturas(load<Assinatura[]>('ltf_assinaturas', []));
      setObjetivos(load<Objetivo[]>('ltf_objetivos', []));
      setCartoes(load<Cartao[]>('ltf_cartoes', []));
      setConfiguracoes(load<ConfiguracoesType>('ltf_configuracoes', {
        credito: { alerta: '2500', critico: '1000', positivo: '5000' },
        saldo: { alerta: '500', critico: '100', positivo: '2000' },
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // CORRIGIDO: Usando chaves prefixadas e únicas
    React.useEffect(() => { localStorage.setItem('ltf_gastos', JSON.stringify(gastos)); }, [gastos]);
    React.useEffect(() => { localStorage.setItem('ltf_receitas', JSON.stringify(receitas)); }, [receitas]);
    React.useEffect(() => { localStorage.setItem('ltf_assinaturas', JSON.stringify(assinaturas)); }, [assinaturas]);
    React.useEffect(() => { localStorage.setItem('ltf_objetivos', JSON.stringify(objetivos)); }, [objetivos]);
    React.useEffect(() => { localStorage.setItem('ltf_cartoes', JSON.stringify(cartoes)); }, [cartoes]);
    // CORRIGIDO: Removido useEffect duplicado
    React.useEffect(() => { localStorage.setItem('ltf_configuracoes', JSON.stringify(configuracoes)); }, [configuracoes]);

    // Derivados
    const totalReceitas = React.useMemo(
      () => receitas.reduce((acc, r) => acc + toNum(r.valor), 0),
      [receitas]
    );
  // ... (restante dos useMemo: gastosDebito, gastosCredito, etc.) ...
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

    const gastosTotal = React.useMemo(
      () => gastosCredito + gastosDebito,
      [gastosCredito, gastosDebito]
    );

    const assinDebitoMensal = React.useMemo(
      () => assinaturas
        .filter(a => a.tipoPagamento === 'DÉBITO' && a.periodoCobranca === 'MENSAL' && a.tipo !== 'CONTRATO - ALUGUEL')
        .reduce((acc, a) => acc + toNum(a.valor), 0),
      [assinaturas]
    );

    const saldo = React.useMemo(
      () => totalReceitas - gastosDebito - assinDebitoMensal,
      [totalReceitas, gastosDebito, assinDebitoMensal]
    );

    const saldoMesAnterior = React.useMemo(() => {
      const receitasMesAnterior = receitas
        .filter(r => isPreviousMonth(r.data))
        .reduce((acc, r) => acc + toNum(r.valor), 0);

      const gastosDebitoMesAnterior = gastos
        .filter(g => g.tipoPagamento === 'DÉBITO' && isPreviousMonth(g.data))
        .reduce((acc, g) => acc + toNum(g.valor), 0);

      // Assumindo que assinaturas de débito são constantes mês a mês
      return receitasMesAnterior - gastosDebitoMesAnterior - assinDebitoMensal;
    }, [receitas, gastos, assinDebitoMensal]);




    // Listas derivadas para modais
    const assinMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ASSINATURA'), [assinaturas]);

    // Assinaturas mensais pagas no crédito também contam como gasto de crédito do mês
    const assinaturasCreditoMensal = React.useMemo(
      () => assinMensais.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((s, a) => s + toNum(a.valor), 0),
      [assinMensais]
    );


    const porCategoria = React.useMemo(() => calcularGastosPorCategoria(gastos), [gastos]);
    const anuaisTodos = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'ANUAL'), [assinaturas]);
    const anuaisProximas = React.useMemo(() => anuaisTodos.filter(a => {
      const vencimento = calcularProximoVencimentoAnual(a); 
      return !!vencimento && (vencimento.ehProximo ?? false); // Use the renamed helper
    }), [anuaisTodos]);

    // Assinaturas anuais que vencem no mês atual
    const anuaisVencendoMes = React.useMemo(() => anuaisTodos.filter(a => {
      const vencimento = calcularProximoVencimentoAnual(a);
      return vencimento ? isSameMonth(vencimento.data.toISOString()) : false;
    }), [anuaisTodos]);

    const totalAssinAnualMesCorrenteCredito = React.useMemo(
      () => anuaisVencendoMes.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((acc, a) => acc + toNum(a.valor), 0),
      [anuaisVencendoMes]
    );

    // Lógica da aba Faturas
    const faturasPorCartao = React.useMemo(() => {
      const isMesFatura = (data: string) => {
        const d = new Date(data + 'T12:00:00');
        return d.getFullYear() === mesFatura.getFullYear() && d.getMonth() === mesFatura.getMonth();
      };

      const faturas = cartoes.map(cartao => {
        const gastosDoCartao = gastos.filter(g => g.cartaoId === cartao.id && g.tipoPagamento === 'CRÉDITO' && isMesFatura(g.data));
        const assinaturasDoCartao = assinaturas.filter(a => a.cartaoId === cartao.id && a.tipoPagamento === 'CRÉDITO' && a.periodoCobranca === 'MENSAL');
        
        const lancamentos = [
          ...gastosDoCartao.map(g => ({ ...g, dataObj: new Date(g.data + 'T12:00:00') })),
          ...assinaturasDoCartao.map(a => ({
            id: `ass-${a.id}`,
            descricao: a.nome,
            valor: a.valor,
            data: new Date(mesFatura.getFullYear(), mesFatura.getMonth(), a.diaCobranca).toISOString().slice(0, 10),
            dataObj: new Date(mesFatura.getFullYear(), mesFatura.getMonth(), a.diaCobranca),
            categoria: a.categoriaPersonalizada || a.tipo,
            // Adiciona os campos que faltam para Gasto
            tipoPagamento: a.tipoPagamento,
            cartaoId: a.cartaoId,
            cartaoNome: a.cartaoNome,
          }))
        ].sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());

        const total = lancamentos.reduce((acc, item) => acc + toNum(item.valor), 0);

        return {
          cartao,
          lancamentos: lancamentos as (Gasto & { dataObj: Date })[], // Cast para unificar o tipo
          total,
          disponivel: toNum(cartao.limite) - total,
        };
      });


      // Ordenação especial para layout
      if (faturas.length > 1) {
        faturas.sort((a, b) => toNum(b.cartao.limite) - toNum(a.cartao.limite));
        if (faturas.length > 2) {
          // Move o segundo maior para o início (será o da esquerda)
          const segundo = faturas.splice(1, 1)[0];
          if (segundo) {
            faturas.unshift(segundo);
          }
        }
      }
      return faturas;
    }, [cartoes, gastos, assinaturas, mesFatura]);

    const faturasFiltradas = React.useMemo(() => {
      if (!buscaFatura.trim()) return faturasPorCartao;
      const query = buscaFatura.toLowerCase();

      return faturasPorCartao.map(fatura => ({
        ...fatura,
        lancamentos: fatura.lancamentos.filter(l => 
          l.descricao.toLowerCase().includes(query) ||
          (l.categoria || '').toLowerCase().includes(query) || // Adiciona verificação para categoria
          String(l.valor).includes(query)
        ),
      }));
    }, [faturasPorCartao, buscaFatura]);
  // ... (restante dos useMemo: totalFaturasMes, creditoDisponivel, etc.) ...
    const totalFaturasMes = React.useMemo(() => faturasPorCartao.reduce((acc, f) => acc + f.total, 0), [faturasPorCartao]);


    const creditoDisponivel = React.useMemo(
      () =>
        Math.max(
          0,
          totalLimite - (gastosCredito + assinaturasCreditoMensal + totalAssinAnualMesCorrenteCredito)
        ),
      [totalLimite, gastosCredito, assinaturasCreditoMensal, totalAssinAnualMesCorrenteCredito]
    ); 

    // Compras parceladas ativas
   const comprasParceladasAtivas = React.useMemo(() => {
      const parcelados = gastos.filter(g => g.parcelaId && g.tipoPagamento === 'CRÉDITO');
      const grouped = parcelados.reduce((acc, g) => {
        if (!g.parcelaId) return acc;
        if (!acc[g.parcelaId]) {
          acc[g.parcelaId] = {
            descricao: g.descricao,
            // Ensure g.valor is a string before passing to toNum
            // And g.parcelasTotal is a number before multiplication
            valorTotal: toNum(String(g.valor)) * (g.parcelasTotal || 1),
            parcelasPagas: 0,
            parcelasTotal: g.parcelasTotal || 0,
            valorParcela: toNum(g.valor),
            cartaoNome: g.cartaoNome || 'Não identificado',
          };
        }
        // Conta quantas parcelas já passaram (parcelas com data <= hoje)
        const hoje = new Date();
        const dataParcela = new Date(g.data + "T12:00:00"); // Adiciona T12 para evitar fuso
        // Check if acc[g.parcelaId] is defined before accessing its properties
        if (dataParcela <= hoje && acc[g.parcelaId]) {
          acc[g.parcelaId]!.parcelasPagas = Math.max(acc[g.parcelaId]!.parcelasPagas, g.parcelaAtual || 0);
        }
        return acc;
      }, {} as Record<string, { descricao: string; valorTotal: number; parcelasPagas: number; parcelasTotal: number; valorParcela: number; cartaoNome: string }>);

      return Object.values(grouped).filter(g => g.parcelasPagas < g.parcelasTotal);
    }, [gastos]);

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

    const totalAnualAssinaturas = React.useMemo(() => {
      return assinaturas.reduce((acc, a) => {
        return acc + (toNum(a.valor) * (a.periodoCobranca === 'MENSAL' ? 12 : 1));
      }, 0);
    }, [assinaturas]);


  const acordosMensais = React.useMemo(() => {
    return assinaturas
      .filter(a => a.tipo === 'ACORDO' && a.periodoCobranca === 'MENSAL' && (a.parcelaAtual ?? 1) <= (a.parcelasTotal ?? 1))
      .reduce((acc, a) => {
        const valorParcela = toNum(a.valor) / (a.parcelasTotal ?? 1);
        return acc + valorParcela;
      }, 0);
  }, [assinaturas]);

  const acordosAnuaisVencendoMes = React.useMemo(() => {
    return anuaisVencendoMes
      .filter(a => a.tipo === 'ACORDO' && (a.parcelaAtual ?? 1) <= (a.parcelasTotal ?? 1))
      .reduce((acc, a) => {
        const valorParcela = toNum(a.valor) / (a.parcelasTotal ?? 1);
        return acc + valorParcela;
      }, 0);
  }, [anuaisVencendoMes]);

  const totalAcordosMes = acordosMensais + acordosAnuaisVencendoMes;

  // AGORA O PREVISAO MES (atualize o total)
  const previsaoMes = React.useMemo(() => ({
    aluguel: totalAluguelMensal,
    assinaturas: totalAssinMensal + totalAssinAnualMesCorrente,
    credito: gastosCreditoMes,
    acordos: totalAcordosMes, // <-- CORRIGIDO: Adicionado acordos
    total: totalAluguelMensal + totalAssinMensal + totalAssinAnualMesCorrente + gastosCreditoMes + totalAcordosMes
  }), [totalAluguelMensal, totalAssinMensal, totalAssinAnualMesCorrente, gastosCreditoMes, totalAcordosMes]);
    // ------------------------------------

    // --- Resumo Anual ---
    const dadosResumoAnual = React.useMemo(() => {
      const meses = Array.from({ length: 12 }, (_, i) => ({
        mes: i,
        nome: new Date(anoResumo, i, 1).toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
        receitas: 0,
        gastosDebito: 0,
        gastosCredito: 0,
      }));

      receitas.forEach(r => {
        const d = new Date(r.data + 'T12:00:00');
        if (d.getFullYear() === anoResumo) {
          meses[d.getMonth()]!.receitas += toNum(r.valor);
        }
      });

      gastos.forEach(g => {
        const d = new Date(g.data + 'T12:00:00');
        if (d.getFullYear() === anoResumo) {
          if (g.tipoPagamento === 'CRÉDITO') {
            meses[d.getMonth()]!.gastosCredito += toNum(g.valor);
          } else {
            meses[d.getMonth()]!.gastosDebito += toNum(g.valor);
          }
        }
      });

      return meses;
    }, [anoResumo, receitas, gastos]);

    // Listas derivadas para modais
    const alugueisMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'CONTRATO - ALUGUEL'), [assinaturas]);
    const acordosMensaisList = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ACORDO'), [assinaturas]);

    // Lista detalhada de gastos de crédito do mês (gastos + assinaturas mensais no crédito)
    const creditGastosMesList = React.useMemo(() => {
      const now = new Date();
      const gastosList = gastos
        .filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data))
        .map(g => ({
          id: `gasto-${g.id}`,
          tipo: 'gasto' as const,
          data: isNaN(new Date(g.data).getTime()) ? '' : g.data,
          descricao: g.descricao,
          valor: toNum(g.valor),
          cartaoId: g.cartaoId,
          cartaoNome: g.cartaoNome ?? cartoes.find(c => c.id === g.cartaoId)?.nome ?? ''
        }));
   
      const assinList = assinMensais
        .filter(a => a.tipoPagamento === 'CRÉDITO')
        .map(a => ({
          id: `assinatura-${a.id}`,
          tipo: 'assinatura' as const,
          data: new Date(now.getFullYear(), now.getMonth(), a.diaCobranca ?? 1).toISOString().slice(0,10),
          descricao: a.nome + ' (assinatura)',
          valor: toNum(a.valor),
          cartaoId: a.cartaoId,
          cartaoNome: cartoes.find(c => c.id === a.cartaoId)?.nome ?? ''
        }));

      return [...gastosList, ...assinList].sort((a, b) => (new Date(a.data + "T12:00:00")).getTime() - (new Date(b.data + "T12:00:00")).getTime());
    }, [gastos, assinMensais, cartoes]);

   // Resumo por cartão (considerando o total comprometido)
    const creditByCard = React.useMemo(() => {
      // Esta lógica recalcula o 'usado' com base em todos os gastos e assinaturas,
      // o que é mais preciso do que o 'disponível' da fatura (que é só do mês)
      const map = new Map<number, number>();
      gastos.filter(g => g.tipoPagamento === 'CRÉDITO' && g.cartaoId != null).forEach(g => {
        const id = g.cartaoId!;
        map.set(id, (map.get(id) ?? 0) + toNum(g.valor));
      });
      assinaturas
        .filter(a => a.tipoPagamento === 'CRÉDITO' && a.periodoCobranca === 'MENSAL' && a.cartaoId != null)
        .forEach(a => {
          const id = a.cartaoId!;
          map.set(id, (map.get(id) ?? 0) + toNum(a.valor));
        });
      // Adiciona anuais de crédito
      anuaisVencendoMes
        .filter(a => a.tipoPagamento === 'CRÉDITO' && a.cartaoId != null)
        .forEach(a => {
          const id = a.cartaoId!;
          map.set(id, (map.get(id) ?? 0) + toNum(a.valor));
        });

      return cartoes.map(c => ({
        cartao: c,
        usado: map.get(c.id) ?? 0,
        disponivel: Math.max(0, toNum(c.limite) - (map.get(c.id) ?? 0)),
      }));
    }, [gastos, cartoes, assinaturas, anuaisVencendoMes]);


    // Ordenação e filtro da lista de assinaturas mensais
    const mensaisList = React.useMemo(() => {
      const q = mensaisQuery.trim().toLowerCase();
      const base = assinMensais.filter(a => a.nome.toLowerCase().includes(q));
      const sort = [...base].sort((a, b) => {
        if (mensaisSort === 'nome') return a.nome.localeCompare(b.nome);
        if (mensaisSort === 'valor') return toNum(b.valor) - toNum(a.valor); // Mais caro primeiro
        // vencimento
        return (a.diaCobranca ?? 0) - (b.diaCobranca ?? 0);
      });
      return sort;
    }, [assinMensais, mensaisQuery, mensaisSort]);


    // --- BLOCO DE CÓDIGO CORROMPIDO REMOVIDO DAQUI ---

    // Ações
    const adicionarGasto = (e: React.FormEvent) => {
  // ... (restante das funções de ação: adicionarGasto, iniciarEdicaoGasto, etc.) ...
      e.preventDefault();
      if (!novoGasto.descricao || !novoGasto.valor) {
          alert("Descrição e Valor são obrigatórios.");
          return;
      }
      if (novoGasto.tipoPagamento === 'CRÉDITO' && !novoGasto.cartaoId) {
        alert('Por favor, selecione um cartão para o gasto de crédito.');
        return;
      }

      const parcelas = novoGasto.tipoPagamento === 'CRÉDITO' ? (novoGasto.parcelasTotal || 1) : 1;
      const valorParcela = toNum(novoGasto.valor) / parcelas;
      const parcelaId = parcelas > 1 ? `${Date.now()}` : undefined;

      const novosGastos: Gasto[] = [];
      const dataInicial = new Date(novoGasto.data + 'T12:00:00'); // Evita problemas de fuso

      for (let i = 0; i < parcelas; i++) {
        const dataParcela = new Date(dataInicial);
        dataParcela.setMonth(dataInicial.getMonth() + i);

        const cartaoNome = novoGasto.tipoPagamento === 'CRÉDITO'
          ? (cartoes.find(c => c.id === novoGasto.cartaoId)?.nome ?? null)
          : null;

        novosGastos.push({
          ...novoGasto,
          id: Date.now() + i,
          valor: String(valorParcela.toFixed(2)),
          data: dataParcela.toISOString().slice(0, 10),
          cartaoId: novoGasto.tipoPagamento === 'CRÉDITO' ? novoGasto.cartaoId : null,
          cartaoNome,
          parcelaId,
          parcelaAtual: parcelas > 1 ? i + 1 : undefined,
          parcelasTotal: parcelas > 1 ? parcelas : undefined,
        });
      }

      setGastos(g => [...g, ...novosGastos]);

      setNovoGasto({
        id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
        categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
        parcelasTotal: 1
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
        categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
        parcelasTotal: 1
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

  const removerObjetivo = (id: number) => {
    if (window.confirm('Remover este objetivo?')) {
      setObjetivos(prev => prev.filter(obj => obj.id !== id));
    }
  };


    const adicionarReceita = (e: React.FormEvent) => {
      e.preventDefault();
      if (!novaReceita.descricao || !novaReceita.valor) {
          alert("Descrição e Valor são obrigatórios.");
          return;
      }
      setReceitas(r => [...r, { ...novaReceita, id: Date.now() }]);
      setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
    };

    const adicionarCartao = (e: React.FormEvent) => {
      e.preventDefault();
      if (!novoCartao.nome.trim() || !novoCartao.limite) return;
      // Garante que o nome seja capitalizado para consistência
      const cartaoFinal = { ...novoCartao, nome: novoCartao.nome.trim().toUpperCase(), id: Date.now() };
      setCartoes((prev: Cartao[]) => [...prev, cartaoFinal]);
      setSugestoesCartao([]);
      
      setNovoCartao({ nome: '', limite: '', diaVencimento: 1, diaFechamento: 1 });
    };

    const adicionarAssinatura = (e: React.FormEvent) => {
      e.preventDefault();
      if (!novaAssinatura.nome || !novaAssinatura.valor) {
          alert("Nome e Valor são obrigatórios.");
          return;
      }
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
      // Resetar 'pagoEsteMes' para aluguéis no início de cada mês
    React.useEffect(() => {
      const hoje = new Date();
      const primeiroDiaDoMes = hoje.getDate() === 1;

      if (primeiroDiaDoMes) {
        const jaResetou = localStorage.getItem('resetAluguelMes') === `${hoje.getFullYear()}-${hoje.getMonth()}`;
        if (!jaResetou) {
          setAssinaturas(prev => prev.map(a => a.tipo === 'CONTRATO - ALUGUEL' ? { ...a, pagoEsteMes: false } : a));
          localStorage.setItem('resetAluguelMes', `${hoje.getFullYear()}-${hoje.getMonth()}`);
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const adicionarObjetivo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!novoObjetivo.nome || !novoObjetivo.valorNecessario) {
          alert("Nome e Valor Necessário são obrigatórios.");
          return;
      }
      setObjetivos(o => [...o, { ...novoObjetivo, id: Date.now(), valorAtual: novoObjetivo.valorAtual || 0 }]);
      setNovoObjetivo({ id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO' } as unknown as Objetivo);
    };

    const adicionarValorObjetivo = (id: number) => {
      const valor = toNum(valorAdicionarObjetivo[id]);
      if (valor > 0) {
        atualizarObjetivoValor(id, valor);
        setValorAdicionarObjetivo(prev => ({ ...prev, [id]: '' }));
      }
    };
  // ... (restante das funções de ação: atualizarObjetivoValor, alterarStatusObjetivo, etc.) ...
    const atualizarObjetivoValor = (id: number, delta: number) => {
      setObjetivos(list => list.map(o => o.id === id ? { ...o, valorAtual: Math.max(0, o.valorAtual + delta) } : o));
    };

    const alterarStatusObjetivo = (id: number, status: StatusObj) => {
      setObjetivos(list => list.map(o => o.id === id ? { ...o, status } : o));
    };

    const pagarAluguel = (aluguel: Assinatura) => {
      if (aluguel.pagoEsteMes) {
        alert('Este aluguel já foi marcado como pago para o mês atual.');
        return;
      }
      if (!window.confirm(`Confirmar pagamento do aluguel "${aluguel.nome}" de ${fmt(toNum(aluguel.valor))}?`)) {
        return;
      }

      // Adicionar o gasto correspondente
      const novoGastoAluguel: Gasto = {
        id: Date.now(),
        descricao: `Pagamento Aluguel: ${aluguel.nome}`,
        valor: aluguel.valor,
        categoria: 'MORADIA',
        data: new Date().toISOString().slice(0, 10),
        tipoPagamento: aluguel.tipoPagamento,
        cartaoId: aluguel.cartaoId,
        cartaoNome: aluguel.cartaoNome,
      };
      setGastos(g => [...g, novoGastoAluguel]);

      // Marcar como pago
      setAssinaturas(prev => prev.map(a => 
        a.id === aluguel.id ? { ...a, pagoEsteMes: true } : a
      ));
    };

    const getCorValor = (valor: number, config: ConfiguracoesType['credito'] | ConfiguracoesType['saldo']) => {
      const critico = toNum(config.critico);
      const alerta = toNum(config.alerta);
      const positivo = toNum(config.positivo);
      if (valor <= critico) return 'text-red-600 dark:text-red-400';
      if (valor <= alerta) return 'text-orange-500 dark:text-orange-400';
      if (valor >= positivo) return 'text-green-600 dark:text-green-400';
      return 'text-black dark:text-white'; // Cor padrão
    };

    const nomeMesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

    // --- Lógica para o novo card de Saldo ---
    const diferencaSaldo = saldo - saldoMesAnterior;
    const saldoMelhorou = diferencaSaldo >= 0;
    const percentualVariacaoSaldo = saldoMesAnterior !== 0 ? Math.abs((diferencaSaldo / Math.abs(saldoMesAnterior)) * 100) : 0;
    const badgeBgSaldo = saldoMelhorou ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400";
    const diffTextoSaldo = fmt(Math.abs(diferencaSaldo));
    const corValorSaldo = saldo < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200';

    
    const retirarValorObjetivo = (id: number): void => {
      const valor = toNum(valorAdicionarObjetivo[id]);
      if (valor > 0) {
        // Passa o valor como negativo para a função de atualização
        atualizarObjetivoValor(id, -valor);
        setValorAdicionarObjetivo(prev => ({ ...prev, [id]: '' }));
      }
    };

    // O JSX principal é retornado aqui, adaptado do seu código
    return (
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100">
        <Sidebar
          tab={tab}
          setTab={setTab}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {/* Renderização da Aba Ativa */}
        {tab === 'dashboard' && (
          <div className="animate-fadeInUp space-y-8">
            {/* Cards do dashboard - Atualizado */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card de Saldo com variação mensal */}
            <div className="inline-flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/80" style={{ animationDelay: '100ms' }}>
              <div className="p-4 pb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium tracking-[0.14em] text-slate-500 dark:text-slate-400 uppercase">
                    Saldo (Dinheiro)
                  </span>
                  <div className={`mt-1 text-2xl font-semibold ${corValorSaldo}`}>
                    {fmt(saldo)}
                  </div>
                  {/* Badge de variação percentual */}
                  <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${badgeBgSaldo}`}>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                      {saldoMelhorou ? "↑" : "↓"}
                    </span>
                    {`${saldoMelhorou ? "+" : "-"}${percentualVariacaoSaldo.toFixed(1)}%`}
                  </div>
                </div>
                {/* Logo pequena no canto superior direito */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100/80 bg-emerald-500/5 dark:border-slate-700/80 dark:bg-emerald-400/10">
                  <LifeTrackerIconOnly />

                </div>
              </div>
              {/* Rodapé */}
              <div className="px-4 py-3 border-t border-slate-100/80 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800 flex items-center justify-between">
                <span>{`${saldoMelhorou ? "+" : "-"}${diffTextoSaldo} em relação ao mês anterior`}</span>
              </div>
            </div>

              <div className="p-4 rounded-2xl glass-card glass-card-hover">
                <div className="text-sm opacity-60">
                  Crédito Disponível
                </div>
                <div className={`text-xl font-semibold ${getCorValor(creditoDisponivel, configuracoes.credito)}`}>
                  {fmt(creditoDisponivel)}
                </div>
                <div className="text-xs opacity-60 mt-1">Total de {fmt(totalLimite)}</div>
                {cartoes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {creditByCard.map(({ cartao, disponivel }) => (
                      <li key={cartao.id} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full inline-block ${getDadosCartao(cartao.nome).bg}`}></span>
                        <span className="flex-1 truncate">{cartao.nome}</span>
                        <span className="font-medium">{fmt(disponivel)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-4 rounded-2xl glass-card glass-card-hover" style={{ animationDelay: '200ms' }}>
                <div className="text-sm opacity-60">Gastos (Crédito)</div>              
                <div className="text-xl font-medium">{fmt(gastosCredito + assinaturasCreditoMensal)}</div>
                {assinaturasCreditoMensal > 0 && (
                  <div className="text-xs opacity-60">
                    (inclui {fmt(assinaturasCreditoMensal)} de assinaturas)
                  </div>
                )}
              </div>
              <div className="p-4 rounded-2xl glass-card glass-card-hover" style={{ animationDelay: '250ms' }}>
                <div className="text-sm opacity-60">Gastos (Dinheiro)</div>
                <div className="text-xl font-medium">{fmt(gastosDebito)}</div>
              </div>
              <div className="p-4 rounded-2xl glass-card glass-card-hover" style={{ animationDelay: '300ms' }}>
                <div className="text-sm opacity-60">Gastos (Total)</div>
                <div className="text-xl font-medium">{fmt(gastosTotal)}</div>
              </div>
            </section>

            {/* Previsão do mês */}
            <section className="p-4 rounded-2xl glass-card" style={{ animationDelay: '350ms' }}>
              <h2 className="text-lg font-medium mb-3 text-black dark:text-gray-200">Previsão de Gastos (este mês)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-600">
                  <div className="opacity-60">Aluguel</div>
                  <div className="text-lg font-semibold">{fmt(previsaoMes.aluguel)}</div>
                  {alugueisMensais.map(aluguel => (
                    <div key={aluguel.id} className="mt-1 text-xs flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${aluguel.pagoEsteMes ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{aluguel.pagoEsteMes ? 'Pago' : 'Não Pago'}</span>
                      {!aluguel.pagoEsteMes && (
                        <button
                          onClick={() => pagarAluguel(aluguel)}
                          className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-600">
                <div className="opacity-60"> Acordos: </div>
                <div className="text-lg font-semibold">{fmt(totalAcordosMes)}</div>
                </div>
                <button type="button" onClick={() => setShowMensaisModal(true)} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition dark:bg-slate-700 dark:border-slate-600">
                  <div className="opacity-60">Assinaturas Mensais</div>
                  <div className="text-lg font-semibold">{fmt(previsaoMes.assinaturas)}</div>
                </button>
                <button type="button" onClick={() => setShowCreditoMesModal(true)} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition dark:bg-slate-700 dark:border-slate-600">
                  <div className="opacity-60">Gastos em Crédito (mês)</div>
                  <div className="text-lg font-semibold">{fmt(previsaoMes.credito)}</div>
                </button>
               <div className="h-[95px] p-3 rounded-xl bg-gray-900 text-white dark:bg-slate-950 md:col-start-2 md:col-span-2 flex flex-col items-center justify-center " >
                  <div className="opacity-80"> 
                    Total previsto para{' '}
                    <span className="font-bold text-emerald-400 [text-shadow:0_0_8px_#4ade80]">
                      {nomeMesAtual}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{fmt(previsaoMes.total)}</div>
                </div>
              </div>
            </section>
  {/* ... (restante do JSX do dashboard: porCategoria, comprasParceladasAtivas, etc.) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gastos por categoria */}
              <section className="p-4 rounded-2xl glass-card" style={{ animationDelay: '400ms' }}>
                <h2 className="text-lg font-medium mb-3">Gastos por categoria</h2>
                {Object.keys(porCategoria).length === 0 ? (
                  <p className="text-sm opacity-60">Sem lançamentos</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {Object.entries(porCategoria).sort((a,b) => b[1] - a[1]).map(([cat, total]) => (
                      <li key={cat} className="flex justify-between">
                        <span>{cat}</span>
                        <span>{fmt(total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Compras Parceladas Ativas */}
              <section className="p-4 rounded-2xl glass-card" style={{ animationDelay: '450ms' }}>
                <h2 className="text-lg font-medium mb-3">Compras Parceladas Ativas</h2>
                {comprasParceladasAtivas.length === 0 ? (
                  <p className="text-sm opacity-60">Nenhuma compra parcelada ativa.</p>
                ) : (
                  <ul className="text-sm divide-y dark:divide-slate-700">
                    {comprasParceladasAtivas.map((p, i) => (
                      <li key={i} className="py-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{p.descricao}</span>
                          <span className="font-semibold">{fmt(p.valorTotal)}</span>
                        </div>
                        <div className="text-xs opacity-70">
                          {p.parcelasPagas} de {p.parcelasTotal} pagas ({fmt(p.valorParcela)}/mês)
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Assinaturas anuais */}
            <section className="p-4 rounded-2xl glass-card" style={{ animationDelay: '500ms' }}>
              <h2 className="text-lg font-medium mb-3">Assinaturas anuais</h2>
              {anuaisTodos.length === 0 ? (
                <p className="text-sm opacity-60">Nenhuma assinatura anual.</p>
              ) : ( // Use the renamed helper
                <ul className="text-sm divide-y dark:divide-slate-700">
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
                        <div className={`font-semibold ${vencimento.ehProximo ? 'text-red-500' : ''}`}>{fmt(toNum(a.valor))} • {vencimento.texto}</div>
                      
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Objetivos */}
            <section className="p-4 rounded-2xl glass-card" style={{ animationDelay: '550ms' }}>
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
                  <div key={o.id} className={`p-3 rounded-xl border ${quitado ? 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-700' : 'bg-gray-50 dark:bg-slate-700 dark:border-slate-600'}`}>
                        <div className="flex items-start justify-between">
                      <div className="font-medium text-sm text-black dark:text-white">{o.nome}</div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${quitado ? 'bg-green-200 text-green-800' : 'bg-gray-200 dark:bg-slate-600'}`}>{o.status}</div>
                        </div>
                        <div className="text-xs opacity-70 mt-1">Meta: {fmt(necessario)}</div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded mt-2">
                          <div className={`h-2 rounded ${quitado ? 'bg-green-500' : 'bg-emerald-500'}`} style={{ width: `${progresso}%` }} />
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
          </div>
        )}
        {tab === 'gastos' && (
          <Gastos
            gastos={gastos}
            cartoes={cartoes}
            editingGastoId={editingGastoId}
            novoGasto={novoGasto}
            setNovoGasto={setNovoGasto}
            sugestoesDescricao={sugestoesDescricao}
            setSugestoesDescricao={setSugestoesDescricao}
            sugestaoDescricaoAtivaIndex={sugestaoDescricaoAtivaIndex}
            setSugestaoDescricaoAtivaIndex={setSugestaoDescricaoAtivaIndex}
            adicionarGasto={adicionarGasto}
            salvarEdicaoGasto={salvarEdicaoGasto}
            cancelarEdicaoGasto={cancelarEdicaoGasto}
            iniciarEdicaoGasto={iniciarEdicaoGasto}
            removerGasto={removerGasto}
          />
        )}

        {tab === 'receitas' && (
          <Receitas
            receitas={receitas}
            editingReceitaId={editingReceitaId}
            novaReceita={novaReceita}
            setNovaReceita={setNovaReceita}
            adicionarReceita={adicionarReceita}
            salvarEdicaoReceita={salvarEdicaoReceita}
            cancelarEdicaoReceita={cancelarEdicaoReceita}
            iniciarEdicaoReceita={iniciarEdicaoReceita}
            removerReceita={removerReceita}
          />
        )}
        {tab === 'contas-recorrentes' && (
          <ContasRecorrentes
            assinaturas={assinaturas}
            cartoes={cartoes}
            editingAssinaturaId={editingAssinaturaId}
            novaAssinatura={novaAssinatura}
            setNovaAssinatura={setNovaAssinatura}
            adicionarAssinatura={adicionarAssinatura}
            salvarEdicaoAssinatura={salvarEdicaoAssinatura}
            cancelarEdicaoAssinatura={cancelarEdicaoAssinatura}
            iniciarEdicaoAssinatura={iniciarEdicaoAssinatura}
            removerAssinatura={removerAssinatura}
            pagarParcelaAcordo={pagarParcelaAcordo}
            totalAnualAssinaturas={totalAnualAssinaturas}
          />
        )}
        {tab === 'objetivos' && (
          <Objetivos
            objetivos={objetivos}
            novoObjetivo={novoObjetivo}
            setNovoObjetivo={setNovoObjetivo}
            adicionarObjetivo={adicionarObjetivo}
            alterarStatusObjetivo={alterarStatusObjetivo}
            atualizarObjetivoValor={atualizarObjetivoValor}
            removerObjetivo={removerObjetivo}
            valorAdicionarObjetivo={valorAdicionarObjetivo}
            setValorAdicionarObjetivo={setValorAdicionarObjetivo}
            adicionarValorObjetivo={adicionarValorObjetivo}
            retirarValorObjetivo={retirarValorObjetivo}
          />
        )}

        {tab === 'cartoes' && (
          <Cartoes
            cartoes={cartoes}
            novoCartao={novoCartao}
            setNovoCartao={setNovoCartao}
            adicionarCartao={adicionarCartao}
            sugestoesCartao={sugestoesCartao}
            setSugestoesCartao={setSugestoesCartao}
            sugestaoAtivaIndex={sugestaoAtivaIndex}
            setSugestaoAtivaIndex={setSugestaoAtivaIndex}
            editingCardId={editingCardId}
            editCardDraft={editCardDraft}
            setEditCardDraft={setEditCardDraft}
            startEditCard={startEditCard}
            cancelEditCard={cancelEditCard}
            saveEditCard={saveEditCard}
            deleteCard={deleteCard}
            getDadosCartao={getDadosCartao}
          />
        )}
  
        {tab === 'resumo-anual' && (
          <ResumoAnual
            dadosResumoAnual={dadosResumoAnual}
            anoResumo={anoResumo}
            setAnoResumo={setAnoResumo}
          />
        )}

        {tab === 'faturas' && (
          <Faturas
            faturasFiltradas={faturasFiltradas}
            buscaFatura={buscaFatura}
            setBuscaFatura={setBuscaFatura}
            mesFatura={mesFatura}
            setMesFatura={setMesFatura}
            totalFaturasMes={totalFaturasMes}
            getDadosCartao={getDadosCartao}
          />
        )}
  
        {tab === 'configuracoes' && (
          <Configuracoes
            configuracoes={configuracoes}
            setConfiguracoes={setConfiguracoes}
          />
        )}

        {/* MODAL: Assinaturas Mensais */}
        {showMensaisModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fadeIn" onClick={() => setShowMensaisModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl m-4 animate-fadeInUp" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Assinaturas Mensais</h3>
                <button onClick={() => setShowMensaisModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
              </div>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Buscar assinatura..."
                  value={mensaisQuery}
                  onChange={e => setMensaisQuery(e.target.value)}
                  className="input-premium flex-1"
                />
                <select value={mensaisSort} onChange={e => setMensaisSort(e.target.value as any)} className="input-premium">
                  <option value="vencimento">Ordenar por Vencimento</option>
                  <option value="nome">Ordenar por Nome</option>
                  <option value="valor">Ordenar por Valor</option>
                </select>
              </div>
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {mensaisList.map(a => (
                  <li key={a.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <div className="font-medium">{a.nome}</div>
                      <div className="text-xs opacity-60">
                        Dia {a.diaCobranca} • {a.tipoPagamento} {a.cartaoNome ? `(${a.cartaoNome})` : ''}
                      </div>
                    </div>
                    <div className="font-semibold">{fmt(toNum(a.valor))}</div>
                  </li>
                ))}
              </ul>
              <div className="text-right font-bold mt-4 pt-4 border-t dark:border-slate-700">
                Total Mensal: {fmt(totalAssinMensal)}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Gastos de Crédito do Mês */}
        {showCreditoMesModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fadeIn" onClick={() => setShowCreditoMesModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl m-4 animate-fadeInUp" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Gastos em Crédito ({nomeMesAtual})</h3>
                <button onClick={() => setShowCreditoMesModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
              </div>
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {creditGastosMesList.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <div className="font-medium">{item.descricao}</div>
                      <div className="text-xs opacity-60">
                        {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {item.cartaoNome}
                      </div>
                    </div>
                    <div className="font-semibold">{fmt(item.valor)}</div>
                  </li>
                ))}
              </ul>
              <div className="text-right font-bold mt-4 pt-4 border-t dark:border-slate-700">
                Total: {fmt(gastosCreditoMes + assinaturasCreditoMensal)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    );
  };

  export default LifeTracker;
