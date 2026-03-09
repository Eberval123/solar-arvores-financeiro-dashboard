import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signupSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string()
    .optional()
    .refine(
      (val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val),
      'Telefone inválido. Use o formato (11) 99999-9999'
    ),
  apartamento: z.string()
    .min(1, 'Selecione um apartamento'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});


export type SignupFormData = z.infer<typeof signupSchema>;

export const useSignupForm = () => {
  return useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      apartamento: '',
      password: '',
      confirmPassword: '',
    },
  });
};
