'use client';

import { useEffect, useState } from 'react';
import {
  X, MapPin, Calendar, Clock, Briefcase, Navigation,
  ChevronRight, CheckSquare, User, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { jobApi } from '@/lib/api/job.api';
import { NearbyJob, JobCategory } from '@/types';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  jobId:    string | null;
  distKm?:  number;
  onClose:  () => void;
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDist(km: number) {
  if (km === 0) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function JobDetailModal({ jobId, distKm = 0, onClose }: Props) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [job,     setJob]     = useState<NearbyJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [visible, setVisible] = useState(false);

  // Fetch job detail
  useEffect(() => {
    if (!jobId || !token) return;
    setJob(null);
    setError('');
    setLoading(true);

    jobApi.getById(jobId, token)
      .then(setJob)
      .catch(() => setError('Gagal memuat detail pekerjaan'))
      .finally(() => setLoading(false));
  }, [jobId, token]);

  // Animate in
  useEffect(() => {
    if (jobId) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [jobId]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleOffer() {
    // Prevent offering your own job
    if (job?.customerId === user?.id) return;
    router.push(`/dashboard/workers`);
    handleClose();
  }

  if (!jobId) return null;

  const isOwner = job?.customerId === user?.id;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl
                    shadow-2xl transition-transform duration-300 ease-out
                    ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '90dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Detail Pekerjaan</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90dvh - 120px)' }}>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Memuat detail...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm font-semibold text-gray-700">{error}</p>
              <button
                onClick={() => jobId && token && jobApi.getById(jobId, token).then(setJob).catch(() => {})}
                className="text-xs text-blue-500 underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Content */}
          {job && !loading && (
            <div className="px-5 py-4 space-y-5 pb-8">

              {/* Category + Status + Distance */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold
                  px-2.5 py-1 rounded-full ${CATEGORY_META[job.category].bg} ${CATEGORY_META[job.category].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_META[job.category].dot}`} />
                  {CATEGORY_META[job.category].label}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
                  ${STATUS_CONFIG[job.status].className}`}>
                  {STATUS_CONFIG[job.status].label}
                </span>
                {formatDist(distKm) && (
                  <span className="ml-auto flex items-center gap-1 text-[11px] bg-blue-50
                    text-blue-600 font-bold px-2.5 py-1 rounded-full">
                    <Navigation size={10} />
                    {formatDist(distKm)}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <User size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">oleh {job.customerName}</span>
                  {isOwner && (
                    <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">
                      Milikmu
                    </span>
                  )}
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
                  icon={<Clock size={14} className="text-gray-400" />}
                  label="Diposting"
                  value={formatDate(job.createdAt)}
                />
              </div>

              {/* Total budget highlight */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-4 py-3
                              flex items-center justify-between border border-blue-100">
                <div>
                  <p className="text-[11px] text-gray-500">Total Budget</p>
                  <p className="text-lg font-black text-blue-600">
                    Rp {(job.budgetPerDay * job.durationDays).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">
                    Rp {job.budgetPerDay.toLocaleString('id-ID')} × {job.durationDays} hari
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi</p>
                <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Todo list */}
              {job.todoList && job.todoList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Yang Perlu Dikerjakan
                  </p>
                  <div className="space-y-2">
                    {job.todoList.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckSquare size={15} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {!isOwner && job.status === 'OPEN' && (
                <button
                  onClick={handleOffer}
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

              {job.status === 'CLOSED' && !isOwner && (
                <div className="w-full py-3.5 bg-gray-100 text-gray-500 font-semibold
                                rounded-2xl text-center text-sm">
                  Pekerjaan ini sudah ditutup
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
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
    <div className="bg-gray-50 rounded-2xl px-3 py-2.5 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}
