import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingRepository } from '@/data/booking/BookingRepository';
import { CreateBookingUseCase } from '@/domain/booking/usecases/CreateBookingUseCase';
import { CreateBookingPayload } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

const useCase = new CreateBookingUseCase(new BookingRepository());

export function useCreateBookingMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => useCase.execute(payload, token!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
