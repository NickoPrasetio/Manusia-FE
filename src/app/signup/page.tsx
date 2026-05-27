import Link from 'next/link';
import { ChevronLeft, Users } from 'lucide-react';
import SignupForm from '@/components/features/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 px-6 pt-14 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <Link
          href="/login"
          className="relative flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm mb-5 w-fit"
        >
          <ChevronLeft size={18} />
          Kembali
        </Link>
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Buat Akun</h1>
            <p className="text-orange-100 text-xs mt-0.5">Daftar dan mulai berkarya</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10">
        <SignupForm />
      </div>
    </main>
  );
}
