'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, LogOut, User, ClipboardList, Loader2, AlertCircle, Users,
} from 'lucide-react';
import { Booking } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useWorkerOrdersQuery } from '@/hooks/useWorkerOrdersQuery';
import WorkerOrderCard from '@/components/features/worker/WorkerOrderCard';
import WorkerOrderDetailPanel from '@/components/features/worker/WorkerOrderDetailPanel';
import AuthGuard from '@/components/providers/AuthGuard';

function WorkerDashboardContent() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const { data: orders, isLoading, isError, error } = useWorkerOrdersQuery();
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  const pending   = orders?.filter((o) => o.status === 'PENDING').length   ?? 0;
  const confirmed = orders?.filter((o) => o.status === 'CONFIRMED').length ?? 0;
  const completed = orders?.filter((o) => o.status === 'COMPLETED').length ?? 0;

  return (
    <>
      <div className="min-h-dvh bg-blue-50 flex flex-col">

        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Dashboard Pekerja</p>
                <p className="text-base font-bold text-gray-900 leading-tight">
                  {user?.name ?? 'Pekerja'} 👋
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/profile')}
                className="relative p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-500" />
                    </div>
                  )
                }
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors text-gray-600"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-7 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={20} className="opacity-80" />
            <span className="text-sm opacity-80">Kelola pesanan masukmu</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Menunggu',  value: pending,   color: 'bg-yellow-400/20 text-yellow-200' },
              { label: 'Aktif',     value: confirmed, color: 'bg-green-400/20  text-green-200'  },
              { label: 'Selesai',   value: completed, color: 'bg-white/20      text-white'      },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-3 text-center ${s.color}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[11px] mt-0.5 font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="flex-1 px-4 py-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-blue-500" />
            <h2 className="font-bold text-gray-900 text-sm">Daftar Pesanan</h2>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Memuat pesanan…</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={26} className="text-red-400" />
              </div>
              <p className="text-sm text-red-500 font-semibold">Gagal memuat pesanan</p>
              <p className="text-xs text-gray-400">{(error as Error)?.message ?? 'Terjadi kesalahan.'}</p>
            </div>
          )}

          {!isLoading && !isError && orders?.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users size={26} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-700 font-semibold">Belum ada pesanan masuk</p>
              <p className="text-xs text-gray-400">
                Pesanan dari pelanggan akan muncul di sini.
              </p>
            </div>
          )}

          {orders?.map((order) => (
            <WorkerOrderCard
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      </div>

      {selectedOrder && (
        <WorkerOrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

export default function WorkerDashboardPage() {
  return (
    <AuthGuard>
      <WorkerDashboardContent />
    </AuthGuard>
  );
}
