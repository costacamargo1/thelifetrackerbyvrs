import React from 'react';
import { Category } from './types';
import CategoryManager from '../components/CategoryManager';

interface ConfiguracoesProps {
  categories: Category[];
  onSaveCategoria: (category: Category) => void;
  onDeleteCategoria: (id: string) => void;
  openModal: (type: 'categoria', item?: any) => void;
}

const Configuracoes: React.FC<ConfiguracoesProps> = ({
  categories,
  onSaveCategoria,
  onDeleteCategoria,
}) => {
  return (
    <section className="space-y-6 animate-fadeInUp">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações</h2>
      <div className="p-6 rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700/60 shadow-sm">
        <CategoryManager categories={categories} onSave={onSaveCategoria as any} onDelete={onDeleteCategoria} />
      </div>
    </section>
  );
};

export default Configuracoes;