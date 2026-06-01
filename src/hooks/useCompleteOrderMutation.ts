import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { CompleteOrderUseCase } from '@/domain/booking/usecases/CompleteOrderUseCase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new CompleteOrderUseCase(new BookingRepository());

export function useCompleteOrderMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => useCase.execute(id, token!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
