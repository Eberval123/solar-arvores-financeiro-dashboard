-- Executar este script no SQL Editor do Supabase para garantir que
-- condominiosolardasarvores@gmail.com seja o administrador do sistema.
--
-- Acesse: https://supabase.com/dashboard/project/zbegedxfpdjsduubgjmo/editor
-- E cole este SQL abaixo:

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'condominiosolardasarvores@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar resultado:
SELECT au.id, au.email, ur.role
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email = 'condominiosolardasarvores@gmail.com';
