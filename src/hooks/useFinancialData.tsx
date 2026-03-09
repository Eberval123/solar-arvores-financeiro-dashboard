import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MovimentacaoFinanceira, ResumoFinanceiro, FiltroMovimentacao } from '@/types/financial';
import { fetchGoogleSheetsData } from '@/services/googleSheets';
import { supabase } from '@/integrations/supabase/client';

interface FinancialDataState {
  movimentacoes: MovimentacaoFinanceira[];
  aplicacoes: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  autoRefreshEnabled: boolean;
  setMovimentacoes: (data: MovimentacaoFinanceira[]) => void;
  setAplicacoes: (data: any[]) => void;
  loadFromGoogleSheets: () => Promise<void>;
  loadAplicacoes: () => Promise<void>;
  addMovimentacao: (movimentacao: MovimentacaoFinanceira) => void;
  updateMovimentacao: (index: number, movimentacao: MovimentacaoFinanceira) => void;
  deleteMovimentacao: (index: number) => void;
  getResumoFinanceiro: () => ResumoFinanceiro;
  getMovimentacoesFiltradas: (filtros: FiltroMovimentacao) => MovimentacaoFinanceira[];
  clearData: () => void;
  subscribeToChanges: () => () => void;
  startAutoRefresh: () => () => void;
  toggleAutoRefresh: (enabled: boolean) => void;
}

export const useFinancialData = create<FinancialDataState>()(
  persist(
    (set, get) => ({
      movimentacoes: [],
      aplicacoes: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,

      setMovimentacoes: (data: MovimentacaoFinanceira[]) => {
        set({
          movimentacoes: data,
          lastUpdated: new Date().toISOString(),
          error: null
        });
      },

      setAplicacoes: (data: any[]) => {
        set({ aplicacoes: data });
      },

      loadFromGoogleSheets: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchGoogleSheetsData();
          set({
            movimentacoes: data,
            lastUpdated: new Date().toISOString(),
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      },

      loadAplicacoes: async () => {
        try {
          const { data } = await supabase
            .from('aplicacoes_financeiras')
            .select('*');

          if (data) {
            set({ aplicacoes: data });
          }
        } catch (error) {
          console.error('Erro ao carregar aplicações:', error);
        }
      },

      subscribeToChanges: () => {
        // Subscribe to aplicacoes_financeiras changes
        const aplicacoesChannel = supabase
          .channel('aplicacoes_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'aplicacoes_financeiras'
            },
            () => {
              // Reload aplicacoes when data changes
              get().loadAplicacoes();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(aplicacoesChannel);
        };
      },

      addMovimentacao: (movimentacao: MovimentacaoFinanceira) => {
        set(state => ({
          movimentacoes: [...state.movimentacoes, movimentacao]
        }));
      },

      updateMovimentacao: (index: number, movimentacao: MovimentacaoFinanceira) => {
        set(state => {
          const newMovimentacoes = [...state.movimentacoes];
          newMovimentacoes[index] = movimentacao;
          return { movimentacoes: newMovimentacoes };
        });
      },

      deleteMovimentacao: (index: number) => {
        set(state => ({
          movimentacoes: state.movimentacoes.filter((_, i) => i !== index)
        }));
      },

      getResumoFinanceiro: (): ResumoFinanceiro => {
        const { movimentacoes, aplicacoes } = get();
        const totalReceitas = movimentacoes
          .filter(m => m.ValorMov > 0)
          .reduce((sum, m) => sum + m.ValorMov, 0);

        const totalDespesas = movimentacoes
          .filter(m => m.ValorMov < 0)
          .reduce((sum, m) => sum + Math.abs(m.ValorMov), 0);

        // Calcular fundos baseados nas aplicações financeiras
        const fundoReserva = aplicacoes
          .filter(app => app.nome_aplicacao.toLowerCase().includes('reserva'))
          .reduce((total, app) => total + app.valor_aplicacao + app.valor_rendimento, 0);

        const fundoReforma = aplicacoes
          .filter(app => app.nome_aplicacao.toLowerCase().includes('reforma'))
          .reduce((total, app) => total + app.valor_aplicacao + app.valor_rendimento, 0);

        // Cálculo do saldo atual: saldo anterior + total receita - total despesa - fundo reserva - fundo reforma
        const saldoAnterior = 0; // TODO: implementar lógica para saldo anterior
        const saldoAtual = saldoAnterior + totalReceitas - totalDespesas - fundoReserva - fundoReforma;

        const categoriasMap = new Map();
        movimentacoes.forEach(m => {
          const categoria = m.IdBaseCategoria;
          if (!categoriasMap.has(categoria)) {
            categoriasMap.set(categoria, { valor: 0, count: 0 });
          }
          const current = categoriasMap.get(categoria);
          categoriasMap.set(categoria, {
            valor: current.valor + Math.abs(m.ValorMov),
            count: current.count + 1
          });
        });

        const movimentacoesPorCategoria = Array.from(categoriasMap.entries())
          .map(([categoria, data]) => ({
            categoria,
            valor: data.valor,
            count: data.count
          }));

        return {
          saldoAnterior,
          totalReceitas,
          totalDespesas,
          fundoReserva,
          fundoReforma,
          saldoAtual,
          movimentacoesPorCategoria
        };
      },

      getMovimentacoesFiltradas: (filtros: FiltroMovimentacao): MovimentacaoFinanceira[] => {
        const { movimentacoes } = get();
        return movimentacoes.filter(m => {
          if (filtros.mes && m.MesRef !== filtros.mes) return false;
          if (filtros.categoria && m.IdBaseCategoria !== filtros.categoria) return false;
          if (filtros.status && m.Status !== filtros.status) return false;
          if (filtros.dataInicio && m.DataMovimentacao < filtros.dataInicio) return false;
          if (filtros.dataFim && m.DataMovimentacao > filtros.dataFim) return false;
          return true;
        });
      },

      clearData: () => {
        set({ movimentacoes: [] });
      },

      startAutoRefresh: () => {
        // Função para verificar se há mudanças nos dados
        const checkForUpdates = async () => {
          const state = get();
          if (!state.autoRefreshEnabled) return;

          try {
            const data = await fetchGoogleSheetsData();
            const currentDataString = JSON.stringify(state.movimentacoes);
            const newDataString = JSON.stringify(data);

            // Só atualiza se houver mudanças nos dados
            if (currentDataString !== newDataString) {
              set({
                movimentacoes: data,
                lastUpdated: new Date().toISOString(),
                error: null
              });
            }
          } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
          }
        };

        // Verificar atualizações a cada 30 segundos
        const intervalId = setInterval(checkForUpdates, 30000);

        // Fazer primeira verificação após 5 segundos
        setTimeout(checkForUpdates, 5000);

        return () => {
          clearInterval(intervalId);
        };
      },

      toggleAutoRefresh: (enabled: boolean) => {
        set({ autoRefreshEnabled: enabled });
      }
    }),
    {
      name: 'condominio-financial-data',
    }
  )
);
