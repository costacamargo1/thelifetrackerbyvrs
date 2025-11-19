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
  const values = data.map(d => d[dataKey] as number);
  const maxValue = Math.max(...values);
  const allZero = values.every(v => v === 0);

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-600">
      <h3 className="font-medium mb-4 text-black dark:text-gray-200">{title}</h3>
      <div className="flex justify-between gap-2 h-48">
        {allZero ? (
          <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
            <p>Nenhum dado para exibir.</p>
          </div>
        ) : (
                        data.map(d => {
                      const value = d[dataKey] as number;
                      const heightPercent = maxValue > 0 ? Math.max(0, (value / maxValue) * 100) : 0;
          
                      return (
                        <div key={d.mes} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                          <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {fmt(value)}
                          </div>
                          <div className="w-full flex-grow flex items-end">
                            <div 
                              className={`w-full rounded-t ${colorClass} transition-all duration-500 ease-out`} 
                              style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '2px' : '0' }} 
                            />
                          </div>
                          <div className="text-xs opacity-70">{d.nome}</div>
                        </div>
                      );
                    })        )}
      </div>
    </div>
  );
};

const ResumoAnual: React.FC<ResumoAnualProps> = ({ dadosResumoAnual, anoResumo, setAnoResumo }) => {
  const totais = dadosResumoAnual.reduce(
    (acc, mes) => {
      acc.receitas += mes.receitas;
      acc.gastosDebito += mes.gastosDebito;
      acc.gastosCredito += mes.gastosCredito;
      return acc;
    },
    { receitas: 0, gastosDebito: 0, gastosCredito: 0 }
  );

  const saldoTotalAnual = totais.receitas - totais.gastosDebito - totais.gastosCredito;

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

      {/* Tabela de Resumo */}
      <div className="mt-8 border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3">Mês</th>
              <th className="p-3 text-right">Receitas</th>
              <th className="p-3 text-right">Gastos (Dinheiro)</th>
              <th className="p-3 text-right">Gastos (Crédito)</th>
              <th className="p-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {dadosResumoAnual.map((mes) => {
              const saldoMes = mes.receitas - mes.gastosDebito - mes.gastosCredito;
              return (
                <tr key={mes.mes} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20">
                  <td className="p-3 font-medium">{mes.nome}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(mes.receitas)}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(mes.gastosDebito)}</td>
                  <td className="p-3 text-right text-orange-600 dark:text-orange-400">{fmt(mes.gastosCredito)}</td>
                  <td className={`p-3 text-right font-semibold ${saldoMes >= 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
                    {fmt(saldoMes)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100 dark:bg-slate-800 font-bold border-t-2 border-gray-300 dark:border-slate-600">
            <tr>
              <td className="p-3">Total Anual</td>
              <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(totais.receitas)}</td>
              <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(totais.gastosDebito)}</td>
              <td className="p-3 text-right text-orange-600 dark:text-orange-400">{fmt(totais.gastosCredito)}</td>
              <td className={`p-3 text-right font-semibold ${saldoTotalAnual >= 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
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