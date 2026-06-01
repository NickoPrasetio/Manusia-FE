'use client';

import dynamic from 'next/dynamic';
import { Users, Loader2 } from 'lucide-react';

const LoginForm = dynamic(
  () => import('@/components/features/auth/LoginForm'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    ),
  },
);

export default function LoginPage() {
  return (
    <main className="flex flex-col min-h-dvh bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-6 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Manusia</h1>
          <p className="text-blue-100 text-sm mt-1.5">Temukan freelancer terbaik untuk kebutuhanmu</p>
        </div>
      </div>

      {/* Form — rendered client-side only */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk melanjutkan</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
