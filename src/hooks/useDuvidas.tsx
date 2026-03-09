import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Duvida {
  id: string;
  pergunta: string;
  resposta: string | null;
  morador_nome: string;
  apartamento: string;
  bloco: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useDuvidas = () => {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDuvidas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('duvidas_sindico')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDuvidas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar dúvidas:', error);
      toast({
        title: "Erro ao carregar dúvidas",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const responderDuvida = async (duvidaId: string, resposta: string) => {
    try {
      const { error } = await supabase
        .from('duvidas_sindico')
        .update({ 
          resposta: resposta,
          status: 'respondida',
          updated_at: new Date().toISOString()
        })
        .eq('id', duvidaId);

      if (error) throw error;

      toast({
        title: "Resposta enviada com sucesso",
        description: "A dúvida foi respondida e o status foi atualizado.",
      });

      // Recarregar as dúvidas
      fetchDuvidas();
    } catch (error: any) {
      console.error('Erro ao responder dúvida:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDuvidas();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('duvidas_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duvidas_sindico'
        },
        () => {
          fetchDuvidas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    duvidas,
    loading,
    fetchDuvidas,
    responderDuvida,
  };
};