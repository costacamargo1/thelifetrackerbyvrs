import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Categoria } from '../pages/types';

export function useCategorias() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategorias = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      if (error) {
        throw error;
      }

      setCategorias(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar categorias:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const addCategoria = async (categoria: Omit<Categoria, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ ...categoria, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar categoria:", error);
      throw error;
    }

    if (data) {
      setCategorias(prev => [...prev, data[0]]);
    }
    return data ? data[0] : null;
  };

  const updateCategoria = async (id: string, updates: Partial<Categoria>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
    
    if (data) {
      setCategorias(prev => prev.map(c => (c.id === id ? data[0] : c)));
    }
    return data ? data[0] : null;
  };

  const deleteCategoria = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar categoria:", error);
      throw error;
    }

    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  return { categorias, loading, error, addCategoria, updateCategoria, deleteCategoria, refetch: fetchCategorias };
}
