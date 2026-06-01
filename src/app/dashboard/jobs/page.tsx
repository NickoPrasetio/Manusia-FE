import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import NearbyJobsList from '@/components/features/dashboard/NearbyJobsList';

export default function NearbyJobsPage() {
  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-[#f8fafc]">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link
              href="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Pekerjaan di Sekitar</h1>
              <p className="text-[11px] text-gray-400">Bantu orang-orang di sekitarmu</p>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <div className="px-4 py-4 pb-6">
          <NearbyJobsList />
        </div>

      </main>
    </AuthGuard>
  );
}
