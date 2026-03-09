import React, { useState } from 'react';
import MovimentacoesTable from '@/components/dashboard/MovimentacoesTable';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAplicacoesFinanceiras } from '@/hooks/useAplicacoesFinanceiras';
import { useDuvidas } from '@/hooks/useDuvidas';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, BarChart3, TrendingUp, MessageSquare, Send, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const extratoFormSchema = z.object({
  mes: z.string().min(1, 'Selecione o mês'),
  ano: z.string().min(1, 'Digite o ano'),
  arquivo: z.instanceof(File).refine((file) => file.type === 'application/pdf', {
    message: 'Apenas arquivos PDF são permitidos',
  }),
});

const analiseFormSchema = z.object({
  periodo: z.string().min(1, 'Informe o período analisado'),
  analise: z.string().min(10, 'A análise deve ter pelo menos 10 caracteres'),
});

const aplicacaoFormSchema = z.object({
  dataSaldo: z.string().min(1, 'Selecione a data do saldo'),
  nomeAplicacao: z.string().min(1, 'Informe o nome da aplicação'),
  valorAplicacao: z.string().min(1, 'Informe o valor da aplicação').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Valor deve ser um número válido e positivo',
  }),
  valorRendimento: z.string().min(1, 'Informe o valor do rendimento').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Valor deve ser um número válido e positivo',
  }),
});

const prestacaoContasFormSchema = z.object({
  mes: z.string().min(1, 'Selecione o mês'),
  ano: z.string().min(1, 'Digite o ano'),
  arquivo: z.instanceof(File).refine((file) => file.type === 'application/pdf', {
    message: 'Apenas arquivos PDF são permitidos',
  }),
});

type ExtratoFormData = z.infer<typeof extratoFormSchema>;
type AnaliseFormData = z.infer<typeof analiseFormSchema>;
type AplicacaoFormData = z.infer<typeof aplicacaoFormSchema>;
type PrestacaoContasFormData = z.infer<typeof prestacaoContasFormSchema>;

