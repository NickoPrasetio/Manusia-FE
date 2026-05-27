import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';
import { queryKeys } from '@/lib/queryKeys';

export function useReviewsQuery(workerId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byWorker(workerId),
    queryFn:  () => reviewApi.getByWorker(workerId),
    enabled:  !!workerId,
  });
}
