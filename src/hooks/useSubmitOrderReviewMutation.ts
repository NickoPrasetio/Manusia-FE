import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

interface SubmitReviewParams {
  workerId:  string;
  bookingId: string;
  rating:    number;
  comment:   string;
  photos:    File[];
}

export function useSubmitOrderReviewMutation() {
  const user        = useAuthStore((s) => s.user);
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SubmitReviewParams) =>
      reviewApi.createWithPhotos(
        params.workerId,
        params.bookingId,
        user?.name ?? 'Anonim',
        params.rating,
        params.comment,
        params.photos,
        token!,
      ),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byWorker(params.workerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.detail(params.workerId) });
    },
  });
}
