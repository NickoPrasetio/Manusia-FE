'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { reviewApi, ReviewApiResponse } from '@/lib/api/review.api';

const LIMIT = 10;

export function useMyGivenReviews() {
  const user = useAuthStore((s) => s.user);

  const query = useInfiniteQuery({
    queryKey:         ['my-given-reviews', user?.id],
    queryFn:          ({ pageParam }) => reviewApi.getGivenByUserPage(user!.id, pageParam as number, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    enabled:          !!user?.id,
  });

  const reviews = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages.flatMap((p) => p.reviews) ?? []).filter((r: ReviewApiResponse) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [query.data?.pages]);

  const total = query.data?.pages[0]?.total ?? 0;

  return {
    reviews,
    total,
    isLoading:          query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage ?? false,
  };
}
