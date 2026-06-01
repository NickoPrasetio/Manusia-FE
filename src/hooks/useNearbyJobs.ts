'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { JobRepository } from '@/data/job/JobRepository';
import { GetNearbyJobsUseCase } from '@/domain/job/usecases/GetNearbyJobsUseCase';
import { NearbyJobsPage } from '@/domain/job/IJobRepository';
import { dummyNearbyJobs } from '@/data/dummyNearbyJobs';
import { NearbyJob, JobCategory } from '@/types';

const useCase = new GetNearbyJobsUseCase(new JobRepository());

const PAGE_SIZE = 10;

export interface NearbyJobWithDistance extends NearbyJob {
  distKm: number;
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function paginateDummy(all: NearbyJob[], category: JobCategory | '', page: number): NearbyJobsPage {
  const filtered = category ? all.filter((j) => j.category === category) : all;
  const start    = (page - 1) * PAGE_SIZE;
  return {
    jobs:    filtered.slice(start, start + PAGE_SIZE),
    total:   filtered.length,
    page,
    limit:   PAGE_SIZE,
    hasMore: start + PAGE_SIZE < filtered.length,
  };
}

export function useNearbyJobs(radiusKm = 50, category?: JobCategory | '') {
  const { token, user } = useAuthStore();
  const lat = user?.latitude;
  const lon = user?.longitude;
  const hasLocation = lat != null && lon != null;

  const query = useInfiniteQuery({
    queryKey: ['nearby-jobs', lat ?? null, lon ?? null, radiusKm, category ?? ''],

    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;

      if (!token || !hasLocation) {
        return paginateDummy(dummyNearbyJobs, category ?? '', page);
      }

      try {
        const result = await useCase.execute(
          { lat: lat!, lon: lon!, radiusKm, category, page, limit: PAGE_SIZE },
          token,
        );
        if (page === 1 && result.jobs.length === 0) {
          return paginateDummy(dummyNearbyJobs, category ?? '', page);
        }
        return result;
      } catch {
        return paginateDummy(dummyNearbyJobs, category ?? '', page);
      }
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage: NearbyJobsPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled:   !!token,
    staleTime: 60_000,
  });

  const jobs = useMemo<NearbyJobWithDistance[]>(() => {
    const allJobs = query.data?.pages.flatMap((p) => p.jobs) ?? [];
    const seen    = new Set<string>();
    return allJobs
      .filter((j) => { if (seen.has(j.id)) return false; seen.add(j.id); return true; })
      .map((j) => ({
        ...j,
        distKm: hasLocation ? distanceKm(lat!, lon!, j.latitude, j.longitude) : 0,
      }));
  }, [query.data, lat, lon, hasLocation]);

  return {
    jobs,
    total:          query.data?.pages[0]?.total ?? 0,
    isLoading:      query.isLoading && hasLocation,
    isFetchingMore: query.isFetchingNextPage,
    isError:        query.isError,
    hasMore:        query.hasNextPage ?? false,
    fetchMore:      query.fetchNextPage,
    hasLocation,
  };
}
