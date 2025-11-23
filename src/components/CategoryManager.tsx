import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCategorias } from '../hooks/useCategorias';
import { toast } from 'sonner';

const CategoryManager: React.FC = () => {
  const { categorias, loading, error, addCategoria, deleteCategoria } = useCategorias();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      toast.error('O nome da categoria não pode estar vazio.');
      return;
    }
    try {
      await addCategoria({ nome: newCategoryName.trim(), tipo: 'gasto', icone: 'QuestionMarkCircleIcon' });
      setNewCategoryName('');
      toast.success('Categoria adicionada!');
    } catch (err) {
      toast.error('Erro ao adicionar categoria.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Gerenciar Categorias</h3>
      
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

      {loading && <p className="text-sm text-slate-500">Carregando categorias...</p>}
      {error && <p className="text-sm text-red-500">Erro ao carregar categorias.</p>}
      
      <div className="space-y-2 pt-4">
        {!loading && !error && (
          categorias.length > 0 ? (
            categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.nome}</span>
                <button
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja remover a categoria "${cat.nome}"?`)) {
                      deleteCategoria(cat.id);
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
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma categoria personalizada cadastrada.</p>
          )
        )}
      </div>
    </div>
  );
};

export default CategoryManager;