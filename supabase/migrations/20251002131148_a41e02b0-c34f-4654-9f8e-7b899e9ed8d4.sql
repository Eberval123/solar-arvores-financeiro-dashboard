-- Add file-related columns to analises_financeiras table
ALTER TABLE public.analises_financeiras 
ADD COLUMN IF NOT EXISTS nome_arquivo TEXT,
ADD COLUMN IF NOT EXISTS url_arquivo TEXT,
ADD COLUMN IF NOT EXISTS tamanho_arquivo BIGINT,
ADD COLUMN IF NOT EXISTS tipo_arquivo TEXT DEFAULT 'application/pdf';

-- Create storage bucket for analises financeiras
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analises-financeiras', 'analises-financeiras', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for analises-financeiras bucket
CREATE POLICY "Admins podem visualizar análises financeiras"
ON storage.objects FOR SELECT
USING (bucket_id = 'analises-financeiras' AND auth.role() = 'authenticated');

CREATE POLICY "Admins podem fazer upload de análises financeiras"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'analises-financeiras' AND auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar análises financeiras"
ON storage.objects FOR DELETE
USING (bucket_id = 'analises-financeiras' AND auth.role() = 'authenticated');