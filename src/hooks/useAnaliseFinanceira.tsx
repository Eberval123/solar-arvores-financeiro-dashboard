import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AnaliseFinanceira {
  id: string;
  periodo: string;
  conteudo: string;
  data_criacao: string;
  created_by?: string;
  nome_arquivo?: string;
  url_arquivo?: string;
  tamanho_arquivo?: number;
  tipo_arquivo?: string;
}

export const useAnaliseFinanceira = () => {
  const [analises, setAnalises] = useState<AnaliseFinanceira[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalises = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('analises_financeiras')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAnalises(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar análises';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPDF = async (periodo: string, file: File) => {
    try {
      console.log('Iniciando upload do PDF:', { periodo, fileName: file.name, fileSize: file.size });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${periodo.replace(/\//g, '-').replace(/\s+/g, '_')}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Fazendo upload para storage:', filePath);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('analises-financeiras')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload para storage:', uploadError);
        throw uploadError;
      }

      console.log('Upload para storage concluído com sucesso');

      // Save to database
      console.log('Inserindo registro no banco de dados...');
      const { error: insertError } = await supabase
        .from('analises_financeiras')
        .insert({
          periodo,
          conteudo: `Análise financeira de ${periodo}`,
          nome_arquivo: file.name,
          url_arquivo: filePath,
          tamanho_arquivo: file.size,
          tipo_arquivo: file.type,
          data_criacao: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erro ao inserir no banco de dados:', insertError);
        // Rollback storage upload if database insert fails
        await supabase.storage.from('analises-financeiras').remove([filePath]);
        throw insertError;
      }

      console.log('Análise salva com sucesso no banco de dados');
      await fetchAnalises();
    } catch (err) {
      console.error('Erro completo no upload:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar análise';
      toast.error(errorMessage);
      throw err;
    }
  };

  const downloadAnalise = async (fileName: string, filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('analises-financeiras')
        .download(filePath);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download iniciado!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao baixar análise';
      toast.error(errorMessage);
    }
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('analises-financeiras')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar URL';
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteAnalise = async (id: string, filePath?: string) => {
    try {
      // Delete from storage if file exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('analises-financeiras')
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('analises_financeiras')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Análise excluída com sucesso!');
      await fetchAnalises();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir análise';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchAnalises();
  }, []);

  return {
    analises,
    isLoading,
    error,
    fetchAnalises,
    uploadPDF,
    downloadAnalise,
    getSignedUrl,
    deleteAnalise
  };
};