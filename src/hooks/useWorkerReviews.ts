import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewApi, ReviewApiResponse } from '@/lib/api/review.api';

const LIMIT = 10;

export type SortOption = 'recent' | 'highest' | 'lowest';

export function useWorkerReviews(workerId: string, sortBy: SortOption = 'recent') {
  const query = useInfiniteQuery({
    queryKey:         ['worker-reviews-page', workerId],
    queryFn:          ({ pageParam }) => reviewApi.getByWorkerPage(workerId, pageParam as number, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    enabled:          !!workerId,
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

  return {
    reviews,
    stats:              query.data?.pages[0],
    isLoading:          query.isLoading,
    isError:            query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage ?? false,
  };
}
