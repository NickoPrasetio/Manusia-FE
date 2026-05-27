import { useInfiniteQuery } from '@tanstack/react-query';
import { workerApi } from '@/lib/api/worker.api';
import { queryKeys } from '@/lib/queryKeys';
import { useWorkerStore } from '@/store/workerStore';

export function useWorkersInfiniteQuery() {
  const { searchQuery, filterAvailable } = useWorkerStore();

  return useInfiniteQuery({
    queryKey: queryKeys.workers.infinite(searchQuery, filterAvailable),
    queryFn: ({ pageParam = 0 }) =>
      workerApi.getPage(pageParam, 10, searchQuery || undefined, filterAvailable || undefined),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  });
}
