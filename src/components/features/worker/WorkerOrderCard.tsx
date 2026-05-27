'use client';

import { Calendar, Clock, MapPin, Package, ChevronRight, User } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Menunggu',     className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100  text-green-700'  },
  CANCELLED: { label: 'Dibatalkan',   className: 'bg-red-100    text-red-600'    },
  COMPLETED: { label: 'Selesai',      className: 'bg-blue-100   text-blue-700'   },
};

interface Props {
  order: Booking;
  onClick: () => void;
}

export default function WorkerOrderCard({ order, onClick }: Props) {
  const cfg  = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-600' };
  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-blue-100 shadow-sm p-5 flex flex-col gap-3 active:scale-[0.98] transition-transform hover:border-blue-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <User size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">
              {order.customerName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Klik untuk detail</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.className}`}>
            {cfg.label}
          </span>
          <ChevronRight size={16} className="text-blue-300" />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Details */}
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
