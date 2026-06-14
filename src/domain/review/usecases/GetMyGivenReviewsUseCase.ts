import { IReviewRepository } from '@/domain/review/IReviewRepository';
import { GivenReviewPage } from '@/lib/api/review.api';

export class GetMyGivenReviewsUseCase {
  constructor(private readonly repo: IReviewRepository) {}

  execute(userId: string, page: number, limit = 10): Promise<GivenReviewPage> {
    return this.repo.getGivenByUserPage(userId, page, limit);
  }
}
