'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobApi, NearbyJobsResponse } from '@/lib/api/job.api';
import { dummyNearbyJobs } from '@/data/dummyNearbyJobs';
import { NearbyJob, JobCategory } from '@/types';

const PAGE_SIZE = 10;

// ── Haversine ──────────────────────────────────────────────────────────────
/** Distance in km between two lat/lon points. */
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

// ── Dummy fallback ─────────────────────────────────────────────────────────
/** Paginates dummy data to mimic the backend NearbyJobsResponse format. */
function paginateDummy(
  all: NearbyJob[],
  category: JobCategory | '',
  page: number,
): NearbyJobsResponse {
  const filtered = category ? all.filter((j) => j.category === category) : all;
  const start = (page - 1) * PAGE_SIZE;
  const jobs = filtered.slice(start, start + PAGE_SIZE);
  return {
    jobs,
    total: filtered.length,
    page,
    limit: PAGE_SIZE,
    hasMore: start + PAGE_SIZE < filtered.length,
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * Infinite-scroll hook for nearby open jobs.
 *
 * Strategy:
 *  1. Worker has location + token  → call backend (paginated)
 *  2. Backend returns 0 items on p.1, or network error  → fall back to dummy
 *  3. No token / no location  → paginate dummy data client-side
 *
 * @param radiusKm  Search radius passed to backend (default 50)
 * @param category  Filter: 'TASK' | 'PROJECT' | 'EVENT' | '' (all)
 */
export function useNearbyJobs(
  radiusKm = 50,
  category?: JobCategory | '',
): {
  jobs:           NearbyJobWithDistance[];
  total:          number;
  isLoading:      boolean;
  isFetchingMore: boolean;
  isError:        boolean;
  hasMore:        boolean;
  fetchMore:      () => void;
  hasLocation:    boolean;
} {
  const { token, user } = useAuthStore();
  const lat = user?.latitude;
  const lon = user?.longitude;
  const hasLocation = lat != null && lon != null;

  const query = useInfiniteQuery({
    // Key includes lat/lon so query resets when location is enabled/disabled
    queryKey: ['nearby-jobs', lat ?? null, lon ?? null, radiusKm, category ?? ''],

    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;

      // No token or no location → immediate dummy response (no network call)
      if (!token || !hasLocation) {
        return paginateDummy(dummyNearbyJobs, category ?? '', page);
      }

      try {
        const result = await jobApi.getNearby(
          lat!, lon!, token, radiusKm, category, page, PAGE_SIZE,
        );
        // Backend returned nothing on first page → fall back to dummy
        if (page === 1 && result.jobs.length === 0) {
          return paginateDummy(dummyNearbyJobs, category ?? '', page);
        }
        return result;
      } catch {
        // Network / backend error → fall back to dummy
        return paginateDummy(dummyNearbyJobs, category ?? '', page);
      }
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage: NearbyJobsResponse) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,

    // Always run once token is available — location handled inside queryFn
    enabled: !!token,
    staleTime: 60_000,
  });

  // Flatten all loaded pages, deduplicate by id, then attach distance.
  // Dedup guards against offset-pagination drift on the backend returning
  // the same row on two different pages.
  const jobs = useMemo<NearbyJobWithDistance[]>(() => {
    const allJobs = query.data?.pages.flatMap((p) => p.jobs) ?? [];
    const seen = new Set<string>();
    return allJobs
      .filter((j) => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
      })
      .map((j) => ({
        ...j,
        distKm: hasLocation
          ? distanceKm(lat!, lon!, j.latitude, j.longitude)
          : 0,
      }));
  }, [query.data, lat, lon, hasLocation]);

  // Total comes from first-page response
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    jobs,
    total,
    // Show spinner only on initial page load when there is real backend fetch
    isLoading:      query.isLoading && hasLocation,
    isFetchingMore: query.isFetchingNextPage,
    isError:        query.isError,
    hasMore:        query.hasNextPage ?? false,
    fetchMore:      query.fetchNextPage,
    hasLocation,
  };
}
