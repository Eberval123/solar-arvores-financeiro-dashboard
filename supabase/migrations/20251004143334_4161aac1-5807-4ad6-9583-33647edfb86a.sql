-- Fase 1: Sistema de Roles e Segurança

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'morador');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar função has_role com SECURITY DEFINER (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Atualizar RLS: analises_financeiras
DROP POLICY IF EXISTS "Admins can create analises financeiras" ON public.analises_financeiras;
DROP POLICY IF EXISTS "Admins can update analises financeiras" ON public.analises_financeiras;
DROP POLICY IF EXISTS "Admins can delete analises financeiras" ON public.analises_financeiras;
DROP POLICY IF EXISTS "Admins can view all analises financeiras" ON public.analises_financeiras;

CREATE POLICY "Admins can manage analises financeiras"
ON public.analises_financeiras
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view analises"
ON public.analises_financeiras
FOR SELECT
TO authenticated
USING (true);

-- 6. Atualizar RLS: extratos_bancarios
DROP POLICY IF EXISTS "Admins can create extratos bancarios" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "Admins can update extratos bancarios" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "Admins can delete extratos bancarios" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "Admins can view all extratos bancarios" ON public.extratos_bancarios;

CREATE POLICY "Admins can manage extratos"
ON public.extratos_bancarios
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view extratos"
ON public.extratos_bancarios
FOR SELECT
TO authenticated
USING (true);

-- 7. Atualizar RLS: prestacao_contas
DROP POLICY IF EXISTS "Admins podem criar prestação de contas" ON public.prestacao_contas;
DROP POLICY IF EXISTS "Admins podem atualizar prestação de contas" ON public.prestacao_contas;
DROP POLICY IF EXISTS "Admins podem deletar prestação de contas" ON public.prestacao_contas;
DROP POLICY IF EXISTS "Todos podem visualizar prestação de contas" ON public.prestacao_contas;

CREATE POLICY "Admins can manage prestacao contas"
ON public.prestacao_contas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view prestacao contas"
ON public.prestacao_contas
FOR SELECT
TO authenticated
USING (true);

-- 8. Atualizar RLS: aplicacoes_financeiras
DROP POLICY IF EXISTS "Admins can create aplicacoes financeiras" ON public.aplicacoes_financeiras;
DROP POLICY IF EXISTS "Admins can update aplicacoes financeiras" ON public.aplicacoes_financeiras;
DROP POLICY IF EXISTS "Admins can delete aplicacoes financeiras" ON public.aplicacoes_financeiras;
DROP POLICY IF EXISTS "Admins can view all aplicacoes financeiras" ON public.aplicacoes_financeiras;

CREATE POLICY "Admins can manage aplicacoes"
ON public.aplicacoes_financeiras
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view aplicacoes"
ON public.aplicacoes_financeiras
FOR SELECT
TO authenticated
USING (true);

-- 9. Atualizar RLS: moradores
DROP POLICY IF EXISTS "Admins can create moradores" ON public.moradores;
DROP POLICY IF EXISTS "Admins can update moradores" ON public.moradores;
DROP POLICY IF EXISTS "Admins can delete moradores" ON public.moradores;
DROP POLICY IF EXISTS "Admins can view all moradores" ON public.moradores;

CREATE POLICY "Admins can manage moradores"
ON public.moradores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view moradores"
ON public.moradores
FOR SELECT
TO authenticated
USING (true);

-- 10. Atualizar RLS: boletos
DROP POLICY IF EXISTS "Admins can create boletos" ON public.boletos;
DROP POLICY IF EXISTS "Admins can update boletos" ON public.boletos;
DROP POLICY IF EXISTS "Admins can delete boletos" ON public.boletos;
DROP POLICY IF EXISTS "Admins can view all boletos" ON public.boletos;

CREATE POLICY "Admins can manage all boletos"
ON public.boletos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view boletos"
ON public.boletos
FOR SELECT
TO authenticated
USING (true);

-- 11. Atualizar RLS: duvidas_sindico
DROP POLICY IF EXISTS "Todos podem criar dúvidas" ON public.duvidas_sindico;
DROP POLICY IF EXISTS "Todos podem visualizar dúvidas" ON public.duvidas_sindico;
DROP POLICY IF EXISTS "Admins podem atualizar dúvidas" ON public.duvidas_sindico;

CREATE POLICY "Authenticated users can create duvidas"
ON public.duvidas_sindico
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view duvidas"
ON public.duvidas_sindico
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update duvidas"
ON public.duvidas_sindico
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete duvidas"
ON public.duvidas_sindico
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Storage Policies para analises-financeiras
CREATE POLICY "Admins can upload analises"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analises-financeiras' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete analises files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'analises-financeiras' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can view analises files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'analises-financeiras');

-- 13. Storage Policies para extratos-bancarios
CREATE POLICY "Admins can upload extratos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'extratos-bancarios' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete extratos files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'extratos-bancarios' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can view extratos files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'extratos-bancarios');

-- 14. Criar primeiro usuário admin (use o email que você desejar)
-- IMPORTANTE: Execute este comando APÓS criar o usuário no Supabase Auth
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário criado

-- Exemplo de como criar o primeiro admin após o usuário se registrar:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('SEU_USER_ID_AQUI', 'admin');