
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Pencil, Trash2 } from 'lucide-react';
import { MovimentacaoFinanceira, FiltroMovimentacao } from '@/types/financial';

interface MovimentacoesTableProps {
  movimentacoes: MovimentacaoFinanceira[];
  onEdit?: (index: number, movimentacao: MovimentacaoFinanceira) => void;
  onDelete?: (index: number) => void;
}

const MovimentacoesTable: React.FC<MovimentacoesTableProps> = ({ 
  movimentacoes, 
  onEdit, 
  onDelete 
}) => {
  const [filtros, setFiltros] = useState<FiltroMovimentacao>({});
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'realizado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const movimentacoesFiltradas = React.useMemo(() => {
    return movimentacoes.filter(mov => {
      // Filtro por texto
      if (searchTerm && !mov.DescricaoMovimentacao.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtros específicos
      if (filtros.mes && mov.MesRef !== filtros.mes) return false;
      if (filtros.categoria && mov.IdBaseCategoria !== filtros.categoria) return false;
      if (filtros.status && mov.Status !== filtros.status) return false;
      
      return true;
    });
  }, [movimentacoes, searchTerm, filtros]);

  const mesesUnicos = [...new Set(movimentacoes.map(m => m.MesRef))].filter(Boolean);
  const categoriasUnicas = [...new Set(movimentacoes.map(m => m.IdBaseCategoria))].filter(Boolean);
  const statusUnicos = [...new Set(movimentacoes.map(m => m.Status))].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Movimentações Financeiras ({movimentacoes.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filtros.mes || 'all'} onValueChange={(value) => 
            setFiltros(prev => ({ ...prev, mes: value === 'all' ? undefined : value }))
          }>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {mesesUnicos.map(mes => (
                <SelectItem key={mes} value={mes}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                {(onEdit || onDelete) && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoesFiltradas.length > 0 ? (
                movimentacoesFiltradas.map((mov, index) => (
                  <TableRow key={mov.iD || index}>
                    <TableCell className="font-medium">
                      {formatDate(mov.DataMovimentacao)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {mov.DescricaoMovimentacao}
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      mov.ValorMov > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(mov.ValorMov)}
                    </TableCell>
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <div className="flex gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(index, mov)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {movimentacoes.length === 0 
                      ? "Nenhuma movimentação encontrada" 
                      : "Nenhuma movimentação encontrada com os filtros aplicados"
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovimentacoesTable;
