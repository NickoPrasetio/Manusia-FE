'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ChevronRight, Loader2, AlertCircle, Users,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useCustomerOrdersQuery } from '@/hooks/useCustomerOrdersQuery';

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

interface Props { jobId: string }

export default function JobApplicantsContent({ jobId }: Props) {
  const router = useRouter();
  const { data: orders, isLoading, isError, error } = useCustomerOrdersQuery();

  const { jobTitle, applicants } = useMemo(() => {
    const list = (orders ?? []).filter((o) => o.jobId === jobId);
    return {
      jobTitle:   list[0]?.jobTitle ?? 'Pekerjaan',
      applicants: list,
    };
  }, [orders, jobId]);

  return (
    <main className="flex flex-col min-h-dvh bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center
                     hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-blue-500" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-base truncate">{jobTitle}</h1>
          <p className="text-xs text-gray-400">Daftar pelamar</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 pb-10">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Memuat pelamar…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={26} className="text-red-400" />
            </div>
            <p className="text-sm text-red-500 font-semibold">Gagal memuat data</p>
            <p className="text-xs text-gray-400">{(error as Error)?.message}</p>
          </div>
        )}

        {!isLoading && !isError && applicants.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={26} className="text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 font-semibold">Belum ada pelamar</p>
          </div>
        )}

        {applicants.length > 0 && (
          <>
            {/* Stats chip */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {applicants.length} pelamar
              </span>
              {applicants.filter((o) => o.status === 'CONFIRMED').length > 0 && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  {applicants.filter((o) => o.status === 'CONFIRMED').length} dipekerjakan
                </span>
              )}
            </div>

            {/* Applicant cards */}
            {applicants.map((order) => (
              <ApplicantCard
                key={order.id}
                order={order}
                onClick={() =>
                  router.push(`/dashboard/orders/job/${jobId}/applicant/${order.id}`)
                }
              />
            ))}
          </>
        )}
      </div>
    </main>
  );
}

function ApplicantCard({ order, onClick }: { order: Booking; onClick: () => void }) {
  const initials = (order.workerName ?? 'P')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm
                 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform
                 hover:border-blue-200 hover:shadow-md"
    >
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center
                      shrink-0 overflow-hidden shadow-sm">
        {order.workerAvatar
          ? <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
          : <span className="text-lg font-black text-blue-500">{initials}</span>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">
          {order.workerName ?? 'Pelamar'}
        </p>
        {order.notes ? (
          <p className="text-xs text-gray-400 truncate mt-0.5">"{order.notes}"</p>
        ) : (
          <p className="text-xs text-gray-300 mt-0.5 italic">Tidak ada pesan</p>
        )}
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </button>
  );
}
