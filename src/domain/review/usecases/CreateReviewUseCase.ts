import { Review } from '@/types';
import { IReviewRepository, CreateReviewInput } from '../IReviewRepository';

export class CreateReviewUseCase {
  constructor(private repo: IReviewRepository) {}

  async execute(input: CreateReviewInput, token: string): Promise<Review> {
    if (input.rating < 1 || input.rating > 5) throw new Error('Rating harus antara 1-5');
    if (!input.comment?.trim())               throw new Error('Komentar wajib diisi');
    return this.repo.create(input, token);
  }
}
