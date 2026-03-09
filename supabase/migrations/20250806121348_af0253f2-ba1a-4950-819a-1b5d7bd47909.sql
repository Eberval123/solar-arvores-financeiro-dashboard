-- Create table for financial analyses
CREATE TABLE public.analises_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.analises_financeiras ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all analises financeiras" 
ON public.analises_financeiras 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create analises financeiras" 
ON public.analises_financeiras 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update analises financeiras" 
ON public.analises_financeiras 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete analises financeiras" 
ON public.analises_financeiras 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analises_financeiras_updated_at
BEFORE UPDATE ON public.analises_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();