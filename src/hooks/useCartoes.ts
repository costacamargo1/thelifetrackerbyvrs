import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Cartao } from '../pages/types';

export function useCartoes() {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCartoes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCartoes(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar cartões:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCartoes();
  }, [fetchCartoes]);

  const addCartao = async (cartao: Omit<Cartao, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('cartoes')
      .insert([{ ...cartao, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar cartão:", error);
      throw error;
    }

    if (data) {
      setCartoes(prev => [data[0], ...prev]);
    }
    return data ? data[0] : null;
  };

  const updateCartao = async (id: string, updates: Partial<Cartao>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('cartoes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar cartão:", error);
      throw error;
    }
    
    if (data) {
      setCartoes(prev => prev.map(c => (c.id === id ? data[0] : c)));
    }
    return data ? data[0] : null;
  };

  const deleteCartao = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar cartão:", error);
      throw error;
    }

    setCartoes(prev => prev.filter(c => c.id !== id));
  };

  return { cartoes, loading, error, addCartao, updateCartao, deleteCartao, refetch: fetchCartoes };
}
