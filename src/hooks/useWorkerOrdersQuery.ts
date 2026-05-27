import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

export function useWorkerOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.bookings.workerOrders,
    queryFn:  () => bookingApi.getWorkerOrders(token!),
    enabled:  !!token,
  });
}
