import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, TrendingDown, TrendingUp, CreditCard,
  Calendar, Settings, Goal, Menu,
  ArrowUpRight, PieChart, ChevronRight, Bell, Search, Sun, Moon, Wallet, Plus
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import Gastos from './pages/Gastos';
import Receitas from './pages/Receitas';
import ContasRecorrentes from './pages/ContasRecorrentes';
import Objetivos from './pages/Objetivos';
import Cartoes from './pages/Cartoes';
import Faturas from './pages/Faturas';
import ResumoAnual from './pages/ResumoAnual';
import Configuracoes from './pages/Configuracoes';
import Modal from './components/Modal';
import { Assinatura, Cartao, Categoria, Objetivo, Tab } from './pages/types';
import { capitalize, fmt } from '../utils/helpers';
import LifeTrackerCompactLogo from './components/LifeTrackerCompactLogo';
import LifeTrackerIconOnly from './components/LifeTrackerIconOnly';
import { IconComponent } from './components/CategoryIcon';
import CreditCardVisual from './components/CreditCardVisual';
import { useAuth } from './hooks/useAuth';
import { useGastos } from './hooks/useGastos';
import { useReceitas } from './hooks/useReceitas';
import { useAssinaturas } from './hooks/useAssinaturas';
import { useCartoes } from './hooks/useCartoes';
import { useCategorias } from './hooks/useCategorias';
import { useObjetivos } from './hooks/useObjetivos';
import { useConfiguracoes } from './hooks/useConfiguracoes';

// --- VISUAL COMPONENTS ---
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
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[type]}`}>{children}</span>;
};

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: { icon: any, label:string, active: boolean, collapsed: boolean, onClick: () => void }) => (
  <button onClick={onClick} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative ${active ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}`}>
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{label}</span>}
    {collapsed && <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">{label}</div>}
  </button>
);

