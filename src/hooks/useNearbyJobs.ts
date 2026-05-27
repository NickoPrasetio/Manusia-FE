'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobApi } from '@/lib/api/job.api';
import { dummyNearbyJobs } from '@/data/dummyNearbyJobs';
import { NearbyJob, JobCategory } from '@/types';

/** Haversine distance in km between two lat/lon points. */
export function distanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyJobWithDistance extends NearbyJob {
  /** Distance from worker in km. 0 = no location available. */
  distKm: number;
}

/**
 * Fetch nearby open jobs from the backend and attach distance.
 * Falls back to dummy data when:
 *  - worker location is unavailable (query disabled), OR
 *  - backend returns an empty array
 *
 * @param radiusKm  Search radius passed to the backend (default 50)
 * @param category  Optional category filter: 'TASK' | 'PROJECT' | 'EVENT' | ''
 */
export function useNearbyJobs(
  radiusKm = 50,
  category?: JobCategory | '',
): {
  jobs: NearbyJobWithDistance[];
  isLoading: boolean;
  isError: boolean;
  hasLocation: boolean;
} {
  const { token, user } = useAuthStore();
  const lat = user?.latitude;
  const lon = user?.longitude;
  const hasLocation = lat != null && lon != null;

  const query = useQuery({
    queryKey: ['nearby-jobs', lat, lon, radiusKm, category ?? ''],
    queryFn:  () => jobApi.getNearby(lat!, lon!, token!, radiusKm, category),
    enabled:  !!token && hasLocation,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const jobs = useMemo<NearbyJobWithDistance[]>(() => {
    // Use backend data when available and non-empty
    const source: NearbyJob[] =
      query.data && query.data.length > 0 ? query.data : dummyNearbyJobs;

    // Filter by category if one is selected
    const filtered = category
      ? source.filter((j) => j.category === category)
      : source;

    // Attach distance — 0 when no location (distance badge hidden in card)
    return filtered.map((j) => ({
      ...j,
      distKm: hasLocation
        ? distanceKm(lat!, lon!, j.latitude, j.longitude)
        : 0,
    }));
  }, [query.data, lat, lon, hasLocation, category]);

  return {
    jobs,
    isLoading:   query.isLoading && hasLocation,
    isError:     query.isError,
    hasLocation,
  };
}
