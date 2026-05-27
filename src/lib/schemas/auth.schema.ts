import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    phone: z.string().min(1, 'Nomor HP wajib diisi').regex(/^08\d{8,11}$/, 'Format: 08xxxxxxxxxx'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    userType: z.enum(['CUSTOMER', 'WORKER'] as const),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak sama',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
export type UserType = SignupFormValues['userType'];

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
