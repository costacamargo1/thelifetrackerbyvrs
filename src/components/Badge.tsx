import React from 'react';

const Badge = ({ children, type = 'neutral' }: { children: React.ReactNode, type?: 'success' | 'danger' | 'warning' | 'neutral' }) => {
  const colors = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[type]}`}>
      {children}
    </span>
  );
};

export default Badge;
