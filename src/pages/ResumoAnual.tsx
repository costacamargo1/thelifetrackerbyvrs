import React from 'react';
import { fmt } from '../../utils/helpers';

type DadosResumo = {
  mes: number;
  nome: string;
  receitas: number;
  gastosDebito: number;
  gastosCredito: number;
};

interface ResumoAnualProps {
  dadosResumoAnual: DadosResumo[];
  anoResumo: number;
  setAnoResumo: React.Dispatch<React.SetStateAction<number>>;
}

const BarChart = ({ title, data, dataKey, colorClass }: { title: string; data: DadosResumo[]; dataKey: keyof DadosResumo; colorClass: string }) => {
  const maxValue = Math.max(...data.map(d => d[dataKey] as number), 1); // O 1 evita divisão por zero
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-600">
      <h3 className="font-medium mb-4 text-black dark:text-gray-200">{title}</h3>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map(d => (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {fmt(d[dataKey] as number)}
            </div>
            <div className={`w-full rounded-t ${colorClass} transition-all duration-500 ease-out`} style={{ height: `${((d[dataKey] as number) / maxValue) * 100}%` }} />
            <div className="text-xs opacity-70">{d.nome}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResumoAnual: React.FC<ResumoAnualProps> = ({ dadosResumoAnual, anoResumo, setAnoResumo }) => {
  return (
    <section className="p-4 rounded-2xl glass-card space-y-6 animate-fadeInUp" >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-black dark:text-gray-200">Resumo Anual</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">Ano:</span>
          <input type="number" value={anoResumo} onChange={e => setAnoResumo(Number(e.target.value))} className="input-premium p-2 w-24" />
        </div>
      </div>
      <div className="space-y-6">
        <BarChart title="Receitas por Mês" data={dadosResumoAnual} dataKey="receitas" colorClass="bg-green-500" />
        <div className="grid md:grid-cols-2 gap-6">
          <BarChart title="Gastos em Dinheiro (Débito/PIX) por Mês" data={dadosResumoAnual} dataKey="gastosDebito" colorClass="bg-blue-500" />
          <BarChart title="Gastos em Crédito por Mês" data={dadosResumoAnual} dataKey="gastosCredito" colorClass="bg-orange-500" />
        </div>
      </div>
    </section>
  );
};

export default ResumoAnual;