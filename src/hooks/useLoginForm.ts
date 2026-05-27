'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, LoginFormValues } from '@/lib/schemas/auth.schema';
import { loginUseCase } from '@/data/auth';

export function useLoginForm(onSuccess: () => void) {
  const { setSession } = useAuthStore();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    const result = await loginUseCase.execute(values.email, values.password);
    if (result.success) {
      setSession(result.data.user, result.data.token);
      onSuccess();
    } else {
      setSubmitError(result.error.message);
    }
  });

  return { register, errors, isSubmitting, submitError, onSubmit };
}
