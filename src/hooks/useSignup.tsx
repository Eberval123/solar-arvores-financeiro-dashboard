import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignupData {
  nome: string;
  apartamento: string;
  email: string;
  telefone?: string;
}

interface SignupResult {
  success: boolean;
  error?: string;
}

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (data: SignupData): Promise<SignupResult> => {
    setIsLoading(true);

    try {
      // Verificar se o email já existe
      const { data: existingEmail } = await supabase
        .from('moradores')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingEmail) {
        return {
          success: false,
          error: 'Este email já está cadastrado no sistema.'
        };
      }

      // Removida a verificação de apartamento ocupado para permitir múltiplos moradores por unidade

      // Inserir o novo morador com status "No aguardo"
      const { error } = await supabase
        .from('moradores')
        .insert({
          nome: data.nome.trim(),
          apartamento: data.apartamento,
          email: data.email.toLowerCase().trim(),
          telefone: data.telefone || null,
          status: 'No aguardo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting resident:', error);
        return {
          success: false,
          error: 'Erro ao cadastrar morador. Tente novamente.'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      return {
        success: false,
        error: 'Erro inesperado. Tente novamente mais tarde.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    isLoading
  };
};