'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthRepository } from '@/data/auth/AuthRepository';
import { UpdateProfileUseCase } from '@/domain/auth/usecases/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '@/domain/auth/usecases/UploadAvatarUseCase';
import { ChangePasswordUseCase } from '@/domain/auth/usecases/ChangePasswordUseCase';

const repo            = new AuthRepository();
const updateProfileUC = new UpdateProfileUseCase(repo);
const uploadAvatarUC  = new UploadAvatarUseCase(repo);
const changePasswordUC = new ChangePasswordUseCase(repo);

export function useProfileSettings() {
  const { user, token, setUser } = useAuthStore();

  // Profile form
  const [name,      setName]     = useState(user?.name  ?? '');
  const [phone,     setPhone]    = useState(user?.phone ?? '');
  const [saving,    setSaving]   = useState(false);
  const [saved,     setSaved]    = useState(false);
  const [error,     setError]    = useState('');
  const [uploading, setUploading] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwError,   setPwError]   = useState('');

  async function saveProfile() {
    if (!token) return;
    setSaving(true); setError('');
    const result = await updateProfileUC.execute(token, { name: name.trim(), phone: phone.trim() });
    if (result.success) {
      setUser({ name: result.data.name, phone: result.data.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error.message);
    }
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    if (!token) return;
    setUploading(true); setError('');
    const result = await uploadAvatarUC.execute(token, file);
    if (result.success) {
      setUser({ avatar: result.data.avatar });
    } else {
      setError(result.error.message);
    }
    setUploading(false);
  }

  async function changePassword() {
    if (!token) return;
    setPwSaving(true); setPwError('');
    const result = await changePasswordUC.execute(token, currentPw, newPw);
    if (result.success) {
      setPwSaved(true);
      setCurrentPw(''); setNewPw('');
      setTimeout(() => setPwSaved(false), 2500);
    } else {
      setPwError(result.error.message);
    }
    setPwSaving(false);
  }

  function resetPasswordForm() {
    setCurrentPw(''); setNewPw(''); setPwError('');
  }

  return {
    // Profile
    name, setName, phone, setPhone,
    saving, saved, error, uploading,
    saveProfile, uploadAvatar,
    // Password
    currentPw, setCurrentPw,
    newPw, setNewPw,
    pwSaving, pwSaved, pwError,
    changePassword, resetPasswordForm,
  };
}
