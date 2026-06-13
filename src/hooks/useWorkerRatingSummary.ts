import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';

/** Fetch the first page (limit=1) just to get avgRating, total, and dist. */
export function useWorkerRatingSummary(workerId: string | undefined) {
  return useQuery({
    queryKey: ['worker-rating-summary', workerId],
    queryFn:  () => reviewApi.getByWorkerPage(workerId!, 0, 1),
    enabled:  !!workerId,
    staleTime: 60_000,
  });
}
