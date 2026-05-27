import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, CreateBookingPayload } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

export function useCreateBookingMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingApi.create(payload, token!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
