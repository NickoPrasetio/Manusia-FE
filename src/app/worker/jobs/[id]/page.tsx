'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, MapPin, Clock, Wallet, CheckSquare,
  CalendarDays, Loader2, AlertCircle, Briefcase,
  Share2, Copy, Check, X, MessageCircle, Send,
} from 'lucide-react';
import { JobCategory, NearbyJob } from '@/types';
import { useJobDetail } from '@/hooks/useJobDetail';
import AuthGuard from '@/components/providers/AuthGuard';

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_META: Record<JobCategory, {
  label: string;
  gradient: string;
  badge: string;
  dot: string;
}> = {
  TASK:    {
    label:    'Task',
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    badge:    'bg-blue-400/20 text-blue-100',
    dot:      'bg-blue-300',
  },
  PROJECT: {
    label:    'Project',
    gradient: 'from-violet-500 via-violet-600 to-violet-700',
    badge:    'bg-violet-400/20 text-violet-100',
    dot:      'bg-violet-300',
  },
  EVENT:   {
    label:    'Event',
    gradient: 'from-rose-500 via-rose-600 to-rose-700',
    badge:    'bg-rose-400/20 text-rose-100',
    dot:      'bg-rose-300',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

function buildShareText(job: NearbyJob, url: string): string {
  const budget = `Rp ${job.budgetPerDay.toLocaleString('id-ID')}/hari`;
  const desc   = job.description.length > 120
    ? job.description.slice(0, 120) + '…'
    : job.description;
  return (
    `*${job.title}*\n` +
    `${desc}\n\n` +
    `💰 ${budget}\n` +
    `📍 ${job.city}\n` +
    `⏱ ${job.durationDays} hari kerja\n\n` +
    `Lihat detail: ${url}`
  );
}

// ── Share sheet (fallback modal) ───────────────────────────────────────────
function ShareSheet({
  job,
  url,
  onClose,
}: {
  job: NearbyJob;
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const shareText = buildShareText(job, url);

  const options = [
    {
      id: 'copy',
      icon: copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-gray-600" />,
      label: copied ? 'Tersalin!' : 'Salin Link',
      sub: url.length > 40 ? url.slice(0, 40) + '…' : url,
      bg: copied ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200',
      onClick: handleCopy,
    },
    {
      id: 'whatsapp',
      icon: <MessageCircle size={20} className="text-green-500" />,
      label: 'WhatsApp',
      sub: 'Kirim ke kontak WhatsApp',
      bg: 'bg-green-50 border-green-100',
      onClick: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
      },
    },
    {
      id: 'telegram',
      icon: <Send size={20} className="text-blue-500" />,
      label: 'Telegram',
      sub: 'Bagikan lewat Telegram',
      bg: 'bg-blue-50 border-blue-100',
      onClick: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl px-4 pt-4 pb-8 shadow-2xl animate-slide-up">

        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Bagikan Pekerjaan</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={opt.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all active:scale-[0.98] ${opt.bg}`}
            >
              <div className="shrink-0 w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                {opt.icon}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400 truncate">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Page content ───────────────────────────────────────────────────────────
function JobDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { job, isLoading, isError } = useJobDetail(id);
  const [showSheet, setShowSheet] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Try native Web Share API first; fall back to custom sheet
  const handleShare = useCallback(async () => {
    if (!job) return;
    const url   = pageUrl;
    const text  = buildShareText(job, url);

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: job.title, text, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to sheet
      }
    }
    setShowSheet(true);
  }, [job, pageUrl]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  // ── Error / Not found ────────────────────────────────────────────────────
  if (isError || !job) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-gray-700 font-semibold">Pekerjaan tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-emerald-600 font-semibold hover:underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  const meta = CATEGORY_META[job.category];

  return (
    <>
      <div className="min-h-dvh bg-gray-50 flex flex-col">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className={`bg-gradient-to-br ${meta.gradient} px-5 pt-12 pb-10 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Top row: back + share */}
          <div className="relative flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>

            <button
              onClick={handleShare}
              aria-label="Bagikan pekerjaan"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors active:scale-95"
            >
              <Share2 size={17} className="text-white" />
            </button>
          </div>

          {/* Category badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-black text-white leading-tight mb-1">
            {job.title}
          </h1>
          <p className="text-white/70 text-sm">{job.customerName}</p>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 bg-gray-50 rounded-t-3xl -mt-5 px-4 pt-6 pb-28 space-y-4">

          {/* Quick info chips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Wallet size={14} className="text-emerald-500" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Bayaran</span>
              </div>
              <p className="text-base font-black text-gray-900">
                Rp {job.budgetPerDay.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-gray-400">per hari</p>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={14} className="text-amber-500" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Durasi</span>
              </div>
              <p className="text-base font-black text-gray-900">{job.durationDays}</p>
              <p className="text-[11px] text-gray-400">hari kerja</p>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin size={14} className="text-blue-500" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Lokasi</span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{job.city}</p>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <CalendarDays size={14} className="text-indigo-500" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Diposting</span>
              </div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{formatDate(job.createdAt)}</p>
              <p className="text-[11px] text-gray-400">{formatTime(job.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={15} className="text-gray-400" />
              <h2 className="text-sm font-bold text-gray-700">Deskripsi</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Todo list */}
          {job.todoList.length > 0 && (
            <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-700">Yang Perlu Dikerjakan</h2>
              </div>
              <ul className="space-y-2">
                {job.todoList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Fixed bottom CTA ────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Share shortcut */}
            <button
              onClick={handleShare}
              aria-label="Bagikan"
              className="shrink-0 w-14 h-14 rounded-2xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
            >
              <Share2 size={20} className="text-gray-500" />
            </button>

            {/* Main CTA */}
            <button
              onClick={() => alert('Fitur ini segera hadir!')}
              className={`flex-1 h-14 rounded-2xl font-bold text-white text-base bg-gradient-to-r ${meta.gradient} shadow-lg active:scale-[0.98] transition-transform`}
            >
              Coba Membantu
            </button>
          </div>
        </div>

      </div>

      {/* ── Share sheet (fallback) ───────────────────────────────────────── */}
      {showSheet && (
        <ShareSheet
          job={job}
          url={pageUrl}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}

// ── Route export ───────────────────────────────────────────────────────────
export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <JobDetailContent id={id} />
    </AuthGuard>
  );
}
