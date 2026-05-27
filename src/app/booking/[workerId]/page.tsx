import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BookingForm from '@/components/features/booking/BookingForm';
import AuthGuard from '@/components/providers/AuthGuard';
import { workerApi } from '@/lib/api/worker.api';

interface Props {
  params: Promise<{ workerId: string }>;
}

export default async function BookingPage({ params }: Props) {
  const { workerId } = await params;

  let worker;
  try {
    worker = await workerApi.getById(workerId);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900">Buat Pemesanan</h1>
          <p className="text-xs text-gray-500">Isi detail pekerjaan yang kamu butuhkan</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-6 max-w-lg mx-auto">
        <AuthGuard>
          <BookingForm worker={worker} />
        </AuthGuard>
      </div>
    </div>
  );
}
