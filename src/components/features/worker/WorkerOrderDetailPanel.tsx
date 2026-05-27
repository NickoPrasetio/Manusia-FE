'use client';

import { X, Calendar, Clock, MapPin, Package, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useConfirmOrderMutation } from '@/hooks/useConfirmOrderMutation';
import { useCompleteOrderMutation } from '@/hooks/useCompleteOrderMutation';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Menunggu Konfirmasi', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Dikonfirmasi',        className: 'bg-green-100  text-green-700'  },
  CANCELLED: { label: 'Dibatalkan',          className: 'bg-red-100    text-red-600'    },
  COMPLETED: { label: 'Selesai',             className: 'bg-blue-100   text-blue-700'   },
};

interface Props {
  order: Booking;
  onClose: () => void;
}

export default function WorkerOrderDetailPanel({ order, onClose }: Props) {
  const confirmMut  = useConfirmOrderMutation();
  const completeMut = useCompleteOrderMutation();

  const cfg  = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-600' };
  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const isBusy = confirmMut.isPending || completeMut.isPending;

  async function handleConfirm() {
    await confirmMut.mutateAsync(order.id);
    onClose();
  }

  async function handleComplete() {
    await completeMut.mutateAsync(order.id);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 pointer-events-none"
        aria-hidden
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex flex-col max-h-[90dvh] bg-white rounded-t-3xl shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Detail Pesanan</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <User size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Pelanggan</p>
              <p className="font-bold text-gray-900">{order.customerName}</p>
            </div>
            <div className="ml-auto">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <InfoRow icon={<Calendar size={16} className="text-blue-400" />} label="Tanggal" value={date} />
            <InfoRow icon={<Clock size={16} className="text-blue-400" />}    label="Waktu"   value={`Mulai ${order.startTime} · ${order.durationDays} hari`} />
            <InfoRow icon={<MapPin size={16} className="text-blue-400" />}   label="Alamat"  value={`${order.address}, ${order.city}`} />
            {order.notes && (
              <InfoRow icon={<Package size={16} className="text-gray-400" />} label="Catatan" value={order.notes} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          {order.status === 'PENDING' && (
            <button
              onClick={handleConfirm}
              disabled={isBusy}
              className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300
                         text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {confirmMut.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Mengkonfirmasi...</>
                : <><CheckCircle size={18} /> Terima Pesanan</>
              }
            </button>
          )}

          {order.status === 'CONFIRMED' && (
            <button
              onClick={handleComplete}
              disabled={isBusy}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                         text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {completeMut.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Menyelesaikan...</>
                : <><CheckCircle size={18} /> Tandai Selesai</>
              }
            </button>
          )}

          {(order.status === 'CANCELLED' || order.status === 'COMPLETED') && (
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 leading-snug">{value}</p>
      </div>
    </div>
  );
}
