import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

export function useConfirmOrderMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingApi.confirmOrder(id, token!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.workerOrders });
    },
  });
}
