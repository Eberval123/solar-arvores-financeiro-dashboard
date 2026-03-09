-- Remover políticas existentes da tabela moradores
DROP POLICY IF EXISTS "Admins can manage moradores" ON public.moradores;
DROP POLICY IF EXISTS "Users can view own morador data" ON public.moradores;

-- Criar políticas PERMISSIVAS corretas

-- Admins podem gerenciar todos os moradores
CREATE POLICY "Admins can manage all moradores"
ON public.moradores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own morador data"
ON public.moradores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios dados (exceto campos sensíveis gerenciados por admin)
CREATE POLICY "Users can update own morador data"
ON public.moradores
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);