import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Eye, Upload, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { useAnaliseFinanceira } from '@/hooks/useAnaliseFinanceira';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PdfViewer } from '@/components/ui/pdf-viewer';

interface AnaliseFinanceiraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnaliseFinanceiraModal = ({ open, onOpenChange }: AnaliseFinanceiraModalProps) => {
  const { analises, isLoading, uploadPDF, downloadAnalise, getSignedUrl, deleteAnalise } = useAnaliseFinanceira();
  const { isAdmin, isAuthenticated } = useSupabaseAuth();
  const [viewingPdf, setViewingPdf] = useState<Blob | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string>('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('O arquivo deve ter no máximo 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatPeriodo = (start: Date, end: Date): string => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const startDay = start.getDate().toString().padStart(2, '0');
    const startMonth = months[start.getMonth()];
    const endDay = end.getDate().toString().padStart(2, '0');
    const endMonth = months[end.getMonth()];

    return `${startDay} de ${startMonth} a ${endDay} de ${endMonth}`;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo PDF');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Selecione as datas de início e fim do período');
      return;
    }

    if (endDate <= startDate) {
      toast.error('A data final deve ser posterior à data inicial');
      return;
    }

    const periodo = formatPeriodo(startDate, endDate);

    try {
      await uploadPDF(periodo, selectedFile);
      setSelectedFile(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setShowUploadForm(false);
      toast.success('Análise enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Erro ao enviar análise. Verifique o console para mais detalhes.');
    }
  };

  const handleDownload = async (fileName: string, filePath: string) => {
    await downloadAnalise(fileName, filePath);
  };

  const handleViewPdf = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase.storage
        .from('analises-financeiras')
        .download(filePath);

      if (error) throw error;

      setViewingPdf(data);
      setViewingFileName(fileName);
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
      toast.error('Erro ao carregar o PDF. Tente fazer o download.');
    }
  };

  const handleDelete = async (id: string, filePath?: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      await deleteAnalise(id, filePath);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold font-montserrat">Análises Financeiras</DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Visualize e gerencie as análises financeiras do condomínio
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="flex-shrink-0"
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Análise</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {isAdmin && showUploadForm && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Enviar Nova Análise</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data Início</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            locale={ptBR}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data Fim</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            locale={ptBR}
                            disabled={(date) => startDate ? date < startDate : false}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arquivo PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90
                        file:cursor-pointer cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpload} disabled={!selectedFile || !startDate || !endDate}>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Análise
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFile(null);
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



          <div className="space-y-4 overflow-x-hidden">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando análises...
              </div>
            ) : analises.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma análise encontrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Nova Análise" para enviar a primeira análise
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {analises.map((analise) => (
                  <Card key={analise.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="font-semibold text-sm sm:text-base break-words">
                              {analise.nome_arquivo || `Análise ${analise.periodo}`}
                            </h3>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1 min-w-0">
                              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Período: {analise.periodo}</span>
                            </div>
                            {analise.tamanho_arquivo && (
                              <span>Tamanho: {formatFileSize(analise.tamanho_arquivo)}</span>
                            )}
                            <span>
                              Criado em: {new Date(analise.data_criacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {analise.url_arquivo && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleDownload(analise.nome_arquivo || 'analise.pdf', analise.url_arquivo!)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPdf(analise.url_arquivo!, analise.nome_arquivo || 'analise.pdf')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(analise.id, analise.url_arquivo)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* PDF Viewer Modal */}
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

export default AnaliseFinanceiraModal;