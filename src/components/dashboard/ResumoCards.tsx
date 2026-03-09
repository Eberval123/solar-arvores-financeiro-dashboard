
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { ResumoFinanceiro } from '@/types/financial';

interface ResumoCardsProps {
  resumo: ResumoFinanceiro;
}

const ResumoCards: React.FC<ResumoCardsProps> = ({ resumo }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Saldo Anterior',
      value: resumo.saldoAnterior,
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Total Receitas',
      value: resumo.totalReceitas,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Despesas',
      value: resumo.totalDespesas,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Fundo Reserva',
      value: resumo.fundoReserva,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Fundo Reforma',
      value: resumo.fundoReforma,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Saldo Atual',
      value: resumo.saldoAtual,
      icon: DollarSign,
      color: resumo.saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: resumo.saldoAtual >= 0 ? 'bg-blue-50' : 'bg-red-50',
      borderColor: resumo.saldoAtual >= 0 ? 'border-blue-200' : 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.borderColor} ${card.bgColor} border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[120px] rounded-sm`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-gray-700 leading-tight">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color} flex-shrink-0`} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-lg font-bold ${card.color} leading-tight`}>
              {formatCurrency(card.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResumoCards;
