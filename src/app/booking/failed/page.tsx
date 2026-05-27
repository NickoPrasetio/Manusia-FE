'use client';

import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, Home } from 'lucide-react';

export default function BookingFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center px-6 py-12">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <XCircle size={52} className="text-red-500" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Pemesanan Gagal
      </h1>
      <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
        Terjadi kesalahan saat memproses pemesananmu. Silakan coba lagi.
      </p>

      {/* Error card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-sm border border-red-100 mb-8">
        <p className="text-sm text-gray-600 text-center">
          Kemungkinan penyebab: koneksi internet bermasalah atau pekerja tidak tersedia saat ini.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.back()}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Coba Lagi
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
