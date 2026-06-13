'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Briefcase, ChevronRight,
  Loader2, AlertCircle, ClipboardList, User,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useCustomerOrdersQuery } from '@/hooks/useCustomerOrdersQuery';

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobGroup {
  jobId:    string;
  jobTitle: string;
  orders:   Booking[];
}

interface DirectBooking {
  type:  'direct';
  order: Booking;
}

interface GroupedJob {
  type:  'job';
  group: JobGroup;
}

type ListItem = DirectBooking | GroupedJob;

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Menunggu',     className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100  text-green-700'  },
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

// ── Job group card ─────────────────────────────────────────────────────────────

function JobGroupCard({ group, onClick }: { group: JobGroup; onClick: () => void }) {
  const pending   = group.orders.filter((o) => o.status === 'PENDING').length;
  const confirmed = group.orders.filter((o) => o.status === 'CONFIRMED').length;

  return (
    <button
      type="button" onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-blue-100 shadow-sm
                 p-5 flex flex-col gap-3 active:scale-[0.98] transition-transform hover:border-blue-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Briefcase size={18} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">
              {group.jobTitle || 'Pekerjaan'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {group.orders.length} pelamar
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-blue-300 shrink-0 mt-1" />
      </div>

      {/* Applicant avatars row */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {group.orders.slice(0, 4).map((o) => (
            <div
              key={o.id}
              className="w-7 h-7 rounded-full border-2 border-white bg-blue-200
                         flex items-center justify-center text-[10px] font-bold text-blue-600 overflow-hidden"
            >
              {o.workerAvatar
                ? <img src={o.workerAvatar} alt={o.workerName} className="w-full h-full object-cover" />
                : (o.workerName ?? '?')[0].toUpperCase()}
            </div>
          ))}
          {group.orders.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100
                            flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{group.orders.length - 4}
            </div>
          )}
        </div>
        <div className="flex gap-1.5 ml-1">
          {pending > 0 && (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {pending} menunggu
            </span>
          )}
          {confirmed > 0 && (
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {confirmed} dipekerjakan
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Direct booking card ───────────────────────────────────────────────────────

function DirectBookingCard({ order, onClick }: { order: Booking; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm
                 p-5 flex items-center gap-3 active:scale-[0.98] transition-transform hover:border-blue-300"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {order.workerAvatar
          ? <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
          : <User size={18} className="text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{order.workerName ?? 'Pekerja'}</p>
        <p className="text-xs text-gray-400">{order.city} · {order.durationDays} hari</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={order.status} />
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CustomerOrderListContent() {
  const router = useRouter();
  const { data: orders, isLoading, isError, error } = useCustomerOrdersQuery();

  const listItems: ListItem[] = useMemo(() => {
    if (!orders) return [];

    const jobMap = new Map<string, Booking[]>();
    const direct: Booking[] = [];

    for (const o of orders) {
      if (o.jobId) {
        const arr = jobMap.get(o.jobId) ?? [];
        arr.push(o);
        jobMap.set(o.jobId, arr);
      } else {
        direct.push(o);
      }
    }

    const items: ListItem[] = [];

    jobMap.forEach((groupOrders, jobId) => {
      items.push({
        type: 'job',
        group: {
          jobId,
          jobTitle: groupOrders[0]?.jobTitle ?? 'Pekerjaan',
          orders:   groupOrders,
        },
      });
    });

    direct.forEach((o) => items.push({ type: 'direct', order: o }));

    return items.sort((a, b) => {
      const aDate = a.type === 'job' ? a.group.orders[0]?.createdAt : a.order.createdAt;
      const bDate = b.type === 'job' ? b.group.orders[0]?.createdAt : b.order.createdAt;
      return new Date(bDate ?? 0).getTime() - new Date(aDate ?? 0).getTime();
    });
  }, [orders]);

  const totalOrders = orders?.length ?? 0;
  const pending     = orders?.filter((o) => o.status === 'PENDING').length   ?? 0;
  const confirmed   = orders?.filter((o) => o.status === 'CONFIRMED').length ?? 0;

  return (
    <main className="flex flex-col min-h-dvh bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-blue-500" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-base">My Order</h1>
          <p className="text-xs text-gray-400">Riwayat dan status ordermu</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 pb-10">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Memuat order…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={26} className="text-red-400" />
            </div>
            <p className="text-sm text-red-500 font-semibold">Gagal memuat order</p>
            <p className="text-xs text-gray-400">{(error as Error)?.message}</p>
          </div>
        )}

        {!isLoading && !isError && listItems.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardList size={26} className="text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 font-semibold">Belum ada order</p>
            <p className="text-xs text-gray-400">Order dan lamaran akan muncul di sini.</p>
          </div>
        )}

        {listItems.length > 0 && (
          <>
            {/* Stats */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-blue-100">
                <p className="text-base font-black text-blue-700">{totalOrders}</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-yellow-100">
                <p className="text-base font-black text-yellow-600">{pending}</p>
                <p className="text-[10px] text-gray-400">Menunggu</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-green-100">
                <p className="text-base font-black text-green-600">{confirmed}</p>
                <p className="text-[10px] text-gray-400">Dipekerjakan</p>
              </div>
            </div>

            {/* List */}
            {listItems.map((item) =>
              item.type === 'job' ? (
                <JobGroupCard
                  key={item.group.jobId}
                  group={item.group}
                  onClick={() => router.push(`/dashboard/orders/job/${item.group.jobId}`)}
                />
              ) : (
                <DirectBookingCard
                  key={item.order.id}
                  order={item.order}
                  onClick={() =>
                    router.push(`/dashboard/orders/job/${item.order.jobId ?? 'direct'}/applicant/${item.order.id}`)
                  }
                />
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}
