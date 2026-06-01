import { IReviewRepository } from '../IReviewRepository';
import { ReviewPage } from '@/lib/api/review.api';

export class GetMyReviewsUseCase {
  constructor(private repo: IReviewRepository) {}

  async execute(workerId: string, page: number, limit = 10): Promise<ReviewPage> {
    if (!workerId?.trim()) throw new Error('Worker ID tidak boleh kosong');
    return this.repo.getByWorkerPage(workerId, page, limit);
  }
}
