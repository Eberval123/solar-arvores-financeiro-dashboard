import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PdfViewer } from '@/components/ui/pdf-viewer';

interface Extrato {
  id: string;
  mes_referencia: number;
  ano_referencia: number;
  nome_arquivo: string;
  url_arquivo: string;
  created_at: string;
  tamanho_arquivo: number | null;
}

interface ExtratosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExtratosModal = ({ open, onOpenChange }: ExtratosModalProps) => {
  const [extratos, setExtratos] = useState<Extrato[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<Blob | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadExtratos();
    }
  }, [open]);

  const loadExtratos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('extratos_bancarios')
        .select('*')
        .order('ano_referencia', { ascending: false })
        .order('mes_referencia', { ascending: false });

      if (error) throw error;

      setExtratos(data || []);
    } catch (error) {
      console.error('Erro ao carregar extratos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (extrato: Extrato) => {
    try {
      const { data, error } = await supabase.storage
        .from('extratos-bancarios')
        .download(extrato.url_arquivo);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = extrato.nome_arquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const handleViewPdf = async (extrato: Extrato) => {
    try {
      const { data, error } = await supabase.storage
        .from('extratos-bancarios')
        .download(extrato.url_arquivo);

      if (error) {
        console.error('Erro ao baixar PDF:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o PDF",
          variant: "destructive",
        });
        return;
      }

      setViewingPdf(data);
      setViewingFileName(extrato.nome_arquivo);
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível visualizar o PDF",
        variant: "destructive",
      });
    }
  };

  const formatMesAno = (mes: number, ano: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[mes - 1]} ${ano}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamanho desconhecido';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              Extratos Cadastrados
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Visualize e gerencie os extratos bancários do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto overflow-x-hidden flex-1 -mx-4 px-4 sm:mx-0 sm:px-0 mt-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando extratos...</p>
              </div>
            ) : extratos.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum extrato encontrado
                </h3>
                <p className="text-muted-foreground">
                  Não há extratos cadastrados no sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {extratos.map((extrato) => (
                  <Card key={extrato.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1 break-words">
                              {formatMesAno(extrato.mes_referencia, extrato.ano_referencia)}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground break-all">
                              {extrato.nome_arquivo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(extrato.tamanho_arquivo)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => handleDownload(extrato)}
                            variant="default"
                            size="sm"
                            className="flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Download className="w-4 h-4" />
                            Baixar
                          </Button>
                          <Button
                            onClick={() => handleViewPdf(extrato)}
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para visualização do PDF */}
      <Dialog open={!!viewingPdf} onOpenChange={() => setViewingPdf(null)}>
        <DialogContent className="max-w-6xl w-full h-full sm:h-[90vh] p-0 flex flex-col gap-0 rounded-none sm:rounded-lg">
          <DialogHeader className="p-4 sm:p-6 border-b bg-background flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-sm sm:text-lg truncate mr-2">{viewingFileName}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PdfViewer file={viewingPdf} fileName={viewingFileName} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExtratosModal;