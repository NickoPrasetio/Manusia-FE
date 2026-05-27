'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { signupSchema, SignupFormValues, UserType } from '@/lib/schemas/auth.schema';
import { signupUseCase } from '@/data/auth';
import { useLocation } from './useLocation';

export function useSignupForm(onSuccess: () => void) {
  const { setSession } = useAuthStore();
  const location       = useLocation();
  const [submitError, setSubmitError] = useState('');

  // KTP state
  const [ktpFile,    setKtpFile]    = useState<File | undefined>(undefined);
  const [ktpPreview, setKtpPreview] = useState<string | undefined>(undefined);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone,    setOcrDone]    = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const userType = watch('userType');

  function selectUserType(type: UserType) {
    setValue('userType', type, { shouldValidate: true });
  }

  async function handleKtpChange(file: File) {
    setKtpFile(file);
    setOcrDone(false);

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => setKtpPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Run OCR
    setOcrLoading(true);
    try {
      // Dynamic import to avoid SSR issues with WebWorkers
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'ind+eng');
      const text   = result.data.text;

      // Parse the "Nama" line from KTP
      const lines = text.split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/[^a-zA-Z0-9 :.,]/g, ' ').trim();
        const lower   = cleaned.toLowerCase();
        if (lower.includes('nama') && cleaned.includes(':')) {
          const parts = cleaned.split(':');
          const name  = parts[1]?.trim();
          if (name && name.length > 1) {
            setValue('name', name, { shouldValidate: true });
            break;
          }
        }
      }
      setOcrDone(true);
    } catch (e) {
      console.error('OCR error:', e);
    } finally {
      setOcrLoading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    const result = await signupUseCase.execute({
      name:      values.name,
      email:     values.email,
      password:  values.password,
      phone:     values.phone,
      userType:  values.userType,
      birthDate: values.birthDate,
      ktpFile,
      latitude:  location.latitude,
      longitude: location.longitude,
    });
    if (result.success) {
      setSession(result.data.user, result.data.token);
      onSuccess();
    } else {
      setSubmitError(result.error.message);
    }
  });

  return {
    register, errors, isSubmitting, submitError,
    userType, selectUserType,
    location,
    ktpFile, ktpPreview, ocrLoading, ocrDone, handleKtpChange,
    onSubmit,
  };
}
