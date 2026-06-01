'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { useLoginForm } from '@/hooks/useLoginForm';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();

  function handleSuccess() {
    router.push('/dashboard');
  }

  const { register, errors, isSubmitting, submitError, onSubmit } = useLoginForm(handleSuccess);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      <Input
        label="Email" type="email" placeholder="email@contoh.com"
        icon={<Mail size={18} />} error={errors.email?.message} autoComplete="email"
        {...register('email')}
      />

      <Input
        label="Password" type="password" placeholder="Masukkan password"
        icon={<Lock size={18} />} error={errors.password?.message} autoComplete="current-password"
        {...register('password')}
      />

      {Boolean(submitError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-1">
        Masuk
      </Button>

      <p className="text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link href="/signup" className="font-semibold text-blue-500 hover:underline">
          Daftar sekarang
        </Link>
      </p>

    </form>
  );
}
