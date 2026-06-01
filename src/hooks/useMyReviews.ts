'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { ReviewRepository } from '@/data/review/ReviewRepository';
import { GetMyReviewsUseCase } from '@/domain/review/usecases/GetMyReviewsUseCase';
import { ReviewApiResponse } from '@/lib/api/review.api';

const useCase = new GetMyReviewsUseCase(new ReviewRepository());

const LIMIT = 10;

export type SortOption = 'recent' | 'highest' | 'lowest';

export function useMyReviews(sortBy: SortOption = 'recent') {
  const user = useAuthStore((s) => s.user);

  const query = useInfiniteQuery({
    queryKey:       ['my-reviews-page', user?.id],
    queryFn:        ({ pageParam }) => useCase.execute(user!.id, pageParam as number, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    enabled:        !!user?.id,
  });

  const reviews = useMemo(() => {
    const seen = new Set<string>();
    const flat = (query.data?.pages.flatMap((p) => p.reviews) ?? [])
      .filter((r: ReviewApiResponse) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

    if (sortBy === 'highest') return [...flat].sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
    if (sortBy === 'lowest')  return [...flat].sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));
    return flat;
  }, [query.data?.pages, sortBy]);

  const stats = query.data?.pages[0];

  return {
    reviews,
    stats,
    isLoading:          query.isLoading,
    isError:            query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage ?? false,
  };
}
