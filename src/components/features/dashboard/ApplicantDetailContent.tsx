'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, HandHelping, Loader2, AlertCircle, ClipboardList, Star,
} from 'lucide-react';
import { BookingStatus } from '@/types';
import { useCustomerOrdersQuery } from '@/hooks/useCustomerOrdersQuery';
import { useConfirmOrderMutation } from '@/hooks/useConfirmOrderMutation';
import { useWorkerRatingSummary } from '@/hooks/useWorkerRatingSummary';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Menunggu',     className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Dipekerjakan', className: 'bg-green-100  text-green-700'  },
  CANCELLED: { label: 'Dibatalkan',   className: 'bg-red-100    text-red-600'    },
  COMPLETED: { label: 'Selesai',      className: 'bg-blue-100   text-blue-700'   },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

interface Props { jobId: string; bookingId: string }

export default function ApplicantDetailContent({ jobId, bookingId }: Props) {
  const router = useRouter();
  const { data: orders, isLoading, isError } = useCustomerOrdersQuery();
  const confirmMutation = useConfirmOrderMutation();

  const [hired,       setHired]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const order = useMemo(
    () => orders?.find((o) => o.id === bookingId) ?? null,
    [orders, bookingId],
  );

  const isHired = hired || order?.status === 'CONFIRMED';

  const { data: ratingSummary } = useWorkerRatingSummary(order?.workerId);

  async function handleHire() {
    await confirmMutation.mutateAsync(bookingId);
    setHired(true);
    setShowConfirm(false);
  }

  const initials = (order?.workerName ?? 'P')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-dvh bg-blue-50 items-center justify-center gap-2 text-gray-400">
        <Loader2 size={24} className="animate-spin" />
        <span className="text-sm">Memuat data…</span>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="flex flex-col min-h-dvh bg-blue-50 items-center justify-center gap-3 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle size={26} className="text-red-400" />
        </div>
        <p className="text-sm text-gray-600 font-semibold">Data tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-blue-500 underline"
        >
          Kembali
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-dvh bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/dashboard/orders/job/${jobId}`)}
          className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center
                     hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-blue-500" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-base">Profil Pelamar</h1>
          <p className="text-xs text-gray-400 truncate max-w-[220px]">
            {order.jobTitle || 'Pekerjaan'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-6 pb-10">
        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center
                            shrink-0 overflow-hidden shadow-md">
              {order.workerAvatar
                ? <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
                : <span className="text-2xl font-black text-blue-500">{initials}</span>}
            </div>

            {/* Nama + status + rating */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {order.workerName ?? 'Pelamar'}
              </h2>

              {isHired && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  Sudah Dipekerjakan
                </div>
              )}

              {/* Rating stars button */}
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/worker-reviews/${order.workerId}?name=${encodeURIComponent(order.workerName ?? '')}`,
                  )
                }
                className="flex items-center gap-2 w-fit active:scale-[0.97] transition-transform"
              >
                {/* Stars row */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const avg = ratingSummary?.avgRating ?? 0;
                    const filled = i <= Math.floor(avg);
                    const half   = !filled && i === Math.ceil(avg) && avg % 1 >= 0.25;
                    return (
                      <Star
                        key={i}
                        size={20}
                        className={
                          filled || half
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 fill-gray-200'
                        }
                      />
                    );
                  })}
                </div>
                {ratingSummary && ratingSummary.total > 0 ? (
                  <span className="text-xs text-gray-400 font-medium">
                    {ratingSummary.avgRating.toFixed(1)} · {ratingSummary.total} ulasan
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Belum ada ulasan</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detail Lamaran</h3>

          <InfoRow label="Pekerjaan"  value={order.jobTitle || '-'} />
          <InfoRow label="Kota"       value={order.city} />
          <InfoRow label="Durasi"     value={`${order.durationDays} hari`} />
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status</span>
            <StatusBadge status={isHired ? 'CONFIRMED' : order.status} />
          </div>
        </div>

        {/* Pesan pelamar */}
        {order.notes && (
          <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-5">
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
              Pesan dari pelamar
            </p>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{order.notes}"</p>
          </div>
        )}

        {/* CTA — hanya muncul jika PENDING dan belum dipekerjakan */}
        {!isHired && order.status === 'PENDING' && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold
                       rounded-2xl transition-colors flex items-center justify-center gap-2
                       shadow-md shadow-blue-200 active:scale-[0.98] mt-2"
          >
            <HandHelping size={20} />
            OK, Pekerjakan Dia!
          </button>
        )}

        {/* Confirm box */}
        {showConfirm && (
          <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm mt-2">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <HandHelping size={26} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-1">
              Pekerjakan {order.workerName}?
            </h3>
            <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
              {order.workerName} akan mendapat konfirmasi bahwa mereka dipekerjakan untuk tugas ini.
            </p>

            {confirmMutation.isError && (
              <p className="text-xs text-red-500 text-center mb-4">
                Gagal mengkonfirmasi. Coba lagi.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={confirmMutation.isPending}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold
                           rounded-2xl text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleHire}
                disabled={confirmMutation.isPending}
                className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                           text-white font-bold rounded-2xl text-sm transition-colors
                           flex items-center justify-center gap-2"
              >
                {confirmMutation.isPending
                  ? <><Loader2 size={15} className="animate-spin" /> Memproses…</>
                  : 'Ya, Pekerjakan!'}
              </button>
            </div>
          </div>
        )}

        {/* Already cancelled */}
        {order.status === 'CANCELLED' && (
          <div className="flex items-center gap-2 justify-center text-sm text-gray-400 py-2">
            <ClipboardList size={16} />
            Lamaran ini sudah dibatalkan
          </div>
        )}
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}
