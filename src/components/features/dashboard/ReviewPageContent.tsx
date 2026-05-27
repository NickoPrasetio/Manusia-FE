'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, Star, Trash2, Loader2,
  CheckCircle2, AlertCircle, ImagePlus,
} from 'lucide-react';
import { useSubmitOrderReviewMutation } from '@/hooks/useSubmitOrderReviewMutation';
import { useCustomerOrdersQuery } from '@/hooks/useCustomerOrdersQuery';

const MAX_PHOTOS     = 5;
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Buruk',
  2: 'Buruk',
  3: 'Cukup',
  4: 'Bagus',
  5: 'Sangat Bagus!',
};

interface PhotoItem {
  file:    File;
  preview: string;
  error?:  string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star} type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={44}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewPageContent({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: orders, isLoading, isError } = useCustomerOrdersQuery();
  const booking = orders?.find((o) => o.id === bookingId);

  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [photos,  setPhotos]  = useState<PhotoItem[]>([]);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const submitMutation = useSubmitOrderReviewMutation();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).map<PhotoItem>((file) => {
      if (file.size > MAX_SIZE_BYTES) return { file, preview: '', error: `${file.name} melebihi 50 MB` };
      return { file, preview: URL.createObjectURL(file) };
    });
    setPhotos((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const validPhotos = photos.filter((p) => !p.error);
  const hasPhotoErr = photos.some((p) => !!p.error);
  const canSubmit   = rating > 0 && !hasPhotoErr && !submitMutation.isPending;

  function handleSubmit() {
    if (!canSubmit || !booking) return;
    submitMutation.mutate({
      workerId:  booking.workerId,
      bookingId: booking.id,
      rating,
      comment:   comment.trim(),
      photos:    validPhotos.map((p) => p.file),
    });
  }

  const Header = ({ subtitle }: { subtitle?: string }) => (
    <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
      <button
        onClick={() => router.push('/dashboard/orders')}
        className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
      >
        <ArrowLeft size={18} className="text-blue-500" />
      </button>
      <div>
        <h1 className="font-bold text-gray-900 text-base">Tulis Ulasan</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-dvh bg-[#f8fafc]">
        <Header />
        <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Memuat data…</span>
        </div>
      </main>
    );
  }

  if (isError || !booking) {
    return (
      <main className="flex flex-col min-h-dvh bg-[#f8fafc]">
        <Header />
        <div className="flex flex-col items-center gap-4 py-20 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={26} className="text-red-400" />
          </div>
          <p className="text-sm text-red-500 font-semibold">Gagal memuat data order</p>
          <button onClick={() => router.push('/dashboard/orders')} className="text-blue-500 text-sm font-semibold">
            Kembali ke Order Saya
          </button>
        </div>
      </main>
    );
  }

  if (submitMutation.isSuccess) {
    return (
      <main className="flex flex-col min-h-dvh bg-[#f8fafc] items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Ulasan Terkirim!</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Terima kasih sudah memberikan ulasan untuk {booking.workerName ?? 'pekerja ini'}!
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="w-full max-w-xs rounded-2xl bg-blue-500 text-white py-4 font-bold text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-200"
        >
          Kembali ke Order Saya
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-dvh bg-[#f8fafc]">
      <Header subtitle="Bagikan pengalamanmu" />

      <div className="px-4 py-6 flex flex-col gap-6 pb-12">

        {/* Worker info */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm px-4 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-100 shrink-0">
            {booking.workerAvatar
              ? <img src={booking.workerAvatar} alt={booking.workerName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold text-xl">{booking.workerName?.[0] ?? '?'}</div>
            }
          </div>
          <div>
            <p className="text-xs text-gray-400">Ulasan untuk</p>
            <p className="font-bold text-gray-900">{booking.workerName ?? 'Pekerja'}</p>
          </div>
        </div>

        {/* Star rating */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-4 py-8 flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-gray-700">Rating Kamu</p>
          <StarPicker value={rating} onChange={setRating} />
          <p className={`text-sm font-bold transition-all ${rating ? 'text-amber-500' : 'text-gray-300'}`}>
            {rating ? RATING_LABELS[rating] : 'Pilih bintang…'}
          </p>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-4 py-5 flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">
            Komentar <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu bekerja dengan orang ini…"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-gray-50"
          />
        </div>

        {/* Photo upload */}
        <div className="flex flex-col gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm px-4 py-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Foto Hasil Kerja <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS} · max 50 MB</span>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((item, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {item.error
                    ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-red-50">
                        <AlertCircle size={20} className="text-red-400 mb-1" />
                        <p className="text-[10px] text-red-500 text-center leading-tight">{item.error}</p>
                      </div>
                    )
                    : <img src={item.preview} alt={`foto-${idx + 1}`} className="w-full h-full object-cover" />
                  }
                  <button
                    type="button" onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <ImagePlus size={20} className="text-blue-400" />
                  <span className="text-[10px] text-blue-400 font-medium">Tambah</span>
                </button>
              )}
            </div>
          )}

          {photos.length === 0 && (
            <button
              type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 w-full rounded-2xl border-2 border-dashed border-gray-200 px-4 py-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Camera size={20} className="text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700">Upload Foto</p>
                <p className="text-xs text-gray-400">Max {MAX_PHOTOS} foto · Maks. 50 MB per foto</p>
              </div>
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

          {hasPhotoErr && (
            <div className="flex items-start gap-2 bg-red-50 rounded-2xl px-3 py-2">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-500">Hapus foto yang melebihi batas ukuran sebelum melanjutkan.</p>
            </div>
          )}
        </div>

        {submitMutation.isError && (
          <div className="flex items-start gap-2 bg-red-50 rounded-2xl px-4 py-3">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">
              {submitMutation.error instanceof Error ? submitMutation.error.message : 'Gagal mengirim ulasan. Coba lagi.'}
            </p>
          </div>
        )}

        <button
          type="button" onClick={handleSubmit} disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white py-4 font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 mt-2"
        >
          {submitMutation.isPending
            ? <><Loader2 size={18} className="animate-spin" /> Mengirim…</>
            : <><Star size={16} className="fill-white" /> Kirim Ulasan</>
          }
        </button>

        <p className="text-center text-xs text-gray-400">
          Ulasan hanya dapat dikirim sekali setelah order selesai
        </p>
      </div>
    </main>
  );
}
