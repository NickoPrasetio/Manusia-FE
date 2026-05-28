'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Loader2, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { jobApi, CreateJobPayload } from '@/lib/api/job.api';
import { JobCategory } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: JobCategory; label: string; desc: string }[] = [
  { value: 'TASK',    label: 'Task',    desc: 'Pekerjaan singkat & spesifik' },
  { value: 'PROJECT', label: 'Project', desc: 'Proyek bertahap'              },
  { value: 'EVENT',   label: 'Event',   desc: 'Keperluan acara'              },
];

const INITIAL_FORM = {
  title:        '',
  description:  '',
  category:     'TASK' as JobCategory,
  budgetPerDay: '',
  durationDays: '1',
  city:         '',
  todoItems:    [''],
};

// ── Main component ───────────────────────────────────────────────────────────

export default function PostJobButton() {
  const { token, user } = useAuthStore();
  const queryClient    = useQueryClient();

  const [open,    setOpen]    = useState(false);
  const [done,    setDone]    = useState(false);
  const [form,    setForm]    = useState(INITIAL_FORM);

  // Only render for customers
  if (user?.userType !== 'CUSTOMER') return null;

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => jobApi.create(payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-jobs'] });
      setDone(true);
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const close = () => {
    setOpen(false);
    // Reset form after animation finishes
    setTimeout(() => { setForm(INITIAL_FORM); setDone(false); mutation.reset(); }, 300);
  };

  const addTodo    = () =>
    setForm(f => ({ ...f, todoItems: [...f.todoItems, ''] }));
  const removeTodo = (i: number) =>
    setForm(f => ({ ...f, todoItems: f.todoItems.filter((_, idx) => idx !== i) }));
  const updateTodo = (i: number, val: string) =>
    setForm(f => ({ ...f, todoItems: f.todoItems.map((t, idx) => idx === i ? val : t) }));

  const handleBudgetChange = (raw: string) => {
    const digits    = raw.replace(/\D/g, '');
    const formatted = digits ? Number(digits).toLocaleString('id-ID') : '';
    setForm(f => ({ ...f, budgetPerDay: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      customerName: user!.name,
      title:        form.title.trim(),
      description:  form.description.trim(),
      category:     form.category,
      budgetPerDay: parseInt(form.budgetPerDay.replace(/\D/g, ''), 10),
      durationDays: parseInt(form.durationDays, 10),
      city:         form.city.trim(),
      latitude:     user?.latitude  ?? 0,
      longitude:    user?.longitude ?? 0,
      todoList:     form.todoItems.filter(t => t.trim() !== ''),
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all"
      >
        <Plus size={18} strokeWidth={2.5} />
        Minta Tolong
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Bottom sheet */}
      {open && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-bold text-gray-900">Buat Permintaan</h2>
            <button
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* ── Success screen ── */}
          {done ? (
            <div className="flex flex-col items-center justify-center gap-4 flex-1 px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={34} className="text-green-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Permintaan Terkirim!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Pekerja di sekitarmu dapat melihat dan merespons permintaanmu.
                </p>
              </div>
              <button
                onClick={close}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl transition-colors"
              >
                Tutup
              </button>
            </div>
          ) : (

          /* ── Form ── */
          <form onSubmit={handleSubmit} className="overflow-y-auto flex flex-col gap-5 px-5 py-5 pb-10">

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`rounded-xl p-3 text-left border transition-all ${
                      form.category === cat.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-xs font-bold ${form.category === cat.value ? 'text-blue-600' : 'text-gray-700'}`}>
                      {cat.label}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Judul Pekerjaan</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="cth. Perbaikan Atap Bocor"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Deskripsi</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Jelaskan pekerjaan yang dibutuhkan secara detail…"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Budget + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Budget/Hari (Rp)</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={form.budgetPerDay}
                  onChange={e => handleBudgetChange(e.target.value)}
                  placeholder="300.000"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Durasi (Hari)</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kota</label>
              <input
                required
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="cth. Jakarta Selatan"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Todo list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500">Daftar Tugas <span className="font-normal text-gray-400">(opsional)</span></label>
                <button
                  type="button"
                  onClick={addTodo}
                  className="flex items-center gap-1 text-[11px] text-blue-500 font-semibold hover:text-blue-600"
                >
                  <PlusCircle size={13} />
                  Tambah
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {form.todoItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0 text-right">{i + 1}.</span>
                    <input
                      value={item}
                      onChange={e => updateTodo(i, e.target.value)}
                      placeholder={`Tugas ke-${i + 1}`}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    {form.todoItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTodo(i)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {mutation.isError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-xl">
                Gagal mengirim permintaan. Pastikan semua kolom terisi dan coba lagi.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Mengirim…
                </>
              ) : (
                'Kirim Permintaan 🚀'
              )}
            </button>
          </form>
          )}
        </div>
      )}
    </>
  );
}
