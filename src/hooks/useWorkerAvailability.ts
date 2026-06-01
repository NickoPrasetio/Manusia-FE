'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { WorkerRepository } from '@/data/worker/WorkerRepository';
import { UpdateAvailabilityUseCase } from '@/domain/worker/usecases/UpdateAvailabilityUseCase';
import { WorkerApiResponse } from '@/lib/api/worker.api';

const repo              = new WorkerRepository();
const availabilityUseCase = new UpdateAvailabilityUseCase(repo);

const QUERY_KEY = ['my-profile'];

export interface CurrentLocation {
  latitude: number;
  longitude: number;
}

function requestLocation(): Promise<CurrentLocation | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      ()    => resolve(null),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  });
}

export function useWorkerAvailability() {
  const { token, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn:  () => repo.getMyProfile(token!),
    enabled:  !!token,
    staleTime: 30_000,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      let loc: CurrentLocation | null = null;
      if (isAvailable) {
        loc = await requestLocation();
        if (loc) setCurrentLocation(loc);
      }
      return availabilityUseCase.execute(isAvailable, token!, loc?.latitude, loc?.longitude);
    },

    onMutate: async (isAvailable) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<WorkerApiResponse>(QUERY_KEY);
      qc.setQueryData<WorkerApiResponse>(QUERY_KEY, (old) =>
        old ? { ...old, isAvailable, workStatus: isAvailable ? 'OPEN' : 'CLOSED' } : old,
      );
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(QUERY_KEY, ctx.prev);
    },

    onSuccess: (profile) => {
      if (profile.latitude != null && profile.longitude != null) {
        setUser({ latitude: profile.latitude, longitude: profile.longitude });
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const isAvailable = query.data?.isAvailable ?? true;

  return {
    isAvailable,
    currentLocation,
    profile:    query.data ?? null,
    isLoading:  query.isLoading,
    toggle:     (val: boolean) => mutation.mutate(val),
    isToggling: mutation.isPending,
  };
}
