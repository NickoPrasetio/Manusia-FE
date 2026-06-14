'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Heart, MessageSquare, Loader2, Star,
  Pencil, X, AlertCircle, AlertTriangle, ImagePlus,
  Trash2, Camera, CheckCircle2, Info,
} from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { ReviewApiResponse } from '@/lib/api/review.api';
import { canEditReview } from '@/domain/review/IReviewRepository';
import {
  validatePhoto, photoErrorMessage,
  PHOTO_RULES, PhotoErrorKind,
} from '@/domain/review/PhotoValidation';
import { useMyGivenReviews } from '@/hooks/useMyGivenReviews';
import { useEditReview } from '@/hooks/useEditReview';
import { Review } from '@/types';

// ── Stars display ─────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

// ── Star Picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition-transform active:scale-90"
        >
          <Star size={32}
            className={`transition-colors ${
              i <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-200 hover:text-amber-200 hover:fill-amber-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Photo item ────────────────────────────────────────────────────────────────

interface PhotoItem {
  file:    File;
  preview: string;
  error?:  PhotoErrorKind;
  warn?:   boolean;
}

// ── Info Popup — sisa edit ────────────────────────────────────────────────────

function EditInfoPopup({
  remaining,
  onClose,
}: {
  remaining: number;
  onClose: () => void;
}) {
  const isLast = remaining === 1;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isLast ? 'bg-orange-100' : 'bg-purple-100'}`}>
          {isLast
            ? <AlertTriangle size={28} className="text-orange-500" />
            : <Info size={28} className="text-purple-500" />
          }
        </div>
        <div>
          <h3 className={`font-bold text-base ${isLast ? 'text-orange-700' : 'text-gray-900'}`}>
            {isLast ? 'Kesempatan Edit Terakhir!' : 'Info Edit Ulasan'}
          </h3>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {isLast
              ? 'Setelah ini ulasan tidak dapat diubah lagi. Pastikan ulasanmu sudah sesuai sebelum menyimpan.'
              : `Kamu masih memiliki ${remaining} kesempatan untuk mengedit ulasan ini.`
            }
          </p>
        </div>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 ${
            isLast ? 'bg-orange-500 hover:bg-orange-400' : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          Mengerti, Lanjutkan
        </button>
      </div>
    </div>
  );
}

// ── Last-chance Confirmation Dialog ──────────────────────────────────────────

