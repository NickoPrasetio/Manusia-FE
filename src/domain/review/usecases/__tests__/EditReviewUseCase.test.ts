import { EditReviewUseCase, ReviewNotEditableError } from '../EditReviewUseCase';
import { IReviewRepository } from '@/domain/review/IReviewRepository';
import { Review } from '@/types';

const mockRepo = (): jest.Mocked<IReviewRepository> => ({
  getByWorker:        jest.fn(),
  getByWorkerPage:    jest.fn(),
  getGivenByUserPage: jest.fn(),
  create:             jest.fn(),
  edit:               jest.fn(),
});

const makeReview = (editCount: number, daysAgo: number): Pick<Review, 'id' | 'editCount' | 'createdAt'> => {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return { id: 'rev-1', editCount, createdAt: d.toISOString() };
};

const updatedReview: Review = {
  id: 'rev-1', userId: 'u1', userName: 'Budi', rating: 5,
  comment: 'luar biasa', date: '2026-06-14', editCount: 1,
  createdAt: new Date().toISOString(),
};

describe('EditReviewUseCase', () => {
  it('edits successfully on first edit within window', async () => {
    const repo = mockRepo();
    repo.edit.mockResolvedValue(updatedReview);
    const result = await new EditReviewUseCase(repo).execute(makeReview(0, 0), 5, 'luar biasa', 'tok');
    expect(result).toEqual(updatedReview);
    expect(repo.edit).toHaveBeenCalledWith('rev-1', 5, 'luar biasa', 'tok');
  });

  it('edits successfully on second (last) edit', async () => {
    const repo = mockRepo();
    repo.edit.mockResolvedValue(updatedReview);
    await expect(
      new EditReviewUseCase(repo).execute(makeReview(1, 1), 3, 'revisi', 'tok'),
    ).resolves.toBeDefined();
  });

  it('throws ReviewNotEditableError when edit_count >= 2', async () => {
    const repo = mockRepo();
    await expect(
      new EditReviewUseCase(repo).execute(makeReview(2, 0), 5, 'x', 'tok'),
    ).rejects.toThrow(ReviewNotEditableError);
    expect(repo.edit).not.toHaveBeenCalled();
  });

  it('throws ReviewNotEditableError when created more than 3 days ago', async () => {
    const repo = mockRepo();
    await expect(
      new EditReviewUseCase(repo).execute(makeReview(0, 4), 5, 'x', 'tok'),
    ).rejects.toThrow(ReviewNotEditableError);
    expect(repo.edit).not.toHaveBeenCalled();
  });

  it('still allows edit exactly at 3-day boundary (2 days 23h ago)', async () => {
    const repo = mockRepo();
    repo.edit.mockResolvedValue(updatedReview);
    const boundary: Pick<Review, 'id' | 'editCount' | 'createdAt'> = {
      id: 'rev-1',
      editCount: 0,
      createdAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000 - 60_000)).toISOString(),
    };
    await expect(
      new EditReviewUseCase(repo).execute(boundary, 5, 'ok', 'tok'),
    ).resolves.toBeDefined();
  });
});
