'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobApi } from '@/lib/api/job.api';
import { dummyNearbyJobs } from '@/data/dummyNearbyJobs';
import { NearbyJob } from '@/types';

export function useJobDetail(id: string): {
  job: NearbyJob | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id, token!),
    enabled: !!token,
    staleTime: 60_000,
    retry: false,
  });

  // Fall back to dummy data when backend doesn't have the job yet
  const job: NearbyJob | null =
    query.data ?? dummyNearbyJobs.find((j) => j.id === id) ?? null;

  return {
    job,
    isLoading: query.isLoading && !job,
    isError:   query.isError && !job,
  };
}
