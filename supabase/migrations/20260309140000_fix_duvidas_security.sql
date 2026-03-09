
-- Migration: Add RLS to duvidas_sindico for privacy
-- Description: Residents should only see their own doubts. Admins and fiscals see all.

ALTER TABLE public.duvidas_sindico ENABLE ROW LEVEL SECURITY;

-- 1. Residents can create their own doubts
DROP POLICY IF EXISTS "Authenticated users can create duvidas" ON public.duvidas_sindico;
CREATE POLICY "Residents can create own duvidas"
ON public.duvidas_sindico
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Residents see only their own doubts, Admins/Fiscal see everything
DROP POLICY IF EXISTS "Authenticated users can view duvidas" ON public.duvidas_sindico;
CREATE POLICY "Residents can view own duvidas and admins all"
ON public.duvidas_sindico
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'fiscal'));

-- 3. Only Admins can Update (to provide answers)
DROP POLICY IF EXISTS "Admins podem atualizar dúvidas" ON public.duvidas_sindico;
CREATE POLICY "Admins can update duvidas (respond)"
ON public.duvidas_sindico
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Only Admins can Delete
CREATE POLICY "Admins can delete duvidas"
ON public.duvidas_sindico
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
