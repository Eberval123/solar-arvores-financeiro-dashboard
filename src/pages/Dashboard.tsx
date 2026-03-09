import React, { useEffect, useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import ResumoCards from '@/components/dashboard/ResumoCards';
import ChartsSection from '@/components/dashboard/ChartsSection';
import FinancialSummaryTable from '@/components/dashboard/FinancialSummaryTable';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import ExtratosModal from '@/components/dashboard/ExtratosModal';
import AnaliseFinanceiraModal from '@/components/dashboard/AnaliseFinanceiraModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, RefreshCw, AlertCircle, FileText, BarChart } from 'lucide-react';
const Dashboard = () => {
  const {
    movimentacoes,
    getResumoFinanceiro,
    loadFromGoogleSheets,
    loadAplicacoes,
    subscribeToChanges,
    startAutoRefresh,
    isLoading,
    error,
    lastUpdated
  } = useFinancialData();
  const [extratosModalOpen, setExtratosModalOpen] = useState(false);
  const [analiseModalOpen, setAnaliseModalOpen] = useState(false);
  const resumo = getResumoFinanceiro();

  useEffect(() => {
    // Carregar dados automaticamente na primeira visita
    if (movimentacoes.length === 0 && !error) {
      loadFromGoogleSheets();
      loadAplicacoes();
    }
  }, [loadFromGoogleSheets, loadAplicacoes]);

  // Subscribe to realtime changes
  useEffect(() => {
    const unsubscribe = subscribeToChanges();
    return unsubscribe;
  }, [subscribeToChanges]);

  // Start auto-refresh for Google Sheets data
  useEffect(() => {
    const stopAutoRefresh = startAutoRefresh();
    return stopAutoRefresh;
  }, [startAutoRefresh]);

  const handleRefresh = () => {
    loadFromGoogleSheets();
    loadAplicacoes();
  };
  const formatLastUpdated = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  };

  if (error) {
    return <div className="space-y-6">
      {/* Status da Conexão */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <ConnectionStatus isConnected={false} lastUpdated={lastUpdated} />
      </div>

      <div className="text-center py-12">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-red-700 mb-4 text-sm">
              {error}
            </p>
            <Button onClick={handleRefresh} disabled={isLoading} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              {isLoading ? <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </> : <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
  }
  if (isLoading && movimentacoes.length === 0) {
    return <div className="space-y-6">
      {/* Status da Conexão */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <ConnectionStatus isConnected={true} lastUpdated={lastUpdated} />
      </div>

      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Carregando dados...
            </h3>
            <p className="text-gray-600">
              Conectando com Google Sheets para buscar os dados financeiros.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>;
  }
  if (movimentacoes.length === 0) {
    return <div className="space-y-6">
      {/* Status da Conexão */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <ConnectionStatus isConnected={!error} lastUpdated={lastUpdated} />
      </div>

      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <FileX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar dados na planilha do Google Sheets ou a planilha pode estar vazia.
            </p>
            <Button onClick={handleRefresh} disabled={isLoading} className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-sm hover:-translate-y-0.5 transition-all">
              {isLoading ? <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </> : <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Carregar Dados
              </>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
  }
  return <div className="space-y-6">
    {/* Header com status da conexão e botão de atualização */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        {lastUpdated && <p className="text-sm text-gray-600">
          Última atualização: {formatLastUpdated(lastUpdated)}
        </p>}
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus isConnected={!error} lastUpdated={lastUpdated} />
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>

    {/* Cards de Resumo */}
    <ResumoCards resumo={resumo} />

    {/* Botões de Ação reposicionados para maior destaque */}
    <div className="flex flex-col sm:flex-row justify-center gap-4 py-2">
      <Button onClick={() => setAnaliseModalOpen(true)} className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-4 rounded-sm shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
        <BarChart className="w-5 h-5" />
        Análise Financeira
      </Button>

      <Button onClick={() => setExtratosModalOpen(true)} variant="outline" className="flex items-center gap-2 border-emerald-800/20 text-emerald-900 hover:bg-emerald-50 font-semibold px-6 py-4 rounded-sm hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
        <FileText className="w-4 h-4" />
        Ver Extratos Cadastrados
      </Button>
    </div>

    {/* Gráficos */}
    <ChartsSection movimentacoes={movimentacoes} />

    {/* Tabela Resumo Financeiro */}
    <FinancialSummaryTable />

    {/* Modais */}
    <ExtratosModal open={extratosModalOpen} onOpenChange={setExtratosModalOpen} />

    <AnaliseFinanceiraModal open={analiseModalOpen} onOpenChange={setAnaliseModalOpen} />
  </div>;
};
export default Dashboard;