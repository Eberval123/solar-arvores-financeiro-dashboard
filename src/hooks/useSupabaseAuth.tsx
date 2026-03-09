import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFiscal: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    isFiscal: false,
  });

  const checkUserRole = async (userId: string, role: 'admin' | 'fiscal'): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar role:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Defer role check to avoid blocking
          setTimeout(async () => {
            const isAdmin = await checkUserRole(session.user.id, 'admin');
            const isFiscal = await checkUserRole(session.user.id, 'fiscal');
            setAuthState({
              user: session.user,
              session: session,
              isLoading: false,
              isAdmin,
              isFiscal,
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
            isFiscal: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkUserRole(session.user.id, 'admin');
        const isFiscal = await checkUserRole(session.user.id, 'fiscal');
        setAuthState({
          user: session.user,
          session: session,
          isLoading: false,
          isAdmin,
          isFiscal,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
          isFiscal: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
        isFiscal: false,
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAdmin: authState.isAdmin,
    isFiscal: authState.isFiscal,
    canAccessPrestacaoContas: authState.isAdmin || authState.isFiscal,
    isAuthenticated: !!authState.user,
    signIn,
    signUp,
    signOut,
    checkUserRole,
  };
};
