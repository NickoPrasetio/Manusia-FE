'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, User, Mail, Phone, Save, Loader2, CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import AuthGuard from '@/components/providers/AuthGuard';

function ProfileContent() {
  const router              = useRouter();
  const { user, token, setUser } = useAuthStore();
  const fileInputRef        = useRef<HTMLInputElement>(null);

  const [name,    setName]   = useState(user?.name  ?? '');
  const [phone,   setPhone]  = useState(user?.phone ?? '');
  const [saving,  setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);
  const [error,   setError]  = useState('');
  const [uploading, setUploading] = useState(false);

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

  const backPath = user?.userType === 'WORKER' ? '/worker-dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push(backPath)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Profil Saya</h1>
          <p className="text-xs text-gray-500">Kelola informasi akunmu</p>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6">

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
            <span className="inline-block mt-1 text-[10px] font-semibold bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {user?.userType === 'WORKER' ? 'Pekerja' : 'Pelanggan'}
            </span>
          </div>
        </div>

        {/* Form */}
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

          {/* Name */}
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

          {/* Phone */}
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

        {/* Danger zone */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-red-100 space-y-3">
          <h2 className="font-semibold text-red-600 text-sm">Zona Berbahaya</h2>
          <button
            onClick={() => {
              useAuthStore.getState().clearSession();
              router.push('/login');
            }}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl transition-colors text-sm"
          >
            Keluar dari Akun
          </button>
        </div>
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
