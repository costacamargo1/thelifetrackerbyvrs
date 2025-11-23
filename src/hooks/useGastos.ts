import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Gasto } from '../pages/types';

export function useGastos() {
  const { user } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGastos = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      setGastos(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar gastos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const addGasto = async (gasto: Omit<Gasto, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('gastos')
      .insert([{ ...gasto, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar gasto:", error);
      throw error;
    }

    if (data) {
      setGastos(prev => [data[0], ...prev]);
    }
    return data ? data[0] : null;
  };

  const updateGasto = async (id: string, updates: Partial<Gasto>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const numericId = Number(id);
    const { data, error } = await supabase
      .from('gastos')
      .update(updates)
      .eq('id', numericId)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar gasto:", error);
      throw error;
    }
    
    if (data) {
      setGastos(prev => prev.map(g => (g.id === numericId ? data[0] : g)));
    }
    return data ? data[0] : null;
  };

  const deleteGasto = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const numericId = Number(id);
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', numericId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar gasto:", error);
      throw error;
    }

    setGastos(prev => prev.filter(g => g.id !== numericId));
  };

  return { gastos, loading, error, addGasto, updateGasto, deleteGasto, refetch: fetchGastos };
}
