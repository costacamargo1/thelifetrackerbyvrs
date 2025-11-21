import React, { useState, useMemo } from 'react';
import { Gasto, Receita } from './types';
import { fmt, toNum } from '../../utils/helpers';

type DadosResumo = {
  mes: number;
  nome: string;
  receitas: number;
  gastosDebito: number;
  gastosCredito: number;
};

interface ResumoAnualProps {
  gastos: Gasto[];
  receitas: Receita[];
}

const BarChart = ({ title, data, dataKey, colorClass }: { title: string; data: DadosResumo[]; dataKey: keyof DadosResumo; colorClass: string }) => {
  const values = data.map(d => d[dataKey] as number);
  const maxValue = Math.max(...values, 1); // Avoid division by zero, ensure a baseline
  const allZero = values.every(v => v === 0);

  return (
    <div className="p-6 rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700/60 shadow-sm">
      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">{title}</h3>
      <div className="flex justify-between gap-2 h-48">
        {allZero ? (
          <div className="flex items-center justify-center w-full h-full text-sm text-slate-500">
            <p>Nenhum dado para exibir.</p>
          </div>
        ) : (
          data.map(d => {
            const value = d[dataKey] as number;
            const heightPercent = maxValue > 0 ? Math.max(0, (value / maxValue) * 100) : 0;

            return (
              <div key={d.mes} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 text-white px-1.5 py-0.5 rounded">
                  {fmt(value)}
                </div>
                <div className="w-full flex-grow flex items-end">
                  <div 
                    className={`w-full rounded-t-lg ${colorClass} transition-all duration-500 ease-out`} 
                    style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '2px' : '0' }} 
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{d.nome}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const ResumoAnual: React.FC<ResumoAnualProps> = ({ gastos, receitas }) => {
  const [anoResumo, setAnoResumo] = useState(new Date().getFullYear());

  const dadosResumoAnual = useMemo(() => {
    const dados: DadosResumo[] = Array.from({ length: 12 }, (_, i) => ({
      mes: i,
      nome: new Date(anoResumo, i).toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
      receitas: 0,
      gastosDebito: 0,
      gastosCredito: 0,
    }));

    receitas.forEach(r => {
      const data = new Date(r.data + 'T12:00:00');
      if (!isNaN(data.getTime()) && data.getFullYear() === anoResumo) {
        const month = data.getMonth();
        if (dados[month]) {
          dados[month].receitas += toNum(r.valor);
        }
      }
    });

    gastos.forEach(g => {
      const data = new Date(g.data + 'T12:00:00');
      if (!isNaN(data.getTime()) && data.getFullYear() === anoResumo) {
        const month = data.getMonth();
        if (dados[month]) {
          if (g.tipoPagamento === 'CRÉDITO') {
            dados[month].gastosCredito += toNum(g.valor);
          } else {
            dados[month].gastosDebito += toNum(g.valor);
          }
        }
      }
    });

    return dados;
  }, [gastos, receitas, anoResumo]);

  const totais = dadosResumoAnual.reduce(
    (acc, mes) => {
      acc.receitas += mes.receitas;
      acc.gastosDebito += mes.gastosDebito;
      acc.gastosCredito += mes.gastosCredito;
      return acc;
    },
    { receitas: 0, gastosDebito: 0, gastosCredito: 0 }
  );

  const saldoTotalAnual = totais.receitas - totais.gastosDebito;

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumo Anual</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Ano:</span>
          <input type="number" value={anoResumo} onChange={e => setAnoResumo(Number(e.target.value))} className="input-premium p-2 w-28" />
        </div>
      </div>
      <div className="space-y-6">
        <BarChart title="Receitas por Mês" data={dadosResumoAnual} dataKey="receitas" colorClass="bg-emerald-500" />
        <div className="grid md:grid-cols-2 gap-6">
          <BarChart title="Gastos (Débito/Dinheiro)" data={dadosResumoAnual} dataKey="gastosDebito" colorClass="bg-blue-500" />
          <BarChart title="Gastos (Crédito)" data={dadosResumoAnual} dataKey="gastosCredito" colorClass="bg-amber-500" />
        </div>
      </div>

      <div className="mt-8 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th className="p-4 font-semibold">Mês</th>
              <th className="p-4 text-right font-semibold">Receitas</th>
              <th className="p-4 text-right font-semibold">Gastos (Dinheiro)</th>
              <th className="p-4 text-right font-semibold">Gastos (Crédito)</th>
              <th className="p-4 text-right font-semibold">Saldo do Mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {dadosResumoAnual.map((mes) => {
              const saldoMes = mes.receitas - mes.gastosDebito;
              return (
                <tr key={mes.mes} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                  <td className="p-4 font-medium capitalize text-slate-700 dark:text-slate-200">{mes.nome}</td>
                  <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">{fmt(mes.receitas)}</td>
                  <td className="p-4 text-right text-blue-600 dark:text-blue-400">{fmt(mes.gastosDebito)}</td>
                  <td className="p-4 text-right text-amber-600 dark:text-amber-400">{fmt(mes.gastosCredito)}</td>
                  <td className={`p-4 text-right font-bold ${saldoMes >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-500'}`}>
                    {fmt(saldoMes)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 dark:bg-slate-900/50 font-bold border-t-2 border-slate-300 dark:border-slate-600">
            <tr>
              <td className="p-4 text-slate-800 dark:text-slate-100">Total Anual</td>
              <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">{fmt(totais.receitas)}</td>
              <td className="p-4 text-right text-blue-600 dark:text-blue-400">{fmt(totais.gastosDebito)}</td>
              <td className="p-4 text-right text-amber-600 dark:text-amber-400">{fmt(totais.gastosCredito)}</td>
              <td className={`p-4 text-right font-extrabold ${saldoTotalAnual >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-500'}`}>
                {fmt(saldoTotalAnual)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default ResumoAnual;