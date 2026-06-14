import { Review } from '@/types';
import { ReviewPage, GivenReviewPage } from '@/lib/api/review.api';

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
  getGivenByUserPage(userId: string, page: number, limit?: number): Promise<GivenReviewPage>;
  create(input: CreateReviewInput, token: string): Promise<Review>;
  edit(id: string, rating: number, comment: string, token: string, photos: File[]): Promise<Review>;
}

/** Returns true if the review is still within the editable window (3 days, max 2 edits). */
export function canEditReview(review: Pick<Review, 'editCount' | 'createdAt'>): boolean {
  if (review.editCount >= 2) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(review.createdAt).getTime() <= threeDaysMs;
}
