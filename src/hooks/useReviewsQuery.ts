import { useQuery } from '@tanstack/react-query';
import { ReviewRepository } from '@/data/review/ReviewRepository';
import { queryKeys } from '@/lib/queryKeys';

const repo = new ReviewRepository();

export function useReviewsQuery(workerId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byWorker(workerId),
    queryFn:  () => repo.getByWorker(workerId),
    enabled:  !!workerId,
  });
}
