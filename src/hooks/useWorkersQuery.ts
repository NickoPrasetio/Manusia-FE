import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { workerApi } from '@/lib/api/worker.api';
import { queryKeys } from '@/lib/queryKeys';

export function useWorkersQuery(search?: string, available?: boolean) {
  return useQuery({
    queryKey: queryKeys.workers.list(search, available),
    queryFn:  () => workerApi.getAll(search, available),
  });
}

export function useWorkersInfiniteQuery(search?: string, available?: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.workers.infinite(search, available),
    queryFn:  ({ pageParam = 0 }) => workerApi.getPage(pageParam, 10, search, available),
    initialPageParam: 0,
    getNextPageParam: (last) => last.last ? undefined : last.number + 1,
  });
}
