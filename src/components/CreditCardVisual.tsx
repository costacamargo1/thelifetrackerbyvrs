import React from 'react';
import { fmt, toNum } from '../../utils/helpers';

const CreditCardVisual = ({ nome, limite, gastos }: { nome: string, limite: string, gastos: number }) => {
    const getStyle = (n: string) => {
      const lower = n.toLowerCase();
      if (lower.includes('nubank')) return 'from-purple-700 to-purple-800 text-white';
      if (lower.includes('santander')) return 'from-red-600 to-red-700 text-white';
      if (lower.includes('inter')) return 'from-orange-500 to-orange-600 text-white';
      if (lower.includes('itau') || lower.includes('itaú')) return 'from-orange-600 to-orange-700 text-white';
      if (lower.includes('caixa')) return 'from-blue-600 to-blue-800 text-white';
      if (lower.includes('bradesco')) return 'from-red-700 to-red-800 text-white';
      if (lower.includes('c6')) return 'from-slate-800 to-black text-white';
      if (lower.includes('banco do brasil') || lower.includes('bb')) return 'from-yellow-400 to-yellow-500 text-black';
      if (lower.includes('xp')) return 'from-slate-900 via-yellow-600 to-slate-900 text-white border border-yellow-500/30';
      return 'from-slate-700 via-slate-600 to-slate-800 text-white';
    };
  
    const limiteNum = toNum(limite);
    const disponivel = limiteNum - gastos;
    const availablePercent = limiteNum > 0 ? Math.max(0, Math.min(100, (disponivel / limiteNum) * 100)) : 0;
  
    return (
      <div className={`relative w-full aspect-[1.586] rounded-2xl p-5 flex flex-col justify-between shadow-lg overflow-hidden bg-gradient-to-br ${getStyle(nome)} transition-transform hover:scale-[1.02] duration-300`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>
        <div className="flex justify-between items-start z-10">
          <span className="font-semibold tracking-wider opacity-90">{nome}</span>
          <div className="w-10 h-8 rounded bg-gradient-to-tr from-yellow-200 to-yellow-400 opacity-80 border border-yellow-500/30 flex items-center justify-center">
              <div className="w-full h-[1px] bg-yellow-600/20 mb-[2px]"></div>
          </div>
        </div>
        <div className="z-10">
          <div className="flex justify-between text-xs opacity-80 mb-1">
            <span>Disponível</span>
            <span>{fmt(disponivel)}</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden backdrop-blur-sm">
            <div className="bg-white/90 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${availablePercent}%` }} />
          </div>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold tracking-tight">{fmt(limiteNum)}</span>
            <span className="text-[10px] opacity-70 font-mono tracking-widest">**** 8842</span>
          </div>
        </div>
      </div>
    );
  };

  export default CreditCardVisual;
  