'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Lock, Phone, MapPin, Calendar, CreditCard,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Upload, ScanLine,
  Mars, Venus,
} from 'lucide-react';
import { useSignupForm } from '@/hooks/useSignupForm';
import { LocationState } from '@/hooks/useLocation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ─── KTP Upload Card ──────────────────────────────────────────────────────────

function KTPUploadCard({
  preview, ocrLoading, ocrDone, onChange,
}: {
  preview?: string;
  ocrLoading: boolean;
  ocrDone: boolean;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">Foto KTP</label>
        <span className="text-xs text-gray-400">Untuk verifikasi &amp; auto-isi data</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-400 bg-gray-50">
          <Image src={preview} alt="KTP Preview" width={400} height={250}
            className="w-full h-40 object-cover" />

          {ocrLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
              <Loader2 size={28} className="animate-spin text-white" />
              <p className="text-xs font-semibold text-white">Membaca data KTP…</p>
            </div>
          )}

          {ocrDone && !ocrLoading && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
              <CheckCircle2 size={11} /> Data berhasil dibaca
            </div>
          )}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-white transition"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-8 text-blue-500 hover:border-blue-400 hover:bg-blue-100 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
            <ScanLine size={24} className="text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">Upload Foto KTP</p>
            <p className="text-xs text-blue-400 mt-0.5">Nama, tanggal lahir &amp; jenis kelamin otomatis terisi</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white">
            <Upload size={13} /> Pilih Foto
          </div>
        </button>
      )}
    </div>
  );
}

// ─── Gender Selector ──────────────────────────────────────────────────────────

function GenderSelector({
  value, onSelect, ocrDone, error,
}: {
  value?: 'MALE' | 'FEMALE';
  onSelect: (g: 'MALE' | 'FEMALE') => void;
  ocrDone: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
        {ocrDone && value && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 size={12} /> dari KTP
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Laki-laki */}
        <button
          type="button"
          onClick={() => onSelect('MALE')}
          className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
            value === 'MALE'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            value === 'MALE' ? 'bg-blue-500' : 'bg-gray-100'
          }`}>
            <Mars size={18} className={value === 'MALE' ? 'text-white' : 'text-gray-500'} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${value === 'MALE' ? 'text-blue-600' : 'text-gray-700'}`}>
              Laki-laki
            </p>
          </div>
          {value === 'MALE' && (
            <CheckCircle2 size={16} className="ml-auto text-blue-500" />
          )}
        </button>

        {/* Perempuan */}
        <button
          type="button"
          onClick={() => onSelect('FEMALE')}
          className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
            value === 'FEMALE'
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 bg-white hover:border-pink-300'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            value === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-100'
          }`}>
            <Venus size={18} className={value === 'FEMALE' ? 'text-white' : 'text-gray-500'} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${value === 'FEMALE' ? 'text-pink-600' : 'text-gray-700'}`}>
              Perempuan
            </p>
          </div>
          {value === 'FEMALE' && (
            <CheckCircle2 size={16} className="ml-auto text-pink-500" />
          )}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Location Widget ──────────────────────────────────────────────────────────

