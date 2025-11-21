import React, { useState, useEffect, useMemo } from 'react';
import {
  
  LayoutDashboard, TrendingDown, TrendingUp, CreditCard,
  Calendar, Settings, Goal, Menu,
  ArrowUpRight, PieChart, ChevronRight, Bell, Search, Sun, Moon, Wallet, Plus
} from 'lucide-react';

import Gastos from './pages/Gastos';
import Receitas from './pages/Receitas';
import ContasRecorrentes from './pages/ContasRecorrentes';
import Objetivos from './pages/Objetivos';
import Cartoes from './pages/Cartoes';
import Faturas from './pages/Faturas';
import ResumoAnual from './pages/ResumoAnual';
import Configuracoes from './pages/Configuracoes';
import Modal from './components/Modal';
import { Gasto, Receita, Assinatura, Cartao, Category, Objetivo, Tab } from './pages/types';
import { capitalize, fmt, toNum, CATEGORIAS_GASTO } from '../utils/helpers';
import LifeTrackerCompactLogo from './components/LifeTrackerCompactLogo';
import LifeTrackerIconOnly from './components/LifeTrackerIconOnly';
import { Toaster, toast } from 'sonner';
import { IconComponent } from './components/CategoryIcon';
import CreditCardVisual from './components/CreditCardVisual';

