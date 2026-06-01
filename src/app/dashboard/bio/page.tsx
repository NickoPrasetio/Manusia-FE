'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, Save, Loader2, CheckCircle2,
  User, MapPin, Calendar, FileText, Mars, Venus, AlertCircle,
} from 'lucide-react';
import AuthGuard from '@/components/providers/AuthGuard';
import { useBioForm } from '@/hooks/useBioForm';

// ── Gender selector ───────────────────────────────────────────────────────────

function GenderSelector({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { val: 'MALE',   label: 'Laki-laki', icon: <Mars size={18} />,   active: 'border-blue-500 bg-blue-50',  iconBg: 'bg-blue-500',  iconText: 'text-blue-600'  },
        { val: 'FEMALE', label: 'Perempuan',  icon: <Venus size={18} />,  active: 'border-pink-500 bg-pink-50',  iconBg: 'bg-pink-500',  iconText: 'text-pink-600'  },
      ].map((opt) => {
        const isActive = value === opt.val;
        return (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
              isActive ? opt.active : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isActive ? opt.iconBg : 'bg-gray-100'
            }`}>
              <span className={isActive ? 'text-white' : 'text-gray-400'}>{opt.icon}</span>
            </div>
            <span className={`text-sm font-semibold ${isActive ? opt.iconText : 'text-gray-600'}`}>
              {opt.label}
            </span>
            {isActive && <CheckCircle2 size={15} className="ml-auto text-current opacity-70" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';

// ── Main page ─────────────────────────────────────────────────────────────────

function BioContent() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    profile, loading, saving, saved, error, uploading,
    fields: { name, age, gender, birthPlace, location, bio },
    setters: { setName, setAge, setGender, setBirthPlace, setLocation, setBio },
    save: handleSave,
    uploadPhoto,
  } = useBioForm();

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPhoto(file);
    e.target.value = '';
  }

  const avatarUrl = profile?.avatar || '';
  const initials  = (name || 'U').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">Memuat profil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-sm">Profil Saya</h1>
          <p className="text-xs text-gray-400">Mini biography yang dilihat orang lain</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={15} />
          ) : (
            <Save size={15} />
          )}
          {saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Avatar card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1.5 -right-1.5 w-9 h-9 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors"
            >
              {uploading
                ? <Loader2 size={15} className="text-white animate-spin" />
                : <Camera size={15} className="text-white" />
              }
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div className="text-center">
            <p className="text-xs text-gray-400">Tap kamera untuk ganti foto</p>
            {!profile && (
              <p className="text-xs text-amber-500 mt-1">💡 Simpan profil dulu agar bisa upload foto</p>
            )}
          </div>
        </div>

        {/* Bio form */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
          <h2 className="font-bold text-gray-900 text-sm">Informasi Pribadi</h2>

          <Field label="Nama Lengkap" icon={<User size={13} />}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkapmu"
              className={inputClass}
            />
          </Field>

          <Field label="Jenis Kelamin" icon={<Mars size={13} />}>
            <GenderSelector value={gender} onChange={setGender} />
          </Field>

          <Field label="Usia" icon={<Calendar size={13} />}>
            <input
              type="number"
              min={1}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Usiamu dalam tahun"
              className={inputClass}
            />
          </Field>

          <Field label="Tempat Lahir" icon={<MapPin size={13} />}>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="cth. Bandung, Jawa Barat"
              className={inputClass}
            />
          </Field>

          <Field label="Domisili Sekarang" icon={<MapPin size={13} />}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="cth. Jakarta Selatan"
              className={inputClass}
            />
          </Field>

          <Field label="Tentang Saya" icon={<FileText size={13} />}>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang dirimu, keahlian, atau hal yang bisa kamu bantu…"
              className={inputClass + ' resize-none'}
            />
            <p className="text-xs text-gray-400 text-right">{bio.length} karakter</p>
          </Field>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">👋</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            Profil ini akan ditampilkan kepada orang lain saat mereka melihat kamu di daftar <strong>Orang Baik di Sekitar</strong>. Lengkapi profilmu agar lebih mudah dipercaya!
          </p>
        </div>

        {/* Save button (bottom) */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Menyimpan…</>
          ) : saved ? (
            <><CheckCircle2 size={18} /> Profil Tersimpan!</>
          ) : (
            <><Save size={18} /> Simpan Profil</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BioPage() {
  return (
    <AuthGuard>
      <BioContent />
    </AuthGuard>
  );
}
