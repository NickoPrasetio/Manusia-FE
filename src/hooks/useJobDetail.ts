'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { JobRepository } from '@/data/job/JobRepository';
import { GetJobByIdUseCase } from '@/domain/job/usecases/GetJobByIdUseCase';
import { NearbyJob } from '@/types';

const useCase = new GetJobByIdUseCase(new JobRepository());

export function useJobDetail(id: string): {
  job:       NearbyJob | null;
  isLoading: boolean;
  isError:   boolean;
  error:     string;
  refetch:   () => void;
} {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['job', id],
    queryFn:  () => useCase.execute(id, token!),
    enabled:  !!token && !!id,
    staleTime: 60_000,
    retry:    false,
  });

  return {
    job:       query.data ?? null,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error ? (query.error as Error).message : '',
    refetch:   query.refetch,
  };
}
