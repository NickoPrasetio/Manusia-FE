import { Review } from '@/types';
import { IReviewRepository, canEditReview } from '@/domain/review/IReviewRepository';

export class ReviewNotEditableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewNotEditableError';
  }
}

export class EditReviewUseCase {
  constructor(private readonly repo: IReviewRepository) {}

  async execute(
    review: Pick<Review, 'id' | 'editCount' | 'createdAt'>,
    rating: number,
    comment: string,
    token: string,
    photos: File[] = [],
  ): Promise<Review> {
    if (!canEditReview(review)) {
      throw new ReviewNotEditableError(
        review.editCount >= 2
          ? 'Ulasan sudah diedit 2 kali'
          : 'Ulasan hanya bisa diedit dalam 3 hari',
      );
    }
    return this.repo.edit(review.id, rating, comment, token, photos);
  }
}
