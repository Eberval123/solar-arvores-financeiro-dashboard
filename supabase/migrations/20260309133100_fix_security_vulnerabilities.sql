-- Fix security vulnerabilities for moradores, boletos and reservas

-- 1. Restrict SELECT on moradores to own data or admins
DROP POLICY IF EXISTS "Authenticated users can view moradores" ON public.moradores;
DROP POLICY IF EXISTS "Users can view own morador data" ON public.moradores;
DROP POLICY IF EXISTS "Users can view own morador data or admins all" ON public.moradores;

CREATE POLICY "Users can view own morador data or admins all"
ON public.moradores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'fiscal'));

-- 2. Restrict SELECT on boletos to own apartment or admins
DROP POLICY IF EXISTS "Authenticated users can view boletos" ON public.boletos;
DROP POLICY IF EXISTS "Admins can view all boletos" ON public.boletos;
DROP POLICY IF EXISTS "Residents view own boletos and admins all" ON public.boletos;

CREATE POLICY "Residents view own boletos and admins all"
ON public.boletos
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'fiscal') OR
  EXISTS (
    SELECT 1 FROM public.moradores m
    WHERE m.user_id = auth.uid()
    AND m.apartamento = boletos.apartamento
    AND (m.bloco = boletos.bloco OR (m.bloco IS NULL AND boletos.bloco IS NULL))
  )
);

-- 3. Fix reservas table (RLS was too open or missing)
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can view own reservations and admins all" ON public.reservas;
DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can delete own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can manage own reservations" ON public.reservas;

-- Reservas: People might need to see IF a date is taken, but maybe not the details.
-- The report says "anyone to view ... reveals celeberations personal ... celebrate personal (marriages, graduations)".
-- So we restrict viewing to own or admins for now to follow the user request.
CREATE POLICY "Users can view own reservations and admins all"
ON public.reservas
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'fiscal') OR
  EXISTS (
    SELECT 1 FROM public.moradores m
    WHERE m.user_id = auth.uid()
    AND m.nome = reservas.morador_nome
    AND m.apartamento = reservas.apartamento
  )
);

CREATE POLICY "Users can manage own reservations"
ON public.reservas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  EXISTS (
    SELECT 1 FROM public.moradores m
    WHERE m.user_id = auth.uid()
    AND m.nome = reservas.morador_nome
    AND m.apartamento = reservas.apartamento
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  EXISTS (
    SELECT 1 FROM public.moradores m
    WHERE m.user_id = auth.uid()
    AND m.nome = reservas.morador_nome
    AND m.apartamento = reservas.apartamento
  )
);
