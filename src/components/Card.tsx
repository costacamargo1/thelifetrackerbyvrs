import React from 'react';

const Card = ({ children, className = "", delay = "0ms" }: { children: React.ReactNode, className?: string, delay?: string }) => (
  <div 
    className={`bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);

export default Card;
