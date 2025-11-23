import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Fatura, FaturaTransacao } from '../pages/types';

// Hook para Faturas
export function useFaturas(cartaoId?: string) {
  const { user } = useAuth();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFaturas = useCallback(async () => {
    if (!user || !cartaoId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .eq('user_id', user.id)
        .eq('cartao_id', cartaoId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      setFaturas(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar faturas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, cartaoId]);

  useEffect(() => {
    fetchFaturas();
  }, [fetchFaturas]);
  
  // A lógica de add/update/delete de faturas é mais complexa
  // e provavelmente será um efeito colateral da manipulação de transações.
  // Por enquanto, o hook focará em carregar os dados.

  return { faturas, loading, error, refetch: fetchFaturas };
}

// Hook para Transações da Fatura
export function useFaturaTransacoes(faturaId?: string) {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<FaturaTransacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransacoes = useCallback(async () => {
    if (!user || !faturaId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('fatura_transacoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('fatura_id', faturaId)
        .order('data', { ascending: false });

      if (error) throw error;
      setTransacoes(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar transações da fatura:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, faturaId]);

  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);

  // A lógica de adicionar transações provavelmente será chamada de outro lugar,
  // como ao criar um gasto parcelado.

  return { transacoes, loading, error, refetch: fetchTransacoes };
}
