import { Review } from '@/types';
import { ReviewPage } from '@/lib/api/review.api';

export interface CreateReviewInput {
  workerId:  string;
  bookingId: string;
  userName:  string;
  rating:    number;
  comment:   string;
  photos:    File[];
}

export interface IReviewRepository {
  getByWorker(workerId: string): Promise<Review[]>;
  getByWorkerPage(workerId: string, page: number, limit?: number): Promise<ReviewPage>;
  create(input: CreateReviewInput, token: string): Promise<Review>;
}
