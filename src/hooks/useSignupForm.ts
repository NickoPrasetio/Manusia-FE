'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { signupSchema, SignupFormValues, UserType } from '@/lib/schemas/auth.schema';
import { signupUseCase } from '@/data/auth';
import { useLocation } from './useLocation';

// ─── KTP OCR helpers ──────────────────────────────────────────────────────────

/**
 * Normalize OCR text: collapse whitespace, fix common OCR misreads.
 */
function normalize(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')   // collapse spaces/tabs
    .trim();
}

/**
 * Extract NIK: 16-digit number.
 * Strategies (in order):
 *  1. Regex after "NIK" label (tolerates missing colon, I→1/l misreads, spaces in number)
 *  2. Per-line scan: any line whose digits total exactly 16
 *  3. Full-text scan: first bare 16-digit sequence
 */
function extractNIK(fullText: string): string | null {
  const flat = fullText.replace(/\n/g, ' ');

  // Strategy 1 — label-based, separator optional
  // Handles: "NIK : 32730...", "NlK32730...", "N1K:32730...", spaces between digits
  const m1 = flat.match(/N[I1il][Kk][:\s]*(\d[\d\s]{14,22}\d)/i);
  if (m1) {
    const d = m1[1].replace(/\D/g, '');
    if (d.length === 16) return d;
  }

  // Strategy 2 — per-line, strip non-digits, check exactly 16
  for (const line of fullText.split('\n')) {
    const d = line.replace(/\D/g, '');
    if (d.length === 16) return d;
  }

  // Strategy 3 — any 16 consecutive digits in the text (no spaces needed)
  const m3 = flat.match(/\d{16}/);
  if (m3) return m3[0];

  // Strategy 4 — accumulate adjacent digit-groups until total = 16
  const groups = flat.match(/\d+/g) ?? [];
  let buf = '';
  for (const g of groups) {
    buf += g;
    if (buf.length === 16) return buf;
    if (buf.length > 16)   buf = g; // reset to current group
  }

  return null;
}

/**
 * Extract a labelled field value.
 * Handles lines like "Nama : BUDI SANTOSO" or "Nama BUDI SANTOSO" (no colon).
 */
function extractField(fullText: string, ...keywords: string[]): string | null {
  for (const line of fullText.split('\n')) {
    const lower = line.toLowerCase();
    if (!keywords.some((kw) => lower.includes(kw))) continue;

    // With colon
    if (line.includes(':')) {
      const val = line.split(':').slice(1).join(':').trim();
      if (val.length > 1) return normalize(val);
    }
    // Without colon — everything after the label keyword + optional spaces
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1) {
        const after = line.slice(idx + kw.length).replace(/^[\s/]+/, '').trim();
        if (after.length > 1) return normalize(after);
      }
    }
  }
  return null;
}

/**
 * Convert "DD-MM-YYYY" or "DD/MM/YYYY" from KTP to HTML date "YYYY-MM-DD".
 */
function parseBirthDate(raw: string): string | null {
  const m = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSignupForm(onSuccess: () => void) {
  const { setSession } = useAuthStore();
  const location       = useLocation();
  const [submitError, setSubmitError] = useState('');

  // KTP state
  const [ktpFile,    setKtpFile]    = useState<File | undefined>(undefined);
  const [ktpPreview, setKtpPreview] = useState<string | undefined>(undefined);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone,    setOcrDone]    = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const userType = watch('userType');

  function selectUserType(type: UserType) {
    setValue('userType', type, { shouldValidate: true });
  }

  async function handleKtpChange(file: File) {
    setKtpFile(file);
    setOcrDone(false);

    // Image preview
    const reader = new FileReader();
    reader.onload = (e) => setKtpPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // OCR
    setOcrLoading(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result    = await Tesseract.recognize(file, 'ind+eng');
      const text      = result.data.text;

      // Debug — buka browser console (F12) untuk lihat hasil OCR
      console.log('=== OCR RAW TEXT ===\n' + text);

      // ── NIK ───────────────────────────────────────────────────────────
      const nik = extractNIK(text);
      console.log('=== NIK extracted ===', nik);
      if (nik) setValue('nik', nik, { shouldValidate: true });

      // ── Nama ──────────────────────────────────────────────────────────
      const namaRaw = extractField(text, 'nama');
      if (namaRaw && namaRaw.length > 1) {
        setValue('name', namaRaw, { shouldValidate: true });
      }

      // ── Tanggal Lahir ──────────────────────────────────────────────────
      const lahirRaw = extractField(text, 'tgl lahir', 'tanggal lahir', 'lahir');
      if (lahirRaw) {
        const iso = parseBirthDate(lahirRaw);
        if (iso) setValue('birthDate', iso, { shouldValidate: true });
      }

      // ── Jenis Kelamin ──────────────────────────────────────────────────
      const kelaminRaw = extractField(text, 'kelamin', 'jenis kel');
      if (kelaminRaw) {
        const upper = kelaminRaw.toUpperCase();
        if (upper.includes('LAKI')) {
          setValue('gender', 'MALE',   { shouldValidate: true });
        } else if (upper.includes('PEREMPUAN') || upper.includes('WANITA')) {
          setValue('gender', 'FEMALE', { shouldValidate: true });
        }
      }

      setOcrDone(true);
    } catch (e) {
      console.error('OCR error:', e);
    } finally {
      setOcrLoading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    const result = await signupUseCase.execute({
      nik:       values.nik,
      name:      values.name,
      email:     values.email,
      password:  values.password,
      phone:     values.phone,
      userType:  values.userType,
      birthDate: values.birthDate,
      gender:    values.gender,
      ktpFile,
      latitude:  location.latitude,
      longitude: location.longitude,
    });
    if (result.success) {
      setSession(result.data.user, result.data.token);
      onSuccess();
    } else {
      setSubmitError(result.error.message);
    }
  });

  return {
    register, watch, errors, isSubmitting, submitError,
    userType, selectUserType,
    location,
    ktpFile, ktpPreview, ocrLoading, ocrDone, handleKtpChange,
    setValue,
    onSubmit,
  };
}
