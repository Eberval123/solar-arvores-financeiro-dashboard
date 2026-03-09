
export interface MovimentacaoFinanceira {
  iD: string;
  IdBaseMovimentacao: string;
  IdBaseCategoria: string;
  DescricaoMovimentacao: string;
  DataMovimentacao: string;
  ValorMov: number;
  Status: string;
  MesRef: string;
}

export enum StatusMovimentacao {
  REALIZADO = "Realizado",
  PENDENTE = "Pendente",
  CANCELADO = "Cancelado"
}

export enum CategoriaBase {
  ADMINISTRATIVA = "Administrativa",
  MANUTENCAO = "Manutenção",
  LIMPEZA = "Limpeza",
  SEGURANCA = "Segurança",
  RECEITA = "Receita",
  OUTROS = "Outros"
}

export interface FiltroMovimentacao {
  mes?: string;
  categoria?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface ResumoFinanceiro {
  saldoAnterior: number;
  totalReceitas: number;
  totalDespesas: number;
  fundoReserva: number;
  fundoReforma: number;
  saldoAtual: number;
  movimentacoesPorCategoria: Array<{
    categoria: string;
    valor: number;
    count: number;
  }>;
}
