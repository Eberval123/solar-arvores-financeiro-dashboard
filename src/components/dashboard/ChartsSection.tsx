
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { MovimentacaoFinanceira } from '@/types/financial';

interface ChartsSectionProps {
  movimentacoes: MovimentacaoFinanceira[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ movimentacoes }) => {
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('mes_atual');
  
  // Cores por categoria
  const coresPorCategoria = {
    'Administrativa': '#3B82F6',
    'Manutenção': '#EF4444', 
    'Manutenção Ordinária': '#F97316',
    'Limpeza': '#10B981',
    'Segurança': '#8B5CF6',
    'Receita': '#06B6D4',
    'Receita Tx. Condomínio': '#059669',
    'Receita Financeira': '#0D9488',
    'Taxa Gás': '#F59E0B',
    'Prestador de Serviço': '#EC4899',
    'Salário': '#6366F1',
    'Encargos': '#84CC16',
    'Juros/Multa': '#DC2626',
    'Concessionárias': '#9333EA',
    'Outros': '#6B7280'
  };

  const getCorCategoria = (categoria: string) => {
    return coresPorCategoria[categoria as keyof typeof coresPorCategoria] || '#6B7280';
  };

  const abreviarCategoria = (categoria: string) => {
    const abreviacoes: { [key: string]: string } = {
      'Receita Tx. Condomínio': 'Tx. Cond.',
      'Receita Financeira': 'Fin.',
      'Taxa Gás': 'Gás',
      'Prestador de Serviço': 'Prest. Serv.',
      'Administrativa': 'Admin.',
      'Manutenção': 'Manut.',
      'Manutenção Ordinária': 'Manut. Ord.',
      'Segurança': 'Seg.',
      'Concessionárias': 'Concess.',
      'Juros/Multa': 'Juros'
    };
    return abreviacoes[categoria] || categoria;
  };
  
  // Função para extrair mês/ano da data no formato "Nov/24"
  const extractMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  };

  // Função para converter "Nov/24" em timestamp para ordenação
  const parseMonthYearToTimestamp = (monthYear: string): number => {
    const [month, year] = monthYear.split('/');
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthIndex = monthNames.indexOf(month);
    const fullYear = 2000 + parseInt(year);
    return new Date(fullYear, monthIndex, 1).getTime();
  };

  // Função para ordenar meses cronologicamente baseado no timestamp
  const sortMonthsChronologically = (months: string[]): string[] => {
    return months.sort((a, b) => parseMonthYearToTimestamp(a) - parseMonthYearToTimestamp(b));
  };

  // Dados para gráfico de linha (evolução mensal)
  const evolucaoMensal = React.useMemo(() => {
    const mesesData = movimentacoes.reduce((acc, mov) => {
      const mes = extractMonthYear(mov.DataMovimentacao);
      if (!acc[mes]) {
        acc[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
      }
      
      if (mov.ValorMov > 0) {
        acc[mes].receitas += mov.ValorMov;
      } else {
        acc[mes].despesas += Math.abs(mov.ValorMov);
      }
      
      acc[mes].saldo = acc[mes].receitas - acc[mes].despesas;
      return acc;
    }, {} as Record<string, any>);
    
    // Ordenar os meses cronologicamente
    const mesesOrdenados = sortMonthsChronologically(Object.keys(mesesData));
    return mesesOrdenados.map(mes => mesesData[mes]);
  }, [movimentacoes]);

  // Filtrar dados baseado no período selecionado
  const evolucaoMensalFiltrada = React.useMemo(() => {
    if (!evolucaoMensal.length) return [];
    
    // Encontrar o último mês disponível nos dados (mais recente)
    const ultimoMesTimestamp = Math.max(...evolucaoMensal.map(item => parseMonthYearToTimestamp(item.mes)));
    const dataUltimoMes = new Date(ultimoMesTimestamp);
    const mesUltimo = dataUltimoMes.getMonth();
    const anoUltimo = dataUltimoMes.getFullYear();
    
    return evolucaoMensal.filter(item => {
      const timestamp = parseMonthYearToTimestamp(item.mes);
      const dataItem = new Date(timestamp);
      const mesItem = dataItem.getMonth();
      const anoItem = dataItem.getFullYear();
      
      switch (periodoFiltro) {
        case 'mes_atual':
          // Mostrar apenas o último mês cadastrado
          return mesItem === mesUltimo && anoItem === anoUltimo;
        
        case 'trimestre': {
          // Últimos 3 meses a partir do último mês cadastrado
          const tresMesesAtras = new Date(anoUltimo, mesUltimo - 2, 1);
          return dataItem >= tresMesesAtras && dataItem <= dataUltimoMes;
        }
        
        case 'semestre': {
          // Últimos 6 meses a partir do último mês cadastrado
          const seisMesesAtras = new Date(anoUltimo, mesUltimo - 5, 1);
          return dataItem >= seisMesesAtras && dataItem <= dataUltimoMes;
        }
        
        case 'ano': {
          // Últimos 12 meses a partir do último mês cadastrado
          const dozeMesesAtras = new Date(anoUltimo, mesUltimo - 11, 1);
          return dataItem >= dozeMesesAtras && dataItem <= dataUltimoMes;
        }
        
        default:
          return true;
      }
    });
  }, [evolucaoMensal, periodoFiltro]);

  // Dados para gráfico de receitas por categoria com percentuais
  const receitasPorCategoria = React.useMemo(() => {
    const categoriasMap = new Map();
    let totalReceitas = 0;
    
    movimentacoes
      .filter(mov => mov.ValorMov > 0) // Apenas receitas (valores positivos)
      .forEach(mov => {
        const categoria = mov.IdBaseCategoria;
        if (!categoriasMap.has(categoria)) {
          categoriasMap.set(categoria, 0);
        }
        const valor = mov.ValorMov;
        categoriasMap.set(categoria, categoriasMap.get(categoria) + valor);
        totalReceitas += valor;
      });
    
    return Array.from(categoriasMap.entries())
      .map(([categoria, valor]) => ({ 
        categoria, 
        valor, 
        percentual: totalReceitas > 0 ? (valor / totalReceitas * 100) : 0,
        fill: getCorCategoria(categoria) 
      }))
      .sort((a, b) => b.valor - a.valor); // Ordenar por valor decrescente
  }, [movimentacoes]);

  // Dados para gráfico de despesas por categoria com percentuais
  const despesasPorCategoria = React.useMemo(() => {
    const categoriasMap = new Map();
    let totalDespesas = 0;
    
    movimentacoes
      .filter(mov => mov.ValorMov < 0) // Apenas despesas (valores negativos)
      .forEach(mov => {
        const categoria = mov.IdBaseCategoria;
        if (!categoriasMap.has(categoria)) {
          categoriasMap.set(categoria, 0);
        }
        const valor = Math.abs(mov.ValorMov);
        categoriasMap.set(categoria, categoriasMap.get(categoria) + valor);
        totalDespesas += valor;
      });
    
    return Array.from(categoriasMap.entries())
      .map(([categoria, valor]) => ({ 
        categoria, 
        valor, 
        percentual: totalDespesas > 0 ? (valor / totalDespesas * 100) : 0,
        fill: getCorCategoria(categoria) 
      }))
      .sort((a, b) => b.valor - a.valor); // Ordenar por valor decrescente
  }, [movimentacoes]);

  // Dados para gráfico de evolução EMBASA
  const evolucaoEmbasa = React.useMemo(() => {
    const movimentacoesEmbasa = movimentacoes.filter(mov => 
      mov.IdBaseMovimentacao.toLowerCase().includes('embasa') && mov.ValorMov < 0
    );
    
    const mesesData = movimentacoesEmbasa.reduce((acc, mov) => {
      const mes = extractMonthYear(mov.DataMovimentacao);
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += Math.abs(mov.ValorMov);
      return acc;
    }, {} as Record<string, number>);
    
    // Ordenar os meses cronologicamente e calcular variação percentual
    const mesesOrdenados = sortMonthsChronologically(Object.keys(mesesData));
    
    return mesesOrdenados.map((mes, index) => {
      const valor = mesesData[mes];
      let variacao = undefined;
      
      if (index > 0) {
        const valorAnterior = mesesData[mesesOrdenados[index - 1]];
        if (valorAnterior > 0) {
          variacao = ((valor - valorAnterior) / valorAnterior) * 100;
        }
      }
      
      return {
        mes,
        valor,
        variacao
      };
    });
  }, [movimentacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatAxisCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Receitas vs Despesas */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Receitas vs Despesas
          </CardTitle>
          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-[180px] bg-white z-50">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="mes_atual">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="semestre">Semestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolucaoMensalFiltrada}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      {/* Gráfico de Receitas por Categoria */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Receitas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={receitasPorCategoria} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={formatAxisCurrency}
              />
               <YAxis 
                 type="category" 
                 dataKey="categoria" 
                 width={100}
                 fontSize={11}
                 interval={0}
                 tickFormatter={abreviarCategoria}
               />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  formatCurrency(value), 
                  `${props.payload.percentual.toFixed(1)}% das receitas`
                ]}
                labelFormatter={(label) => `Categoria: ${label}`}
              />
              <Bar dataKey="valor">
                {receitasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Despesas por Categoria */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={despesasPorCategoria} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={formatAxisCurrency}
              />
               <YAxis 
                 type="category" 
                 dataKey="categoria" 
                 width={100}
                 fontSize={11}
                 interval={0}
                 tickFormatter={abreviarCategoria}
               />
               <Tooltip 
                 formatter={(value: number, name: string, props: any) => [
                   formatCurrency(value), 
                   `${props.payload.percentual.toFixed(1)}% das despesas`
                 ]}
                 labelFormatter={(label) => `Categoria: ${label}`}
               />
              <Bar dataKey="valor">
                {despesasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução EMBASA */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Evolução das Despesas EMBASA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoEmbasa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  formatCurrency(value),
                  props.payload.variacao !== undefined 
                    ? `Variação: ${props.payload.variacao > 0 ? '+' : ''}${props.payload.variacao.toFixed(1)}%`
                    : 'Primeiro mês'
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#DC2626" 
                strokeWidth={3}
                name="Despesa EMBASA"
                dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default ChartsSection;
