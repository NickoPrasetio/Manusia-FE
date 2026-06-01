'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Calendar, Clock, Briefcase, Navigation,
  CheckSquare, User, Loader2, AlertCircle, ChevronRight,
} from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { jobApi } from '@/lib/api/job.api';
import { NearbyJob, JobCategory } from '@/types';

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
  const { token, user } = useAuthStore();

  const id = params.id as string;

  const [job,     setJob]     = useState<NearbyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    setError('');
    jobApi.getById(id, token)
      .then(setJob)
      .catch(() => setError('Gagal memuat detail pekerjaan'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const isOwner = job?.customerId === user?.id;
  const meta    = job ? CATEGORY_META[job.category] : null;

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
            onClick={() => {
              setError('');
              setLoading(true);
              jobApi.getById(id, token!)
                .then(setJob)
                .catch(() => setError('Gagal memuat detail pekerjaan'))
                .finally(() => setLoading(false));
            }}
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

          {/* CTA — dalam flow konten, lebar sama dengan card lain */}
          {!isOwner && job.status === 'OPEN' && (
            <button
              onClick={() => router.push('/dashboard/workers')}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
                         text-white font-bold rounded-2xl transition-all
                         flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              Tawarkan Diri
              <ChevronRight size={18} />
            </button>
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
