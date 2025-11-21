import React from 'react';

const CardIcon = ({ cardName }: { cardName: string }) => {
  const getStyle = (n: string) => {
    const lower = n.toLowerCase();
    if (lower.includes('nubank')) return 'from-purple-700 to-purple-800';
    if (lower.includes('santander')) return 'from-red-600 to-red-700';
    if (lower.includes('inter')) return 'from-orange-500 to-orange-600';
    if (lower.includes('itau') || lower.includes('itaú')) return 'from-orange-600 to-orange-700';
    if (lower.includes('caixa')) return 'from-blue-600 to-blue-800';
    if (lower.includes('bradesco')) return 'from-red-700 to-red-800';
    if (lower.includes('c6')) return 'from-slate-800 to-black';
    if (lower.includes('banco do brasil') || lower.includes('bb')) return 'from-yellow-400 to-yellow-500';
    if (lower.includes('xp')) return 'from-slate-800 to-slate-900';
    return 'from-slate-600 to-slate-700';
  };

  return (
    <div className={`w-10 h-6 rounded-md bg-gradient-to-br ${getStyle(cardName)} shadow-sm`} />
  );
};

export default CardIcon;
