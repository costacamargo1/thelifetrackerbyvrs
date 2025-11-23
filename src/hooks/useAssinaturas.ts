import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Assinatura } from '../pages/types';

export function useAssinaturas() {
  const { user } = useAuth();
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssinaturas = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('user_id', user.id)
        .order('proximo_pagamento', { ascending: true });

      if (error) {
        throw error;
      }

      setAssinaturas(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar assinaturas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssinaturas();
  }, [fetchAssinaturas]);

  const addAssinatura = async (assinatura: Omit<Assinatura, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('assinaturas')
      .insert([{ ...assinatura, user_id: user.id }])
      .select();

    if (error) {
      console.error("Erro ao adicionar assinatura:", error);
      throw error;
    }

    if (data) {
      setAssinaturas(prev => [...prev, data[0]]); // Re-sort or just add
    }
    return data ? data[0] : null;
  };

  const updateAssinatura = async (id: string, updates: Partial<Assinatura>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('assinaturas')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erro ao atualizar assinatura:", error);
      throw error;
    }
    
    if (data) {
      setAssinaturas(prev => prev.map(a => (a.id === id ? data[0] : a)));
    }
    return data ? data[0] : null;
  };

  const deleteAssinatura = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { error } = await supabase
      .from('assinaturas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao deletar assinatura:", error);
      throw error;
    }

    setAssinaturas(prev => prev.filter(a => a.id !== id));
  };

  return { assinaturas, loading, error, addAssinatura, updateAssinatura, deleteAssinatura, refetch: fetchAssinaturas };
}
