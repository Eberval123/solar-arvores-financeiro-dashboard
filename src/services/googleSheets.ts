
// Configurações da API do Google Sheets
const SHEET_ID = '1Q6j8MUMGZfrbKm7XNcULbtjgvLPS4sWSMRxHRSgIad0';
const GID = '116296905';

export interface GoogleSheetsRow {
  [key: string]: string;
}

export const fetchGoogleSheetsData = async () => {
  try {
    // URL pública para CSV da planilha
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const csvText = await response.text();

    return parseCSVToMovimentacoes(csvText);
  } catch (error) {
    console.error('Erro ao conectar com Google Sheets:', error);
    throw error;
  }
};

const parseCSVToMovimentacoes = (csvText: string) => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    throw new Error('Planilha vazia ou não encontrada');
  }

  // Parse CSV mais robusto
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  };

  // Função para gerar ID único
  const generateUniqueId = (index: number): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}_${index}_${random}`;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());

  const movimentacoes = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, '').trim());

    // Mapear colunas corretamente baseado na estrutura da planilha
    // Ordem: id, IdBaseMovimentacao, IdBaseCategoria, DescricaoMovimentacao, DataMovimentacao, ValorMov, Status, MesRef
    const movimentacao = {
      iD: generateUniqueId(i), // ID único gerado
      IdBaseMovimentacao: values[1] || `mov_${i}`,
      IdBaseCategoria: values[2] || 'Sem Categoria',
      DescricaoMovimentacao: values[3] || 'Sem Descrição',
      DataMovimentacao: formatDate(values[4] || ''),
      ValorMov: parseValue(values[5]) || 0,
      Status: values[6] || 'Pendente',
      MesRef: values[7] || getMonthFromDate(values[4] || '')
    };

    // Verificar se não é apenas o cabeçalho ou linha vazia
    if (values[1] && values[1] !== 'IdBaseMovimentacao' && values[1].trim() !== '') {
      movimentacoes.push(movimentacao);
    }
  }

  return movimentacoes;
};

const parseValue = (valueStr: string): number => {
  if (!valueStr || valueStr.trim() === '') return 0;

  let cleanValue = valueStr.trim();

  // Detectar se é negativo
  const isNegative = cleanValue.includes('-') || cleanValue.startsWith('(');

  // Remover prefixos como "R$", "-R$", símbolos de moeda
  cleanValue = cleanValue.replace(/^[-]?R?\$?\s*/, '');
  cleanValue = cleanValue.replace(/[()]/g, ''); // Remover parênteses

  // Tratar formato brasileiro: "1.305,00" onde ponto é separador de milhares e vírgula é decimal
  // Se há vírgula e ela está nas últimas 3 posições, é separador decimal
  if (cleanValue.includes(',')) {
    const commaIndex = cleanValue.lastIndexOf(',');
    const afterComma = cleanValue.substring(commaIndex + 1);

    // Se após a vírgula há 2 dígitos ou menos, é separador decimal
    if (afterComma.length <= 2 && /^\d+$/.test(afterComma)) {
      // Remover pontos (separadores de milhares) e substituir vírgula por ponto
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Vírgula não é separador decimal, remover
      cleanValue = cleanValue.replace(/[,]/g, '');
    }
  }

  // Remove caracteres não numéricos exceto ponto e sinal negativo
  const numericValue = cleanValue.replace(/[^\d.-]/g, '');

  const parsed = parseFloat(numericValue);
  const result = isNaN(parsed) ? 0 : (isNegative ? -Math.abs(parsed) : parsed);

  return result;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // Se já está no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Se está no formato DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Tentar parse direto
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Erro ao formatar data:', e);
  }

  return new Date().toISOString().split('T')[0];
};

const getMonthFromDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().substring(0, 7);

  try {
    const date = new Date(formatDate(dateStr));
    return date.toISOString().substring(0, 7);
  } catch (e) {
    return new Date().toISOString().substring(0, 7);
  }
};
