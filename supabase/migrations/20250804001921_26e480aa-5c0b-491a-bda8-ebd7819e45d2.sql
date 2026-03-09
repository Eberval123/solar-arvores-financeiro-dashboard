-- Create table for bank statements (extratos bancários)
CREATE TABLE public.extratos_bancarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  mes_referencia INTEGER NOT NULL CHECK (mes_referencia >= 1 AND mes_referencia <= 12),
  ano_referencia INTEGER NOT NULL CHECK (ano_referencia >= 2020 AND ano_referencia <= 2030),
  tamanho_arquivo BIGINT,
  tipo_arquivo TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(mes_referencia, ano_referencia)
);

-- Enable Row Level Security
ALTER TABLE public.extratos_bancarios ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all extratos bancarios" 
ON public.extratos_bancarios 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create extratos bancarios" 
ON public.extratos_bancarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update extratos bancarios" 
ON public.extratos_bancarios 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete extratos bancarios" 
ON public.extratos_bancarios 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_extratos_bancarios_updated_at
BEFORE UPDATE ON public.extratos_bancarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for bank statements if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('extratos-bancarios', 'extratos-bancarios', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for bank statements
CREATE POLICY "Admins can view extratos bancarios files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'extratos-bancarios');

CREATE POLICY "Admins can upload extratos bancarios files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'extratos-bancarios');

CREATE POLICY "Admins can update extratos bancarios files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'extratos-bancarios');

CREATE POLICY "Admins can delete extratos bancarios files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'extratos-bancarios');