'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Star, ArrowUpDown, X, ChevronRight, Image as ImageIcon,
} from 'lucide-react';
import { Review } from '@/types';
import { dummyMyRatings } from '@/data/dummyMyRatings';
import AuthGuard from '@/components/providers/AuthGuard';

// ── Types ──────────────────────────────────────────────────────────────────
type SortKey = 'rating_desc' | 'rating_asc' | 'date_desc' | 'date_asc';

interface LightboxState { photos: string[]; index: number }

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc',   label: 'Terbaru'   },
  { value: 'date_asc',    label: 'Terlama'   },
  { value: 'rating_desc', label: 'Tertinggi' },
  { value: 'rating_asc',  label: 'Terendah'  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function sortReviews(reviews: Review[], key: SortKey): Review[] {
  return [...reviews].sort((a, b) => {
    switch (key) {
      case 'rating_desc': return b.rating - a.rating;
      case 'rating_asc':  return a.rating - b.rating;
      case 'date_desc':   return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date_asc':    return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={rating >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-violet-400', 'bg-rose-400',
  'bg-emerald-400', 'bg-amber-400', 'bg-indigo-400',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({ state, onClose }: { state: LightboxState; onClose: () => void }) {
  const [idx, setIdx] = useState(state.index);
  const photos = state.photos;
  const total  = photos.length;

  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm font-medium">{idx + 1} / {total}</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center px-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        )}

        {/* Main image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[idx]}
          alt={`Foto ${idx + 1}`}
          className="max-h-full max-w-full rounded-xl object-contain select-none"
          draggable={false}
        />

        {/* Next */}
        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div
          className="flex items-center justify-center gap-1.5 py-4 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${
                i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip (only when > 1 photo) */}
      {total > 1 && (
        <div
          className="flex gap-2 px-4 pb-5 shrink-0 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              onClick={() => setIdx(i)}
              className={`shrink-0 w-14 h-14 rounded-lg object-cover cursor-pointer transition-all ${
                i === idx
                  ? 'ring-2 ring-white opacity-100'
                  : 'opacity-40 hover:opacity-70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Rating summary ─────────────────────────────────────────────────────────
function RatingSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg   = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5 mx-4 mt-4">
      <div className="flex items-center gap-4">
        <div className="text-center shrink-0 w-20">
          <p className="text-5xl font-black text-gray-900">{avg.toFixed(1)}</p>
          <StarRow rating={Math.round(avg)} size={13} />
          <p className="text-xs text-gray-400 mt-1">{total} ulasan</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {counts.map(({ star, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-3 text-right">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Review card ────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  onPhotoClick,
}: {
  review: Review;
  onPhotoClick: (photos: string[], index: number) => void;
}) {
  const initial = review.userName.charAt(0).toUpperCase();
  const color   = avatarColor(review.userName);
  const photos  = review.photos ?? [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-2.5">
        <div className={`shrink-0 w-9 h-9 rounded-full ${color} flex items-center justify-center`}>
          <span className="text-sm font-bold text-white">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{review.userName}</p>
            <p className="shrink-0 text-[11px] text-gray-400">{formatDate(review.date)}</p>
          </div>
          <StarRow rating={review.rating} size={12} />
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

      {/* Photo strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => onPhotoClick(photos, i)}
              className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              {/* "+N more" overlay on last visible thumb when photos > 3 */}
              {i === 2 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+{photos.length - 3}</span>
                </div>
              )}
            </button>
          ))}
          {/* Photo count chip */}
          <div className="shrink-0 flex items-center gap-1 pl-1 text-[11px] text-gray-400">
            <ImageIcon size={11} />
            {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page content ───────────────────────────────────────────────────────────
function MyRatingContent() {
  const router = useRouter();
  const [sort, setSort]         = useState<SortKey>('date_desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const sorted = useMemo(() => sortReviews(dummyMyRatings, sort), [sort]);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '';

  return (
    <>
      <div className="min-h-dvh bg-gray-50 flex flex-col pb-8">

        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Kembali</span>
            </button>
            <h1 className="text-base font-bold text-gray-900">Rating Saya</h1>
            <div className="w-16" />
          </div>
        </header>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <RatingSummary reviews={dummyMyRatings} />

        {/* ── Sort bar ────────────────────────────────────────────────────── */}
        <div className="px-4 mt-4 mb-1 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">{sorted.length} ulasan</p>
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              <ArrowUpDown size={12} className="text-gray-400" />
              {currentLabel}
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden w-36">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sort === opt.value
                          ? 'bg-amber-50 text-amber-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Review list ─────────────────────────────────────────────────── */}
        <div className="px-4 space-y-3 mt-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <Star size={24} className="text-amber-300 fill-amber-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Belum ada ulasan</p>
              <p className="text-xs text-gray-400">Ulasan dari pelanggan akan muncul di sini.</p>
            </div>
          ) : (
            sorted.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onPhotoClick={(photos, index) => setLightbox({ photos, index })}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox state={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

export default function MyRatingPage() {
  return (
    <AuthGuard>
      <MyRatingContent />
    </AuthGuard>
  );
}
