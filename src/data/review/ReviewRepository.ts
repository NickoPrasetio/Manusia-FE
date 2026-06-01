import { Review } from '@/types';
import { IReviewRepository, CreateReviewInput } from '@/domain/review/IReviewRepository';
import { reviewApi, ReviewPage } from '@/lib/api/review.api';

export class ReviewRepository implements IReviewRepository {
  async getByWorker(workerId: string): Promise<Review[]> {
    return reviewApi.getByWorker(workerId);
  }

  async getByWorkerPage(workerId: string, page: number, limit = 10): Promise<ReviewPage> {
    return reviewApi.getByWorkerPage(workerId, page, limit);
  }

  async create(input: CreateReviewInput, token: string): Promise<Review> {
    return reviewApi.createWithPhotos(
      input.workerId,
      input.bookingId,
      input.userName,
      input.rating,
      input.comment,
      input.photos,
      token,
    );
  }
}
