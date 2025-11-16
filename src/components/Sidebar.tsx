import React from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Repeat,
  CreditCard,
  Receipt,
  Calendar,
  Settings,
  Sun,
  Moon,
  Goal,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import LifeTrackerCompactLogo from "./LifeTrackerCompactLogo";
import LifeTrackerIcon from "./LifeTrackerLogo";

type Tab = 'dashboard' | 'gastos' | 'receitas' | 'contas-recorrentes' | 'objetivos' | 'cartoes' | 'dividas' | 'faturas' | 'configuracoes' | 'resumo-anual';

interface SidebarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SidebarButton: React.FC<{ id: Tab; currentTab: Tab; icon: React.ReactNode; label: string; isCollapsed: boolean; onClick: () => void; }> = ({ id, currentTab, icon, label, isCollapsed, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`flex items-center h-12 rounded-lg transition-colors relative group ${
      isCollapsed ? 'w-12 justify-center' : 'w-full px-4 justify-start'
    } ${
      currentTab === id
        ? 'bg-emerald-500 text-white shadow-lg'
        : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-slate-700 '
    }`}
  >
    {icon}
    {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ tab, setTab, isSidebarCollapsed, setIsSidebarCollapsed, darkMode, toggleDarkMode }) => {
  return (
    <aside className={`flex flex-col p-4 bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20 items-center' : 'w-64'}`}>
      <div className={`flex items-center mb-8 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isSidebarCollapsed && (
          <div className="transition-opacity duration-300">
            <LifeTrackerCompactLogo />
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="transition-opacity duration-300">
            <LifeTrackerIcon />
          </div>
        )}
      </div>
      <nav className="flex-1 flex flex-col gap-2 w-full">
        <SidebarButton id="dashboard" currentTab={tab} onClick={() => setTab('dashboard')} icon={<LayoutDashboard size={22} />} label="Dashboard" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="gastos" currentTab={tab} onClick={() => setTab('gastos')} icon={<TrendingDown size={22} />} label="Gastos" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="receitas" currentTab={tab} onClick={() => setTab('receitas')} icon={<TrendingUp size={22} />} label="Receitas" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="contas-recorrentes" currentTab={tab} onClick={() => setTab('contas-recorrentes')} icon={<Repeat size={22} />} label="Contas Recorrentes" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="objetivos" currentTab={tab} onClick={() => setTab('objetivos')} icon={<Goal size={22} />} label="Objetivos" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="cartoes" currentTab={tab} onClick={() => setTab('cartoes')} icon={<CreditCard size={22} />} label="Cartões" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="faturas" currentTab={tab} onClick={() => setTab('faturas')} icon={<Receipt size={22} />} label="Faturas" isCollapsed={isSidebarCollapsed} />
        <SidebarButton id="resumo-anual" currentTab={tab} onClick={() => setTab('resumo-anual')} icon={<Calendar size={22} />} label="Resumo Anual" isCollapsed={isSidebarCollapsed} />
      </nav>
      <div className="flex flex-col gap-2 w-full">
        <SidebarButton id="configuracoes" currentTab={tab} onClick={() => setTab('configuracoes')} icon={<Settings size={22} />} label="Configurações" isCollapsed={isSidebarCollapsed} />
        <button onClick={toggleDarkMode} title={darkMode ? 'Modo Claro' : 'Modo Escuro'} className={`flex items-center h-12 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-slate-700 ${isSidebarCollapsed ? 'w-12 justify-center' : 'w-full px-4 justify-start'}`}>
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          {!isSidebarCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Tema</span>}
        </button>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'} className={`flex items-center h-12 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-slate-700 ${isSidebarCollapsed ? 'w-12 justify-center' : 'w-full px-4 justify-start'}`}>
          {isSidebarCollapsed ? <ChevronsRight size={22} /> : <ChevronsLeft size={22} />}
          {!isSidebarCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Recolher</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;