'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, User, Mail, Phone, Save, Loader2, CheckCircle,
  CreditCard, Lock, LogOut, Eye, EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import AuthGuard from '@/components/providers/AuthGuard';

function ProfileContent() {
  const router                      = useRouter();
  const { user, token, setUser }    = useAuthStore();
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // Form fields
  const [name,     setName]    = useState(user?.name  ?? '');
  const [phone,    setPhone]   = useState(user?.phone ?? '');

  // Save state
  const [saving,   setSaving]  = useState(false);
  const [saved,    setSaved]   = useState(false);
  const [error,    setError]   = useState('');
  const [uploading, setUploading] = useState(false);

  // Change password state
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwSaved,     setPwSaved]     = useState(false);
  const [pwError,     setPwError]     = useState('');

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const updated = await authApi.updateMe({ name: name.trim(), phone: phone.trim() }, token);
      setUser({ name: updated.name, phone: updated.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setError('');
    try {
      const updated = await authApi.uploadAvatar(file, token);
      setUser({ avatar: updated.avatar });
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword() {
    setPwError('');
    if (!currentPw)       { setPwError('Password saat ini wajib diisi'); return; }
    if (!newPw)           { setPwError('Password baru wajib diisi'); return; }
    if (newPw.length < 8) { setPwError('Password baru minimal 8 karakter'); return; }
    if (!token) return;
    setPwSaving(true);
    try {
      await authApi.changePassword(currentPw, newPw, token);
      setPwSaved(true);
      setCurrentPw(''); setNewPw('');
      setTimeout(() => { setPwSaved(false); setShowPwForm(false); }, 2500);
    } catch (e: unknown) {
      setPwError((e as Error)?.message ?? 'Gagal mengganti password');
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    useAuthStore.getState().clearSession();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Pengaturan</h1>
          <p className="text-xs text-gray-500">Kelola informasi akunmu</p>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-5">

        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-blue-100 flex items-center justify-center">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <User size={38} className="text-blue-400" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600
                         rounded-full flex items-center justify-center shadow-md
                         transition-colors disabled:bg-blue-300"
            >
              {uploading
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Camera size={14} className="text-white" />
              }
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="text-center">
            <p className="font-bold text-gray-900">{user?.name ?? '-'}</p>
            <p className="text-xs text-gray-400">{user?.email ?? '-'}</p>
          </div>
        </div>

        {/* Informasi Akun */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Informasi Akun</h2>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Mail size={13} />
              Email
            </label>
            <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-400">
              {user?.email ?? '-'}
            </div>
          </div>

          {/* Nama */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <User size={13} />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkapmu"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                         text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Nomor HP */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <Phone size={13} />
              Nomor HP
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xx-xxxx-xxxx"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                         text-sm placeholder:text-gray-400"
            />
          </div>

          {/* NIK / KTP (read-only) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <CreditCard size={13} />
              NIK / KTP
            </label>
            <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-400">
              {(user as any)?.nik ?? '-'}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                       text-white font-semibold rounded-2xl transition-colors
                       flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 size={17} className="animate-spin" /> Menyimpan...</>
            ) : saved ? (
              <><CheckCircle size={17} /> Tersimpan!</>
            ) : (
              <><Save size={17} /> Simpan Perubahan</>
            )}
          </button>
        </div>

        {/* Keamanan — Ganti Password */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Keamanan</h2>
          </div>

          {!showPwForm ? (
            <button
              onClick={() => setShowPwForm(true)}
              className="w-full py-3 border border-gray-200 hover:border-blue-400 hover:bg-blue-50
                         text-gray-700 hover:text-blue-600 font-semibold rounded-2xl transition-all
                         flex items-center justify-center gap-2 text-sm"
            >
              <Lock size={16} />
              Ganti Password
            </button>
          ) : (
            <div className="space-y-3">
              {/* Password Saat Ini */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                               text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                               text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {pwError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
                  <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                  <p className="text-xs text-red-600 leading-relaxed">{pwError}</p>
                </div>
              )}

              {/* Sukses */}
              {pwSaved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">
                  <CheckCircle size={15} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">Password berhasil diubah!</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowPwForm(false); setPwError(''); setCurrentPw(''); setNewPw(''); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl
                             hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || pwSaved}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                             text-white font-semibold rounded-2xl transition-colors text-sm
                             flex items-center justify-center gap-2"
                >
                  {pwSaving ? (
                    <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    'Simpan Password'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Keluar */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50
                     text-gray-600 hover:text-red-600 font-semibold rounded-2xl transition-all
                     flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <LogOut size={17} />
          Keluar dari Akun
        </button>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