const DataManagement = () => {
  const isMobile = useIsMobile();
  const { movimentacoes } = useFinancialData();
  const { valorTotalGeral, valorTotalAplicacoes, valorTotalRendimentos, aplicacoes, refetch: refetchAplicacoes } = useAplicacoesFinanceiras();
  const { duvidas, loading: loadingDuvidas, responderDuvida } = useDuvidas();
  const { toast } = useToast();
  const [isExtratoDialogOpen, setIsExtratoDialogOpen] = useState(false);
  const [isAnaliseDialogOpen, setIsAnaliseDialogOpen] = useState(false);
  const [isAplicacaoDialogOpen, setIsAplicacaoDialogOpen] = useState(false);
  const [isPrestacaoContasDialogOpen, setIsPrestacaoContasDialogOpen] = useState(false);
  const [respostaDialogOpen, setRespostaDialogOpen] = useState(false);
  const [duvidaSelecionada, setDuvidaSelecionada] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [showMovimentacoes, setShowMovimentacoes] = useState(false);
  
  const extratoForm = useForm<ExtratoFormData>({
    resolver: zodResolver(extratoFormSchema),
    defaultValues: {
      mes: '',
      ano: new Date().getFullYear().toString(),
    },
  });

  const analiseForm = useForm<AnaliseFormData>({
    resolver: zodResolver(analiseFormSchema),
    defaultValues: {
      periodo: '',
      analise: '',
    },
  });

  const aplicacaoForm = useForm<AplicacaoFormData>({
    resolver: zodResolver(aplicacaoFormSchema),
    defaultValues: {
      dataSaldo: '',
      nomeAplicacao: '',
      valorAplicacao: '',
      valorRendimento: '',
    },
  });

  const prestacaoContasForm = useForm<PrestacaoContasFormData>({
    resolver: zodResolver(prestacaoContasFormSchema),
    defaultValues: {
      mes: '',
      ano: new Date().getFullYear().toString(),
    },
  });

  const handleExtratoSubmit = async (data: ExtratoFormData) => {
    try {
      const file = data.arquivo;
      const fileName = `${data.ano}-${data.mes.padStart(2, '0')}-${file.name}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('extratos-bancarios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Salvar dados na tabela extratos_bancarios
      const { error: dbError } = await supabase
        .from('extratos_bancarios')
        .insert({
          nome_arquivo: file.name,
          url_arquivo: uploadData.path,
          mes_referencia: parseInt(data.mes),
          ano_referencia: parseInt(data.ano),
          tamanho_arquivo: file.size,
          tipo_arquivo: file.type
        });

      if (dbError) throw dbError;
      
      toast({
        title: "Extrato anexado com sucesso",
        description: `Extrato de ${data.mes}/${data.ano} foi anexado.`,
      });
      
      setIsExtratoDialogOpen(false);
      extratoForm.reset();
    } catch (error: any) {
      console.error('Erro ao anexar extrato:', error);
      toast({
        title: "Erro ao anexar extrato",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAnaliseSubmit = async (data: AnaliseFormData) => {
    try {
      const { error } = await supabase
        .from('analises_financeiras')
        .insert({
          periodo: data.periodo,
          conteudo: data.analise,
          data_criacao: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast({
        title: "Análise salva com sucesso",
        description: `Análise do período ${data.periodo} foi salva.`,
      });
      
      setIsAnaliseDialogOpen(false);
      analiseForm.reset();
    } catch (error: any) {
      console.error('Erro ao salvar análise:', error);
      toast({
        title: "Erro ao salvar análise",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAplicacaoSubmit = async (data: AplicacaoFormData) => {
    try {
      const { error } = await supabase
        .from('aplicacoes_financeiras')
        .insert({
          data_saldo: data.dataSaldo,
          nome_aplicacao: data.nomeAplicacao,
          valor_aplicacao: parseFloat(data.valorAplicacao),
          valor_rendimento: parseFloat(data.valorRendimento),
        });

      if (error) throw error;
      
      toast({
        title: "Aplicação financeira salva com sucesso",
        description: `Aplicação ${data.nomeAplicacao} foi registrada.`,
      });
      
      setIsAplicacaoDialogOpen(false);
      aplicacaoForm.reset();
      refetchAplicacoes(); // Recarregar dados após inserção
    } catch (error: any) {
      console.error('Erro ao salvar aplicação financeira:', error);
      toast({
        title: "Erro ao salvar aplicação",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePrestacaoContasSubmit = async (data: PrestacaoContasFormData) => {
    try {
      const file = data.arquivo;
      const fileName = `prestacao-contas-${data.ano}-${data.mes.padStart(2, '0')}-${file.name}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('extratos-bancarios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Salvar dados na tabela prestacao_contas
      const { error: dbError } = await supabase
        .from('prestacao_contas')
        .insert({
          nome_arquivo: file.name,
          url_arquivo: uploadData.path,
          mes_referencia: parseInt(data.mes),
          ano_referencia: parseInt(data.ano),
          tamanho_arquivo: file.size,
          tipo_arquivo: file.type
        });

      if (dbError) throw dbError;
      
      toast({
        title: "Prestação de contas anexada com sucesso",
        description: `Prestação de contas de ${data.mes}/${data.ano} foi anexada.`,
      });
      
      setIsPrestacaoContasDialogOpen(false);
      prestacaoContasForm.reset();
    } catch (error: any) {
      console.error('Erro ao anexar prestação de contas:', error);
      toast({
        title: "Erro ao anexar prestação de contas",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleResponderDuvida = async () => {
    if (!duvidaSelecionada || !respostaTexto.trim()) return;
    
    await responderDuvida(duvidaSelecionada, respostaTexto);
    setRespostaDialogOpen(false);
    setDuvidaSelecionada(null);
    setRespostaTexto('');
  };

  const abrirDialogResposta = (duvidaId: string) => {
    setDuvidaSelecionada(duvidaId);
    setRespostaDialogOpen(true);
  };

  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className={`container mx-auto ${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className={isMobile ? 'mb-6' : 'mb-8'}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>Gerenciamento de Dados</h1>
        <p className={`text-muted-foreground ${isMobile ? 'mt-1 text-sm' : 'mt-2'}`}>
          Painel administrativo para gerenciar dados financeiros e interações com moradores
        </p>
      </div>

      {/* Grid principal responsivo */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Gerenciar Dúvidas dos Moradores */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader className={isMobile ? 'pb-3' : 'pb-4'}>
              <CardTitle className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'} ${isMobile ? 'text-base' : 'text-lg'}`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                  Dúvidas dos Moradores
                </div>
                {duvidas.length > 0 && (
                  <Badge variant="secondary" className={isMobile ? 'self-start' : 'ml-2'}>
                    {duvidas.filter(d => d.status !== 'respondida').length} pendentes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingDuvidas ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando dúvidas...</p>
                  </div>
                ) : duvidas.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhuma dúvida encontrada.</p>
                  </div>
                ) : (
                  duvidas.map((duvida) => (
                    <div key={duvida.id} className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'} space-y-3 bg-background/50`}>
                      <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between'}`}>
                        <div className="flex-1">
                          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Badge variant={duvida.status === 'respondida' ? 'default' : 'secondary'}>
                                {duvida.status === 'respondida' ? 'Respondida' : 'Pendente'}
                              </Badge>
                              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                                {new Date(duvida.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-muted-foreground`}>
                              <strong className="text-foreground">{duvida.morador_nome}</strong> - Apt. {duvida.apartamento}
                              {duvida.bloco && ` - Bloco ${duvida.bloco}`}
                            </p>
                          </div>
                          
                          <div className="mb-3">
                            <p className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>Pergunta:</p>
                            <p className={`${isMobile ? 'text-sm' : 'text-sm'} mt-1 bg-muted/50 ${isMobile ? 'p-2' : 'p-3'} rounded-md`}>{duvida.pergunta}</p>
                          </div>
                          
                          {duvida.resposta && (
                            <div>
                              <p className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>Resposta:</p>
                              <p className={`${isMobile ? 'text-sm' : 'text-sm'} mt-1 bg-primary/5 ${isMobile ? 'p-2' : 'p-3'} rounded-md border-l-2 border-primary`}>
                                {duvida.resposta}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {duvida.status !== 'respondida' && (
                          <Button 
                            size={isMobile ? "default" : "sm"}  
                            onClick={() => abrirDialogResposta(duvida.id)}
                            className={`${isMobile ? 'w-full mt-2' : 'ml-4 shrink-0'}`}
                          >
                            <Send className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-4 h-4 mr-1'}`} />
                            Responder
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Dialog para responder dúvida */}
              <Dialog open={respostaDialogOpen} onOpenChange={setRespostaDialogOpen}>
                <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw]" : "sm:max-w-md"}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? 'text-lg' : ''}>Responder Dúvida</DialogTitle>
                    <DialogDescription className={isMobile ? 'text-sm' : ''}>
                      Digite sua resposta para a dúvida do morador.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Digite sua resposta aqui..."
                      value={respostaTexto}
                      onChange={(e) => setRespostaTexto(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleResponderDuvida}
                        className="flex-1"
                        disabled={!respostaTexto.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Resposta
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setRespostaDialogOpen(false);
                          setRespostaTexto('');
                          setDuvidaSelecionada(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Análise Financeira Personalizada */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Análise Financeira Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isAnaliseDialogOpen} onOpenChange={setIsAnaliseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Criar Nova Análise
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Análise Financeira</DialogTitle>
                    <DialogDescription>
                      Insira uma análise financeira personalizada com período e conteúdo detalhado.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...analiseForm}>
                    <form onSubmit={analiseForm.handleSubmit(handleAnaliseSubmit)} className="space-y-4">
                      <FormField
                        control={analiseForm.control}
                        name="periodo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período Analisado</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Novembro 2024 - Junho 2025" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={analiseForm.control}
                        name="analise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo da Análise</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Insira aqui sua análise financeira detalhada..."
                                className="min-h-[300px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Salvar Análise
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAnaliseDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Prestação de Contas */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Prestação de Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isPrestacaoContasDialogOpen} onOpenChange={setIsPrestacaoContasDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Inserir Prestação de Contas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Inserir Prestação de Contas</DialogTitle>
                    <DialogDescription>
                      Selecione o mês, ano e faça o upload da prestação de contas em PDF.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...prestacaoContasForm}>
                    <form onSubmit={prestacaoContasForm.handleSubmit(handlePrestacaoContasSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={prestacaoContasForm.control}
                          name="mes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mês</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {meses.map((mes) => (
                                    <SelectItem key={mes.value} value={mes.value}>
                                      {mes.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={prestacaoContasForm.control}
                          name="ano"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ano</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="2024" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={prestacaoContasForm.control}
                        name="arquivo"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Arquivo PDF</FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                type="file"
                                accept=".pdf"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  onChange(file);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Inserir Prestação de Contas
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPrestacaoContasDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Aplicações Financeiras */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Aplicações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    {aplicacoes.length > 0 && (
                      <Badge variant="secondary">
                        {aplicacoes.length} aplicações
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(valorTotalGeral)}
                  </p>
                  
                  {aplicacoes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        Aplicação: {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(valorTotalAplicacoes)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Rendimento: {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(valorTotalRendimentos)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Dialog open={isAplicacaoDialogOpen} onOpenChange={setIsAplicacaoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Registrar Aplicação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Registrar Aplicação Financeira</DialogTitle>
                      <DialogDescription>
                        Informe os dados da aplicação financeira incluindo saldo e rendimento.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...aplicacaoForm}>
                      <form onSubmit={aplicacaoForm.handleSubmit(handleAplicacaoSubmit)} className="space-y-4">
                        <FormField
                          control={aplicacaoForm.control}
                          name="dataSaldo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data do Saldo</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={aplicacaoForm.control}
                          name="nomeAplicacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Aplicação</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: CDB Banco ABC" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={aplicacaoForm.control}
                            name="valorAplicacao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor da Aplicação</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0,00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={aplicacaoForm.control}
                            name="valorRendimento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor do Rendimento</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0,00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">
                            Salvar Aplicação
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAplicacaoDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Anexar Extratos */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-primary" />
                Anexar Extratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isExtratoDialogOpen} onOpenChange={setIsExtratoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Anexar Extrato Bancário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Anexar Extrato Bancário</DialogTitle>
                    <DialogDescription>
                      Selecione o mês, ano e o arquivo PDF do extrato bancário.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...extratoForm}>
                    <form onSubmit={extratoForm.handleSubmit(handleExtratoSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={extratoForm.control}
                          name="mes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mês</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {meses.map((mes) => (
                                    <SelectItem key={mes.value} value={mes.value}>
                                      {mes.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={extratoForm.control}
                          name="ano"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ano</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="2024" 
                                  type="number" 
                                  min="2020" 
                                  max="2030" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={extratoForm.control}
                        name="arquivo"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Arquivo PDF</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onChange(file);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Anexar Extrato
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsExtratoDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Movimentações Financeiras - Seção Colapsável */}
      <Card className="shadow-sm border-0 bg-card/50">
        <CardHeader className={isMobile ? 'pb-3' : 'pb-4'}>
          <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
            <CardTitle className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'} ${isMobile ? 'text-base' : 'text-lg'}`}>
              <div className="flex items-center gap-2">
                <BarChart3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                Relatório de Movimentações Financeiras
              </div>
              {movimentacoes.length > 0 && (
                <Badge variant="secondary" className={isMobile ? 'self-start' : 'ml-2'}>
                  {movimentacoes.length} registros
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={() => setShowMovimentacoes(!showMovimentacoes)}
              className={`${isMobile ? 'w-full' : 'shrink-0'}`}
            >
              {showMovimentacoes ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showMovimentacoes && (
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <MovimentacoesTable movimentacoes={movimentacoes} />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DataManagement;