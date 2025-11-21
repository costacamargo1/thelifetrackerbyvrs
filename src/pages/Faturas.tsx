import React, { useState, useMemo } from 'react';
import { Cartao, Gasto } from './types';
import { fmt, toNum } from '../../utils/helpers';
import CardIcon from '../components/CardIcon';

interface Fatura {
  cartao: Cartao;
  lancamentos: Gasto[];
  total: number;
  disponivel: number;
}

interface FaturasProps {
  gastos: Gasto[];
  cartoes: Cartao[];
}

const Faturas: React.FC<FaturasProps> = ({
  gastos,
  cartoes,
}) => {
  const [buscaFatura, setBuscaFatura] = useState('');
  const [mesFatura, setMesFatura] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Set to previous month
    return date;
  });

 const faturasFiltradas = useMemo(() => {
    return cartoes.map(cartao => {
      const lancamentos = gastos.filter(gasto => {
        if (gasto.cartaoId !== cartao.id) return false;
        if (gasto.tipoPagamento !== 'CRÉDITO') return false;

        const mesFaturaAtual = mesFatura.getMonth(); // 0-indexed
        const anoFaturaAtual = mesFatura.getFullYear();
        const diaFechamentoCartao = cartao.diaFechamento;

        // O período da fatura vai do dia seguinte ao fechamento do mês anterior
        // até o dia de fechamento do mês selecionado
        
        // Data de início: dia seguinte ao fechamento do mês anterior
        const inicioFatura = new Date(anoFaturaAtual, mesFaturaAtual - 1, diaFechamentoCartao + 1);
        inicioFatura.setHours(0, 0, 0, 0);
        
        // Data de fim: dia de fechamento do mês selecionado
        const fimFatura = new Date(anoFaturaAtual, mesFaturaAtual, diaFechamentoCartao);
        fimFatura.setHours(23, 59, 59, 999);

        // Converter a data do gasto para objeto Date
        const gastoDate = new Date(gasto.data + 'T12:00:00');
        
        // Incluir gastos que estão dentro do período da fatura
        return gastoDate > inicioFatura && gastoDate <= fimFatura;
      });

      const lancamentosFiltrados = buscaFatura
        ? lancamentos.filter(l => l.descricao.toLowerCase().includes(buscaFatura.toLowerCase()))
        : lancamentos;

      const total = lancamentos.reduce((acc, g) => acc + toNum(g.valor), 0);
      const limite = toNum(cartao.limite);
      
      // 'Disponível Pós-fatura' reflete o limite menos o total da fatura atual
      const disponivel = limite - total;

      return {
        cartao,
        lancamentos: lancamentosFiltrados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
        total,
        disponivel,
      };
    });
  }, [cartoes, gastos, mesFatura, buscaFatura]);

  const totalFaturasMes = useMemo(() => {
    return faturasFiltradas.reduce((acc, fatura) => acc + fatura.total, 0);
  }, [faturasFiltradas]);

  return (
    <section className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card">
        <h2 className="text-lg font-medium text-black dark:text-gray-200">Faturas dos Cartões</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input type="text" placeholder="Buscar lançamento..." value={buscaFatura} onChange={e => setBuscaFatura(e.target.value)} className="input-premium w-full sm:w-48" />
          <input type="month" value={mesFatura.toISOString().slice(0, 7)} onChange={e => setMesFatura(new Date(e.target.value + '-01T12:00:00'))} className="input-premium" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faturasFiltradas.map((f, index) => (
          <div key={f.cartao.id} className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-center gap-2 mb-4">
              <CardIcon cardName={f.cartao.nome} />
              <h3 className="font-medium text-base">{f.cartao.nome}</h3>
            </div>
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {f.lancamentos.length === 0 ? (
                <p className="text-sm text-center opacity-60 py-4">Nenhum lançamento para este mês.</p>
              ) : (
                f.lancamentos.map(g => (
                  <div key={g.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <div className="truncate max-w-[200px] sm:max-w-xs">{g.descricao}</div>
                      <div className="text-xs opacity-60">{new Date(g.data + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="font-medium whitespace-nowrap">{fmt(toNum(g.valor))}</div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t pt-2 dark:border-slate-700">
              <div className="flex justify-between text-sm font-medium">
                <span>Total da Fatura</span>
                <span className="text-red-600 dark:text-red-400">{fmt(f.total)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="opacity-70">Limite Total</span>
                <span>{fmt(toNum(f.cartao.limite))}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-70">Disponível Pós-fatura</span>
                <span className="text-green-600 dark:text-green-400">{fmt(f.disponivel)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700 text-right font-medium text-sm">
        Total das faturas no mês: {fmt(totalFaturasMes)}
      </div>
    </section>
  );
};

export default Faturas;
