-- Adicionar coluna user_id na tabela moradores
ALTER TABLE public.moradores 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice único para user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_moradores_user_id ON public.moradores(user_id) 
WHERE user_id IS NOT NULL;

-- Garantir email único
CREATE UNIQUE INDEX IF NOT EXISTS idx_moradores_email ON public.moradores(email) 
WHERE email IS NOT NULL;

-- Função para criar/atualizar morador automaticamente
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

-- Trigger para executar após inserção de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Atualizar política RLS para permitir usuários verem seus próprios dados
DROP POLICY IF EXISTS "Authenticated users can view moradores" ON public.moradores;
CREATE POLICY "Users can view own morador data"
ON public.moradores
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));