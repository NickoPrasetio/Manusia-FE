import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { ConfirmOrderUseCase } from '@/domain/booking/usecases/ConfirmOrderUseCase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new ConfirmOrderUseCase(new BookingRepository());

export function useConfirmOrderMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => useCase.execute(id, token!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.workerOrders });
    },
  });
}
