'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ClipboardList, Home, Suspense } from 'lucide-react';

function BookingSuccessContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const bookingId  = params.get('id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6 py-12">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle size={52} className="text-green-500" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Pemesanan Berhasil!
      </h1>
      <p className="text-gray-500 text-center text-sm leading-relaxed mb-2">
        Pemesananmu telah terkirim. Tunggu konfirmasi dari pekerja ya.
      </p>
      {bookingId && (
        <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-1 rounded-full mb-8">
          ID: {bookingId}
        </p>
      )}
      {!bookingId && <div className="mb-8" />}

      {/* Steps */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-8 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Langkah selanjutnya</p>
        {[
          { num: '1', text: 'Tunggu konfirmasi dari pekerja' },
          { num: '2', text: 'Pekerja akan datang sesuai jadwal' },
          { num: '3', text: 'Bayar tunai setelah pekerjaan selesai' },
          { num: '4', text: 'Beri ulasan untuk pekerja' },
        ].map((s) => (
          <div key={s.num} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {s.num}
            </div>
            <p className="text-sm text-gray-700">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <ClipboardList size={18} />
          Lihat Pesanan Saya
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
