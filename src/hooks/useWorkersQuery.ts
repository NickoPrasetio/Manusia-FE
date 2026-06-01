import { useQuery } from '@tanstack/react-query';
import { WorkerRepository } from '@/data/worker/WorkerRepository';
import { queryKeys } from '@/lib/queryKeys';

const repo = new WorkerRepository();

export function useWorkersQuery(search?: string, available?: boolean) {
  return useQuery({
    queryKey: queryKeys.workers.list(search, available),
    queryFn:  () => repo.getPage(0, 100, search, available).then((p) => p.content),
  });
}
