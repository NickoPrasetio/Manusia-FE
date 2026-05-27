'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, Clock, MapPin, Package,
  Loader2, AlertCircle, ClipboardList, ChevronRight,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useCustomerOrdersQuery } from '@/hooks/useCustomerOrdersQuery';
import CustomerOrderDetailPanel from './CustomerOrderDetailPanel';

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

function OrderCard({ order, onClick }: { order: Booking; onClick: () => void }) {
  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <button
      type="button" onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-blue-100 shadow-sm p-5 flex flex-col gap-3 active:scale-[0.98] transition-transform hover:border-blue-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {order.workerAvatar && (
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-50 shrink-0">
              <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{order.workerName ?? 'Pekerja'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Klik untuk lihat detail</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={order.status} />
          <ChevronRight size={16} className="text-blue-300" />
        </div>
      </div>
      <hr className="border-gray-100" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={15} className="text-blue-400 shrink-0" />
          <span className="truncate">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={15} className="text-blue-400 shrink-0" />
          <span>Mulai {order.startTime} · {order.durationDays} hari</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={15} className="text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug line-clamp-2">{order.address}, {order.city}</span>
        </div>
        {order.notes && (
          <div className="flex items-start gap-2 text-sm text-gray-500 italic">
            <Package size={15} className="text-gray-300 shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-1">{order.notes}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function CustomerOrderListContent() {
  const router = useRouter();
  const { data: orders, isLoading, isError, error } = useCustomerOrdersQuery();
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);

  const pending   = orders?.filter((o) => o.status === 'PENDING').length   ?? 0;
  const confirmed = orders?.filter((o) => o.status === 'CONFIRMED').length ?? 0;

  return (
    <>
      <main className="flex flex-col min-h-dvh bg-blue-50">
        <div className="bg-white border-b border-blue-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
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
              <p className="text-xs text-gray-400">{(error as Error)?.message ?? 'Terjadi kesalahan.'}</p>
            </div>
          )}
          {!isLoading && !isError && orders?.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardList size={26} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-600 font-semibold">Belum ada order</p>
              <p className="text-xs text-gray-400">Order yang kamu buat akan muncul di sini.</p>
            </div>
          )}
          {orders && orders.length > 0 && (
            <>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-blue-100">
                  <p className="text-base font-black text-blue-700">{orders.length}</p>
                  <p className="text-[10px] text-gray-400">Total Order</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-yellow-100">
                  <p className="text-base font-black text-yellow-600">{pending}</p>
                  <p className="text-[10px] text-gray-400">Menunggu</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-center border border-green-100">
                  <p className="text-base font-black text-green-600">{confirmed}</p>
                  <p className="text-[10px] text-gray-400">Aktif</p>
                </div>
              </div>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
              ))}
            </>
          )}
        </div>
      </main>

      {selectedOrder && (
        <CustomerOrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
