import React, { useState } from 'react';
import { Category, CategoryType, Receita } from '../pages/types';
import { IconComponent, iconMap } from './CategoryIcon';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<{ name: string; type: CategoryType; icon: string }>({
    name: '',
    type: 'despesa',
    icon: 'HomeIcon',
  });

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm(category);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'despesa', icon: 'HomeIcon' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) return;

    if (editingCategory) {
      setCategories(categories.map(cat => cat.id === editingCategory.id ? { ...editingCategory, ...categoryForm } : cat));
    } else {
      setCategories([...categories, { ...categoryForm, id: Date.now().toString() }]);
    }
    handleCloseModal();
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Gerenciamento de Categorias</h3>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow dark:bg-blue-600 dark:hover:bg-blue-700">
          Adicionar Categoria
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-white/10">
            <div className="flex items-center gap-3">
              <IconComponent iconName={category.icon} className="w-6 h-6" />
              <span className="font-medium">{category.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${category.type === 'despesa' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                {category.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenModal(category)} className="p-1 text-gray-400 hover:text-white">
                {/* Placeholder for Edit Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
              </button>
              <button onClick={() => handleDeleteCategory(category.id)} className="p-1 text-gray-400 hover:text-red-500">
                {/* Placeholder for Delete Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl glass-card w-full max-w-md space-y-4 animate-fadeInUp">
            <h3 className="text-lg font-medium">{editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs opacity-70">Nome da Categoria</span>
                <input type="text" className="input-premium" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs opacity-70">Tipo</span>
                <select className="input-premium" value={categoryForm.type} onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as CategoryType })}>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </label>
              <div>
                <span className="text-xs opacity-70">Ícone</span>
                <div className="grid grid-cols-8 gap-2 mt-2 p-3 rounded-lg bg-white/10">
                  {Object.keys(iconMap).map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${categoryForm.icon === iconName ? 'bg-blue-500' : 'hover:bg-white/20'}`}
                    >
                      <IconComponent iconName={iconName} className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-white/70 hover:text-white">Cancelar</button>
              <button onClick={handleSaveCategory} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium">{editingCategory ? 'Salvar Alterações' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;