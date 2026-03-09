-- 1. Remover o índice parcial existente no email
DROP INDEX IF EXISTS idx_moradores_email;

-- 2. Criar constraint única completa no email
ALTER TABLE public.moradores 
ADD CONSTRAINT moradores_email_key UNIQUE (email);

-- 3. Atualizar a função handle_new_user para usar ON CONFLICT corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar morador com dados do metadata
  INSERT INTO public.moradores (
    user_id,
    nome,
    email,
    telefone,
    apartamento,
    status,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.email,
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'apartamento',
    'No aguardo',
    now(),
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    apartamento = EXCLUDED.apartamento,
    updated_at = now()
  WHERE moradores.user_id IS NULL;
  
  RETURN new;
END;
$$;