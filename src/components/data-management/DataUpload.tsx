
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFinancialData } from '@/hooks/useFinancialData';
import { MovimentacaoFinanceira } from '@/types/financial';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  
  const { setMovimentacoes } = useFinancialData();
  const { toast } = useToast();

  const validateMovimentacao = (data: any): data is MovimentacaoFinanceira => {
    return (
      typeof data === 'object' &&
      typeof data.IdBaseMovimentacao === 'string' &&
      typeof data.IdBaseCategoria === 'string' &&
      typeof data.DescricaoMovimentacao === 'string' &&
      typeof data.DataMovimentacao === 'string' &&
      typeof data.ValorMov === 'number' &&
      typeof data.Status === 'string' &&
      typeof data.MesRef === 'string'
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Verificar se é um array
        if (!Array.isArray(jsonData)) {
          throw new Error('O arquivo deve conter um array de movimentações.');
        }

        // Validar cada item
        const validMovimentacoes: MovimentacaoFinanceira[] = [];
        const errors: string[] = [];

        jsonData.forEach((item, index) => {
          if (validateMovimentacao(item)) {
            validMovimentacoes.push(item);
          } else {
            errors.push(`Item ${index + 1}: estrutura inválida`);
          }
        });

        if (errors.length > 0 && validMovimentacoes.length === 0) {
          throw new Error(`Nenhuma movimentação válida encontrada. Erros: ${errors.join(', ')}`);
        }

        // Salvar dados válidos
        setMovimentacoes(validMovimentacoes);
        
        setUploadResult({
          success: true,
          message: `${validMovimentacoes.length} movimentações carregadas com sucesso!`,
          count: validMovimentacoes.length
        });

        toast({
          title: "Upload realizado com sucesso!",
          description: `${validMovimentacoes.length} movimentações foram carregadas.`,
        });

        if (errors.length > 0) {
          toast({
            title: "Alguns itens foram ignorados",
            description: `${errors.length} itens com estrutura inválida foram ignorados.`,
            variant: "destructive",
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setUploadResult({
          success: false,
          message: `Erro ao processar arquivo: ${errorMessage}`,
        });

        toast({
          title: "Erro no upload",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        // Reset input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setUploadResult({
        success: false,
        message: 'Erro ao ler o arquivo.',
      });
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Dados Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Área de Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
            <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione o arquivo JSON
            </h3>
            <p className="text-gray-600 mb-4">
              Faça upload do arquivo com os dados financeiros do condomínio
            </p>
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button disabled={isUploading} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                {isUploading ? "Processando..." : "Escolher Arquivo"}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Resultado do Upload */}
          {uploadResult && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              uploadResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-medium ${
                  uploadResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {uploadResult.message}
                </p>
                {uploadResult.success && uploadResult.count && (
                  <p className="text-green-700 text-sm mt-1">
                    Os dados foram salvos e já estão disponíveis no dashboard.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formato Esperado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Formato esperado do JSON:</h4>
            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`[
  {
    "IdBaseMovimentacao": "Honorário Síndico",
    "IdBaseCategoria": "Administrativa",
    "DescricaoMovimentacao": "PIX ENVIADO ANA PAULA LE",
    "DataMovimentacao": "2024-11-04",
    "ValorMov": -706,
    "Status": "Realizado",
    "MesRef": "Nov"
  }
]`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;
