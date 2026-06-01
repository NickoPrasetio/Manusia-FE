'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { WorkerRepository } from '@/data/worker/WorkerRepository';
import { UpdateMyProfileUseCase } from '@/domain/worker/usecases/UpdateMyProfileUseCase';
import { WorkerApiResponse } from '@/lib/api/worker.api';

const repo      = new WorkerRepository();
const updateUC  = new UpdateMyProfileUseCase(repo);

export function useBioForm() {
  const { user, token } = useAuthStore();

  const [profile,    setProfile]    = useState<WorkerApiResponse | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');
  const [uploading,  setUploading]  = useState(false);

  // Form fields
  const [name,       setName]       = useState('');
  const [age,        setAge]        = useState('');
  const [gender,     setGender]     = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [location,   setLocation]   = useState('');
  const [bio,        setBio]        = useState('');

  useEffect(() => {
    if (!token) return;
    repo.getMyProfile(token)
      .then((p) => {
        setProfile(p);
        setName(p.name || user?.name || '');
        setAge(p.age ? String(p.age) : '');
        setGender(p.gender || '');
        setBirthPlace(p.birthPlace || '');
        setLocation(p.location || '');
        setBio(p.bio || '');
      })
      .catch(() => setName(user?.name || ''))
      .finally(() => setLoading(false));
  }, [token, user]);

  async function save() {
    if (!token) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await updateUC.execute({
        name:       name.trim(),
        age:        age ? parseInt(age, 10) : undefined,
        gender,
        birthPlace: birthPlace.trim(),
        location:   location.trim(),
        bio:        bio.trim(),
      }, token);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!token || !profile) {
      setError('Simpan profil terlebih dahulu sebelum mengganti foto');
      return;
    }
    setUploading(true); setError('');
    try {
      const updated = await repo.uploadMyPhoto(file, token);
      setProfile(updated);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  }

  return {
    profile, loading, saving, saved, error, uploading,
    fields: { name, age, gender, birthPlace, location, bio },
    setters: { setName, setAge, setGender, setBirthPlace, setLocation, setBio },
    save,
    uploadPhoto,
  };
}
