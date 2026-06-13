'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { ApplyToJobUseCase } from '@/domain/booking/usecases/ApplyToJobUseCase';
import { queryKeys } from '@/lib/queryKeys';

const useCase = new ApplyToJobUseCase(new BookingRepository());

export function useApplyToJob() {
  const { token, user } = useAuthStore();
  const queryClient     = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      useCase.execute(
        {
          jobId,
          workerName:   user?.name   ?? '',
          workerAvatar: user?.avatar ?? '',
          notes:        '',
        },
        token!,
      ),
    onSuccess: () => {
      // Invalidate my orders agar customer langsung lihat
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
