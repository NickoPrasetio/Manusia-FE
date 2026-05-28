'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, Loader2 } from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { reviewApi, ReviewApiResponse } from '@/lib/api/review.api';

// ── Star renderer ─────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewApiResponse }) {
  const initials = review.userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const dateLabel = new Date(review.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-blue-500">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{review.userName}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{dateLabel}</p>
        </div>
        <Stars rating={review.rating} size={13} />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {review.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`foto ulasan ${i + 1}`}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function RatingSummary({ reviews }: { reviews: ReviewApiResponse[] }) {
  if (reviews.length === 0) return null;

  const avg   = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const total = reviews.length;

  // distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex gap-5 items-center">
      {/* Big number */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-4xl font-black text-gray-900">{avg.toFixed(1)}</span>
        <Stars rating={Math.round(avg)} size={14} />
        <span className="text-[11px] text-gray-400 mt-1">{total} ulasan</span>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex flex-col gap-1">
        {dist.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-3 text-right">{star}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] text-gray-400 w-3">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function MyReviewsContent() {
  const user  = useAuthStore((s) => s.user);
  const [reviews,   setReviews]   = useState<ReviewApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError,   setIsError]   = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    reviewApi
      .getByWorker(user.id)
      .then((data) => {
        // reviewApi returns Review[], but we need ReviewApiResponse[] - cast safely
        setReviews(data as unknown as ReviewApiResponse[]);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-12">

      {/* Summary */}
      {!isLoading && !isError && <RatingSummary reviews={reviews} />}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat ulasan…</span>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">😕</span>
          <p className="text-sm font-semibold text-gray-700">Gagal memuat ulasan</p>
          <p className="text-xs text-gray-400">Coba lagi beberapa saat</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && reviews.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
            <MessageSquare size={28} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Belum ada ulasan</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Selesaikan pekerjaan dan minta pelangganmu memberikan ulasan!
            </p>
          </div>
        </div>
      )}

      {/* Review list */}
      {!isLoading && !isError && reviews.length > 0 && (
        <>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Semua Ulasan
          </p>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-[#f0f4f8]">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link
              href="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Seberapa Baik Saya?</h1>
              <p className="text-[11px] text-gray-400">Ulasan dari pelangganmu</p>
            </div>
          </div>
        </div>

        <MyReviewsContent />
      </main>
    </AuthGuard>
  );
}
