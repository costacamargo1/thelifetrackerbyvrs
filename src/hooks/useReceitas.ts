import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Receita } from '../pages/types';

export function useReceitas() {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReceitas = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      setReceitas(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar receitas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReceitas();
  }, [fetchReceitas]);

  const addReceita = async (receita: Omit<Receita, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('receitas')
      .insert([{ ...receita, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar receita:", error);
      throw error;
    }

    if (data) {
      setReceitas(prev => [data[0], ...prev]);
    }
    return data ? data[0] : null;
  };

  const updateReceita = async (id: string, updates: Partial<Receita>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const numericId = Number(id);
    const { data, error } = await supabase
      .from('receitas')
      .update(updates)
      .eq('id', numericId)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar receita:", error);
      throw error;
    }
    
    if (data) {
      setReceitas(prev => prev.map(r => (r.id === numericId ? data[0] : r)));
    }
    return data ? data[0] : null;
  };

  const deleteReceita = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const numericId = Number(id);
    const { error } = await supabase
      .from('receitas')
      .delete()
      .eq('id', numericId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar receita:", error);
      throw error;
    }

    setReceitas(prev => prev.filter(r => r.id !== numericId));
  };

  return { receitas, loading, error, addReceita, updateReceita, deleteReceita, refetch: fetchReceitas };
}
