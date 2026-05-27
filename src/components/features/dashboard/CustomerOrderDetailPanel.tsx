'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Calendar, Clock, MapPin, Package,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useCompleteOrderMutation } from '@/hooks/useCompleteOrderMutation';
import Button from '@/components/ui/Button';

interface Props {
  order:   Booking;
  onClose: () => void;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING:   'Menunggu Konfirmasi',
  CONFIRMED: 'Dikonfirmasi',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};

export default function CustomerOrderDetailPanel({ order, onClose }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [localStatus, setLocalStatus] = useState<BookingStatus>(order.status);

  const completeMutation = useCompleteOrderMutation();

  async function handleConfirmComplete() {
    await completeMutation.mutateAsync(order.id);
    setLocalStatus('COMPLETED');
    setShowConfirm(false);
    router.push(`/dashboard/orders/${order.id}/review`);
  }

  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      <div
        className="relative bg-white rounded-t-3xl w-full max-w-[430px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>

          <h2 className="text-lg font-bold text-gray-900 mt-4 mb-4">Detail Order</h2>

          {/* Worker */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 shrink-0">
              {order.workerAvatar
                ? <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-bold text-blue-400">{(order.workerName ?? '?')[0]}</div>
              }
            </div>
            <div>
              <p className="text-xs text-gray-500">Pekerja</p>
              <p className="font-bold text-gray-900">{order.workerName ?? 'Pekerja'}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-2xl px-4 py-3">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              localStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
              localStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
              localStatus === 'CANCELLED' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {STATUS_LABEL[localStatus]}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={15} className="text-blue-400 shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={15} className="text-blue-400 shrink-0" />
              <span>Mulai {order.startTime} · {order.durationDays} hari</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>{order.address}, {order.city}</span>
            </div>
            {order.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-500 italic">
                <Package size={15} className="text-gray-300 shrink-0 mt-0.5" />
                <span>{order.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {localStatus === 'CONFIRMED' && (
            <Button
              fullWidth size="lg" variant="primary"
              onClick={() => setShowConfirm(true)}
            >
              Selesaikan Order
            </Button>
          )}
          {localStatus === 'COMPLETED' && (
            <Button
              fullWidth size="lg" variant="outline"
              onClick={() => { onClose(); router.push(`/dashboard/orders/${order.id}/review`); }}
            >
              Beri Ulasan
            </Button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Selesaikan Order?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Pastikan pekerjaan sudah selesai dengan baik sebelum mengkonfirmasi.
            </p>
            {completeMutation.isError && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2 mb-4">
                <AlertCircle size={14} className="text-red-400" />
                <p className="text-xs text-red-500">Gagal menyelesaikan order. Coba lagi.</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)} disabled={completeMutation.isPending}>
                Batal
              </Button>
              <Button variant="primary" fullWidth onClick={handleConfirmComplete} loading={completeMutation.isPending}>
                Ya, Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {completeMutation.isPending && !showConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
