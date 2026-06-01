import { useInfiniteQuery } from '@tanstack/react-query';
import { WorkerRepository } from '@/data/worker/WorkerRepository';

const repo = new WorkerRepository();

export function useWorkersInfiniteQuery(searchQuery: string, filterAvailable: boolean) {
  return useInfiniteQuery({
    queryKey:       ['workers-infinite', searchQuery, filterAvailable],
    queryFn:        ({ pageParam }) =>
      repo.getPage(pageParam as number, 10, searchQuery || undefined, filterAvailable || undefined),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  });
}
