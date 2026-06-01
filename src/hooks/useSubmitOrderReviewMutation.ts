import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewRepository } from '@/data/review/ReviewRepository';
import { CreateReviewUseCase } from '@/domain/review/usecases/CreateReviewUseCase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new CreateReviewUseCase(new ReviewRepository());

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
      useCase.execute(
        {
          workerId:  params.workerId,
          bookingId: params.bookingId,
          userName:  user?.name ?? 'Anonim',
          rating:    params.rating,
          comment:   params.comment,
          photos:    params.photos,
        },
        token!,
      ),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byWorker(params.workerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.detail(params.workerId) });
    },
  });
}