// --- VISUAL COMPONENTS (from new design) ---

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, type = 'neutral' }: { children: React.ReactNode, type?: 'success' | 'danger' | 'warning' | 'neutral' }) => {
  const colors = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[type]}`}>{children}</span>
  );
};



const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: { icon: any, label:string, active: boolean, collapsed: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative ${active ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}`}>
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    {!collapsed && (<span className="font-medium text-sm whitespace-nowrap overflow-hidden">{label}</span>)}
    {collapsed && (<div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">{label}</div>)}
  </button>
);

// --- MAIN APP COMPONENT ---

export default function LifeTracker() {
  // --- STATES ---
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo' | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getBankColorClass = (n: string) => {
    const lower = n.toLowerCase();
    if (lower.includes('nubank')) return 'bg-purple-600';
    if (lower.includes('santander')) return 'bg-red-600';
    if (lower.includes('inter')) return 'bg-orange-500';
    if (lower.includes('itau') || lower.includes('itaú')) return 'bg-orange-600';
    if (lower.includes('caixa')) return 'bg-blue-700';
    if (lower.includes('bradesco')) return 'bg-red-700';
    if (lower.includes('c6')) return 'bg-slate-800';
    if (lower.includes('banco do brasil') || lower.includes('bb')) return 'bg-yellow-400';
    if (lower.includes('xp')) return 'bg-slate-800';
    return 'bg-slate-600';
  };

  // --- EFFECTS ---

  // Dark Mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedGastos = localStorage.getItem('gastos');
      if (storedGastos) setGastos(JSON.parse(storedGastos));

      const storedReceitas = localStorage.getItem('receitas');
      if (storedReceitas) setReceitas(JSON.parse(storedReceitas));

      const storedAssinaturas = localStorage.getItem('assinaturas');
      if (storedAssinaturas) setAssinaturas(JSON.parse(storedAssinaturas));

      const storedCartoes = localStorage.getItem('cartoes');
      if (storedCartoes) setCartoes(JSON.parse(storedCartoes));

      const storedCategorias = localStorage.getItem('categorias');
      if (storedCategorias && JSON.parse(storedCategorias).length > 0) {
        setCategorias(JSON.parse(storedCategorias));
      } else {
        const iconMap: { [key: string]: string } = {
          'Alimentação': 'ShoppingCartIcon',
          'Transporte': 'TruckIcon',
          'Lazer': 'TicketIcon',
          'Saúde': 'HeartIcon',
          'Moradia': 'HomeIcon',
          'Educação': 'AcademicCapIcon',
          'Compras': 'GiftIcon',
          'Vestuário': 'BriefcaseIcon',
          'Eletrônicos': 'DevicePhoneMobileIcon',
          'Utensílios Domésticos': 'BuildingLibraryIcon',
          'Beleza & Cuidados': 'CakeIcon',
          'Pets': 'QuestionMarkCircleIcon',
          'Investimentos': 'BanknotesIcon',
          'Imprevisto': 'BoltIcon',
          'Outros': 'QuestionMarkCircleIcon',
        };

        const defaultCategories: Category[] = CATEGORIAS_GASTO.map((name, index) => ({
          id: String(index + 1),
          name,
          type: 'despesa',
          icon: iconMap[name] || 'QuestionMarkCircleIcon',
        }));
        setCategorias(defaultCategories);
        saveData('categorias', defaultCategories);
      }
      
      const storedObjetivos = localStorage.getItem('objetivos');
      if (storedObjetivos) setObjetivos(JSON.parse(storedObjetivos));

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      toast.error("Erro ao carregar dados salvos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mobile sidebar management
  useEffect(() => {
    const handleResize = () => window.innerWidth >= 1024 && setIsMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DATA PERSISTENCE ---
  const saveData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- CRUD HANDLERS ---
  const handleSaveGasto = (gasto: Gasto) => {
    const newGastos = gasto.id ? gastos.map(g => g.id === gasto.id ? gasto : g) : [...gastos, { ...gasto, id: Date.now() }];
    setGastos(newGastos);
    saveData('gastos', newGastos);
    toast.success('Gasto salvo com sucesso!');
  };

  const handleDeleteGasto = (id: number) => {
    const newGastos = gastos.filter(g => g.id !== id);
    setGastos(newGastos);
    saveData('gastos', newGastos);
    toast.success('Gasto excluído com sucesso!');
  };
  
  const handleSaveReceita = (receita: Receita) => {
    const newReceitas = receita.id ? receitas.map(r => r.id === receita.id ? receita : r) : [...receitas, { ...receita, id: Date.now() }];
    setReceitas(newReceitas);
    saveData('receitas', newReceitas);
    toast.success('Receita salva com sucesso!');
  };

  const handleDeleteReceita = (id: number) => {
    const newReceitas = receitas.filter(r => r.id !== id);
    setReceitas(newReceitas);
    saveData('receitas', newReceitas);
    toast.success('Receita excluída com sucesso!');
  };

  const handleSaveAssinatura = (assinatura: Assinatura) => {
    const newAssinaturas = assinatura.id ? assinaturas.map(a => a.id === assinatura.id ? assinatura : a) : [...assinaturas, { ...assinatura, id: Date.now() }];
    setAssinaturas(newAssinaturas);
    saveData('assinaturas', newAssinaturas);
    toast.success('Assinatura salva com sucesso!');
  };

  const handleDeleteAssinatura = (id: number) => {
    const newAssinaturas = assinaturas.filter(a => a.id !== id);
    setAssinaturas(newAssinaturas);
    saveData('assinaturas', newAssinaturas);
    toast.success('Assinatura excluída com sucesso!');
  };

  const handleSaveCartao = (cartao: Cartao) => {
    const newCartoes = cartao.id ? cartoes.map(c => c.id === cartao.id ? cartao : c) : [...cartoes, { ...cartao, id: Date.now() }];
    setCartoes(newCartoes);
    saveData('cartoes', newCartoes);
    toast.success('Cartão salvo com sucesso!');
  };

  const handleDeleteCartao = (id: number) => {
    const newCartoes = cartoes.filter(c => c.id !== id);
    setCartoes(newCartoes);
    saveData('cartoes', newCartoes);
    toast.success('Cartão excluído com sucesso!');
  };

  const handleSetCartaoPrincipal = (id: number) => {
    const newCartoes = cartoes.map(c => ({
      ...c,
      isPrincipal: c.id === id
    }));
    setCartoes(newCartoes);
    saveData('cartoes', newCartoes);
    toast.success('Cartão principal definido!');
  };

  const handleSaveObjetivo = (objetivo: Objetivo) => {
    const newObjetivos = objetivo.id ? objetivos.map(o => o.id === objetivo.id ? objetivo : o) : [...objetivos, { ...objetivo, id: Date.now() }];
    setObjetivos(newObjetivos);
    saveData('objetivos', newObjetivos);
    toast.success('Objetivo salvo com sucesso!');
  };

  const handleDeleteObjetivo = (id: number) => {
    const newObjetivos = objetivos.filter(o => o.id !== id);
    setObjetivos(newObjetivos);
    saveData('objetivos', newObjetivos);
    toast.success('Objetivo excluído com sucesso!');
  };

  const handleUpdateValorObjetivo = (id: number, amount: number) => {
    const newObjetivos = objetivos.map(o => {
      if (o.id === id) {
        const novoValor = o.valorAtual + amount;
        const valorNecessario = toNum(o.valorNecessario);
        // Clamp the value between 0 and the required amount
        const valorAtual = Math.max(0, Math.min(novoValor, valorNecessario));
        return { ...o, valorAtual };
      }
      return o;
    });
    setObjetivos(newObjetivos);
    saveData('objetivos', newObjetivos);
    toast.success(`Valor do objetivo atualizado!`);
  };

  const handleSetObjetivoPrincipal = (id: number) => {
    const newObjetivos = objetivos.map(o => ({
      ...o,
      isPrincipal: o.id === id
    }));
    setObjetivos(newObjetivos);
    saveData('objetivos', newObjetivos);
    toast.success('Objetivo principal definido!');
  };

  const handleSaveCategoria = (categoria: Category) => {
    const newCategorias = categoria.id ? categorias.map(c => c.id === categoria.id ? categoria : c) : [...categorias, { ...categoria, id: String(Date.now()) }];
    setCategorias(newCategorias);
    saveData('categorias', newCategorias);
    toast.success('Categoria salva com sucesso!');
  };

  const handleDeleteCategoria = (id: string) => {
    const newCategorias = categorias.filter(c => c.id !== id);
    setCategorias(newCategorias);
    saveData('categorias', newCategorias);
    toast.success('Categoria excluída com sucesso!');
  };

  const handleTogglePagamentoAssinatura = (id: number) => {
    const newAssinaturas = assinaturas.map(a => a.id === id ? { ...a, pagoEsteMes: !a.pagoEsteMes } : a);
    setAssinaturas(newAssinaturas);
    saveData('assinaturas', newAssinaturas);
    toast.success('Status da assinatura atualizado!');
  };

  // --- MODAL HANDLERS ---
  const openModal = (type: 'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo', item?: any) => {
    setModalType(type);
    setItemToEdit(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setItemToEdit(null);
  };

  const changeTab = (newTab: Tab) => {
    setTab(newTab);
    setIsMobileMenuOpen(false);
  }

  // --- DERIVED DATA ---
  const totalReceitas = useMemo(() => receitas.reduce((acc, r) => acc + toNum(r.valor), 0), [receitas]);
  const gastosDebito = useMemo(() => gastos.filter(g => g.tipoPagamento === 'DÉBITO').reduce((acc, g) => acc + toNum(g.valor), 0), [gastos]);
  const gastosCredito = useMemo(() => gastos.filter(g => g.tipoPagamento === 'CRÉDITO').reduce((acc, g) => acc + toNum(g.valor), 0), [gastos]);
  const totalGastos = gastosDebito + gastosCredito;
  const saldo = totalReceitas - gastosDebito;

  const creditData = useMemo(() => {
    const totalLimite = cartoes.reduce((acc, c) => acc + toNum(c.limite), 0);    
    const gastosPorCartao: { [cardId: number]: number } = {};

    cartoes.forEach(cartao => {
      gastosPorCartao[cartao.id] = 0;
    });

    gastos.forEach(gasto => {
      if (gasto.tipoPagamento === 'CRÉDITO' && typeof gasto.cartaoId === 'number' && gastosPorCartao.hasOwnProperty(gasto.cartaoId)) {
        gastosPorCartao[gasto.cartaoId] += toNum(gasto.valor);
      }
    })

    const totalGastosCredito = Object.values(gastosPorCartao).reduce((acc, val) => acc + val, 0);
    const disponivel = totalLimite - totalGastosCredito;

    return { totalLimite, disponivel, gastosPorCartao };
  }, [cartoes, gastos]);

  const porCategoria = useMemo(() => {
    const map: Record<string, {valor: number, icon: string}> = {};
    categorias.forEach(c => map[c.name] = { valor: 0, icon: c.icon });
    
    gastos.forEach(g => {
      if (!g.categoria) return;
      const categoryData = map[g.categoria];
      if (categoryData) {
        categoryData.valor += toNum(g.valor);
      } else {
        map[g.categoria] = { valor: toNum(g.valor), icon: 'QuestionMarkCircleIcon' };
      }
    });
    return Object.entries(map).map(([nome, data]) => ({ nome, ...data })).sort((a, b) => b.valor - a.valor);
  }, [gastos, categorias]);

  const objetivoPrincipal = useMemo(() => objetivos.find(o => o.isPrincipal) || objetivos[0], [objetivos]);

  const previsaoMes = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const isDueThisMonth = (a: Assinatura) => 
        a.periodoCobranca === 'MENSAL' || 
        (a.periodoCobranca === 'ANUAL' && a.mesCobranca && (a.mesCobranca - 1) === currentMonth);

    const totalAluguelMensal = assinaturas
      .filter(a => a.tipo === 'CONTRATO - ALUGUEL' && isDueThisMonth(a))
      .reduce((acc, a) => acc + toNum(a.valor), 0);
      
    const totalAssinaturas = assinaturas
      .filter(a => a.tipo === 'ASSINATURA' && isDueThisMonth(a))
      .reduce((acc, a) => acc + toNum(a.valor), 0);

    const totalAcordosMes = assinaturas
      .filter(a => a.tipo === 'ACORDO' && isDueThisMonth(a))
      .reduce((acc, a) => acc + toNum(a.valor), 0);
      
    const gastosCreditoMes = gastos
      .filter(g => {
        if (g.tipoPagamento !== 'CRÉDITO') return false;
        const parts = g.data.split('-');
        if (parts.length < 2 || !parts[0] || !parts[1]) return false;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);

        if (isNaN(year) || isNaN(month)) return false;
        return year === currentYear && (month - 1) === currentMonth;
      })
      .reduce((acc, g) => acc + toNum(g.valor), 0);

    const total = totalAluguelMensal + totalAssinaturas + totalAcordosMes + gastosCreditoMes;

    return {
      aluguel: totalAluguelMensal,
      assinaturas: totalAssinaturas,
      credito: gastosCreditoMes,
      acordos: totalAcordosMes,
      total: total
    };
  }, [assinaturas, gastos]);

  const nomeMesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

  // --- RENDER ---

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Carregando...</div>;
    }
    if (tab === 'dashboard') {
      return (
        <div className="space-y-6">
          {/* Section 1: Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 lg:col-span-5 relative group">
              <Card className="h-full bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-white p-6 md:p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/15 dark:group-hover:bg-blue-500/30 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-white dark:opacity-80"><Wallet size={18} /><span className="text-sm font-medium tracking-wider uppercase">Saldo Atual</span></div>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{fmt(saldo)}</h2>
                    
                    {cartoes.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1 text-sm text-slate-500 dark:text-indigo-200 uppercase tracking-wider"><CreditCard size={16} /><span>Crédito Disponível</span></div>
                            <div className="text-lg font-semibold">
                              <span>{fmt(creditData.disponivel)}</span>
                              <span className="text-slate-500/80 dark:opacity-70"> / {fmt(creditData.totalLimite)}</span>
                            </div>
                            <div className="mt-3 space-y-1 text-xs">
                              {cartoes.map(card => {
                                  const gastosDoCartao = creditData.gastosPorCartao[card.id] || 0; // Use pre-calculated value
                                  const disponivelCard = toNum(card.limite) - gastosDoCartao;
                                  const limiteCard = toNum(card.limite);
                                  const colorClass = getBankColorClass(card.nome);

                                  return (
                                      <div key={card.id} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                          <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                                          <span className="flex-grow">{card.nome}</span>
                                          <span className="font-mono text-slate-600 dark:text-slate-300">{fmt(disponivelCard)} / {fmt(limiteCard)}</span>
                                      </div>
                                  )
                              })}
                            </div>
                        </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                    <div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Receitas</span>
                      <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{fmt(totalReceitas)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Despesas</span>
                      <span className="text-xl font-semibold text-rose-600 dark:text-rose-400">{fmt(totalGastos)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Meus Cartões</h3>
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" onClick={() => setTab('cartoes')}><ArrowUpRight size={18}/></button>
              </div>
              {(() => {
                const principalCard = cartoes.find(c => c.isPrincipal) || cartoes[0];
                if (!principalCard) {
                  return <Card className="flex items-center justify-center text-center p-4 h-full"><p className="text-sm text-slate-500">Nenhum cartão cadastrado.</p></Card>;
                }
                const gastosDoCartao = creditData.gastosPorCartao[principalCard.id] || 0;
                return <CreditCardVisual key={principalCard.id} {...principalCard} gastos={gastosDoCartao} />;
              })()}
               {cartoes.length > 1 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" onClick={() => setTab('cartoes')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-gradient-to-r from-slate-700 to-slate-600 shadow-sm"></div>
                      <span className="font-medium text-sm">Ver outros {cartoes.length - 1} cartões</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400"/>
                </div>
              )}
            </div>

            <div className="md:col-span-12 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
               <Card className="p-5 flex flex-col justify-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none relative overflow-hidden group cursor-pointer hover:scale-[1.02]" onClick={() => openModal('gasto')}>
                 <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                 <div className="flex items-center justify-between z-10">
                    <div className="p-2 bg-white/20 rounded-xl"><Plus size={24} className="text-white"/></div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">Ação Rápida</span>
                 </div>
                 <div className="z-10">
                    <h3 className="font-bold text-lg leading-tight">Novo Gasto</h3>
                    <p className="text-sm opacity-80 mt-1">Adicionar nova transação</p>
                 </div>
              </Card>
              <div className="grid grid-cols-1 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center text-center h-[95px]">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total previsto para{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 [text-shadow:0_0_8px_#4ade80]">
                      {nomeMesAtual}
                    </span>
                  </div>
                  <div className="text-lg font-bold mt-1">{fmt(previsaoMes.total)}</div>
                </Card>
                <Card className="p-4"><div className="flex justify-between items-center h-full"><span className="text-sm font-medium text-slate-500">Gastos (Crédito)</span><span className="font-bold text-base">{fmt(gastosCredito)}</span></div></Card>
                <Card className="p-4"><div className="flex justify-between items-center h-full"><span className="text-sm font-medium text-slate-500">Gastos (Dinheiro)</span><span className="font-bold text-base">{fmt(gastosDebito)}</span></div></Card>
              </div>
            </div>
          </div>

          {/* Section 2: Lists and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><TrendingDown className="text-rose-500" size={20} />Atividade Recente</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline" onClick={() => setTab('gastos')}>Ver tudo</button>
                </div>
                <div className="space-y-4">
                  {gastos.slice().reverse().slice(0, 3).map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                          <IconComponent iconName={(g.categoria && categorias.find(c => c.name === g.categoria)?.icon) || 'QuestionMarkCircleIcon'} className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{g.descricao}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{new Date(g.data).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                            {g.categoria && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{g.categoria.toLowerCase()}</span>
                              </>
                            )}
                            {g.tipoPagamento === 'CRÉDITO' && <Badge>Crédito</Badge>}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">- {fmt(toNum(g.valor))}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Top Categorias</h3>
                    <div className="space-y-4">
 {porCategoria.length > 0 && porCategoria[0] ? (() => {
                      const maxVal = porCategoria[0].valor; // Guaranteed to exist here
                      return porCategoria.slice(0, 4).map(({nome, valor}, idx) => {
                          const percent = maxVal > 0 ? (valor / maxVal) * 100 : 0;
                          return (
                            <div key={nome}>
                                <div className="flex justify-between text-sm mb-1"><span className="capitalize font-medium">{nome.toLowerCase()}</span><span className="text-slate-500">{fmt(valor)}</span></div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][idx % 4]}`} style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>
                          )
                      });
                  })() : <p className="text-sm text-slate-500">Sem gastos para exibir categorias.</p>}                    </div>
                  </Card>
                  
                  {objetivoPrincipal && (
                    <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Objetivo Principal</h3>
                          <Goal size={18} className="text-emerald-500"/>
                        </div>
                        <div className="text-center py-4">
                          <div className="inline-block relative w-32 h-32">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-200 dark:text-emerald-900" />
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.85" strokeDashoffset={351.85 * (1 - (objetivoPrincipal.valorAtual / toNum(objetivoPrincipal.valorNecessario)))} className="text-emerald-500" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round((objetivoPrincipal.valorAtual / toNum(objetivoPrincipal.valorNecessario)) * 100)}%</span>
                              </div>
                          </div>
                          <h4 className="font-semibold mt-2">{objetivoPrincipal.nome}</h4>
                          <p className="text-sm text-slate-500">Faltam {fmt(toNum(objetivoPrincipal.valorNecessario) - objetivoPrincipal.valorAtual)} de {fmt(toNum(objetivoPrincipal.valorNecessario))}</p>
                        </div>
                    </Card>
                  )}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 h-full">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Calendar className="text-indigo-500" size={20}/>Próximas Contas</h3>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pl-6 py-2">
                  {assinaturas.length > 0 ? assinaturas.sort((a,b) => a.diaCobranca - b.diaCobranca).map((a) => (
                     <div key={a.id} className="relative">
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${a.pagoEsteMes ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-100 dark:ring-slate-800'}`}></div>
                        <div className={`transition-opacity ${a.pagoEsteMes ? 'opacity-50' : 'opacity-100'}`}>
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-sm">{a.nome}</h4>
                              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">Dia {a.diaCobranca}</span>
                           </div>
                           <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{fmt(toNum(a.valor))}</div>
                           {a.pagoEsteMes ? (
                              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1 cursor-pointer" onClick={() => handleTogglePagamentoAssinatura(a.id)}><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Pago</span>
                           ) : (
                              <button onClick={() => handleTogglePagamentoAssinatura(a.id)} className="text-xs mt-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors">Marcar como Pago</button>
                           )}
                        </div>
                     </div>
                  )) : <p className="text-sm text-slate-500">Nenhuma conta recorrente cadastrada.</p>}
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    }
    switch (tab) {
      case 'gastos':
        return <Gastos gastos={gastos} openModal={openModal} onDelete={handleDeleteGasto} categorias={categorias} />;
      case 'receitas':
        return <Receitas receitas={receitas} openModal={openModal} onDelete={handleDeleteReceita} />;
      case 'contas-recorrentes':
        return <ContasRecorrentes assinaturas={assinaturas} openModal={openModal} onDelete={handleDeleteAssinatura} onToggle={handleTogglePagamentoAssinatura} />;
      case 'objetivos':
        return <Objetivos objetivos={objetivos} openModal={openModal} onDelete={handleDeleteObjetivo} onUpdateValor={handleUpdateValorObjetivo} onSetPrincipal={handleSetObjetivoPrincipal} />;
      case 'cartoes':
        return <Cartoes cartoes={cartoes} gastos={gastos} gastosNoPeriodo={creditData.gastosPorCartao} openModal={openModal} onDelete={handleDeleteCartao} onSetPrincipal={handleSetCartaoPrincipal} />;
      case 'faturas':
        return <Faturas gastos={gastos} cartoes={cartoes} />;
      case 'resumo-anual':
        return <ResumoAnual gastos={gastos} receitas={receitas} />;
      case 'configuracoes':
        return <Configuracoes categories={categorias} openModal={openModal} onDeleteCategoria={handleDeleteCategoria} onSaveCategoria={handleSaveCategoria} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen bg-[#F3F4F6] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300 selection:bg-blue-500/30`}>
      <Toaster richColors position="top-right" />
      {showModal && modalType && (
        <Modal
          type={modalType}
          closeModal={closeModal}
          onSaveGasto={handleSaveGasto}
          onSaveReceita={handleSaveReceita}
          onSaveAssinatura={handleSaveAssinatura}
          onSaveCartao={handleSaveCartao}
          onSaveCategoria={handleSaveCategoria}
          onSaveObjetivo={handleSaveObjetivo}
          itemToEdit={itemToEdit}
          cartoes={cartoes}
          categorias={categorias}
        />
      )}
      
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />)}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
            {isSidebarCollapsed ? <LifeTrackerIconOnly /> : <LifeTrackerCompactLogo />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={tab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => changeTab('dashboard')} />
          
          <div className={`mt-6 mb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider transition-opacity ${isSidebarCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>Transações</div>
          <SidebarItem icon={TrendingDown} label="Meus Gastos" active={tab === 'gastos'} collapsed={isSidebarCollapsed} onClick={() => changeTab('gastos')} />
          <SidebarItem icon={TrendingUp} label="Receitas" active={tab === 'receitas'} collapsed={isSidebarCollapsed} onClick={() => changeTab('receitas')} />
          <SidebarItem icon={Calendar} label="Contas Recorrentes" active={tab === 'contas-recorrentes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('contas-recorrentes')} />
          
          <div className={`mt-6 mb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider transition-opacity ${isSidebarCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>Gestão</div>
          <SidebarItem icon={CreditCard} label="Cartões" active={tab === 'cartoes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('cartoes')} />
          <SidebarItem icon={PieChart} label="Faturas" active={tab === 'faturas'} collapsed={isSidebarCollapsed} onClick={() => changeTab('faturas')} />
          <SidebarItem icon={Goal} label="Objetivos" active={tab === 'objetivos'} collapsed={isSidebarCollapsed} onClick={() => changeTab('objetivos')} />
          <SidebarItem icon={ArrowUpRight} label="Resumo Anual" active={tab === 'resumo-anual'} collapsed={isSidebarCollapsed} onClick={() => changeTab('resumo-anual')} />
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <SidebarItem icon={Settings} label="Configurações" active={tab === 'configuracoes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('configuracoes')} />
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full mt-2 hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            {isSidebarCollapsed ? <ChevronRight size={20} className="flex items-center justify-center" /> : <ChevronRight className="rotate-180 flex items-center justify-center" size={20}/>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><Menu size={24} /></button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">{tab === 'dashboard' ? 'Visão Geral' : capitalize(tab.replace('-', ' '))}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Search size={16} className="text-slate-400" /><input type="text" placeholder="Buscar..." className="bg-transparent text-sm outline-none w-32 placeholder:text-slate-400" />
            </div>
            <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-yellow-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              {darkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} />}
            </button>
            <button className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <Bell size={20} /><span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-white dark:border-slate-700 shadow-md"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
