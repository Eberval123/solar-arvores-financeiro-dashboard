-- Criar tabela para aplicações financeiras
CREATE TABLE public.aplicacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_saldo DATE NOT NULL,
  nome_aplicacao TEXT NOT NULL,
  valor_aplicacao DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  valor_rendimento DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Habilitar RLS
ALTER TABLE public.aplicacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Admins can view all aplicacoes financeiras" 
ON public.aplicacoes_financeiras 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create aplicacoes financeiras" 
ON public.aplicacoes_financeiras 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update aplicacoes financeiras" 
ON public.aplicacoes_financeiras 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete aplicacoes financeiras" 
ON public.aplicacoes_financeiras 
FOR DELETE 
USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_aplicacoes_financeiras_updated_at
BEFORE UPDATE ON public.aplicacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();