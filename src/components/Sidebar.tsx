import { useAuth } from "../hooks/useAuth";
import React from 'react';
import {
  LayoutDashboard, TrendingDown, TrendingUp, Calendar, CreditCard, PieChart, Goal, ArrowUpRight, Settings, ChevronRight, LogOut,
} from 'lucide-react';
import LifeTrackerCompactLogo from "./LifeTrackerCompactLogo";
import LifeTrackerLogo from "./LifeTrackerLogo";

type Tab = 'dashboard' | 'gastos' | 'receitas' | 'contas-recorrentes' | 'objetivos' | 'cartoes' | 'faturas' | 'resumo-anual' | 'configuracoes';

interface SidebarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  collapsed, 
  onClick 
}: { icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`
      w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}
    `}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    {!collapsed && (
      <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  tab, 
  setTab, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {

  const { user, signOut } = useAuth();

  const handleSetTab = (newTab: Tab) => {
    setTab(newTab);
    setIsMobileMenuOpen(false);
  }

  return (
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarCollapsed ? 'w-20' : 'w-72'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* User Info */}
        {user && !isSidebarCollapsed && (
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
            <img
              src={user.user_metadata?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user.user_metadata?.full_name || "Usuário"}
              </span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
        )}

        {/* Header Sidebar */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              {isSidebarCollapsed ? <LifeTrackerLogo /> : <LifeTrackerCompactLogo />}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">LifeTracker</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">by VRS</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={tab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('dashboard')} />
          
          <div className={`mt-10 mb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>Transações</div>
          <SidebarItem icon={TrendingDown} label="Meus Gastos" active={tab === 'gastos'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('gastos')} />
          <SidebarItem icon={TrendingUp} label="Receitas" active={tab === 'receitas'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('receitas')} />
          <SidebarItem icon={Calendar} label="Contas Recorrentes" active={tab === 'contas-recorrentes'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('contas-recorrentes')} />
          
          <div className={`mt-10 mb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>Gestão</div>
          <SidebarItem icon={CreditCard} label="Cartões" active={tab === 'cartoes'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('cartoes')} />
          <SidebarItem icon={PieChart} label="Faturas" active={tab === 'faturas'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('faturas')} />
          <SidebarItem icon={Goal} label="Objetivos" active={tab === 'objetivos'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('objetivos')} />
          <SidebarItem icon={ArrowUpRight} label="Resumo Anual" active={tab === 'resumo-anual'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('resumo-anual')} />
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <SidebarItem icon={Settings} label="Configurações" active={tab === 'configuracoes'} collapsed={isSidebarCollapsed} onClick={() => handleSetTab('configuracoes')} />
          <SidebarItem icon={LogOut} label="Sair" active={false} collapsed={isSidebarCollapsed} onClick={signOut} />
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full mt-2 hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 text-xs font-medium uppercase"><ChevronRight className="rotate-180" size={16}/> Recolher</div>}
          </button>
        </div>
      </aside>
  );
};

export default Sidebar;