function LocationWidget({ status, latitude, longitude, errorMsg, retry }: LocationState) {
  if (status === 'requesting' || status === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3">
        <Loader2 size={18} className="animate-spin shrink-0 text-blue-500" />
        <p className="text-sm font-medium text-blue-600">Mendapatkan lokasi…</p>
      </div>
    );
  }
  if (status === 'success' && latitude !== undefined && longitude !== undefined) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-green-400 bg-green-50 px-4 py-3">
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-700">Lokasi berhasil didapatkan</p>
          <p className="font-mono text-xs text-green-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
        </div>
        <button type="button" onClick={retry} className="text-green-400 hover:text-green-600">
          <RefreshCw size={15} />
        </button>
      </div>
    );
  }
  if (status === 'denied') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700">Izin lokasi ditolak</p>
          <p className="text-xs text-amber-600 mt-0.5">Aktifkan izin di address bar, lalu klik Coba Lagi.</p>
        </div>
        <button type="button" onClick={retry}
          className="rounded-xl bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
          Coba Lagi
        </button>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-600">Gagal mendapatkan lokasi</p>
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
        <button type="button" onClick={retry}
          className="rounded-xl bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
          Coba Lagi
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={retry}
      className="flex w-full items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
    >
      <MapPin size={18} />
      <span className="flex-1 text-left">Ambil Lokasi Sekarang</span>
      <span className="text-xs text-gray-400">Opsional</span>
    </button>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function SignupForm() {
  const router = useRouter();

  function handleSuccess() {
    router.push('/dashboard');
  }

  const {
    register, errors, isSubmitting, submitError,
    location,
    ktpPreview, ocrLoading, ocrDone, handleKtpChange,
    setValue, watch,
    onSubmit,
  } = useSignupForm(handleSuccess);

  const gender    = watch('gender');
  const birthDate = watch('birthDate');
  const nik       = watch('nik');

  // Scroll ke atas saat ada error submit
  useEffect(() => {
    if (submitError) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submitError]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      {/* ── Submit Error (top, always visible) ── */}
      {Boolean(submitError) && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
          <p className="text-sm font-medium text-red-600">{submitError}</p>
        </div>
      )}

      {/* ── KTP Upload ── */}
      <KTPUploadCard
        preview={ktpPreview}
        ocrLoading={ocrLoading}
        ocrDone={ocrDone}
        onChange={handleKtpChange}
      />

      {/* ── NIK ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">NIK</label>
          {ocrDone && nik?.length === 16 && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 size={12} /> dari KTP
            </span>
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <CreditCard size={18} />
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            placeholder={ocrLoading ? 'Membaca dari KTP…' : '16 digit NIK sesuai KTP'}
            className={`
              w-full rounded-2xl border-2 bg-white py-3 pl-10 pr-4 text-sm text-gray-800
              outline-none transition-all placeholder:text-gray-400 tracking-widest
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100
              ${errors.nik ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
            `}
            {...register('nik')}
          />
          {nik && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${
              nik.length === 16 ? 'text-green-500' : 'text-gray-400'
            }`}>
              {nik.length}/16
            </span>
          )}
        </div>
        {errors.nik && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} /> {errors.nik.message}
          </p>
        )}
      </div>

      {/* ── Nama (auto-filled by OCR) ── */}
      <div className="relative">
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder={ocrLoading ? 'Membaca dari KTP…' : 'Masukkan nama lengkap'}
          icon={ocrLoading
            ? <Loader2 size={18} className="animate-spin text-blue-400" />
            : <User size={18} />
          }
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />
        {ocrDone && !errors.name && (
          <span className="absolute right-3 top-9 flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 size={12} /> dari KTP
          </span>
        )}
      </div>

      {/* ── Tanggal Lahir ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
          {ocrDone && birthDate && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 size={12} /> dari KTP
            </span>
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar size={18} />
          </span>
          <input
            type="date"
            suppressHydrationWarning
            max={new Date().toISOString().split('T')[0]}
            className={`
              w-full rounded-2xl border-2 bg-white py-3 pl-10 pr-4 text-sm text-gray-800
              outline-none transition-all placeholder:text-gray-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100
              ${errors.birthDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
            `}
            {...register('birthDate')}
          />
        </div>
        {errors.birthDate && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} /> {errors.birthDate.message}
          </p>
        )}
      </div>

      {/* ── Jenis Kelamin ── */}
      <GenderSelector
        value={gender}
        onSelect={(g) => setValue('gender', g, { shouldValidate: true })}
        ocrDone={ocrDone}
        error={errors.gender?.message}
      />

      <Input
        label="Email" type="email" placeholder="email@contoh.com"
        icon={<Mail size={18} />} error={errors.email?.message} autoComplete="email"
        {...register('email')}
      />

      <Input
        label="Nomor HP" type="tel" placeholder="08xxxxxxxxxx"
        icon={<Phone size={18} />} error={errors.phone?.message} autoComplete="tel"
        {...register('phone')}
      />

      <Input
        label="Password" type="password" placeholder="Minimal 6 karakter"
        icon={<Lock size={18} />} error={errors.password?.message} autoComplete="new-password"
        {...register('password')}
      />

      <Input
        label="Konfirmasi Password" type="password" placeholder="Ulangi password"
        icon={<Lock size={18} />} error={errors.confirmPassword?.message} autoComplete="new-password"
        {...register('confirmPassword')}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Lokasi</label>
          <span className="text-xs text-gray-400">Opsional</span>
        </div>
        <LocationWidget {...location} />
      </div>

      <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
        Daftar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-blue-500 hover:underline">
          Masuk di sini
        </Link>
      </p>

    </form>
  );
}
