import React, { useMemo } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const FinancialSummaryTable = () => {
  const { movimentacoes } = useFinancialData();

  const tableData = useMemo(() => {
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

    // Detectar meses dinamicamente dos dados
    const detectMonthsFromData = (): string[] => {
      const monthsSet = new Set<string>();
      movimentacoes.forEach(m => {
        if (m.DataMovimentacao) {
          const monthYear = extractMonthYear(m.DataMovimentacao);
          monthsSet.add(monthYear);
        }
      });

      // Ordenar meses cronologicamente
      return Array.from(monthsSet).sort((a, b) =>
        parseMonthYearToTimestamp(a) - parseMonthYearToTimestamp(b)
      );
    };

    const targetMonths = detectMonthsFromData();

    // Criar display names em lowercase baseado nos meses reais
    const monthDisplayNames: Record<string, string> = {};
    targetMonths.forEach(month => {
      monthDisplayNames[month] = month.toLowerCase();
    });

    // Agrupar movimentações por mês e categoria
    const monthlyData = targetMonths.reduce((acc, month) => {
      acc[month] = {};
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const categorias = new Set<string>();

    // Função auxiliar para extrair mês/ano (repetida aqui por escopo)
    const extractMonthYearForProcessing = (dateString: string): string => {
      const date = new Date(dateString);
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return `${month}/${year}`;
    };

    // Processar movimentações usando DataMovimentacao
    movimentacoes.forEach(mov => {
      const monthKey = extractMonthYearForProcessing(mov.DataMovimentacao);
      if (targetMonths.includes(monthKey)) {
        const categoria = mov.IdBaseCategoria;
        categorias.add(categoria);

        if (!monthlyData[monthKey][categoria]) {
          monthlyData[monthKey][categoria] = 0;
        }
        monthlyData[monthKey][categoria] += mov.ValorMov;
      }
    });

    // Separar categorias por tipo (receitas vs despesas)
    const receitaCategorias = new Set<string>();
    const despesaCategorias = new Set<string>();

    movimentacoes.forEach(mov => {
      if (mov.ValorMov > 0) {
        receitaCategorias.add(mov.IdBaseCategoria);
      } else {
        despesaCategorias.add(mov.IdBaseCategoria);
      }
    });

    // Calcular totais por categoria
    const categoriaTotals = Array.from(categorias).reduce((acc, categoria) => {
      acc[categoria] = targetMonths.reduce((sum, month) => {
        return sum + (monthlyData[month][categoria] || 0);
      }, 0);
      return acc;
    }, {} as Record<string, number>);

    // Calcular totais gerais
    const totals = {
      receitas: Array.from(receitaCategorias).reduce((sum, cat) => sum + Math.max(0, categoriaTotals[cat] || 0), 0),
      despesas: Array.from(despesaCategorias).reduce((sum, cat) => sum + Math.abs(Math.min(0, categoriaTotals[cat] || 0)), 0)
    };

    return {
      monthlyData,
      totals,
      targetMonths,
      monthDisplayNames,
      receitaCategorias: Array.from(receitaCategorias).sort(),
      despesaCategorias: Array.from(despesaCategorias).sort(),
      categoriaTotals
    };
  }, [movimentacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular período dinamicamente para o título
  const getPeriodoTitulo = () => {
    if (targetMonths.length === 0) return 'Sem Dados';

    const formatMonthFull = (monthYear: string): string => {
      const [month, year] = monthYear.split('/');
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthIndex = shortMonths.indexOf(month);
      const fullYear = 2000 + parseInt(year);
      return `${monthNames[monthIndex]} ${fullYear}`;
    };

    const primeiroMes = formatMonthFull(targetMonths[0]);
    const ultimoMes = formatMonthFull(targetMonths[targetMonths.length - 1]);

    if (primeiroMes === ultimoMes) {
      return primeiroMes;
    }

    return `${primeiroMes} a ${ultimoMes}`;
  };

  const { monthlyData, totals, targetMonths, monthDisplayNames, receitaCategorias, despesaCategorias, categoriaTotals } = tableData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Resumo Financeiro - {getPeriodoTitulo()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="md:hidden flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mb-2 animate-pulse">
            <span>Deslize para ver mais</span>
            <div className="w-8 h-px bg-muted-foreground/30" />
          </div>
          <div className="overflow-x-auto pb-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Categoria</TableHead>
                  {targetMonths.map(month => (
                    <TableHead key={month} className="text-right font-semibold text-foreground">
                      {monthDisplayNames[month]}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-semibold text-foreground bg-accent/20">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* SEÇÃO DE RECEITAS */}
                <TableRow className="bg-green-100 hover:bg-green-200">
                  <TableCell colSpan={10} className="font-bold text-green-800 text-center py-3">
                    RECEITAS
                  </TableCell>
                </TableRow>

                {/* Categorias de Receitas */}
                {receitaCategorias.map(categoria => (
                  <TableRow key={categoria} className="bg-green-50 hover:bg-green-100 border-l-4 border-green-500">
                    <TableCell className="font-medium text-green-800 pl-4 sm:pl-6 text-xs sm:text-sm">{categoria}</TableCell>
                    {targetMonths.map(month => {
                      const valor = monthlyData[month][categoria] || 0;
                      return (
                        <TableCell key={month} className="text-right text-green-700 text-xs sm:text-sm px-2 sm:px-4">
                          {valor > 0 ? formatCurrency(valor) : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-semibold text-green-800 bg-green-100">
                      {categoriaTotals[categoria] > 0 ? formatCurrency(categoriaTotals[categoria]) : '-'}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total de Receitas */}
                <TableRow className="bg-green-200 hover:bg-green-300 border-l-4 border-green-600">
                  <TableCell className="font-bold text-green-900">Total Receitas</TableCell>
                  {targetMonths.map(month => {
                    const totalMes = receitaCategorias.reduce((sum, cat) => {
                      const valor = monthlyData[month][cat] || 0;
                      return sum + (valor > 0 ? valor : 0);
                    }, 0);
                    return (
                      <TableCell key={month} className="text-right font-bold text-green-900">
                        {totalMes > 0 ? formatCurrency(totalMes) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold text-green-900 bg-green-300">
                    {formatCurrency(totals.receitas)}
                  </TableCell>
                </TableRow>

                {/* Espaço visual */}
                <TableRow>
                  <TableCell colSpan={10} className="h-4 border-0"></TableCell>
                </TableRow>

                {/* SEÇÃO DE DESPESAS */}
                <TableRow className="bg-red-100 hover:bg-red-200">
                  <TableCell colSpan={10} className="font-bold text-red-800 text-center py-3">
                    DESPESAS
                  </TableCell>
                </TableRow>

                {/* Categorias de Despesas */}
                {despesaCategorias.map(categoria => (
                  <TableRow key={categoria} className="bg-red-50 hover:bg-red-100 border-l-4 border-red-500">
                    <TableCell className="font-medium text-red-800 pl-4 sm:pl-6 text-xs sm:text-sm">{categoria}</TableCell>
                    {targetMonths.map(month => {
                      const valor = monthlyData[month][categoria] || 0;
                      return (
                        <TableCell key={month} className="text-right text-red-700 text-xs sm:text-sm px-2 sm:px-4">
                          {valor < 0 ? formatCurrency(Math.abs(valor)) : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-semibold text-red-800 bg-red-100">
                      {categoriaTotals[categoria] < 0 ? formatCurrency(Math.abs(categoriaTotals[categoria])) : '-'}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total de Despesas */}
                <TableRow className="bg-red-200 hover:bg-red-300 border-l-4 border-red-600">
                  <TableCell className="font-bold text-red-900">Total Despesas</TableCell>
                  {targetMonths.map(month => {
                    const totalMes = despesaCategorias.reduce((sum, cat) => {
                      const valor = monthlyData[month][cat] || 0;
                      return sum + (valor < 0 ? Math.abs(valor) : 0);
                    }, 0);
                    return (
                      <TableCell key={month} className="text-right font-bold text-red-900">
                        {totalMes > 0 ? formatCurrency(totalMes) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold text-red-900 bg-red-300">
                    {formatCurrency(totals.despesas)}
                  </TableCell>
                </TableRow>

                {/* Espaço visual */}
                <TableRow>
                  <TableCell colSpan={10} className="h-4 border-0"></TableCell>
                </TableRow>

                {/* RESULTADO FINAL */}
                <TableRow className={cn(
                  "hover:bg-muted/80 border-l-4",
                  totals.receitas - totals.despesas >= 0
                    ? "bg-blue-100 border-blue-600"
                    : "bg-yellow-100 border-yellow-600"
                )}>
                  <TableCell className="font-bold text-lg">RESULTADO</TableCell>
                  {targetMonths.map(month => {
                    const receitasMes = receitaCategorias.reduce((sum, cat) => {
                      const valor = monthlyData[month][cat] || 0;
                      return sum + (valor > 0 ? valor : 0);
                    }, 0);
                    const despesasMes = despesaCategorias.reduce((sum, cat) => {
                      const valor = monthlyData[month][cat] || 0;
                      return sum + (valor < 0 ? Math.abs(valor) : 0);
                    }, 0);
                    const resultado = receitasMes - despesasMes;
                    return (
                      <TableCell
                        key={month}
                        className={cn(
                          "text-right font-bold",
                          resultado >= 0 ? "text-blue-800" : "text-yellow-800"
                        )}
                      >
                        {resultado !== 0 ? formatCurrency(resultado) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className={cn(
                    "text-right font-bold text-xl",
                    totals.receitas - totals.despesas >= 0
                      ? "text-blue-900 bg-blue-200"
                      : "text-yellow-900 bg-yellow-200"
                  )}>
                    {formatCurrency(totals.receitas - totals.despesas)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryTable;