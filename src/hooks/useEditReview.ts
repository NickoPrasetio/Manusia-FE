'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { ReviewRepository } from '@/data/review/ReviewRepository';
import { EditReviewUseCase } from '@/domain/review/usecases/EditReviewUseCase';
import { Review } from '@/types';

const useCase = new EditReviewUseCase(new ReviewRepository());

export function useEditReview() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  const mutation = useMutation({
    mutationFn: ({
      review,
      rating,
      comment,
      photos = [],
    }: {
      review:  Pick<Review, 'id' | 'editCount' | 'createdAt'>;
      rating:  number;
      comment: string;
      photos?: File[];
    }) => useCase.execute(review, rating, comment, token!, photos),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-given-reviews', user?.id] });
    },
  });

  return {
    edit:      mutation.mutateAsync,
    isPending: mutation.isPending,
    error:     mutation.error,
    reset:     mutation.reset,
  };
}