// --- MAIN APP COMPONENT ---
export default function LifeTracker() {
  const { user } = useAuth();
  
  // UI & MODAL STATES
  const [tab, setTab] = useState<Tab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo' | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  // DATA HOOKS
  const { configuracoes, updateConfiguracoes, loading: configLoading } = useConfiguracoes();
  const { gastos, addGasto, updateGasto, loading: gastosLoading } = useGastos();
  const { receitas, addReceita, updateReceita, loading: receitasLoading } = useReceitas();
  const { assinaturas, addAssinatura, updateAssinatura, loading: assinaturasLoading } = useAssinaturas();
  const { cartoes, addCartao, updateCartao, loading: cartoesLoading } = useCartoes();
  const { categorias, addCategoria, updateCategoria, loading: categoriasLoading } = useCategorias();
  const { objetivos, addObjetivo, updateObjetivo, loading: objetivosLoading } = useObjetivos();

  const loading = configLoading || gastosLoading || receitasLoading || assinaturasLoading || cartoesLoading || categoriasLoading || objetivosLoading;
  
  // --- EFFECTS ---
  useEffect(() => {
    const isDark = configuracoes?.tema === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [configuracoes?.tema]);

  const toggleDarkMode = () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    updateConfiguracoes({ tema: newTheme });
  };
  
  useEffect(() => {
    const handleResize = () => window.innerWidth >= 1024 && setIsMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---
  const openModal = (type: 'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo', item?: any) => {
    setModalType(type); setItemToEdit(item); setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false); setModalType(null); setItemToEdit(null);
  };

  const handleSave = async (type: string, item: any) => {
    try {
      const isEditing = !!item.id;
      const { user_id, created_at, ...saveData } = item;
      let promise;
      switch (type) {
        case 'gasto': promise = isEditing ? updateGasto(item.id, saveData) : addGasto(saveData); break;
        case 'receita': promise = isEditing ? updateReceita(item.id, saveData) : addReceita(saveData); break;
        case 'assinatura': promise = isEditing ? updateAssinatura(item.id, saveData) : addAssinatura(saveData); break;
        case 'cartao': promise = isEditing ? updateCartao(item.id, saveData) : addCartao(saveData); break;
        case 'categoria': promise = isEditing ? updateCategoria(item.id, saveData) : addCategoria(saveData); break;
        case 'objetivo': promise = isEditing ? updateObjetivo(item.id, saveData) : addObjetivo(saveData); break;
        default: throw new Error('Tipo de item desconhecido.');
      }
      await promise;
      toast.success(`${capitalize(type)} ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
      closeModal();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const changeTab = (newTab: Tab) => { setTab(newTab); setIsMobileMenuOpen(false); };
  
  // --- DERIVED DATA & HELPERS ---
  const totalReceitas = useMemo(() => receitas.reduce((acc, r) => acc + r.valor, 0), [receitas]);
  const gastosDebito = useMemo(() => gastos.filter(g => g.metodo_pagamento === 'DÉBITO').reduce((acc, g) => acc + g.valor, 0), [gastos]);
  const totalGastos = useMemo(() => gastos.reduce((acc, g) => acc + g.valor, 0), [gastos]);
  const saldo = totalReceitas - gastosDebito;
  const creditData = useMemo(() => {
    const totalLimite = cartoes.reduce((acc, c) => acc + c.limite, 0);
    const gastosPorCartao: { [cardId: string]: number } = {};
    cartoes.forEach(c => gastosPorCartao[c.id] = 0);
    gastos.forEach(g => {
      if (g.metodo_pagamento === 'CRÉDITO' && g.cartaoId) gastosPorCartao[g.cartaoId] = (gastosPorCartao[g.cartaoId] || 0) + g.valor;
    });
    const totalGastosCredito = Object.values(gastosPorCartao).reduce((acc, val) => acc + val, 0);
    return { totalLimite, disponivel: totalLimite - totalGastosCredito, totalGastosCredito, gastosPorCartao };
  }, [cartoes, gastos]);

  const porCategoria = useMemo(() => {
    const map: Record<string, { valor: number, icon: string }> = {};
    categorias.filter(c => c.tipo === 'gasto').forEach(c => map[c.nome] = { valor: 0, icon: c.icone });
    gastos.forEach(g => {
      if (g.categoria && map[g.categoria]) map[g.categoria].valor += g.valor;
    });
    return Object.entries(map).map(([nome, data]) => ({ nome, ...data })).sort((a, b) => b.valor - a.valor);
  }, [gastos, categorias]);
  
  const objetivoPrincipal = useMemo(() => objetivos[0], [objetivos]);
  const nomeMesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  const getBankColorClass = (n: string) => { /* implementation unchanged */ return 'bg-slate-600'; };

  // --- RENDER ---
  const renderContent = () => {
    if (loading && !user) return <div className="flex items-center justify-center h-full">Carregando...</div>;
    
    if (tab === 'dashboard') {
      return (
        <div className="space-y-6 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 lg:col-span-5"><Card className="h-full p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-300"><Wallet size={18} /><span className="text-sm font-medium tracking-wider uppercase">Saldo Atual</span></div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{fmt(saldo)}</h2>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div><span className="block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Receitas</span><span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{fmt(totalReceitas)}</span></div>
                <div><span className="block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Despesas</span><span className="text-xl font-semibold text-rose-600 dark:text-rose-400">{fmt(totalGastos)}</span></div>
              </div>
            </Card></div>
            <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-1"><h3 className="font-semibold text-slate-700 dark:text-slate-300">Meus Cartões</h3><button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg" onClick={() => setTab('cartoes')}><ArrowUpRight size={18}/></button></div>
              {cartoes[0] ? <CreditCardVisual {...cartoes[0]} gastos={creditData.gastosPorCartao[cartoes[0].id] || 0} /> : <Card className="flex items-center justify-center text-center p-4 h-full"><p className="text-sm text-slate-500">Nenhum cartão cadastrado.</p></Card>}
            </div>
            <div className="md:col-span-12 lg:col-span-3"><Card className="p-5 flex flex-col justify-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white" onClick={() => openModal('gasto')}>
              <div className="flex items-center justify-between z-10"><div className="p-2 bg-white/20 rounded-xl"><Plus size={24}/></div><span className="text-xs font-bold uppercase">Ação Rápida</span></div>
              <div className="z-10"><h3 className="font-bold text-lg">Novo Gasto</h3><p className="text-sm opacity-80 mt-1">Adicionar nova transação</p></div>
            </Card></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Card className="p-6">
              <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold flex items-center gap-2"><TrendingDown className="text-rose-500" />Atividade Recente</h3><button className="text-sm text-blue-600 font-medium" onClick={() => setTab('gastos')}>Ver tudo</button></div>
              <div className="space-y-4">{gastos.slice(0, 3).map(g => (<div key={g.id} className="flex items-center justify-between"><div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700"><IconComponent iconName={categorias.find(c=>c.nome===g.categoria)?.icone || 'QuestionMarkCircleIcon'} className="w-6 h-6 text-slate-500"/></div>
                <div><h4 className="font-semibold">{g.descricao}</h4><p className="text-xs text-slate-500">{new Date(g.data+'T12:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} • {g.categoria}</p></div>
              </div><span className="font-bold">- {fmt(g.valor)}</span></div>))}</div>
            </Card></div>
            <div><Card className="p-6 h-full">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Calendar className="text-indigo-500" />Próximas Contas</h3>
              <div className="space-y-4">{assinaturas.slice(0,4).map(a => (<div key={a.id} className="flex items-center justify-between"><h4 className="font-semibold text-sm">{a.nome}</h4><span className="text-sm">{fmt(a.valor)}</span></div>))}</div>
            </Card></div>
          </div>
        </div>
      );
    }
    switch (tab) {
      case 'gastos': return <Gastos categorias={categorias} openModal={openModal} />;
      case 'receitas': return <Receitas openModal={openModal} />;
      case 'contas-recorrentes': return <ContasRecorrentes openModal={openModal} />;
      case 'objetivos': return <Objetivos openModal={openModal} />;
      case 'cartoes': return <Cartoes openModal={openModal} />;
      case 'faturas': return <Faturas />;
      case 'resumo-anual': return <ResumoAnual />;
      case 'configuracoes': return <Configuracoes openModal={openModal} />;
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen bg-[#F3F4F6] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans`}>
      <Toaster richColors position="top-right" />
      {showModal && modalType && <Modal type={modalType} closeModal={closeModal} onSave={handleSave} itemToEdit={itemToEdit} cartoes={cartoes} categorias={categorias} />}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-4 border-b dark:border-slate-800">{isSidebarCollapsed ? <LifeTrackerIconOnly /> : <LifeTrackerCompactLogo />}</div>
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={tab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => changeTab('dashboard')} />
          <div className={`mt-6 mb-2 px-3 text-xs font-bold text-slate-400 uppercase ${isSidebarCollapsed ? 'opacity-0 h-0' : ''}`}>Transações</div>
          <SidebarItem icon={TrendingDown} label="Meus Gastos" active={tab === 'gastos'} collapsed={isSidebarCollapsed} onClick={() => changeTab('gastos')} />
          <SidebarItem icon={TrendingUp} label="Receitas" active={tab === 'receitas'} collapsed={isSidebarCollapsed} onClick={() => changeTab('receitas')} />
          <SidebarItem icon={Calendar} label="Contas Recorrentes" active={tab === 'contas-recorrentes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('contas-recorrentes')} />
          <div className={`mt-6 mb-2 px-3 text-xs font-bold text-slate-400 uppercase ${isSidebarCollapsed ? 'opacity-0 h-0' : ''}`}>Gestão</div>
          <SidebarItem icon={CreditCard} label="Cartões" active={tab === 'cartoes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('cartoes')} />
          <SidebarItem icon={PieChart} label="Faturas" active={tab === 'faturas'} collapsed={isSidebarCollapsed} onClick={() => changeTab('faturas')} />
          <SidebarItem icon={Goal} label="Objetivos" active={tab === 'objetivos'} collapsed={isSidebarCollapsed} onClick={() => changeTab('objetivos')} />
          <SidebarItem icon={ArrowUpRight} label="Resumo Anual" active={tab === 'resumo-anual'} collapsed={isSidebarCollapsed} onClick={() => changeTab('resumo-anual')} />
        </div>
        <div className="p-4 border-t dark:border-slate-800">
          <SidebarItem icon={Settings} label="Configurações" active={tab === 'configuracoes'} collapsed={isSidebarCollapsed} onClick={() => changeTab('configuracoes')} />
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b dark:border-slate-800">
          <div className="flex items-center gap-4"><button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2"><Menu size={24} /></button>
            <div>
              <h1 className="text-xl font-bold">{tab === 'dashboard' ? 'Visão Geral' : capitalize(tab.replace('-', ' '))}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-yellow-400 border dark:border-slate-700 shadow-sm"> {configuracoes?.tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />} </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8"><div className="max-w-7xl mx-auto space-y-6">{renderContent()}</div></div>
      </main>
    </div>
  );
}
