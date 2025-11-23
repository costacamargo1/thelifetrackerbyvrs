import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';
import { useAuth } from './useAuth';
import { Configuracoes } from '../pages/types';

const defaultConfig: Omit<Configuracoes, 'user_id' | 'created_at'> = {
  tema: 'light',
  moeda: 'BRL',
  primeiro_acesso: true,
};

export function useConfiguracoes() {
  const { user } = useAuth();
  const [configuracoes, setConfiguracoes] = useState<Configuracoes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfiguracoes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: 'exact-one' violation (row not found)
        throw error;
      }

      if (data) {
        setConfiguracoes(data);
      } else {
        // Se não houver config, cria uma inicial para o usuário
        const { data: newData, error: insertError } = await supabase
            .from('configuracoes')
            .insert([{ ...defaultConfig, user_id: user.id }])
            .select()
            .single();
        
        if (insertError) throw insertError;
        setConfiguracoes(newData);
      }

    } catch (err: any) {
      console.error("Erro ao buscar configurações:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfiguracoes();
  }, [fetchConfiguracoes]);

  const updateConfiguracoes = async (updates: Partial<Configuracoes>) => {
    if (!user || !configuracoes) throw new Error("Usuário ou configurações não disponíveis.");

    // Omit user_id from updates to prevent trying to change the primary key
    const { user_id, ...updateData } = updates;

    const { data, error } = await supabase
      .from('configuracoes')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar configurações:", error);
      throw error;
    }
    
    if (data) {
      setConfiguracoes(data);
    }
    return data;
  };

  return { configuracoes, loading, error, updateConfiguracoes, refetch: fetchConfiguracoes };
}
