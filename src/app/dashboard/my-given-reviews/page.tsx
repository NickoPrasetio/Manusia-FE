'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageSquare, Loader2, Star } from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { ReviewApiResponse } from '@/lib/api/review.api';
import { useMyGivenReviews } from '@/hooks/useMyGivenReviews';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

function GivenReviewCard({ review }: { review: ReviewApiResponse }) {
  const dateLabel = new Date(review.date + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Heart size={18} className="text-purple-500 fill-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 mt-0.5">{dateLabel}</p>
        </div>
        <Stars rating={review.rating} />
      </div>

      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

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

function MyGivenReviewsContent() {
  const sentinel = useRef<HTMLDivElement>(null);
  const { reviews, total, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMyGivenReviews();

  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 },
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-12">

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat ulasan…</span>
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
            <MessageSquare size={28} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Belum pernah memberi ulasan</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Selesaikan pesanan dan beri ulasan untuk penolong yang sudah membantumu!
            </p>
          </div>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <>
          <div className="bg-purple-50 rounded-2xl px-4 py-3 flex items-center gap-2">
            <Heart size={16} className="text-purple-500 fill-purple-400 shrink-0" />
            <p className="text-sm font-semibold text-purple-700">
              Kamu sudah memberi <span className="font-black">{total}</span> ulasan
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <GivenReviewCard key={r.id} review={r} />
            ))}
          </div>
        </>
      )}

      <div ref={sentinel} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Memuat lebih banyak…</span>
        </div>
      )}

      {!hasNextPage && reviews.length > 0 && !isLoading && (
        <p className="text-center text-xs text-gray-300 py-2">— Semua ulasan sudah ditampilkan —</p>
      )}
    </div>
  );
}

export default function MyGivenReviewsPage() {
  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-[#f0f4f8]">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link
              href="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Ulasan yang Saya Berikan</h1>
              <p className="text-[11px] text-gray-400">Riwayat ulasan yang kamu tulis</p>
            </div>
          </div>
        </div>
        <MyGivenReviewsContent />
      </main>
    </AuthGuard>
  );
}
