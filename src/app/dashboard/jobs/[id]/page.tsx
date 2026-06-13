'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Calendar, Clock, Briefcase, Navigation,
  CheckSquare, User, Loader2, AlertCircle, HandHelping,
} from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { useJobDetail } from '@/hooks/useJobDetail';
import { useApplyToJob } from '@/hooks/useApplyToJob';
import { JobCategory } from '@/types';

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<JobCategory, { label: string; color: string; bg: string; dot: string }> = {
  TASK:    { label: 'Task',    color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-400'   },
  PROJECT: { label: 'Project', color: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-400' },
  EVENT:   { label: 'Event',   color: 'text-rose-600',   bg: 'bg-rose-50',   dot: 'bg-rose-400'   },
};

const STATUS_CONFIG = {
  OPEN:   { label: 'Dibuka',  className: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Ditutup', className: 'bg-gray-100  text-gray-500'  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Info card ─────────────────────────────────────────────────────────────────

function InfoCard({
  icon, label, value, valueClass = 'text-gray-900 font-semibold',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}

// ── Page content ──────────────────────────────────────────────────────────────

function JobDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const id = params.id as string;
  const { job, isLoading: loading, error, refetch } = useJobDetail(id);
  const applyMutation = useApplyToJob();

  const [showConfirm, setShowConfirm] = useState(false);
  const [applyDone,   setApplyDone]   = useState(false);

  const isOwner = job?.customerId === user?.id;
  const meta    = job ? CATEGORY_META[job.category] : null;

  async function handleApply() {
    await applyMutation.mutateAsync(id);
    setShowConfirm(false);
    setApplyDone(true);
  }

  return (
    <main className="flex flex-col min-h-dvh bg-[#f0f4f8]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100
                       hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Detail Pekerjaan</h1>
            <p className="text-[11px] text-gray-400">Info lengkap pekerjaan</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Memuat detail...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{error}</p>
            <p className="text-sm text-gray-400 mt-1">Periksa koneksi dan coba lagi</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Content */}
      {job && !loading && (
        <div className="flex-1 px-4 py-5 space-y-4 pb-8">

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold
              px-2.5 py-1 rounded-full ${meta!.bg} ${meta!.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta!.dot}`} />
              {meta!.label}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
              ${STATUS_CONFIG[job.status].className}`}>
              {STATUS_CONFIG[job.status].label}
            </span>
            {isOwner && (
              <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-2 py-1 rounded-full">
                Postingan Kamu
              </span>
            )}
          </div>

          {/* Title + customer */}
          <div className="bg-white rounded-3xl px-5 py-4 border border-gray-100 shadow-sm space-y-1">
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{job.title}</h2>
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500">Diposting oleh <span className="font-semibold text-gray-700">{job.customerName}</span></span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Clock size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <InfoCard
              icon={<Briefcase size={14} className="text-blue-500" />}
              label="Budget / Hari"
              value={`Rp ${job.budgetPerDay.toLocaleString('id-ID')}`}
              valueClass="text-blue-600 font-bold"
            />
            <InfoCard
              icon={<Calendar size={14} className="text-purple-500" />}
              label="Durasi"
              value={`${job.durationDays} hari`}
            />
            <InfoCard
              icon={<MapPin size={14} className="text-rose-500" />}
              label="Kota"
              value={job.city}
            />
            <InfoCard
              icon={<Navigation size={14} className="text-emerald-500" />}
              label="Kategori"
              value={meta!.label}
            />
          </div>

          {/* Total budget */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl px-5 py-4
                          flex items-center justify-between shadow-md shadow-blue-200">
            <div>
              <p className="text-[11px] text-blue-100">Total Budget</p>
              <p className="text-2xl font-black text-white">
                Rp {(job.budgetPerDay * job.durationDays).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">
                Rp {job.budgetPerDay.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-blue-200">× {job.durationDays} hari</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl px-5 py-4 border border-gray-100 shadow-sm space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Deskripsi</p>
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Todo list */}
          {job.todoList && job.todoList.length > 0 && (
            <div className="bg-white rounded-3xl px-5 py-4 border border-gray-100 shadow-sm space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Yang Perlu Dikerjakan
              </p>
              <div className="space-y-2.5">
                {job.todoList.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare size={11} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {!isOwner && job.status === 'OPEN' && !applyDone && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
                         text-white font-bold rounded-2xl transition-all
                         flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              <HandHelping size={18} />
              Tawarkan Diri
            </button>
          )}
          {!isOwner && job.status === 'OPEN' && applyDone && (
            <div className="w-full py-4 bg-green-50 border border-green-200 rounded-2xl
                            flex flex-col items-center gap-1">
              <p className="text-green-700 font-bold text-sm">✅ Penawaran Terkirim!</p>
              <p className="text-green-600 text-xs">Pemberi kerja akan menerima permintaanmu</p>
            </div>
          )}
          {isOwner && (
            <div className="w-full py-3.5 bg-gray-100 text-gray-500 font-semibold
                            rounded-2xl text-center text-sm">
              Ini adalah postingan milikmu
            </div>
          )}
          {!isOwner && job.status === 'CLOSED' && (
            <div className="w-full py-3.5 bg-gray-100 text-gray-500 font-semibold
                            rounded-2xl text-center text-sm">
              Pekerjaan ini sudah ditutup
            </div>
          )}
        </div>
      )}

      {/* Confirmation bottom sheet */}
      {showConfirm && job && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowConfirm(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto
                          bg-white rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />

            {/* Icon */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <HandHelping size={26} className="text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Tawarkan Diri</h2>
              <p className="text-xs text-gray-400 text-center max-w-[260px] leading-relaxed">
                Kamu akan mengirim penawaran ke <span className="font-semibold text-gray-700">{job.customerName}</span> untuk pekerjaan ini.
                Mereka akan melihatnya di My Orders.
              </p>
            </div>

            {/* Job summary */}
            <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-5 space-y-1">
              <p className="text-sm font-bold text-gray-900 truncate">{job.title}</p>
              <p className="text-xs text-gray-400">{job.city} · {job.durationDays} hari</p>
              <p className="text-sm font-bold text-blue-600">
                Rp {(job.budgetPerDay * job.durationDays).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Error */}
            {applyMutation.isError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-red-600">
                  {(applyMutation.error as Error)?.message || 'Gagal mengirim penawaran'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold
                           rounded-2xl hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                           text-white font-bold rounded-2xl transition-colors text-sm
                           flex items-center justify-center gap-2"
              >
                {applyMutation.isPending
                  ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                  : 'Kirim Penawaran'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function JobDetailPage() {
  return (
    <AuthGuard>
      <JobDetailContent />
    </AuthGuard>
  );
}
