
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

type Morador = Tables<'moradores'>;

export const useCurrentMorador = () => {
    const { user } = useSupabaseAuth();
    const [morador, setMorador] = useState<Morador | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMorador = async () => {
        if (!user) {
            setMorador(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error: fetchError } = await supabase
                .from('moradores')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (fetchError) {
                throw fetchError;
            }

            setMorador(data);
        } catch (err: any) {
            console.error('Erro ao buscar dados do morador:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMorador();
    }, [user]);

    return {
        morador,
        isLoading,
        error,
        refetch: fetchMorador,
    };
};
