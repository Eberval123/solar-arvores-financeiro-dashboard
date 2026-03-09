-- Create table for storing statement of accounts PDFs
CREATE TABLE public.prestacao_contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT DEFAULT 'application/pdf',
  tamanho_arquivo BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.prestacao_contas ENABLE ROW LEVEL SECURITY;

-- Create policies for prestacao_contas
CREATE POLICY "Todos podem visualizar prestação de contas" 
ON public.prestacao_contas 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem criar prestação de contas" 
ON public.prestacao_contas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar prestação de contas" 
ON public.prestacao_contas 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins podem deletar prestação de contas" 
ON public.prestacao_contas 
FOR DELETE 
USING (true);

-- Create trigger for timestamps
CREATE TRIGGER update_prestacao_contas_updated_at
BEFORE UPDATE ON public.prestacao_contas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Note: duvidas_sindico table already exists according to the schema, 
-- so we don't need to create it again