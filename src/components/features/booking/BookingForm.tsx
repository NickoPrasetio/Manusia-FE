'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarDays,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useCreateBookingMutation } from '@/hooks/useCreateBookingMutation';
import { useAuthStore } from '@/store/authStore';
import { Worker } from '@/types';
import { INDONESIAN_CITIES } from '@/data/indonesian-cities';

/* ─── schema ─────────────────────────────────────────────── */
const schema = z.object({
  address:       z.string().min(5,  'Masukkan alamat lengkap'),
  city:          z.string().min(1,  'Pilih kota'),
  bookingDate:   z.string().min(1,  'Pilih tanggal'),
  startTime:     z.string().min(1,  'Pilih jam mulai'),
  durationDays:  z.preprocess((v) => Number(v), z.number().min(1).max(30)),
  paymentMethod: z.literal('CASH'),
  notes:         z.string().optional(),
});

type BookingFormValues = {
  address:       string;
  city:          string;
  bookingDate:   string;
  startTime:     string;
  durationDays:  number;
  paymentMethod: 'CASH';
  notes?:        string;
};

interface Props {
  worker: Worker;
}

/* ─── component ──────────────────────────────────────────── */
export default function BookingForm({ worker }: Props) {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateBookingMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      durationDays:  1,
      paymentMethod: 'CASH',
    },
  });

  const durationDays = watch('durationDays') || 1;
  const totalPrice   = worker.pricePerDay * durationDays;

  /* get today's date as min value */
  const today = new Date().toISOString().split('T')[0];

  async function onSubmit(values: BookingFormValues) {
    try {
      const booking = await mutateAsync({
        workerId:      worker.id,
        workerName:    worker.name,
        workerAvatar:  worker.avatar,
        customerName:  user?.name ?? '',
        address:       values.address,
        city:          values.city,
        latitude:      0,
        longitude:     0,
        bookingDate:   values.bookingDate,
        startTime:     values.startTime,
        durationDays:  values.durationDays,
        paymentMethod: values.paymentMethod,
        notes:         values.notes,
      });
      router.push(`/booking/success?id=${booking.id}`);
    } catch {
      router.push('/booking/failed');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Worker summary */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
        <img
          src={worker.avatar || '/avatar-placeholder.png'}
          alt={worker.name}
          className="w-14 h-14 rounded-2xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{worker.name}</p>
          <p className="text-sm text-gray-500 truncate">
            {worker.specializations.slice(0, 2).join(' · ')}
          </p>
          <p className="text-sm font-bold text-blue-600 mt-0.5">
            Rp {worker.pricePerDay.toLocaleString('id-ID')} / hari
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <MapPin size={15} className="text-blue-500" />
          Alamat Lengkap
        </label>
        <textarea
          {...register('address')}
          rows={2}
          placeholder="Jl. Contoh No. 123, RT 01/02..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     resize-none text-sm placeholder:text-gray-400"
        />
        {errors.address && (
          <p className="text-xs text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <MapPin size={15} className="text-blue-500" />
          Kota
        </label>
        <div className="relative">
          <select
            {...register('city')}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       text-sm appearance-none pr-10"
          >
            <option value="">-- Pilih Kota --</option>
            {INDONESIAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        {errors.city && (
          <p className="text-xs text-red-500">{errors.city.message}</p>
        )}
      </div>

      {/* Date + Time row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <CalendarDays size={15} className="text-blue-500" />
            Tanggal
          </label>
          <input
            type="date"
            min={today}
            {...register('bookingDate')}
            className="w-full px-3 py-3 rounded-2xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       text-sm"
          />
          {errors.bookingDate && (
            <p className="text-xs text-red-500">{errors.bookingDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Clock size={15} className="text-blue-500" />
            Jam Mulai
          </label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full px-3 py-3 rounded-2xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       text-sm"
          />
          {errors.startTime && (
            <p className="text-xs text-red-500">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <CalendarDays size={15} className="text-blue-500" />
          Durasi (hari)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={30}
            {...register('durationDays')}
            className="flex-1 accent-blue-500"
          />
          <span className="w-10 text-center font-bold text-blue-600 text-sm">
            {durationDays}
          </span>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <CreditCard size={15} className="text-blue-500" />
          Metode Pembayaran
        </label>
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50 cursor-pointer">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Bayar Tunai</p>
            <p className="text-xs text-gray-500">Bayar langsung saat pekerja tiba</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <FileText size={15} className="text-blue-500" />
          Catatan (opsional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Deskripsi pekerjaan, kebutuhan khusus, dll..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     resize-none text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Price summary */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Rp {worker.pricePerDay.toLocaleString('id-ID')} × {durationDays} hari</span>
          <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                   text-white font-semibold rounded-2xl transition-colors
                   flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Memproses...
          </>
        ) : (
          'Konfirmasi Pemesanan'
        )}
      </button>
    </form>
  );
}
