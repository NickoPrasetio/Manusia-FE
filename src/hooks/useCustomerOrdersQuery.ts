import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

export function useCustomerOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.bookings.my,
    queryFn:  () => bookingApi.getMy(token!),
    enabled:  !!token,
  });
}