function LastChanceDialog({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel:  () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">Yakin dengan ulasan ini?</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Ini adalah <span className="font-bold text-red-500">kesempatan terakhir</span> kamu untuk mengubah ulasan ini. Setelah disimpan, ulasan tidak bisa diedit lagi.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
            Periksa Lagi
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white bg-red-500 hover:bg-red-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {isPending ? 'Menyimpan...' : 'Ya, Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Size Warning Popup ────────────────────────────────────────────────────────

function SizeWarnPopup({ fileNames, onClose }: { fileNames: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-base text-gray-900">Ukuran Foto Besar</h3>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {fileNames.length === 1
              ? `"${fileNames[0]}" berukuran lebih dari 5 MB.`
              : `${fileNames.length} foto berukuran lebih dari 5 MB.`
            }
            {' '}Foto tetap dapat diunggah, namun mungkin memerlukan waktu lebih lama.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-400 transition-all active:scale-95"
        >
          Oke, Tetap Upload
        </button>
      </div>
    </div>
  );
}

// ── Photo Upload section ──────────────────────────────────────────────────────

function PhotoUploadSection({
  photos,
  onChange,
  onWarn,
}: {
  photos:   PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onWarn:   (names: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = PHOTO_RULES.maxCount - photos.length;
    const toProcess = files.slice(0, remaining);

    const warnNames: string[] = [];
    const items: PhotoItem[] = toProcess.map((file) => {
      const result = validatePhoto(file);
      if (!result.valid) {
        return { file, preview: '', error: result.error };
      }
      if (result.warn) warnNames.push(file.name);
      return { file, preview: URL.createObjectURL(file), warn: result.warn };
    });

    onChange([...photos, ...items]);
    if (warnNames.length) onWarn(warnNames);
    e.target.value = '';
  }

  function remove(idx: number) {
    const updated = [...photos];
    if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview);
    updated.splice(idx, 1);
    onChange(updated);
  }

  const hasError = photos.some((p) => !!p.error);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600">
          Foto <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <span className="text-[10px] text-gray-400">
          {photos.length}/{PHOTO_RULES.maxCount} · JPG/PNG · maks 10 MB
        </span>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((item, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
              {item.error
                ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-red-50">
                    <AlertCircle size={16} className="text-red-400 mb-0.5" />
                    <p className="text-[9px] text-red-500 text-center leading-tight">
                      {photoErrorMessage(item.error)}
                    </p>
                  </div>
                )
                : (
                  <>
                    <img src={item.preview} alt={`foto-${idx + 1}`} className="w-full h-full object-cover" />
                    {item.warn && (
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-500/80 py-0.5 text-center">
                        <span className="text-[9px] text-white font-semibold">{'>'} 5 MB</span>
                      </div>
                    )}
                  </>
                )
              }
              <button
                type="button" onClick={() => remove(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <Trash2 size={10} className="text-white" />
              </button>
            </div>
          ))}

          {photos.length < PHOTO_RULES.maxCount && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-0.5 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <ImagePlus size={18} className="text-purple-400" />
              <span className="text-[10px] text-purple-400 font-medium">Tambah</span>
            </button>
          )}
        </div>
      )}

      {photos.length === 0 && (
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-200 px-3 py-3 hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Camera size={16} className="text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-700">Upload Foto</p>
            <p className="text-[10px] text-gray-400">
              Maks {PHOTO_RULES.maxCount} foto · JPG, JPEG, PNG · maks 10 MB
            </p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef} type="file" multiple className="hidden"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleFileChange}
      />

      {hasError && (
        <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-500">Hapus foto bermasalah sebelum menyimpan.</p>
        </div>
      )}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const [step, setStep]       = useState<'info' | 'form' | 'confirm'>('info');
  const [rating, setRating]   = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [photos, setPhotos]   = useState<PhotoItem[]>([]);
  const [sizeWarn, setSizeWarn] = useState<string[]>([]);

  const { edit, isPending, error, reset } = useEditReview();
  const remaining = 2 - review.editCount;
  const isLastChance = remaining === 1;
  const hasPhotoError = photos.some((p) => !!p.error);

  const doSave = useCallback(async () => {
    reset();
    const validFiles = photos.filter((p) => !p.error).map((p) => p.file);
    await edit({ review, rating, comment, photos: validFiles });
    onClose();
  }, [edit, review, rating, comment, photos, reset, onClose]);

  function handleSaveClick() {
    if (isLastChance) {
      setStep('confirm');
    } else {
      doSave();
    }
  }

  // Info popup on open
  if (step === 'info') {
    return <EditInfoPopup remaining={remaining} onClose={() => setStep('form')} />;
  }

  return (
    <>
      {/* Size warning popup */}
      {sizeWarn.length > 0 && (
        <SizeWarnPopup fileNames={sizeWarn} onClose={() => setSizeWarn([])} />
      )}

      {/* Last-chance confirmation */}
      {step === 'confirm' && (
        <LastChanceDialog
          onConfirm={doSave}
          onCancel={() => setStep('form')}
          isPending={isPending}
        />
      )}

      {/* Main modal */}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">

          {/* Header */}
          <div className={`flex items-center justify-between px-5 pt-5 pb-3 shrink-0 ${isLastChance ? 'bg-orange-50' : ''}`}>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Ulasan</h2>
              <div className={`flex items-center gap-1 mt-0.5 ${isLastChance ? 'text-orange-500' : 'text-purple-600'}`}>
                {isLastChance && <AlertTriangle size={11} />}
                <p className="text-[11px] font-semibold">
                  {isLastChance
                    ? 'Ini kesempatan terakhirmu!'
                    : `Sisa ${remaining}x kesempatan edit`
                  }
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-4">

            {/* Star picker */}
            <div className="flex flex-col items-center gap-2 py-2">
              <StarPicker value={rating} onChange={setRating} />
              <p className={`text-xs font-semibold ${rating ? 'text-amber-500' : 'text-gray-300'}`}>
                {rating
                  ? ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus!'][rating]
                  : 'Pilih bintang…'
                }
              </p>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Komentar</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tulis ulasanmu..."
                className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
            </div>

            {/* Photo upload */}
            <PhotoUploadSection
              photos={photos}
              onChange={setPhotos}
              onWarn={setSizeWarn}
            />

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{error.message}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSaveClick}
              disabled={isPending || rating < 1 || hasPhotoError}
              className={`w-full py-3.5 font-bold text-sm text-white rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                isLastChance
                  ? 'bg-orange-500 hover:bg-orange-400 shadow-md shadow-orange-200'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-200'
              }`}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
              {isPending ? 'Menyimpan...' : isLastChance ? 'Simpan (Terakhir)' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function GivenReviewCard({ review, onEdit }: { review: ReviewApiResponse; onEdit: (r: Review) => void }) {
  const dateLabel = new Date(review.date + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const domainReview: Review = {
    id:        review.id,
    userId:    review.userId,
    userName:  review.userName,
    rating:    review.rating,
    comment:   review.comment,
    photos:    review.photos ?? [],
    date:      review.date,
    editCount: review.editCount ?? 0,
    createdAt: review.createdAt ?? '',
  };

  const editable = canEditReview(domainReview);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Heart size={18} className="text-purple-500 fill-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400">{dateLabel}</p>
          {review.editCount > 0 && (
            <p className="text-[10px] text-gray-300 mt-0.5">
              Diedit {review.editCount}x · sisa {2 - review.editCount}x
            </p>
          )}
          {review.editCount >= 2 && (
            <p className="text-[10px] text-red-300 mt-0.5">Tidak bisa diedit lagi</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={review.rating} />
          {editable && (
            <button onClick={() => onEdit(domainReview)}
              className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors shrink-0"
              title="Edit ulasan"
            >
              <Pencil size={13} className="text-purple-500" />
            </button>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {review.photos.map((url, i) => (
            <img key={i} src={url} alt={`foto ulasan ${i + 1}`}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page Content ──────────────────────────────────────────────────────────────

function MyGivenReviewsContent() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<Review | null>(null);

  const { reviews, total, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useMyGivenReviews();

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
    <>
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
                <GivenReviewCard key={r.id} review={r} onEdit={setEditing} />
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

      {editing && <EditModal review={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function MyGivenReviewsPage() {
  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-[#f0f4f8]">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link href="/dashboard"
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
