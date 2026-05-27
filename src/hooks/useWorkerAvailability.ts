'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { workerApi, WorkerApiResponse } from '@/lib/api/worker.api';

const QUERY_KEY = ['my-profile'];

export interface CurrentLocation {
  latitude: number;
  longitude: number;
}

/** Request geolocation permission and resolve with coordinates, or null on denial. */
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

  // Holds the most-recently-obtained device location
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn:  () => workerApi.getMyProfile(token!),
    enabled:  !!token,
    staleTime: 30_000,
    retry: false, // don't retry 404 (worker with no profile yet)
  });

  const mutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      // When going available, ask for location first
      let loc: CurrentLocation | null = null;
      if (isAvailable) {
        loc = await requestLocation();
        if (loc) setCurrentLocation(loc);
      }

      return workerApi.updateAvailability(
        isAvailable,
        token!,
        loc?.latitude,
        loc?.longitude,
      );
    },

    // Optimistic update so the toggle feels instant
    onMutate: async (isAvailable) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<WorkerApiResponse>(QUERY_KEY);
      qc.setQueryData<WorkerApiResponse>(QUERY_KEY, (old) =>
        old
          ? { ...old, isAvailable, workStatus: isAvailable ? 'OPEN' : 'CLOSED' }
          : old,
      );
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(QUERY_KEY, ctx.prev);
    },

    onSuccess: (profile) => {
      // Attach location to the user object in the auth store
      if (profile.latitude != null && profile.longitude != null) {
        setUser({ latitude: profile.latitude, longitude: profile.longitude });
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // Default to true (open) when profile doesn't exist yet
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
