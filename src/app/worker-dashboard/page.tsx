'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, LogOut, User, ClipboardList, Loader2, AlertCircle,
  Users, MapPin, Navigation, Star, FileText, ChevronRight,
} from 'lucide-react';
import { Booking, JobCategory } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useWorkerOrdersQuery } from '@/hooks/useWorkerOrdersQuery';
import { useWorkerAvailability } from '@/hooks/useWorkerAvailability';
import { useNearbyJobs, NearbyJobWithDistance } from '@/hooks/useNearbyJobs';
import WorkerOrderCard from '@/components/features/worker/WorkerOrderCard';
import WorkerOrderDetailPanel from '@/components/features/worker/WorkerOrderDetailPanel';
import AuthGuard from '@/components/providers/AuthGuard';

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_META: Record<JobCategory, { label: string; color: string; dot: string }> = {
  TASK:    { label: 'Task',    color: 'bg-blue-50   text-blue-600',   dot: 'bg-blue-400'   },
  PROJECT: { label: 'Project', color: 'bg-violet-50 text-violet-600', dot: 'bg-violet-400' },
  EVENT:   { label: 'Event',   color: 'bg-rose-50   text-rose-600',   dot: 'bg-rose-400'   },
};

// ── Nearby job card ───────────────────────────────────────────────────────────
function NearbyJobCard({ job, onClick }: { job: NearbyJobWithDistance; onClick: () => void }) {
  const distLabel = job.distKm === 0
    ? null
    : job.distKm < 1
      ? `${Math.round(job.distKm * 1000)} m`
      : `${job.distKm.toFixed(1)} km`;

  const meta = CATEGORY_META[job.category];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* Top row — category badge + distance */}
      <div className="flex items-center justify-between mb-2">
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        {distLabel && (
          <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
            <Navigation size={10} />
            {distLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{job.title}</p>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2.5">
        {job.description}
      </p>

      {/* Footer — budget & city */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-600">
          Rp {job.budgetPerDay.toLocaleString('id-ID')}
          <span className="text-xs font-normal text-gray-400">/hari</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={11} className="text-gray-300" />
          {job.city}
        </span>
      </div>
    </button>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
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

  const { isAvailable, toggle, isToggling, profile } = useWorkerAvailability();

  // Category filter for nearby jobs
  const [activeCategory, setActiveCategory] = useState<JobCategory | ''>('');

  // Defer location check to client-only to avoid SSR/hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { jobs: nearbyJobs, isLoading: nearbyLoading, hasLocation } = useNearbyJobs(50, activeCategory);
  const clientHasLocation = mounted && hasLocation;

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

          {/* Open-for-work toggle */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  {isAvailable ? 'Siap untuk bekerja' : 'Tutup Pesanan'}
                </p>
                <p className="text-[11px] opacity-70 mt-0.5 leading-tight">
                  {isAvailable
                    ? 'Kamu sedang bisa menerima pesanan baru'
                    : 'Kamu tidak menerima pesanan baru sementara'}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              aria-label="Toggle ketersediaan"
              disabled={isToggling}
              onClick={() => toggle(!isAvailable)}
              className={`shrink-0 relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isAvailable ? 'bg-green-400' : 'bg-white/30'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile shortcuts — Rating & Bio */}
        <div className="px-4 pt-5 grid grid-cols-2 gap-3">
          {/* Rating button */}
          <button
            onClick={() => router.push('/worker/rating')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex flex-col gap-2 text-left hover:border-amber-300 hover:shadow-md transition-all active:scale-[0.97]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Rating Saya</p>
              {profile && profile.rating > 0 ? (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-gray-900">{profile.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">/ 5</span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-400 mt-0.5">Belum ada</p>
              )}
              {profile && profile.totalReviews > 0 && (
                <p className="text-[11px] text-gray-400 mt-0.5">{profile.totalReviews} ulasan</p>
              )}
            </div>
          </button>

          {/* Bio button */}
          <button
            onClick={() => router.push('/worker/bio')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex flex-col gap-2 text-left hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.97]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText size={16} className="text-blue-400" />
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Biografi Saya</p>
              {profile?.bio ? (
                <p className="text-sm font-semibold text-gray-700 mt-0.5 line-clamp-2 leading-snug">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm font-semibold text-gray-400 mt-0.5">Belum diisi</p>
              )}
            </div>
          </button>
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

        {/* ── Pekerjaan di Sekitar ───────────────────────────────────── */}
        <div className="px-4 pb-8">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={16} className="text-emerald-500" />
            <h2 className="font-bold text-gray-900 text-sm">Pekerjaan di Sekitar</h2>
            {nearbyJobs.length > 0 && (
              <span className="ml-auto text-[11px] bg-emerald-100 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
                {nearbyJobs.length} tersedia
              </span>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-0.5 no-scrollbar">
            {([
              { value: '',        label: 'Semua' },
              { value: 'TASK',    label: 'Task' },
              { value: 'PROJECT', label: 'Project' },
              { value: 'EVENT',   label: 'Event' },
            ] as { value: JobCategory | ''; label: string }[]).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === tab.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* No location — prompt */}
          {!clientHasLocation && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3 mb-3">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <MapPin size={15} className="text-emerald-500" />
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Aktifkan <span className="font-semibold">"Siap untuk bekerja"</span> agar pekerjaan
                diurutkan berdasarkan jarak terdekatmu.
              </p>
            </div>
          )}

          {/* Loading */}
          {clientHasLocation && nearbyLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Mencari pekerjaan terdekat…</span>
            </div>
          )}

          {/* Empty */}
          {clientHasLocation && !nearbyLoading && nearbyJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-2 text-center">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Tidak ada pekerjaan terdekat</p>
              <p className="text-xs text-gray-400">
                {activeCategory
                  ? `Belum ada ${activeCategory.toLowerCase()} terbuka di sekitarmu.`
                  : 'Belum ada pekerjaan terbuka dalam radius 50 km.'}
              </p>
            </div>
          )}

          {/* Job cards */}
          <div className="space-y-3">
            {(!clientHasLocation || !nearbyLoading) && nearbyJobs.map((job) => (
              <NearbyJobCard
                key={job.id}
                job={job}
                onClick={() => router.push(`/worker/jobs/${job.id}`)}
              />
            ))}
          </div>
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
