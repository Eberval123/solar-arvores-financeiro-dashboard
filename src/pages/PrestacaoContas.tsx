import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, Send, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCurrentMorador } from '@/hooks/useCurrentMorador';

interface PrestacaoContas {
  id: string;
  nome_arquivo: string;
  url_arquivo: string;
  mes_referencia: number;
  ano_referencia: number;
  tamanho_arquivo: number;
  created_at: string;
}

interface Duvida {
  id: string;
  pergunta: string;
  resposta?: string;
  morador_nome: string;
  apartamento: string;
  status: 'pendente' | 'respondida';
  created_at: string;
}

const PrestacaoContas = () => {
  const { user, canAccessPrestacaoContas, isLoading: authLoading } = useSupabaseAuth();
  const [prestacoes, setPrestacoes] = useState<PrestacaoContas[]>([]);
  const [filteredPrestacoes, setFilteredPrestacoes] = useState<PrestacaoContas[]>([]);
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<string>('');
  const [duvida, setDuvida] = useState('');
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { morador, isLoading: moradorLoading } = useCurrentMorador();
  const { toast } = useToast();

  // Verificação de acesso
  if (!authLoading && !canAccessPrestacaoContas) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar esta página. Apenas administradores e fiscais podem visualizar a prestação de contas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const meses = [
    { valor: '1', nome: 'Janeiro' },
    { valor: '2', nome: 'Fevereiro' },
    { valor: '3', nome: 'Março' },
    { valor: '4', nome: 'Abril' },
    { valor: '5', nome: 'Maio' },
    { valor: '6', nome: 'Junho' },
    { valor: '7', nome: 'Julho' },
    { valor: '8', nome: 'Agosto' },
    { valor: '9', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];

  const anos = Array.from({ length: 10 }, (_, i) => {
    const ano = new Date().getFullYear() - i;
    return { valor: ano.toString(), nome: ano.toString() };
  });

  useEffect(() => {
    loadPrestacoes();
    loadDuvidas();
  }, []);

  useEffect(() => {
    filterPrestacoes();
  }, [prestacoes, selectedMes, selectedAno]);

  const loadPrestacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('prestacao_contas' as any)
        .select('*')
        .order('ano_referencia', { ascending: false })
        .order('mes_referencia', { ascending: false });

      if (error) throw error;
      setPrestacoes((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar prestações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as prestações de contas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDuvidas = async () => {
    try {
      const { data, error } = await supabase
        .from('duvidas_sindico' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDuvidas((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar dúvidas:', error);
    }
  };

  const filterPrestacoes = () => {
    let filtered = prestacoes;

    if (selectedMes) {
      filtered = filtered.filter(prestacao => prestacao.mes_referencia.toString() === selectedMes);
    }

    if (selectedAno) {
      filtered = filtered.filter(prestacao => prestacao.ano_referencia.toString() === selectedAno);
    }

    setFilteredPrestacoes(filtered);
  };

  const formatMesAno = (mes: number, ano: number) => {
    const mesNome = meses.find(m => m.valor === mes.toString())?.nome || mes.toString();
    return `${mesNome} ${ano}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (prestacao: PrestacaoContas) => {
    try {
      const { data, error } = await supabase.storage
        .from('extratos-bancarios')
        .download(prestacao.url_arquivo);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = prestacao.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: `${prestacao.nome_arquivo} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleView = async (prestacao: PrestacaoContas) => {
    try {
      const { data, error } = await supabase.storage
        .from('extratos-bancarios')
        .createSignedUrl(prestacao.url_arquivo, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível visualizar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleEnviarDuvida = async () => {
    if (!duvida.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua dúvida.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('duvidas_sindico' as any)
        .insert({
          pergunta: duvida.trim(),
          morador_nome: morador?.nome || 'Morador',
          apartamento: morador?.apartamento || 'N/A',
          bloco: morador?.bloco || null,
          user_id: user?.id,
          status: 'pendente'
        } as any);

      if (error) throw error;

      setDuvida('');
      loadDuvidas();

      toast({
        title: "Dúvida enviada",
        description: "Sua dúvida foi enviada ao síndico com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar dúvida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua dúvida.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSelectedMes('');
    setSelectedAno('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Prestação de Contas</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mês
              </label>
              <Select value={selectedMes} onValueChange={setSelectedMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(mes => (
                    <SelectItem key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Ano
              </label>
              <Select value={selectedAno} onValueChange={setSelectedAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(ano => (
                    <SelectItem key={ano.valor} value={ano.valor}>
                      {ano.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!selectedMes && !selectedAno}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galeria de Prestações de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Prestações de Contas Disponíveis</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredPrestacoes.length} documento(s) encontrado(s)
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando prestações de contas...</p>
            </div>
          ) : filteredPrestacoes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedMes || selectedAno
                  ? "Nenhuma prestação de contas encontrada para os filtros selecionados."
                  : "Nenhuma prestação de contas disponível."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrestacoes.map((prestacao) => (
                <Card key={prestacao.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {formatMesAno(prestacao.mes_referencia, prestacao.ano_referencia)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(prestacao.tamanho_arquivo || 0)}
                        </p>
                      </div>
                      <Badge variant="secondary">PDF</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(prestacao)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(prestacao)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de Dúvidas */}
      <Card>
        <CardHeader>
          <CardTitle>Tire suas Dúvidas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Envie suas perguntas ao síndico sobre as prestações de contas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Dúvidas ao Síndico
            </label>
            <Textarea
              placeholder="Digite sua dúvida sobre a prestação de contas..."
              value={duvida}
              onChange={(e) => setDuvida(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleEnviarDuvida}
            disabled={isSubmitting || !duvida.trim()}
            className="w-full md:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar Dúvida'}
          </Button>

          {/* Lista de Dúvidas Anteriores */}
          {duvidas.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">Suas dúvidas anteriores</h4>
              <div className="space-y-3">
                {duvidas.slice(0, 3).map((duvida) => (
                  <div key={duvida.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={duvida.status === 'respondida' ? 'default' : 'secondary'}>
                        {duvida.status === 'respondida' ? 'Respondida' : 'Pendente'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(duvida.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{duvida.pergunta}</p>
                    {duvida.resposta && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <strong>Resposta:</strong> {duvida.resposta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrestacaoContas;