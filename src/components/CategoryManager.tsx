import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Category } from '../pages/types';

interface CategoryManagerProps {
  categories: Category[];
  onSave: (category: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onSave, onDelete }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      alert('O nome da categoria não pode estar vazio.');
      return;
    }
    // Chama a função onSave do componente pai para adicionar a categoria, com valores padrão para type e icon
    onSave({ name: newCategoryName.trim(), type: 'despesa', icon: 'QuestionMarkCircleIcon' });
    setNewCategoryName(''); // Limpa o input
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Gerenciar Categorias</h3>
      
      {/* Formulário para adicionar nova categoria */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nome da nova categoria"
          className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Lista de categorias existentes */}
      <div className="space-y-2 pt-4">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg"
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
              <button
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja remover a categoria "${cat.name}"?`)) {
                    onDelete(cat.id);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                title="Excluir categoria"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;