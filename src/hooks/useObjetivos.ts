import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Objetivo } from '../pages/types';

export function useObjetivos() {
  const { user } = useAuth();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchObjetivos = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('objetivos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setObjetivos(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar objetivos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchObjetivos();
  }, [fetchObjetivos]);

  const addObjetivo = async (objetivo: Omit<Objetivo, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('objetivos')
      .insert([{ ...objetivo, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar objetivo:", error);
      throw error;
    }

    if (data) {
      setObjetivos(prev => [data[0], ...prev]);
    }
    return data ? data[0] : null;
  };

  const updateObjetivo = async (id: string, updates: Partial<Objetivo>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('objetivos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar objetivo:", error);
      throw error;
    }
    
    if (data) {
      setObjetivos(prev => prev.map(o => (o.id === id ? data[0] : o)));
    }
    return data ? data[0] : null;
  };

  const deleteObjetivo = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { error } = await supabase
      .from('objetivos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar objetivo:", error);
      throw error;
    }

    setObjetivos(prev => prev.filter(o => o.id !== id));
  };

  return { objetivos, loading, error, addObjetivo, updateObjetivo, deleteObjetivo, refetch: fetchObjetivos };
}
