import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AplicacaoFinanceira {
  id: string;
  data_saldo: string;
  nome_aplicacao: string;
  valor_aplicacao: number;
  valor_rendimento: number;
  created_at: string;
  updated_at: string;
}

export const useAplicacoesFinanceiras = () => {
  const [aplicacoes, setAplicacoes] = useState<AplicacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAplicacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aplicacoes_financeiras')
        .select('*')
        .order('data_saldo', { ascending: false });

      if (error) throw error;
      setAplicacoes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAplicacoes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('aplicacoes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aplicacoes_financeiras'
        },
        () => {
          fetchAplicacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const valorTotalAplicacoes = aplicacoes.reduce((total, app) => total + app.valor_aplicacao, 0);
  const valorTotalRendimentos = aplicacoes.reduce((total, app) => total + app.valor_rendimento, 0);
  const valorTotalGeral = valorTotalAplicacoes + valorTotalRendimentos;

  const refetch = () => {
    fetchAplicacoes();
  };

  return {
    aplicacoes,
    loading,
    error,
    valorTotalAplicacoes,
    valorTotalRendimentos,
    valorTotalGeral,
    refetch,
  };
};